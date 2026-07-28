import { scalekit } from "@/config/env";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest) {
    const redirectURL = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`
    const url=scalekit.getAuthorizationUrl(redirectURL)
    // console.log(`${url}`)
    return NextResponse.redirect(url)
}