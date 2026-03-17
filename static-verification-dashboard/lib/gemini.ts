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
    // Priority: 1. User provided override (from UI), 2. Environment variable
    const rawKey = overrideApiKey || API_KEY_ENV;
    const finalApiKey = rawKey?.trim() || "";
    
    if (!finalApiKey) {
        return "ERROR_MISSING_KEY";
    }

    const modelsToTry = [
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash",
        "gemini-1.5-pro-latest",
        "gemini-1.5-pro",
        "gemini-2.0-flash", 
        "gemini-1.0-pro"
    ];
    
    const apiVersions = ["v1beta", "v1"];
    let lastError = "";
    let hadQuotaError = false;

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
                console.warn(`Gemini Failed: ${modelName} (${apiVer}) - ${lastError}`);
                
                // If it's a quota error, mark it and try next version/model
                if (lastError.includes("429") || lastError.toLowerCase().includes("quota")) {
                    hadQuotaError = true;
                    continue;
                }

                // If it's a 404, we continue to the next version/model
                if (lastError.includes("404") || lastError.toLowerCase().includes("not found")) {
                    continue;
                }
                
                // For 403 (Permission/Leaked/Location) or 401 (Auth), 
                // we might want to try other versions just in case, or stop if it's clearly an auth issue
                if (lastError.includes("401") || lastError.includes("leaked")) {
                    return `AI 분석 서버 인증 실패. 키가 유효하지 않거나 유출된 키입니다. (${lastError})`;
                }
            }
        }
    }
    
    // Final Error Reporting
    if (hadQuotaError) {
        return `AI 분석 한도 초과 (429 Quota Exceeded). 
        \n현재 사용 중인 API 키의 무료 할당량을 모두 소모했거나, 해당 모델의 사용 한도가 0으로 설정되어 있습니다. 
        \n다른 Google 계정으로 새 키를 생성하거나 내일 다시 시도해 주세요.`;
    }

    if (lastError.includes("404")) {
        return `AI 서버 접속 실패 (404 Not Found). 
        \n[원인 진단]: 모든 모델과 API 버전(${apiVersions.join(", ")})에서 응답을 찾을 수 없습니다. 
        \n1. API 키에 오타가 없는지 확인해 주세요. 
        \n2. Google Cloud Console에서 'Generative Language API'가 활성화되어 있는지 확인이 필요합니다.`;
    }
    
    return `AI 분석 중 오류가 발생했습니다. (${lastError})`;
};
