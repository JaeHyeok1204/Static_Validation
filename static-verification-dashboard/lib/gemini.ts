import { GoogleGenerativeAI } from "@google/generative-ai";

// Use hardcoded key for the static build if env is missing in CI, 
// but try to use env first for local development.
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyCvnkf4THS4KjxAWgWCJih0G0Qr6pEg5Tk";
const genAI = new GoogleGenerativeAI(API_KEY);

export const getGeminiModel = () => genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const analyzeDataWithAI = async (prompt: string) => {
    try {
        const model = getGeminiModel();
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini AI Analysis Error:", error);
        return "AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
    }
};
