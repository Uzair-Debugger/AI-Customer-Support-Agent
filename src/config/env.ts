import { Scalekit } from "@scalekit-sdk/node";
import Groq from "groq-sdk";
import { QdrantClient } from "@qdrant/js-client-rest";
import 'dotenv/config'

export const scalekit = new Scalekit(
  process.env.SCALEKIT_ENVIRONMENT_URL!,
  process.env.SCALEKIT_CLIENT_ID!,
  process.env.SCALEKIT_CLIENT_SECRET!
);

if (!process.env.NEXT_PUBLIC_APP_URL) {
  throw new Error("NEXT_PUBLIC_APP_URL is not defined");
}

export const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL;

// ================================================================
if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not defined");
}

export const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ===============================================================


export const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_CLUSTER_ENDPOINT,
  apiKey: process.env.QDRANT_API_KEY,
});

// ===============================================================

export const BGE_EMBEDDING_MODEL = process.env.BGE_API_URL;
if(!BGE_EMBEDDING_MODEL){
  throw new Error("BGE_API_URL is not defined");
}