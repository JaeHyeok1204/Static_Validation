"use client";

import PageHeader from "@/components/PageHeader";
import { useStore } from "@/store/useStore";
// Remove mockData import

export default function RisksPage() {
    const currentVersionIndex = useStore((state) => state.currentVersionIndex);
    const versionedData = useStore((state) => state.versionedData);
    const data = versionedData[currentVersionIndex];

    if (!data) return null;

    return (
        <div className="h-full flex flex-col">
            <PageHeader
                title="업무 리스크"
                description="프로젝트 수행 간 식별된 리스크 및 AI 권장 조치 사항을 확인합니다."
            />

            <div className="flex-1 overflow-y-auto pr-2 pb-6">
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