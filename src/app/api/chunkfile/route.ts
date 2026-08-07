import { NextRequest, NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { qdrantClient } from "@/config/env";
import { embedText } from "@/lib/embeddings";

const COLLECTION = "knowledge";

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

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const ownerId = formData.get("ownerId") as string | null;

  if (!file || !ownerId) {
    return NextResponse.json({ message: "Missing file or ownerId" }, { status: 400 });
  }

  const text = await file.text();

  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap: 50 });
  const chunks = await splitter.splitText(text);

  if (chunks.length === 0) {
    return NextResponse.json({ message: "File is empty or could not be split." }, { status: 400 });
  }

  await ensureCollection();

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
