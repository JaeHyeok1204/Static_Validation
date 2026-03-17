import { GoogleGenerativeAI } from "@google/generative-ai";

// Use hardcoded key for the static build if env is missing in CI, 
// but try to use env first for local development.
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyCvnkf4THS4KjxAWgWCJih0G0Qr6pEg5Tk";
const genAI = new GoogleGenerativeAI(API_KEY);

export const getGeminiModel = () => genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const analyzeDataWithAI = async (prompt: string) => {
    // Prioritize 1.5 models as they have more stable free quotas
    const modelsToTry = [
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash",
        "gemini-1.5-pro-latest",
        "gemini-1.5-pro",
        "gemini-2.0-flash", 
        "gemini-1.0-pro"
    ];
    
    let lastError = "";
    let hadQuotaError = false;

    for (const modelName of modelsToTry) {
        try {
            console.log(`Gemini API Attempt: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            
            // Simple prompt execution
            const result = await model.generateContent(prompt);
            const response = await result.response;
            if (text) {
                console.log(`Gemini API Success with: ${modelName}`);
                return text;
            }
        } catch (error: any) {
            lastError = error?.message || "알 수 없는 오류";
            console.error(`Gemini Error with ${modelName}:`, lastError);
            
            // If it's a quota error, mark it and try next
            if (lastError.includes("429") || lastError.toLowerCase().includes("quota")) {
                hadQuotaError = true;
                continue;
            }

            // If it's a 404, we continue to the next model
            if (lastError.includes("404") || lastError.toLowerCase().includes("not found")) {
                continue;
            }
            
            // For 403 (Permission) or 401 (Auth), stop early
            if (lastError.includes("403") || lastError.includes("401")) {
                break;
            }
        }
    }
    
    // Final Error Reporting
    if (hadQuotaError) {
        return `AI 분석 한도 초과 (429 Quota Exceeded). 
        \n현재 사용 중인 API 키의 무료 할당량을 모두 소모했거나, 해당 모델의 사용 한도가 0으로 설정되어 있습니다. 
        \nGoogle AI Studio에서 새로운 API 키를 생성하거나 내일 다시 시도해 주세요.`;
    }

    if (lastError.includes("404")) {
        return `AI 서버 접속 실패 (404 Not Found). 
        \nAPI 키가 유효하지 않거나, 현재 지역에서 Gemini 서비스를 지원하지 않을 수 있습니다. 
        \nAPI 키를 다시 한번 확인해 주세요.`;
    }
    
    return `AI 분석 중 오류가 발생했습니다. (${lastError})`;
};
