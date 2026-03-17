import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY_ENV = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

export const listAvailableModels = async (key?: string) => {
    const finalKey = key?.trim() || API_KEY_ENV;
    if (!finalKey) return "KEY_MISSING";
    
    try {
        // We use a raw fetch here to bypass SDK limitations and see the full list
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${finalKey}`);
        const data = await response.json();
        
        if (!response.ok) {
            return `FAIL: ${data.error?.message || response.statusText}`;
        }
        
        return data.models?.map((m: any) => m.name.replace("models/", "")) || [];
    } catch (err: any) {
        return `ERROR: ${err.message}`;
    }
};

const genAI = new GoogleGenerativeAI(API_KEY_ENV);

export const analyzeDataWithAI = async (prompt: string, overrideApiKey?: string) => {
    const rawKey = overrideApiKey || API_KEY_ENV;
    const finalApiKey = rawKey?.trim() || "";
    
    if (!finalApiKey) return "ERROR_MISSING_KEY";

    // 1. Dynamic Discovery: Ask the API what models this key can actually use
    const discovered = await listAvailableModels(finalApiKey);
    let modelsToTry: string[] = [];

    if (Array.isArray(discovered) && discovered.length > 0) {
        // Filter for models likely to support generateContent
        modelsToTry = discovered.filter(name => 
            name.includes("flash") || name.includes("pro") || name.includes("gemini")
        );
    } 
    
    // Fallback list if discovery fails or returns nothing
    if (modelsToTry.length === 0) {
        modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash"];
    }

    const apiVersions = ["v1beta", "v1"];
    let lastError = "";
    let hadQuotaError = false;

    // 2. Attempt connection with discovered/fallback models
    for (const modelName of modelsToTry) {
        for (const apiVer of apiVersions) {
            try {
                console.log(`Gemini Attempt: ${modelName} (${apiVer})`);
                const client = new GoogleGenerativeAI(finalApiKey);
                const model = client.getGenerativeModel({ model: modelName }, { apiVersion: apiVer } as any);
                
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                
                if (text) {
                    console.log(`Gemini Success: ${modelName} (${apiVer})`);
                    return text;
                }
            } catch (error: any) {
                lastError = error?.message || "알 수 없는 오류";
                // If quota error, we stop and report it (trying other models usually doesn't help if it's a global quota)
                if (lastError.includes("429") || lastError.toLowerCase().includes("quota")) {
                    hadQuotaError = true;
                    continue; 
                }
                if (lastError.includes("404") || lastError.toLowerCase().includes("not found")) {
                    continue;
                }
                if (lastError.includes("401") || lastError.includes("leaked") || lastError.includes("API key not valid")) {
                    return `API 키가 유효하지 않습니다. (${lastError})`;
                }
            }
        }
    }
    
    if (hadQuotaError) {
        return `AI 할당량 초과 (429). 잠시 후 다시 시도하거나 다른 키를 사용해 주세요.`;
    }

    // Detailed 404 error
    if (lastError.includes("404")) {
        return `AI 모델을 찾을 수 없습니다 (404). 
        \n[검색된 모델]: ${modelsToTry.join(", ") || "없음"}
        \nAPI 서버가 해당 모델들을 인식하지 못하고 있습니다. 
        \n계정의 '지역 제한' 또는 '결제 계정 연결' 상태를 확인해 주세요.`;
    }
    
    return `AI 분석 중 오류가 발생했습니다. (${lastError})`;
};
