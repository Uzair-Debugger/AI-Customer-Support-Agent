import { scalekit } from "@/config/env";
import { NextRequest, NextResponse } from "next/server";
import { NEXT_PUBLIC_APP_URL } from "@/config/env";

export async function GET(req:NextRequest) {
    const redirectURL = `${NEXT_PUBLIC_APP_URL}/api/auth/callback`
    const url=scalekit.getAuthorizationUrl(redirectURL)
    // console.log(`${url}`)
    return NextResponse.redirect(url)
}