import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const {
      ownerId,
      businessName,
      supportEmail,
      knowledge,
    } = await req.json();

    if (!ownerId) {
      return NextResponse.json(
        { message: "Owner id is required" },
        { status: 400 }
      );
    }

    const settings = await prisma.settings.upsert({
      where: {
        ownerId,
      },
      update: {
        businessName,
        supportEmail,
        knowledge,
      },
      create: {
        ownerId,
        businessName,
        supportEmail,
        knowledge,
      },
    });

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}