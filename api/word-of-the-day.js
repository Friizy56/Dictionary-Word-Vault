// api/word-of-the-day.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("Missing GEMINI_API_KEY environment variable");
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // ✅ Use universally supported model
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
Give me a "Word of the Day" with:
1. The word (single word only)
2. A concise definition
3. One example sentence
Format:
Word: ...
Definition: ...
Example: ...
`;

        const result = await model.generateContent(prompt);

        res.status(200).json(result.response);
    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: String(error) });
    }
}
