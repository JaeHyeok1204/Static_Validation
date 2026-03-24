/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import PageHeader from "@/components/PageHeader";
import { useStore } from "@/store/useStore";
import { useState, useEffect } from "react";

export default function ReportsPage() {
    const currentVersionIndex = useStore((state) => state.currentVersionIndex);
    const versionedData = useStore((state) => state.versionedData);
    const data = versionedData[currentVersionIndex] || { reportsDraft: { team: "내용 없음", customer: "내용 없음" } };
    
    const [isGenerating, setIsGenerating] = useState(false);
    const [draftTeam, setDraftTeam] = useState("");
    const [draftCustomer, setDraftCustomer] = useState("");

    useEffect(() => {
        if (data?.reportsDraft) {
            setDraftTeam(data.reportsDraft.team);
            setDraftCustomer(data.reportsDraft.customer);
        }
    }, [data]);

    const handleRegenerate = async () => {
        setIsGenerating(true);
        // Simulate AI analysis based on current version data
        setTimeout(() => {
            const summary = `버전 ${currentVersionIndex} 데이터 기반 분석 결과: 전체 진척도는 ${data.dashboardData.overallProgress}이며, ${data.dashboardData.newRuleViolationsCount}건의 신규 위배가 탐지되었습니다.`;
            setDraftTeam(`[보고서 자동 생성]\n${summary}\n\n1. 주요 검증 결과:\n- Component/Runnable 통합 진척도 및 소요시간 데이터 분석 완료.\n2. 향후 계획:\n- 잔여 위배 항목에 대한 상세 분석 및 조치 예정.`);
            setDraftCustomer(`[KEFICO 주진 보고]\n\n요약: 버전 ${currentVersionIndex} 기준 전체 진척도는 ${data.dashboardData.overallProgress}를 달성했습니다.\n다음 단계: 본 버전에서 탐지된 나머지 ${data.dashboardData.newRuleViolationsCount}건의 신규 위배에 대한 상세 분석 및 조치를 마무리할 예정입니다.`);
            setIsGenerating(false);
        }, 1500);
    };

    const handleDownloadFormat = () => {
        const content = `=== 내부 개발팀 보고 ===\n${draftTeam}\n\n=== 대고객사 보고 ===\n${draftCustomer}`;
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Verification_Report_Vers${currentVersionIndex}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="h-full flex flex-col">
            <PageHeader
                title="AI 보고서 초안 관리"
                description="수집된 전체 데이터를 기반으로 요약 보고서 초안을 AI가 자동 생성합니다."
            />

            <div className="flex-1 overflow-y-auto pr-2 pb-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 1. 내부 개발 및 검증팀용 */}
                    <section className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm flex flex-col">
                        <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                            <h2 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
                                👨‍💻 팀 주진 보고
                            </h2>
                            <button className="text-xs bg-[var(--badge-bg)] hover:bg-[var(--hover-bg)] text-[var(--accent-color)] border border-[var(--border-color)] font-semibold py-1 px-3 rounded shadow-sm transition-colors">텍스트 복사</button>
                        </div>
                        <p className="text-sm text-[var(--text-muted)] mb-4 border-b border-[var(--border-color)] pb-3">매주 수요일 오전까지 팀 주진 내용 보고 필수</p>
                        
                        <div className="bg-[var(--hover-bg)] border border-[var(--border-color)] rounded-xl p-4 text-sm leading-relaxed text-[var(--text-main)] flex-grow font-mono whitespace-pre-wrap">
                            {isGenerating ? "AI가 데이터를 분석하며 초안을 재작성 중입니다..." : draftTeam}
                        </div>
                    </section>

                    {/* 2. 대고객 또는 개발PM 보고용 */}
                    <section className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm flex flex-col">
                        <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                            <h2 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
                                📊 KEFICO 주진 보고
                            </h2>
                            <button className="text-xs bg-[var(--badge-bg)] hover:bg-[var(--hover-bg)] text-[var(--accent-color)] border border-[var(--border-color)] font-semibold py-1 px-3 rounded shadow-sm transition-colors">텍스트 복사</button>
                        </div>
                        <p className="text-sm text-[var(--text-muted)] mb-4 border-b border-[var(--border-color)] pb-3">매주 금요일 오전까지 KEFICO 주진 내용 보고 필수</p>
                        
                        <div className="bg-[var(--hover-bg)] border border-[var(--border-color)] rounded-xl p-4 text-sm leading-relaxed text-[var(--text-main)] flex-grow font-mono whitespace-pre-wrap">
                            {isGenerating ? "AI가 데이터를 분석하며 초안을 재작성 중입니다..." : draftCustomer}
                        </div>
                    </section>
                </div>

                {/* 하단 공통 Control */}
                <div className="mt-6 flex flex-wrap justify-end gap-3">
                    <button 
                        onClick={handleRegenerate}
                        disabled={isGenerating}
                        className="bg-[var(--hover-bg)] hover:brightness-95 border border-[var(--border-color)] text-[var(--text-main)] font-bold py-2.5 px-6 rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50"
                    >
                        {isGenerating ? "🔄 작성중..." : "🔄 AI 초안 다시 작성 (최신 데이터 반영)"}
                    </button>
                    <button 
                        onClick={handleDownloadFormat}
                        className="bg-[var(--accent-color)] hover:brightness-90 text-[var(--bg-color)] font-bold py-2.5 px-6 rounded-xl text-sm shadow-sm transition-all"
                    >
                        💾 확정 파일 생성 및 다운로드
                    </button>
                </div>
            </div>
        </div>
    );
}