"use client";

import PageHeader from "@/components/PageHeader";
import { useStore } from "@/store/useStore";

export default function TimePage() {
    const currentVersionIndex = useStore((state) => state.currentVersionIndex);
    const versionedData = useStore((state) => state.versionedData);
    const data = versionedData[currentVersionIndex];

    if (!data) return null;

    const timeEvaluationComponent = data.timeEvaluationComponent || [];
    const timeEvaluationRunnable = data.timeEvaluationRunnable || [];

    return (
        <div className="h-full flex flex-col">
            <PageHeader
                title="소요시간 평가 및 비교"
                description="각 직전 버전과 현재 버전 간의 검사 소요 시간을 비교하여 딜레이 또는 여유 시간을 판정합니다."
            />

            <div className="flex-1 overflow-y-auto pr-2 pb-6 space-y-8">
                {/* Component Section */}
                <section className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-[var(--text-main)] mb-4 flex items-center gap-2">
                        <span className="w-2 h-6 bg-purple-500 rounded-full inline-block"></span>
                        Component 검사 소요시간 판정
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[var(--hover-bg)] border-b border-[var(--border-color)] text-[var(--text-muted)] text-sm">
                                    <th className="p-3 font-semibold">서브시스템명</th>
                                    <th className="p-3 font-semibold">담당자</th>
                                    <th className="p-3 font-semibold text-center">직전버전 소요시간</th>
                                    <th className="p-3 font-semibold text-center bg-[var(--badge-bg)] font-bold text-[var(--accent-color)]">해당버전 소요시간</th>
                                    <th className="p-3 font-semibold text-center w-40">증감 비교</th>
                                </tr>
                            </thead>
                            <tbody>
                                {timeEvaluationComponent.map((item: import('../../store/useStore').TimeEvaluationData, idx: number) => (
                                    <tr key={idx} className="text-sm text-[var(--text-main)] border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--hover-bg)]">
                                        <td className="p-3 font-medium">{item.subsystem}</td>
                                        <td className="p-3">{item.owner}</td>
                                        <td className="p-3 text-center text-[var(--text-muted)]">{item.prevTime}</td>
                                        <td className="p-3 text-center font-bold text-[var(--text-main)]">{item.currentTime}</td>
                                        <td className={`p-3 text-center font-bold ${item.diffColor || 'text-[var(--text-main)]'}`}>
                                            {item.diff}
                                        </td>
                                    </tr>
                                ))}
                                {timeEvaluationComponent.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-4 text-center text-[var(--text-muted)] text-xs">데이터 통합 에디터에서 평가시간을 입력해주세요.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Runnable Section */}
                <section className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-[var(--text-main)] mb-4 flex items-center gap-2">
                        <span className="w-2 h-6 bg-emerald-500 rounded-full inline-block"></span>
                        Runnable 검사 소요시간 판정
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[var(--hover-bg)] border-b border-[var(--border-color)] text-[var(--text-muted)] text-sm">
                                    <th className="p-3 font-semibold">서브시스템명</th>
                                    <th className="p-3 font-semibold">담당자</th>
                                    <th className="p-3 font-semibold text-center">직전버전 소요시간</th>
                                    <th className="p-3 font-semibold text-center bg-[var(--badge-bg)] font-bold text-[var(--accent-color)]">해당버전 소요시간</th>
                                    <th className="p-3 font-semibold text-center w-40">증감 비교</th>
                                </tr>
                            </thead>
                            <tbody>
                                {timeEvaluationRunnable.map((item: import('../../store/useStore').TimeEvaluationData, idx: number) => (
                                    <tr key={idx} className="text-sm text-[var(--text-main)] border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--hover-bg)]">
                                        <td className="p-3 font-medium">{item.subsystem}</td>
                                        <td className="p-3">{item.owner}</td>
                                        <td className="p-3 text-center text-[var(--text-muted)]">{item.prevTime}</td>
                                        <td className="p-3 text-center font-bold text-[var(--text-main)]">{item.currentTime}</td>
                                        <td className={`p-3 text-center font-bold ${item.diffColor || 'text-[var(--text-main)]'}`}>
                                            {item.diff}
                                        </td>
                                    </tr>
                                ))}
                                {timeEvaluationRunnable.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-4 text-center text-[var(--text-muted)] text-xs">데이터 통합 에디터에서 평가시간을 입력해주세요.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
}