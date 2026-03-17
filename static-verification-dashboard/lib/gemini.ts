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

    // 1. Dynamic Discovery
    const discovered = await listAvailableModels(finalApiKey);
    let modelsToTry: string[] = [];
    let discoveryStatus = "성공";

    if (Array.isArray(discovered)) {
        if (discovered.length > 0) {
            modelsToTry = discovered.filter(name => 
                name.includes("flash") || name.includes("pro") || name.includes("gemini")
            );
        } else {
            discoveryStatus = "성공(빈 목록)";
        }
    } else {
        discoveryStatus = `실패 (${discovered})`;
    }
    
    // Comprehensive Fallback list if discovery doesn't give us anything useful
    if (modelsToTry.length === 0) {
        modelsToTry = [
            "gemini-1.5-flash", 
            "gemini-1.5-pro", 
            "gemini-2.0-flash",
            "gemini-pro", // Legacy name used in some regions/projects
            "gemini-1.0-pro"
        ];
    }

    const apiVersions = ["v1beta", "v1"];
    let lastError = "";
    let hadQuotaError = false;

    // 2. Attempt connection
    for (const modelName of modelsToTry) {
        for (const apiVer of apiVersions) {
            try {
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
                if (lastError.includes("429") || lastError.toLowerCase().includes("quota")) {
                    hadQuotaError = true;
                    continue; 
                }
                if (lastError.includes("404") || lastError.toLowerCase().includes("not found")) {
                    continue;
                }
                // Stop for auth/permission errors
                if (lastError.includes("401") || lastError.includes("API key not valid") || lastError.includes("403")) {
                    return `API 보안/권한 이슈: ${lastError}`;
                }
            }
        }
    }
    
    if (hadQuotaError) {
        return `AI 할당량 초과 (429). 다른 키를 사용하거나 나중에 다시 시도해 주세요.`;
    }

    // Detailed 404 report
    if (lastError.includes("404")) {
        return `AI 모델 접속 실패 (404). 
        \n- 진단 상태: ${discoveryStatus}
        \n- 시도 모델: ${modelsToTry.join(", ")}
        \n
        \n[해결 방법]:
        \n1. Google AI Studio(aistudio.google.com)에서 'Get API Key'를 통해 생성한 키인지 확인해 주세요.
        \n2. 클라우드 콘솔의 API 활성화 후 실제 반영까지 5~10분 정도 소요될 수 있습니다.`;
    }
    
    return `AI 분석 중 오류 발생: ${lastError}`;
};
