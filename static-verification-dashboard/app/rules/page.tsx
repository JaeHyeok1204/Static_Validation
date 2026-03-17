"use client";

import PageHeader from "@/components/PageHeader";
import { useStore } from "@/store/useStore";
// Remove mockData import

export default function RulesPage() {
    const currentVersionIndex = useStore((state) => state.currentVersionIndex);
    const versionedData = useStore((state) => state.versionedData);
    const data = versionedData[currentVersionIndex] || { rulesList: [] };

    return (
        <div className="h-full flex flex-col">
            <PageHeader
                title="규칙 설명 및 중요도"
                description="검출된 위배 규칙에 대한 상세 설명 및 AI 보조 중요도 판정 결과를 제공합니다."
            />

            <div className="flex-1 overflow-y-auto pr-2 pb-6">
                <div className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
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
                                {data.rulesList.map((rule: import('../../store/useStore').RuleData, idx: number) => {
                                    const totalViolations = Object.values(rule.subsystemViolations || {}).reduce((a, b) => a + (Number(b) || 0), 0);
                                    const nonZeroSubsystems = Object.entries(rule.subsystemViolations || {})
                                        .filter(([_, count]) => (Number(count) || 0) > 0)
                                        .map(([id, count]) => `${id}(${count})`)
                                        .join(", ");

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
                                                <div className="font-semibold text-xs mb-1">Total: {totalViolations}</div>
                                                <div className="text-[10px] max-w-[150px] truncate" title={nonZeroSubsystems}>
                                                    {nonZeroSubsystems || "없음"}
                                                </div>
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
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-bold border border-[var(--border-color)] bg-[var(--bg-color)] ${
                                                        rule.severity === "High"
                                                            ? "text-red-500"
                                                            : rule.severity === "Medium"
                                                            ? "text-orange-500"
                                                            : "text-green-500"
                                                    }`}
                                                >
                                                    {rule.severity || "Medium"}
                                                </span>
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