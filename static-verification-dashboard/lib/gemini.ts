import { GoogleGenerativeAI } from "@google/generative-ai";

// Use hardcoded key for the static build if env is missing in CI, 
// but try to use env first for local development.
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyCvnkf4THS4KjxAWgWCJih0G0Qr6pEg5Tk";
const genAI = new GoogleGenerativeAI(API_KEY);

export const getGeminiModel = () => genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const analyzeDataWithAI = async (prompt: string) => {
    const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-flash-001", "gemini-1.5-pro", "gemini-1.0-pro"];
    const apiVersions = ["v1", "v1beta"]; // Try 'v1' first as it might be more stable for 404 errors
    let lastError = "";

    for (const modelName of modelsToTry) {
        for (const apiVer of apiVersions) {
            try {
                console.log(`Trying Gemini model: ${modelName} with API: ${apiVer}`);
                // In @google/generative-ai, the second argument to getGenerativeModel can specify apiVersion
                const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: apiVer } as any);
                const result = await model.generateContent(prompt);
                const response = await result.response;
                return response.text();
            } catch (error: any) {
                lastError = error?.message || "알 수 없는 오류";
                console.error(`Gemini Error (${modelName}, ${apiVer}):`, lastError);
                
                // If it's a 404-related error, continue to the next version/model
                if (lastError.includes("404") || lastError.toLowerCase().includes("not found") || lastError.includes("supported")) {
                    continue;
                }
                // For other fatal errors (429, 401, etc.), we stop and return
                return `AI 분석 중 오류가 발생했습니다. (${lastError})`;
            }
        }
    }
    
    return `AI 분석 중 오류가 발생했습니다. (사용 가능한 모델을 찾을 수 없습니다: ${lastError})`;
};
