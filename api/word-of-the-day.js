// api/word-of-the-day.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" }); // 👈 UPDATED

        const prompt = `Give me a "Word of the Day" with:
    1. The word (one word only)
    2. A short definition
    3. An example sentence
    Format like:
    Word: ...
    Definition: ...
    Example: ...`;

        const result = await model.generateContent(prompt);

        res.status(200).json({
            candidates: result.response.candidates,
        });
    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: error.message || "Failed to fetch Word of the Day." });
    }
}
