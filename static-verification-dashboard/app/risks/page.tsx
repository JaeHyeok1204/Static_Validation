"use client";

import PageHeader from "@/components/PageHeader";
import { useStore } from "@/store/useStore";
import { useState } from "react"; // Added useState import
import { AlertTriangle, Zap } from "lucide-react"; // Added icon imports

export default function RisksPage() {
    const currentVersionIndex = useStore((state) => state.currentVersionIndex);
    const versions = useStore((state) => state.versions); // Added versions
    const data = useStore((state) => state.versionedData[currentVersionIndex]);
    const runAIRiskAnalysis = useStore((state) => state.runAIRiskAnalysis); // Added runAIRiskAnalysis
    const [isAnalyzing, setIsAnalyzing] = useState(false); // Added isAnalyzing state

    const handleRunAI = async () => {
        setIsAnalyzing(true);
        await runAIRiskAnalysis();
        setIsAnalyzing(false);
    };

    if (!data) return null;

    return (
        <div className="h-full flex flex-col">
            <PageHeader
                title="업무 리스크"
                description="프로젝트 수행 간 식별된 리스크 및 AI 권장 조치 사항을 확인합니다."
            />

            <div className="flex-1 overflow-y-auto pr-2 pb-6">
                {/* New AI Analysis Guide and Button */}
                <div className="flex justify-between items-center mb-6 bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-200 dark:border-yellow-900/30">
                    <div className="flex items-center gap-3 text-yellow-700 dark:text-yellow-400">
                        <AlertTriangle className="animate-pulse" />
                        <div>
                            <p className="font-bold text-sm">💡 AI 위험 분석 가이드</p>
                            <p className="text-xs opacity-80">현재 검증 데이터와 이슈 내역을 종합 분석하여 도출된 위험 요소입니다.</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleRunAI}
                        disabled={isAnalyzing}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${
                            isAnalyzing 
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed" 
                            : "bg-yellow-500 text-white hover:bg-yellow-600 active:scale-95"
                        }`}
                    >
                        <Zap size={16} />
                        {isAnalyzing ? "위험 요소 추출 중..." : "AI 실시간 위험 분석 실행"}
                    </button>
                </div>
                {/* End New AI Analysis Guide and Button */}

                <div className="grid grid-cols-1 gap-6">
                    {data.risksList.map((risk: import('../../store/useStore').RiskData, idx: number) => (
                        <div key={idx} className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                            {/* Status bar on left edge mapped to accent logic */}
                            <div className={`absolute left-0 top-0 bottom-0 w-2 ${risk.level === 'High' ? 'bg-red-500' : risk.level === 'Medium' ? 'bg-orange-500' : 'bg-[var(--accent-color)]'}`} />
                            
                            <div className="pl-4 flex flex-col md:flex-row gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-[var(--text-main)]">{risk.title}</h3>
                                        <span className={`px-2 py-0.5 rounded border text-xs font-bold ${
                                            risk.level === "High" ? "border-red-200 text-red-600 bg-red-50" :
                                            risk.level === "Medium" ? "border-orange-200 text-orange-600 bg-orange-50" : "border-[var(--border-color)] text-[var(--accent-color)] bg-[var(--badge-bg)]"
                                        }`}>
                                            리스크 판단: {risk.level}
                                        </span>
                                    </div>
                                    <div className="text-sm text-[var(--text-muted)] leading-relaxed bg-[var(--hover-bg)] p-3 rounded-lg border border-[var(--border-color)]">
                                        <span className="font-semibold text-[var(--text-main)] block mb-1">상세 내용:</span>
                                        {risk.content}
                                    </div>
                                </div>
                                
                                <div className="flex-1 bg-[var(--badge-bg)] p-4 rounded-xl border border-[var(--border-color)]">
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl mt-1">💡</span>
                                        <div>
                                            <h4 className="font-bold text-[var(--text-main)] mb-1">AI 판단 권장 조치</h4>
                                            <p className="text-sm text-[var(--text-muted)] leading-relaxed">{risk.aiRecommendation}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {data.risksList.length === 0 && (
                        <div className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl p-8 text-center text-[var(--text-muted)] shadow-sm">
                            현재 버전에 식별된 리스크가 없습니다.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}