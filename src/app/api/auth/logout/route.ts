import { NEXT_PUBLIC_APP_URL } from "@/config/env";
import { cookies } from "next/headers";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const cookieStore = await cookies();
    cookieStore.delete("access_token");
    return NextResponse.redirect(NEXT_PUBLIC_APP_URL)
}