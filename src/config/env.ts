import { Scalekit } from "@scalekit-sdk/node";
import Groq from "groq-sdk";
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