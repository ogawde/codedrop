
require("dotenv").config();
import express from "express";


import { GoogleGenAI } from "@google/genai";

import { BASE_PROMPT, getSystemPrompt } from "./prompts";
import { nodeBasePrompt } from "./defaults/node";
import { reactBasePrompt } from "./defaults/react";

import cors from "cors";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("ERROR: GEMINI_API_KEY environment variable not set.");
  process.exit(1); 
}

const genAI = new GoogleGenAI({ apiKey });
const app = express();
app.use(cors());
app.use(express.json());

app.post("/template", async (req, res) => {
    try {
        const prompt = req.body.prompt;
        const systemInstruction = "Return either node or react based on what you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra.";
        const fullPrompt = `${systemInstruction}\n\nUser prompt: ${prompt}`;
        
        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt
        });

        const answer = response.text?.trim().toLowerCase() || "";

        if (answer.includes("react")) {
            res.json({
                prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
                uiPrompts: [reactBasePrompt]
            });
            return;
        }

        if (answer.includes("node")) {
            res.json({
                prompts: [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
                uiPrompts: [nodeBasePrompt]
            });
            return;
        }

        res.status(403).json({ message: "Could not determine project type. Model returned: " + answer });
    } catch (error) {
        console.error("Error in /template endpoint:", error);
        res.status(500).json({ message: "An error occurred on the server." });
    }
});

app.post("/chat", async (req, res) => {
    try {
        const messages = req.body.messages; 
        
        const systemPrompt = getSystemPrompt();
        const geminiMessages = [
            { role: 'user', parts: [{ text: systemPrompt }] },
            ...messages.map((msg: { role: string; content: any; }) => ({
                role: msg.role === 'assistant' ? 'model' : 'user', 
                parts: [{ text: msg.content }]
            }))
        ];

        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: geminiMessages
        });

        res.json({
            response: response.text || ""
        });

    } catch (error) {
        console.error("Error in /chat endpoint:", error);
        res.status(500).json({ message: "An error occurred on the server." });
    }
});

const PORT = 3000;

export default app;

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
