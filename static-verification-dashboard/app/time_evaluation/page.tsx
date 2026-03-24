"use client";

import PageHeader from "@/components/PageHeader";
import { useStore } from "@/store/useStore";
// Remove mockData import

export default function TimeEvalPage() {
    const currentVersionIndex = useStore((state) => state.currentVersionIndex);
    const versions = useStore((state) => state.versions);
    const versionedData = useStore((state) => state.versionedData);
    const data = versionedData[currentVersionIndex] || { timeEvaluationComponent: [], timeEvaluationRunnable: [] };

    const currentVersionName = versions[currentVersionIndex] || "이번 검증";
    const previousVersionName = currentVersionIndex > 0 ? versions[currentVersionIndex - 1] : "이전 기준";

    return (
        <div className="h-full flex flex-col">
            <PageHeader
                title="정적검증 소요시간 평가"
                description="현재 선택된 버전에 대한 모델을 Component와 Runnable로 나누어 서브시스템 단위로 소요 시간을 평가합니다."
            />

            <div className="flex-1 overflow-y-auto pr-2 pb-6">
                <div className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm mb-6 overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b border-[var(--border-color)]">
                                <th className="p-3 font-bold text-[var(--text-main)] w-32 border-r border-[var(--border-color)]" rowSpan={2}>서브시스템</th>
                                <th className="p-3 font-bold text-[var(--text-main)] text-center border-r border-[var(--border-color)]" colSpan={3}>Component 평가 소요시간</th>
                                <th className="p-3 font-bold text-[var(--text-main)] text-center" colSpan={3}>Runnable 평가 소요시간</th>
                            </tr>
                            <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] text-sm bg-[var(--hover-bg)]">
                                <th className="p-2 font-semibold text-center border-r border-[var(--border-color)] max-w-[120px] truncate" title={currentVersionName}>{currentVersionName}</th>
                                <th className="p-2 font-semibold text-center border-r border-[var(--border-color)] max-w-[120px] truncate" title={previousVersionName}>{previousVersionName}</th>
                                <th className="p-2 font-semibold text-center border-r border-[var(--border-color)]">증감폭</th>
                                <th className="p-2 font-semibold text-center border-r border-[var(--border-color)] max-w-[120px] truncate" title={currentVersionName}>{currentVersionName}</th>
                                <th className="p-2 font-semibold text-center border-r border-[var(--border-color)] max-w-[120px] truncate" title={previousVersionName}>{previousVersionName}</th>
                                <th className="p-2 font-semibold text-center">증감폭</th>
                            </tr>
                        </thead>
                        <tbody>
                            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'].map((subsystemChar, idx) => {
                                const comp = data.timeEvaluationComponent?.find((c: import('../../store/useStore').TimeEvaluationData) => c.subsystem === subsystemChar);
                                const runn = data.timeEvaluationRunnable?.find((r: import('../../store/useStore').TimeEvaluationData) => r.subsystem === subsystemChar);

                                return (
                                    <tr key={idx} className="h-[48px] text-sm text-[var(--text-main)] border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--hover-bg)] transition-colors">
                                        <td className="p-3 font-bold text-center border-r border-[var(--border-color)] text-[var(--accent-color)]">{subsystemChar}</td>
                                        
                                        {/* Component Stats */}
                                        <td className="p-3 text-center border-r border-[var(--border-color)] font-semibold">{comp ? comp.currentTime : "-"}</td>
                                        <td className="p-3 text-center border-r border-[var(--border-color)] text-[var(--text-muted)]">{comp ? comp.prevTime : "-"}</td>
                                        <td className={`p-3 text-center border-r border-[var(--border-color)] font-bold ${comp?.diffColor || 'text-[var(--text-muted)]'}`}>
                                            {comp ? comp.diff : "-"}
                                        </td>

                                        {/* Runnable Stats */}
                                        <td className="p-3 text-center border-r border-[var(--border-color)] font-semibold">{runn ? runn.currentTime : "-"}</td>
                                        <td className="p-3 text-center border-r border-[var(--border-color)] text-[var(--text-muted)]">{runn ? runn.prevTime : "-"}</td>
                                        <td className={`p-3 text-center font-bold ${runn?.diffColor || 'text-[var(--text-muted)]'}`}>
                                            {runn ? runn.diff : "-"}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
