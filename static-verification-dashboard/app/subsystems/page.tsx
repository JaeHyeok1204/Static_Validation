"use client";

import PageHeader from "@/components/PageHeader";
import { useStore } from "@/store/useStore";
// Remove mockData import

export default function SubsystemsPage() {
    const currentVersionIndex = useStore((state) => state.currentVersionIndex);
    const versionedData = useStore((state) => state.versionedData);
    const data = versionedData[currentVersionIndex] || { subsystemsList: [] };

    return (
        <div className="h-full flex flex-col">
            <PageHeader
                title="서브시스템별 현황 및 진척도"
                description="각 서브시스템 버전별 위배 검출, 분석 및 진척 현황을 관리합니다."
            />

            <div className="flex-1 overflow-y-auto pr-2 pb-6">
                <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
                    {/* Component Box */}
                    <div className="bg-[var(--bg-color)] border border-blue-200 dark:border-blue-900/50 rounded-2xl p-6 shadow-sm overflow-x-auto relative mt-[4px]">
                        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 rounded-t-2xl"></div>
                        <h2 className="text-lg font-bold text-[var(--text-main)] mb-4 border-b border-[var(--border-color)] pb-2 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                Component 진척 현황
                            </div>
                        </h2>
                        <table className="w-full text-left border-collapse min-w-[500px]">
                            <thead>
                                <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] text-sm whitespace-nowrap">
                                    <th className="p-3 font-semibold text-center">서브시스템</th>
                                    <th className="p-3 font-semibold text-center">담당자</th>
                                    <th className="p-3 font-semibold text-center">신규 검출 위배</th>
                                    <th className="p-3 font-semibold text-center">분석 완료 건수</th>
                                    <th className="p-3 font-semibold min-w-[150px]">진척 퍼센티지 바</th>
                                </tr>
                            </thead>
                            <tbody>
                                {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"].map((subsystemChar: string, idx: number) => {
                                    const item = data.subsystemsList.find((s: import('../../store/useStore').SubsystemData) => s.id === subsystemChar && s.category === 'Component');
                                    return (
                                        <tr key={idx} className="text-sm text-[var(--text-main)] border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--hover-bg)] transition-colors">
                                            <td className="p-4 font-bold text-center text-blue-600 dark:text-blue-400">{subsystemChar}</td>
                                            <td className="p-4 text-center">{item ? item.owner : "-"}</td>
                                            <td className="p-4 text-center font-bold text-red-500">{item ? item.newDetectedViolations : 0}</td>
                                            <td className="p-4 text-center text-[var(--accent-color)]">{item ? item.analyzedViolations : 0}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-full bg-[var(--border-color)] rounded-full h-2 relative overflow-hidden">
                                                        <div
                                                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
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

                    {/* Runnable Box */}
                    <div className="bg-[var(--bg-color)] border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-6 shadow-sm overflow-x-auto relative mt-[4px]">
                        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 rounded-t-2xl"></div>
                        <h2 className="text-lg font-bold text-[var(--text-main)] mb-4 border-b border-[var(--border-color)] pb-2 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                                Runnable 진척 현황
                            </div>
                        </h2>
                        <table className="w-full text-left border-collapse min-w-[500px]">
                            <thead>
                                <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] text-sm whitespace-nowrap">
                                    <th className="p-3 font-semibold text-center">서브시스템</th>
                                    <th className="p-3 font-semibold text-center">담당자</th>
                                    <th className="p-3 font-semibold text-center">신규 검출 위배</th>
                                    <th className="p-3 font-semibold text-center">분석 완료 건수</th>
                                    <th className="p-3 font-semibold min-w-[150px]">진척 퍼센티지 바</th>
                                </tr>
                            </thead>
                            <tbody>
                                {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"].map((subsystemChar: string, idx: number) => {
                                    const item = data.subsystemsList.find((s: import('../../store/useStore').SubsystemData) => s.id === subsystemChar && s.category === 'Runnable');
                                    return (
                                        <tr key={idx} className="text-sm text-[var(--text-main)] border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--hover-bg)] transition-colors">
                                            <td className="p-4 font-bold text-center text-emerald-600 dark:text-emerald-400">{subsystemChar}</td>
                                            <td className="p-4 text-center">{item ? item.owner : "-"}</td>
                                            <td className="p-4 text-center font-bold text-red-500">{item ? item.newDetectedViolations : 0}</td>
                                            <td className="p-4 text-center text-[var(--accent-color)]">{item ? item.analyzedViolations : 0}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-full bg-[var(--border-color)] rounded-full h-2 relative overflow-hidden">
                                                        <div
                                                            className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
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