import express, { type NextFunction, type Request, type Response } from "express";
import Groq from "groq-sdk";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";


let history: any[] = [];

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const AichatSendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (!session || !session.user) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        if (history.length > 20) {
            history.pop();
        }

        const { message } = req.body;

        if (!message) {
            res.status(400).json({ error: "Message is required" });
            return;
        }

        history.push({ role: 'user', content: message });


        const chatCompletion = await groq.chat.completions.create({
            messages: history,
            model: 'llama3-70b-8192',
            temperature: 0.7,
        });

        const aiResponse = chatCompletion.choices[0]?.message?.content || "";


        history.push({ role: 'assistant', content: aiResponse });

        res.status(200).json({
            success: true,
            answer: aiResponse,
            historyLength: history.length
        });

    } catch (error) {
        console.error("Groq API Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}