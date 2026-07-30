import { NextRequest, NextResponse } from "next/server";
import { NEXT_PUBLIC_APP_URL } from "./config/env";
import { cookies } from "next/headers";

export async function proxy(req: NextRequest) {
    const session = await cookies()
    const token = session.get("access_token")?.value
    if (!token) {
        return NextResponse.redirect(new URL(NEXT_PUBLIC_APP_URL));
    }
    return NextResponse.next();
}

export const config = {
    matcher: '/dashboard/:path*'
}
