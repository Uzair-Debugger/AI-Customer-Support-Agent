import { BGE_EMBEDDING_MODEL, HUGGINGFACE_API_KEY } from "@/config/env";

const BGE_API_URL = BGE_EMBEDDING_MODEL || "https://router.huggingface.co/hf-inference/models/BAAI/bge-small-en-v1.5/pipeline/feature-extraction";

function normalizeEmbedding(data: unknown): number[] {
  const arr3d = data as number[][][];
  if (Array.isArray(arr3d?.[0]?.[0])) return arr3d[0][0];
  const arr2d = data as number[][];
  if (Array.isArray(arr2d?.[0])) return arr2d[0];
  return data as number[];
}

export async function embedText(text: string): Promise<number[]> {
  const res = await fetch(BGE_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: text }),
  });

  if (!res.ok) throw new Error(`HuggingFace embedding failed: ${await res.text()}`);

  const data = await res.json();
  return normalizeEmbedding(data);
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const res = await fetch(BGE_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: texts }),
  });

  if (!res.ok) throw new Error(`HuggingFace embedding batch failed: ${await res.text()}`);

  const data = await res.json();
  return (data as unknown[]).map((item) => normalizeEmbedding(item));
}

const EMBED_BATCH_SIZE = 30;
const EMBED_CONCURRENCY = 5;

export async function embedChunks(chunks: string[]): Promise<number[][]> {
  if (chunks.length === 0) return [];

  const batches: string[][] = [];
  for (let i = 0; i < chunks.length; i += EMBED_BATCH_SIZE) {
    batches.push(chunks.slice(i, i + EMBED_BATCH_SIZE));
  }

  const results: number[][] = new Array(chunks.length);
  let batchIdx = 0;

  const worker = async () => {
    while (true) {
      const idx = batchIdx++;
      if (idx >= batches.length) break;

      const batch = batches[idx];
      const start = idx * EMBED_BATCH_SIZE;
      const embeddings = await embedTexts(batch);
      for (let j = 0; j < embeddings.length; j++) {
        results[start + j] = embeddings[j];
      }
    }
  };

  await Promise.all(Array.from({ length: EMBED_CONCURRENCY }, worker));
  return results;
}

// ──────────────────────────────────────────────────────────
// ORIGINAL CODE (kept for reference)
// ──────────────────────────────────────────────────────────
//
// const BGE_API_URL = BGE_EMBEDDING_MODEL || "https://router.huggingface.co/hf-inference/models/BAAI/bge-small-en-v1.5/pipeline/feature-extraction";
//
// export async function embedText(text: string): Promise<number[]> {
//   const res = await fetch(BGE_API_URL, {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ inputs: text }),
//   });
//
//   if (!res.ok) throw new Error(`HuggingFace embedding failed: ${await res.text()}`);
//
//   const data = await res.json();
//   // bge models return [[[...floats]]] — mean-pool or just take data[0][0]
//   if (Array.isArray(data[0]?.[0])) return data[0][0];
//   if (Array.isArray(data[0])) return data[0];
//   return data;
// }
