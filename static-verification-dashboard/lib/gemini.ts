import { GoogleGenerativeAI } from "@google/generative-ai";

// Use hardcoded key for the static build if env is missing in CI, 
// but try to use env first for local development.
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyCvnkf4THS4KjxAWgWCJih0G0Qr6pEg5Tk";
const genAI = new GoogleGenerativeAI(API_KEY);

export const getGeminiModel = () => genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const analyzeDataWithAI = async (prompt: string) => {
    const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro", "gemini-pro"];
    let lastError = "";

    for (const modelName of modelsToTry) {
        try {
            console.log(`Trying Gemini model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error: any) {
            console.error(`Gemini AI Analysis Error (${modelName}):`, error);
            lastError = error?.message || "알 수 없는 오류";
            
            // If the error is 404 (Model not found), try the next model
            if (lastError.includes("404") || lastError.toLowerCase().includes("not found")) {
                continue;
            }
            // For other errors (like 429 quota or 401/403 auth), stop and return
            break;
        }
    }
    
    return `AI 분석 중 오류가 발생했습니다. (${lastError})`;
};
