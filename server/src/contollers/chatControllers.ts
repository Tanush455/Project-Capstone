import express, { type NextFunction, type Request, type Response } from "express";
import Groq from "groq-sdk";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";

const userHistories = new Map<string, any[]>();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 2. DEFINE THE SYSTEM PROMPT ONCE
// This instructions the AI on how to behave strictly.
const SYSTEM_PROMPT = {
    role: 'system',
    content: `
    You are an empathetic mental health assistant.
    Your goal is to analyze the user's input and categorize their emotional state into one of three categories:
    1. Depression
    2. Anxiety
    3. Normal
    
    First, detect the emotion. Then, provide a helpful, supportive response based on that detection.
    Be concise but warm.
    `
};

export const AichatSendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Authenticate User
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (!session || !session.user) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const userId = session.user.id;
        const { message } = req.body;

        if (!message) {
            res.status(400).json({ error: "Message is required" });
            return;
        }

        // 3. RETRIEVE OR INITIALIZE USER'S HISTORY
        if (!userHistories.has(userId)) {
            userHistories.set(userId, [SYSTEM_PROMPT]); // Start new history with System Prompt
        }

        const history = userHistories.get(userId)!;

        // 4. ADD USER MESSAGE
        history.push({ role: 'user', content: message });

        if (history.length > 21) {
            // Keep the system prompt (index 0) + the last 20 messages
            const newHistory = [history[0], ...history.slice(-20)];
            userHistories.set(userId, newHistory);
        }

        // 5. CALL AI
        const chatCompletion = await groq.chat.completions.create({
            messages: history,
            model: 'llama3-70b-8192',
            temperature: 0.6, // Slightly lower temperature for more consistent analysis
        });

        const aiResponse = chatCompletion.choices[0]?.message?.content || "";

        // 6. SAVE AI RESPONSE TO HISTORY
        history.push({ role: 'assistant', content: aiResponse });

        res.status(200).json({
            success: true,
            answer: aiResponse,
            detectedState: "See response content", // You could ask the AI to output JSON if you need this strictly separated
        });

    } catch (error) {
        console.error("Groq API Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}