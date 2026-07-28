import {  NEXT_PUBLIC_APP_URL, scalekit } from "@/config/env";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
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
    secure: process.env.NODE_ENV === "production",
    path: "/",
  })

  return response;
}
