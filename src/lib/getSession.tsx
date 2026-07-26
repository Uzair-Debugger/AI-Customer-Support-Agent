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
        console.log(client)

        if (!client || typeof client !== "object" || typeof (client as any).sub !== "string") {
            return NextResponse.json({ message: "Invalid token" });
        }

        const response = await scalekit.user.getUser((client as { sub: string }).sub);
        const name = response?.user?.userProfile?.name
        const profilePic = response?.user?.userProfile?.picture
        console.log(name)
        return NextResponse.json({ message: "success", name, profilePic }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: "Invalid token", error })
    }
}