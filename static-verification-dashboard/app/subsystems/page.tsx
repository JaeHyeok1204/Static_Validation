"use client";

import PageHeader from "@/components/PageHeader";
import { useStore } from "@/store/useStore";
// Remove mockData import

export default function SubsystemsPage() {
    const currentVersionIndex = useStore((state) => state.currentVersionIndex);
    const versionedData = useStore((state) => state.versionedData);
    const data = versionedData[currentVersionIndex];

    if (!data) return null;

    return (
        <div className="h-full flex flex-col">
            <PageHeader
                title="서브시스템별 현황 및 진척도"
                description="각 서브시스템 버전별 위배 검출, 분석 및 진척 현황을 관리합니다."
            />

            <div className="flex-1 overflow-y-auto pr-2 pb-6">
                <div className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] text-sm whitespace-nowrap">
                                    <th className="p-3 font-semibold text-center">분류</th>
                                    <th className="p-3 font-semibold text-center">서브시스템</th>
                                    <th className="p-3 font-semibold text-center">담당자</th>
                                    <th className="p-3 font-semibold text-center">검출 위배 건수</th>
                                    <th className="p-3 font-semibold text-center">신규 위배 개수</th>
                                    <th className="p-3 font-semibold text-center">분석 위배 건수</th>
                                    <th className="p-3 font-semibold min-w-[200px]">진척 퍼센티지 바</th>
                                </tr>
                            </thead>
                            <tbody>
                                {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'].map((subsystemChar: string, idx: number) => {
                                    const item = data.subsystemsList.find((s: any) => s.version === subsystemChar);
                                    return (
                                        <tr key={idx} className="text-sm text-[var(--text-main)] border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--hover-bg)] transition-colors">
                                            <td className="p-4 text-center">
                                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--badge-bg)] border border-[var(--border-color)]">
                                                    {item && item.category ? item.category : "데이터 없음"}
                                                </span>
                                            </td>
                                            <td className="p-4 font-bold text-center text-[var(--accent-color)]">{subsystemChar}</td>
                                            <td className="p-4 text-center">{item ? item.owner : "-"}</td>
                                            <td className="p-4 text-center text-[var(--text-muted)]">{item ? item.detectedViolations : 0}</td>
                                            <td className="p-4 text-center font-bold text-red-500">{item ? item.newViolations : 0}</td>
                                            <td className="p-4 text-center text-[var(--accent-color)]">{item ? item.analyzedViolations : 0}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-full bg-[var(--border-color)] rounded-full h-2 relative overflow-hidden">
                                                        <div
                                                            className="bg-[var(--accent-color)] h-2 rounded-full transition-all duration-500"
                                                            style={{ width: `${item ? item.progress : 0}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs font-bold w-10 text-right">{item ? item.progress : 0}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}