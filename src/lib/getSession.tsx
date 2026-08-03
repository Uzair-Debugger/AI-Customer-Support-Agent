import { cookies } from "next/headers"
import { scalekit } from "../config/env";
import { NextResponse } from "next/server";
export async function getSession() {
    const session = await cookies()
    const token = session.get("access_token")?.value;
    if (!token) {
        return NextResponse.json({ message: "Token not found" })
    }

    try {
        const client = await scalekit.validateToken(token!);

        if (!client || typeof client !== "object" || typeof (client as any).sub !== "string") {
            return NextResponse.json({ message: "Invalid token" });
        }

        const response = await scalekit.user.getUser((client as { sub: string }).sub);
        const user = response?.user

        return NextResponse.json({ message: "success", user: { id: user?.userProfile?.id, name: user?.userProfile?.name, email: user?.email, picture: user?.userProfile?.picture } }, { status: 200 })
    }
    catch (error) {
        console.error("Token validation error:", error)
        return NextResponse.json({ message: "Invalid token", error: String(error) })
    }

}