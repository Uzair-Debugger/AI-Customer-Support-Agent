import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";
import { RATE_LIMITS } from "@/lib/rateLimit.config";

export async function POST(req: NextRequest) {
    const rateLimitResult = await checkRateLimit(req, RATE_LIMITS.settings);
    if (!rateLimitResult.success) {
      return NextResponse.json({ message: "Too many request. Please try again later." }, { status: 429 });
    }

    try {
    const {
      ownerId,
      businessName,
      supportEmail,
      chatbotName,
      logo,
      primaryColor,
      secondaryColor,
      widgetPosition,
      greetingMessage,
      isActive,
      knowledge,
    } = await req.json();

    if (!ownerId) {
      return NextResponse.json({ message: "Owner id is required" }, { status: 400 });
    }

    const data = {
      businessName,
      supportEmail,
      chatbotName,
      logo,
      primaryColor,
      secondaryColor,
      widgetPosition,
      greetingMessage,
      isActive,
      knowledge,
    };

    const settings = await prisma.settings.upsert({
      where: { ownerId },
      update: data,
      create: { ownerId, ...data },
    });

    return NextResponse.json(settings, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
