import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { groq } from "@/config/env";


export async function POST(req: NextRequest) {
    const { ownerId, message } = await req.json();

    if (!ownerId || !message) {
        return new Response("Missing required fields", { status: 400 });
    }

    const setting = await prisma.settings.findFirst({ where: { ownerId } });

    if (!setting) {
        return new Response("Chatbot is not configured yet.", { status: 404 });
    }

    const KNOWLEDGE = `
        Business Name: ${setting.businessName || "Not Provided"}
        Support Email: ${setting.supportEmail || "Not Provided"}
        Knowledge: ${setting.knowledge || "Not Provided"}
    `;

    const prompt = `
        You are a professional customer support assistant for this business.

        Use ONLY the information provided below to answer the customer's question.
        You may rephrase, summarize, or interpret the information if needed.
        Do NOT invent new policies, prices, or promises.

        If the customer's question is completely unrelated to the information,
        or cannot be reasonably answered from it, reply exactly with:
        "Please contact support."

        --------------------
        BUSINESS INFORMATION
        --------------------
        ${KNOWLEDGE}

        --------------------
        CUSTOMER QUESTION
        --------------------
        ${message}

        --------------------
        ANSWER
    `;

    try {
        const groqStream = await groq.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages: [{ role: "user", content: prompt }],
            stream: true,
        });

        const stream = new ReadableStream({
            async start(controller) {
                for await (const chunk of groqStream) {
                    const text = chunk.choices[0]?.delta?.content;
                    if (text) controller.enqueue(new TextEncoder().encode(text));
                }
                controller.close();
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache",
                "Access-Control-Allow-Origin": "*",
            },
        });
    } catch (error) {
        return NextResponse.json(
            { message: `Internal Server Error: ${error}` },
            {
                status: 500,
                headers: { "Access-Control-Allow-Origin": "*" },
            }
        );
    }
}

export const OPTIONS=async ()=>{
    return NextResponse. json(null, {
        status : 201,
        headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",

        }
    })
}