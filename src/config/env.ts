import { Scalekit } from "@scalekit-sdk/node";
import 'dotenv/config'

export const scalekit = new Scalekit(
  process.env.SCALEKIT_ENVIRONMENT_URL!,
  process.env.SCALEKIT_CLIENT_ID!,
  process.env.SCALEKIT_CLIENT_SECRET!
);

export const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL;