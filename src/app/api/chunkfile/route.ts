import { NextRequest, NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { qdrantClient } from "@/config/env";
import { embedText } from "@/lib/embeddings";
import { checkRateLimit } from "@/lib/rateLimit";
import { RATE_LIMITS } from "@/lib/rateLimit.config";
import path from "path";
import { extractText, getDocumentProxy } from "unpdf";
import mammoth from "mammoth";


const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB in bytes
const COLLECTION = "knowledge";
const ALLOWED_EXTENSIONS = ['.txt', '.pdf', '.docx'];
const ALLOWED_MIME_TYPES = [
  "text/plain",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

async function ensureCollection() {
  const collections = await qdrantClient.getCollections();
  const exists = collections.collections.some(c => c.name === COLLECTION);
  if (!exists) {
    await qdrantClient.createCollection(COLLECTION, {
      vectors: { size: 384, distance: "Cosine" },
    });
    await qdrantClient.createPayloadIndex(COLLECTION, {
      field_name: "ownerId",
      field_schema: "keyword",
    });
  }
}

export async function GET(req: NextRequest) {
  const ownerId = req.nextUrl.searchParams.get("ownerId");
  if (!ownerId) {
    return NextResponse.json({ message: "Missing ownerId" }, { status: 400 });
  }

  try {
    const result = await qdrantClient.scroll(COLLECTION, {
      filter: { must: [{ key: "ownerId", match: { value: ownerId } }] },
      limit: 1,
    });
    const exists = result.points && result.points.length > 0;
    return NextResponse.json({ exists });
  } catch {
    return NextResponse.json({ message: "Failed to check file existence" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
    const rateLimitResult = await checkRateLimit(req, RATE_LIMITS.fileUpload);
    if (!rateLimitResult.success) {
      return NextResponse.json({ message: "Too many request. Please try again later." }, { status: 429 });
    }

    const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const ownerId = formData.get("ownerId") as string | null;

  if (!file || !ownerId) {
    return NextResponse.json({ message: "Missing file or ownerId" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ message: "File size exceeds the limit of 500MB." }, { status: 400 });
  }

  const fileName = file.name;
  const mimeType = file.type;
  const ext = path.extname(fileName).toLowerCase()
  if(!ALLOWED_MIME_TYPES.includes(mimeType) || !ALLOWED_EXTENSIONS.includes(ext)){
    return NextResponse.json({ message: "Invalid file type. Only .txt, .pdf, and .docx allowed." }, { status: 400 });
  }
  
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  let text = "";
  if (mimeType === "application/pdf") {
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const result = await extractText(pdf, { mergePages: true });
    text = result && 
            typeof result === "object" && 
            "text" in result 
            ? (result as {text:string}).text 
            : String(result);
  } else if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const result = await mammoth.extractRawText({buffer});
    text = result.value;
  } else {
    text = buffer.toString("utf-8");
  }
  console.log(text)

  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap: 50 });
  const chunks = await splitter.splitText(text);

  if (chunks.length === 0) {
    return NextResponse.json({ message: "File is empty or could not be split." }, { status: 400 });
  }

  await ensureCollection();

  const existing = await qdrantClient.scroll(COLLECTION, {
    filter: { must: [{ key: "ownerId", match: { value: ownerId } }] },
    limit: 1,
  });
  if (existing.points && existing.points.length > 0) {
    return NextResponse.json({ message: "A file is already uploaded. Delete it first before uploading a new one." }, { status: 409 });
  }

  const points = await Promise.all(
    chunks.map(async (chunk, i) => ({
      id: Math.abs(hashCode(`${ownerId}-${Date.now()}-${i}`)),
      vector: await embedText(chunk),
      payload: { ownerId, text: chunk },
    }))
  );

  await qdrantClient.upsert(COLLECTION, { points });

  return NextResponse.json({ message: `${points.length} chunks uploaded.` });
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  return hash >>> 0; // unsigned 32-bit int
}


export async function DELETE(req:NextRequest) {
    const rateLimitResult = await checkRateLimit(req, RATE_LIMITS.fileUpload);
    if (!rateLimitResult.success) {
      return NextResponse.json({ message: "Too many request. Please try again later." }, { status: 429 });
    }

    const {userId} = await req.json();
  if(!userId){
    return NextResponse.json({ message: "Missing userId" }, { status: 400 });
  }

  const existing = await qdrantClient.scroll(COLLECTION, {
    filter: { must: [{ key: "ownerId", match: { value: userId } }] },
    limit: 1,
  });
  if (!existing.points || existing.points.length === 0) {
    return NextResponse.json({ message: "No files found to delete." }, { status: 404 });
  }

  const deleteChunk = await qdrantClient.delete(COLLECTION,
    {
      filter: {
        must: [
          {
            key: "ownerId",
            match: {
              value: userId
            }
          }
        ]
      }
    }
  );

  if(!deleteChunk){
    return NextResponse.json({ message: "Failed to delete chunks" }, { status: 500 });
  }

  return NextResponse.json({message: "File chunks delete successfully."}, {status: 200})
}