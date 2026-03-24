"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { useStore } from "@/store/useStore";
import { Zap, RefreshCw } from 'lucide-react';

export default function RulesPage() {
    const currentVersionIndex = useStore((state) => state.currentVersionIndex);
    const versionedData = useStore((state) => state.versionedData);
    const runAIRuleAnalysis = useStore((state) => state.runAIRuleAnalysis);
    const data = versionedData[currentVersionIndex] || { rulesList: [] };
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleRunAI = async () => {
        setIsAnalyzing(true);
        await runAIRuleAnalysis();
        setIsAnalyzing(false);
    };

    return (
        <div className="h-full flex flex-col">
            <PageHeader
                title="규칙 설명 및 중요도"
                description="검출된 위배 규칙에 대한 상세 설명 및 AI 보조 중요도 판정 결과를 제공합니다."
            />

            <div className="flex-1 overflow-y-auto pr-2 pb-6">
                <div className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <h2 className="text-lg font-bold text-[var(--text-main)]">검출된 위배 규칙 목록</h2>
                        <button 
                            onClick={handleRunAI}
                            disabled={isAnalyzing}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${
                                isAnalyzing 
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                                : "bg-[var(--accent-color)] text-white hover:brightness-110 active:scale-95"
                            }`}
                        >
                            {isAnalyzing ? (
                                <RefreshCw size={16} className="animate-spin" />
                            ) : (
                                <Zap size={16} className="text-yellow-300 fill-yellow-300" />
                            )}
                            {isAnalyzing ? "AI 규칙 심층 분석 중..." : "AI 규칙 심층 분석 실행"}
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px] text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] text-sm whitespace-nowrap">
                                    <th className="p-4 font-semibold">규칙 ID</th>
                                    <th className="p-4 font-semibold">분류</th>
                                    <th className="p-4 font-semibold">설명</th>
                                    <th className="p-4 font-semibold">검출 위치</th>
                                    <th className="p-4 font-semibold min-w-[250px]">AI 코멘트</th>
                                    <th className="p-4 font-semibold text-center">심각도</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.rulesList.filter((r: any) => {
                                    if (r.id.trim() === '') return false;
                                    const totalViolations = Object.values(r.subsystemViolations || {}).reduce((a: number, b: any) => a + (Number(b) || 0), 0);
                                    return totalViolations > 0;
                                }).map((rule: import('../../store/useStore').RuleData, idx: number) => {
                                    const totalViolations = Object.values(rule.subsystemViolations || {}).reduce((a: number, b: any) => a + (Number(b) || 0), 0);

                                    return (
                                        <tr key={idx} className="text-sm text-[var(--text-main)] border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--hover-bg)] transition-colors">
                                            <td className="p-4">
                                                <div className="font-bold text-[var(--accent-color)]">{rule.id}</div>
                                                {rule.mabSubId && <div className="text-[10px] text-gray-400">Sub ID: {rule.mabSubId}</div>}
                                            </td>
                                            <td className="p-4">
                                                <span className="bg-[var(--badge-bg)] border border-[var(--border-color)] px-2 py-1 rounded text-xs">{rule.category}</span>
                                            </td>
                                            <td className="p-4 leading-relaxed">{rule.description || "-"}</td>
                                            <td className="p-4 text-[var(--text-muted)]">
                                                <div className="font-bold text-sm text-[var(--text-main)]">{totalViolations > 0 ? `${totalViolations.toLocaleString()}건 검출` : "0건"}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <span className="text-lg">🤖</span>
                                                    <span className="text-[var(--text-muted)] italic leading-relaxed text-xs">
                                                        {rule.aiComment || "검출된 데이터에 기반한 AI 분석 코멘트가 여기에 표시됩니다."}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                {rule.severity ? (
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-bold border border-[var(--border-color)] bg-[var(--bg-color)] ${
                                                            rule.severity === "High" || rule.severity === "high"
                                                                ? "text-red-500"
                                                                : rule.severity === "Medium" || rule.severity === "medium"
                                                                ? "text-orange-500"
                                                                : "text-green-500"
                                                        }`}
                                                    >
                                                        {rule.severity}
                                                    </span>
                                                ) : (
                                                    <span className="text-[var(--text-muted)]">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {data.rulesList.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-[var(--text-muted)] text-sm">해당 버전의 데이터가 존재하지 않습니다.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}