"use client";

import PageHeader from "@/components/PageHeader";
import { useStore } from "@/store/useStore";
// Remove mockData import

export default function RulesPage() {
    const currentVersionIndex = useStore((state) => state.currentVersionIndex);
    const versionedData = useStore((state) => state.versionedData);
    const data = versionedData[currentVersionIndex];

    if (!data) return null;

    return (
        <div className="h-full flex flex-col">
            <PageHeader
                title="규칙 설명 및 중요도"
                description="검출된 위배 규칙에 대한 상세 설명 및 AI 보조 중요도 판정 결과를 제공합니다."
            />

            <div className="flex-1 overflow-y-auto pr-2 pb-6">
                <div className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
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
                                {data.rulesList.map((rule: any, idx: number) => (
                                    <tr key={idx} className="text-sm text-[var(--text-main)] border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--hover-bg)] transition-colors">
                                        <td className="p-4 font-bold text-[var(--accent-color)]">{rule.id}</td>
                                        <td className="p-4">
                                            <span className="bg-[var(--badge-bg)] border border-[var(--border-color)] px-2 py-1 rounded text-xs">{rule.category}</span>
                                        </td>
                                        <td className="p-4 leading-relaxed">{rule.description}</td>
                                        <td className="p-4 text-[var(--text-muted)] whitespace-nowrap">{rule.location}</td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <span className="text-lg">🤖</span>
                                                <span className="text-[var(--text-muted)] italic leading-relaxed">{rule.aiComment}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            {/* Severity indicates critical status, keep colored text but uniform borders/bgs */}
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold border border-[var(--border-color)] bg-[var(--bg-color)] ${
                                                    rule.severity === "High"
                                                        ? "text-red-500"
                                                        : rule.severity === "Medium"
                                                        ? "text-orange-500"
                                                        : "text-green-500"
                                                }`}
                                            >
                                                {rule.severity}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
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