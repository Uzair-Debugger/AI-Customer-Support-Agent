if (!process.env.NEXT_PUBLIC_APP_URL) {
  throw new Error("NEXT_PUBLIC_APP_URL is not defined");
}
export const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL;
