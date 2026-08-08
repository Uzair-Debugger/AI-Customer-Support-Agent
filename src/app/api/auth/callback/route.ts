import {  NEXT_PUBLIC_APP_URL, scalekit } from "@/config/env";
import { NextRequest, NextResponse } from "next/server";
import { NODE_ENV } from "@/config/env";
import { checkRateLimit } from "@/lib/rateLimit";
import { RATE_LIMITS } from "@/lib/rateLimit.config";

export async function GET(req: NextRequest) {
    const rateLimitResult = await checkRateLimit(req, RATE_LIMITS.auth);
    if (!rateLimitResult.success) {
      return NextResponse.json({ message: "Too many request. Please try again later." }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
  
  const code = searchParams.get("code");
  const redirectURL = `${NEXT_PUBLIC_APP_URL}/api/auth/callback`;

  if (!code) 
    return NextResponse.json({message: "code is not found"}, {status: 400});

  const session = await scalekit.authenticateWithCode(code, redirectURL);
  
  const response = NextResponse.redirect(`${NEXT_PUBLIC_APP_URL}`)
  response.cookies.set("access_token", session.accessToken, {
    httpOnly: true,
    maxAge: 24*60*60*1000,
    secure: NODE_ENV === "production",
    path: "/",
  })

  return response;
}
