import { BGE_EMBEDDING_MODEL, HUGGINGFACE_API_KEY } from "@/config/env";

const BGE_API_URL = BGE_EMBEDDING_MODEL || "https://router.huggingface.co/hf-inference/models/BAAI/bge-small-en-v1.5/pipeline/feature-extraction";

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
  // bge models return [[[...floats]]] — mean-pool or just take data[0][0]
  if (Array.isArray(data[0]?.[0])) return data[0][0];
  if (Array.isArray(data[0])) return data[0];
  return data;
}
