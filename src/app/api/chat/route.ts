import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { groq } from "@/config/env";


export async function POST(req:NextRequest) {
    try {
        
        const {ownerId, message} = await req.json();
        if(!ownerId || !message) {
        return new Response("Missing required fields", {status: 400})
        }
        const setting = await prisma.settings.findFirst({
            where: {
                ownerId
            }
        })
        if(!setting) {
            return new Response("Chatbot is not configured yet.", {status: 404})
        }

        const KNOWLEDGE = `
            Busness Name: ${setting.businessName  || "Not Provided"}
            \nSupport Email: ${setting.supportEmail  || "Not Provided"}
            \nKnowledge: ${setting.knowledge  || "Not Provided"}
            `;
        const prompt = 
        `
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
        ${KNOWLEDGE }

        --------------------
        CUSTOMER QUESTION
        --------------------
        ${message}

        --------------------
        ANSWER
        `

        const response = await groq.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages: [{ role: "user", content: prompt }],
        });

        const result = response.choices[0]?.message?.content;
        if (!result) {
            return new Response("Failed to generate response", { status: 500 });
        }
        return NextResponse.json({response: result}, {status: 200})

    } catch (error) {
        return NextResponse.json({message: `Internal Server Error: ${error}`}, {status: 500})
    }
}