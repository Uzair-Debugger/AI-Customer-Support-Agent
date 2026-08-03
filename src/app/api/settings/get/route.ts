import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req:NextRequest) {

    try {
        const ownerId = req.nextUrl.searchParams.get('ownerId')
            if (!ownerId) {
              return NextResponse.json(
                { message: "Owner id is required" },
                { status: 400 }
              );
            }
        
            const setting = await prisma.settings.findFirst(                {
                    where:{
                        ownerId
                    }
                })
        
            return NextResponse.json(setting, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal Server Error" },{ status: 500 }
);
    }
}