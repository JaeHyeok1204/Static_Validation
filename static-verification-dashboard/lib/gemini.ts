import { GoogleGenerativeAI } from "@google/generative-ai";

// Use hardcoded key for the static build if env is missing in CI, 
// but try to use env first for local development.
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyCvnkf4THS4KjxAWgWCJih0G0Qr6pEg5Tk";
const genAI = new GoogleGenerativeAI(API_KEY);

export const getGeminiModel = () => genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const analyzeDataWithAI = async (prompt: string) => {
    // Attempting latest models including the requested 'Gemini 3 Flash' 
    // and the current stable latest 'Gemini 2.0 Flash'.
    const modelsToTry = [
        "gemini-2.0-flash", 
        "gemini-2.0-flash-exp", 
        "gemini-1.5-flash", 
        "gemini-1.5-pro",
        "gemini-2.0-pro-exp",
        "gemini-3-flash" // Added as requested, just in case of new release
    ];
        try {
            console.log(`Gemini API Attempt: ${modelName}`);
            // Explicitly try with 'v1beta' as it's the most common for AI Studio keys
            const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: 'v1beta' });
            
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }]
            });
            
            const response = await result.response;
            const text = response.text();
            
            if (text) return text;
        } catch (error: any) {
            lastError = error?.message || "알 수 없는 오류";
            console.error(`Gemini Error with ${modelName}:`, lastError);
            
            // If it's a 404, we continue to the next model
            if (lastError.includes("404") || lastError.toLowerCase().includes("not found")) {
                continue;
            }
            
            // If it's a 403 (Location/Permission), 429 (Quota), or 401 (Auth), stop and tell the user
            break;
        }
    }
    
    // If we reached here, it means exhaustion or a fatal error
    if (lastError.includes("404")) {
        return `AI 분석 서버 연결 실패 (404: 모델을 찾을 수 없음). 
        \n사용자님의 API 키가 'Google AI Studio'에서 생성된 것이 맞는지, 그리고 해당 프로젝트에서 'Generative Language API'가 활성화되어 있는지 확인이 필요합니다.`;
    }
    
    return `AI 분석 중 오류가 발생했습니다. (${lastError})`;
};
