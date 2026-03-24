"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { useStore } from "@/store/useStore";
import { hmsToSeconds, secondsToHms } from "@/lib/timeUtils";

export default function DataEditorPage() {
    const currentVersionIndex = useStore((state) => state.currentVersionIndex);
    const versions = useStore((state) => state.versions);
    const versionedData = useStore((state) => state.versionedData);
    const updateVersionData = useStore((state) => state.updateVersionData);
    const createNewVersion = useStore((state) => state.createNewVersion);
    const addRuleRow = useStore((state) => state.addRuleRow);
    const deleteRuleRow = useStore((state) => state.deleteRuleRow);
    const updateRuleRow = useStore((state) => state.updateRuleRow);
    const INITIAL_MAB_RULE_IDS = useStore((state) => state.INITIAL_MAB_RULE_IDS);
    const INITIAL_MISRA_RULE_IDS = useStore((state) => state.INITIAL_MISRA_RULE_IDS);
    const currentUser = useStore((state) => state.currentUser);
    const isSyncing = useStore((state) => state.isSyncing);
    const lastSyncedAt = useStore((state) => state.lastSyncedAt);

    const data = versionedData[currentVersionIndex];
    const [newVersionStr, setNewVersionStr] = useState("");
    
    // Rule Matrix State - Component
    const [compRuleSearch, setCompRuleSearch] = useState("");
    const [compRuleCategoryFilter, setCompRuleCategoryFilter] = useState<'ALL' | 'MAB' | 'MISRA'>('ALL');
    const [compRulePage, setCompRulePage] = useState(1);

    // Rule Matrix State - Runnable
    const [runnRuleSearch, setRunnRuleSearch] = useState("");
    const [runnRuleCategoryFilter, setRunnRuleCategoryFilter] = useState<'ALL' | 'MAB' | 'MISRA'>('ALL');
    const [runnRulePage, setRunnRulePage] = useState(1);

    const rulesPerPage = 15;

    const handleCreateVersion = () => {
        if (!newVersionStr.trim()) return;
        createNewVersion(newVersionStr);
        setNewVersionStr("");
        alert("신규 버전이 생성되었습니다.");
    };

    // Helpers to write to Zustand
    const calculateAutomatedMetrics = (updatedData: import('../../store/useStore').VersionData) => {
        const { dashboardData, subsystemsList, rulesList } = updatedData;
        const newDashboard = { ...dashboardData };

        // 1. Calculate overall progress and specific component/runnable inspection/analysis counts
        if (subsystemsList && subsystemsList.length > 0) {
            const validSubsystems = subsystemsList.filter((s: import('../../store/useStore').SubsystemData) => s.progress !== undefined);
            if (validSubsystems.length > 0) {
                const totalProgress = validSubsystems.reduce((acc: number, s: import('../../store/useStore').SubsystemData) => acc + (s.progress || 0), 0);
                newDashboard.overallProgress = Math.round(totalProgress / validSubsystems.length) + "%";
            } else {
                newDashboard.overallProgress = "0%";
            }

            const compList = subsystemsList.filter(s => s.category === 'Component');
            const runnList = subsystemsList.filter(s => s.category === 'Runnable');
            
            const compInspection = compList.reduce((acc, s) => acc + (s.newDetectedViolations || 0), 0);
            const compAnalysis = compList.reduce((acc, s) => acc + (s.analyzedViolations || 0), 0);
            
            const runnInspection = runnList.reduce((acc, s) => acc + (s.newDetectedViolations || 0), 0);
            const runnAnalysis = runnList.reduce((acc, s) => acc + (s.analyzedViolations || 0), 0);
            
            newDashboard.violationInspectionComponent = compInspection.toString();
            newDashboard.violationAnalysisComponent = compAnalysis.toString();
            newDashboard.violationInspectionRunnable = runnInspection.toString();
            newDashboard.violationAnalysisRunnable = runnAnalysis.toString();
        } else {
            newDashboard.violationInspectionComponent = "0";
            newDashboard.violationAnalysisComponent = "0";
            newDashboard.violationInspectionRunnable = "0";
            newDashboard.violationAnalysisRunnable = "0";
        }


        // 2. Calculate New Rule Violations Count from Rule Matrix
        if (rulesList && rulesList.length > 0) {
            const totalViolations = rulesList
                .filter(r => r.id.trim() !== '') // Ignore rules without an ID
                .reduce((acc, rule) => {
                    const ruleSum = Object.values(rule.subsystemViolations || {}).reduce((sum, val) => sum + (Number(val) || 0), 0);
                    return acc + ruleSum;
                }, 0);
            newDashboard.newRuleViolationsCount = totalViolations;
        } else {
            newDashboard.newRuleViolationsCount = 0;
        }

        // 3. Calculate expected schedule status
        if (newDashboard.startDate && newDashboard.endDate) {
            const start = new Date(newDashboard.startDate);
            const end = new Date(newDashboard.endDate);
            const today = new Date();
            
            // Normalize dates (strip time)
            start.setHours(0,0,0,0);
            end.setHours(0,0,0,0);
            today.setHours(0,0,0,0);

            const totalMs = end.getTime() - start.getTime();
            const elapsedMs = today.getTime() - start.getTime();
            const currentProgress = parseInt(newDashboard.overallProgress) || 0;

            if (currentProgress === 100) {
                newDashboard.expectedSchedule = "업무 완료";
            } else if (today > end) {
                newDashboard.expectedSchedule = "업무 지연";
            } else if (today < start) {
                newDashboard.expectedSchedule = "검증 예정";
            } else {
                if (totalMs > 0) {
                    const targetProgress = Math.max(0, Math.min(100, (elapsedMs / totalMs) * 100));
                    const diff = currentProgress - targetProgress;
                    if (diff < -5) {
                        newDashboard.expectedSchedule = `지연 (${Math.abs(Math.round(diff))}% 부족)`;
                    } else if (diff > 5) {
                        newDashboard.expectedSchedule = `쾌조 (${Math.round(diff)}% 초과)`;
                    } else {
                        newDashboard.expectedSchedule = "정상 진행 (On-track)";
                    }
                }
            }
        } else {
            newDashboard.expectedSchedule = "측정불가";
        }

        return newDashboard;
    };

    const handleChangeDashboard = (key: string, value: string) => {
        const updatedDashboard = calculateAutomatedMetrics({
            ...data,
            dashboardData: { ...data.dashboardData, [key]: value }
        });
        updateVersionData(currentVersionIndex, {
            dashboardData: updatedDashboard
        });
    };

    const handleChangeReport = (key: 'team' | 'customer', value: string) => {
        updateVersionData(currentVersionIndex, {
            reportsDraft: { ...data.reportsDraft, [key]: value }
        });
    };

    // Rule Matrix Logic - Component
    const filteredCompRules = (data?.rulesList || []).filter(r => {
        if (r.scope === 'Runnable') return false;
        const matchesSearch = r.id.toLowerCase().includes(compRuleSearch.toLowerCase());
        const matchesCategory = compRuleCategoryFilter === 'ALL' || r.category === compRuleCategoryFilter;
        return matchesSearch && matchesCategory;
    });
    const paginatedCompRules = filteredCompRules.slice((compRulePage - 1) * rulesPerPage, compRulePage * rulesPerPage);

    // Rule Matrix Logic - Runnable
    const filteredRunnRules = (data?.rulesList || []).filter(r => {
        if (r.scope !== 'Runnable') return false;
        const matchesSearch = r.id.toLowerCase().includes(runnRuleSearch.toLowerCase());
        const matchesCategory = runnRuleCategoryFilter === 'ALL' || r.category === runnRuleCategoryFilter;
        return matchesSearch && matchesCategory;
    });
    const paginatedRunnRules = filteredRunnRules.slice((runnRulePage - 1) * rulesPerPage, runnRulePage * rulesPerPage);

    const handleTableKeyDown = (e: React.KeyboardEvent<HTMLTableElement>) => {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT') return;

        const row = target.closest('tr');
        if (!row) return;

        if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevRow = row.previousElementSibling;
            if (prevRow) {
                const index = Array.from(row.children).indexOf(target.closest('td')!);
                const targetInput = prevRow.children[index]?.querySelector('input');
                if (targetInput) targetInput.focus();
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextRow = row.nextElementSibling;
            if (nextRow) {
                const index = Array.from(row.children).indexOf(target.closest('td')!);
                const targetInput = nextRow.children[index]?.querySelector('input');
                if (targetInput) targetInput.focus();
            }
        } else if (e.key === 'ArrowLeft') {
            const input = target as HTMLInputElement;
            if (input.selectionStart === 0 && input.selectionEnd === 0) {
                e.preventDefault();
                const td = target.closest('td');
                const prevTd = td?.previousElementSibling;
                const targetInput = prevTd?.querySelector('input');
                if (targetInput) targetInput.focus();
            }
        } else if (e.key === 'ArrowRight') {
            const input = target as HTMLInputElement;
            if (input.selectionStart === input.value.length && input.selectionEnd === input.value.length) {
                e.preventDefault();
                const td = target.closest('td');
                const nextTd = td?.nextElementSibling;
                const targetInput = nextTd?.querySelector('input');
                if (targetInput) targetInput.focus();
            }
        }
    };

    return (
        <div className="h-full flex flex-col">
            <PageHeader
                title="데이터 통합 에디터"
                description="선택된 버전의 모든 검증 수치 및 텍스트 데이터를 직접 입력하고 수정합니다."
            />

            <div className="flex-1 overflow-y-auto pr-2 pb-6 space-y-6">
                
                {/* 1. 신규 버전 생성 */}
                <section className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-[var(--text-main)] mb-4 border-b border-[var(--border-color)] pb-2 flex items-center justify-between">
                        🚀 신규 버전 데이터 생성
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input 
                            type="text" 
                            className="flex-1 border border-[var(--border-color)] bg-white rounded-lg p-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]" 
                            placeholder="예: T0050, T0060..."
                            value={newVersionStr}
                            onChange={(e) => setNewVersionStr(e.target.value)}
                        />
                        <button 
                            onClick={handleCreateVersion}
                            className="bg-[var(--accent-color)] text-[var(--bg-color)] hover:brightness-90 px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all whitespace-nowrap"
                        >
                            신규 버전 생성하기
                        </button>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-2">* 새로운 버전을 생성하면 빈 템플릿(0%) 상태로 초기화되며 상단 버전 선택기에서 바로 작업 탭으로 전환됩니다.</p>
                </section>

                {/* 데이터 정합성 검사 (Violation Sync Check) - Moved to top per user request */}
                {data && (
                    <section className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-md my-0">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
                            🔍 데이터 정합성 검사 (상세 데이터 vs 규칙 매트릭스)
                            <span className="text-xs font-normal text-slate-500">* 서브시스템별 위배 개수 일치 여부를 실시간으로 대조합니다.</span>
                        </h2>

                        <div className="flex flex-col sm:flex-row gap-4 mb-2">
                            {/* Component Consistency */}
                            {(() => {
                                const compTotalDetail = data.subsystemsList.filter(s => s.category === 'Component').reduce((acc, s) => acc + (s.newDetectedViolations || 0), 0);
                                const compTotalMatrix = (data.rulesList || []).filter(r => r.scope === 'Component' && r.id.trim() !== '').reduce((acc, rule) => acc + (Number(rule.subsystemViolations?.['TOTAL']) || 0), 0);
                                const isMatch = compTotalDetail === compTotalMatrix;
                                return (
                                    <div className={`flex-1 p-4 rounded-xl border-2 transition-all ${isMatch ? 'border-emerald-100 bg-emerald-50/50' : 'border-red-100 bg-red-50/50 shadow-inner'}`}>
                                        <div className="font-bold text-sm text-slate-700 mb-3 flex items-center gap-2">
                                            <span className="w-5 h-5 flex items-center justify-center bg-blue-500 text-white rounded text-xs">C</span>
                                            Component 총합 점검
                                        </div>
                                        <div className="flex justify-between items-center text-xs mb-1">
                                            <span className="text-slate-600">서브시스템 상세 합계:</span>
                                            <span className="font-bold text-slate-800">{compTotalDetail}건</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs mb-3">
                                            <span className="text-slate-600">규칙 매트릭스 합계:</span>
                                            <span className="font-bold text-slate-800">{compTotalMatrix}건</span>
                                        </div>
                                        <div className={`p-2 rounded-lg text-center text-xs font-bold ${isMatch ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                            {isMatch ? '✅ 완벽하게 일치합니다' : `❌ 불일치 (차이: ${Math.abs(compTotalMatrix - compTotalDetail)}건)`}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Runnable Consistency */}
                            {(() => {
                                const runnTotalDetail = data.subsystemsList.filter(s => s.category === 'Runnable').reduce((acc, s) => acc + (s.newDetectedViolations || 0), 0);
                                const runnTotalMatrix = (data.rulesList || []).filter(r => r.scope === 'Runnable' && r.id.trim() !== '').reduce((acc, rule) => acc + (Number(rule.subsystemViolations?.['TOTAL']) || 0), 0);
                                const isMatch = runnTotalDetail === runnTotalMatrix;
                                return (
                                    <div className={`flex-1 p-4 rounded-xl border-2 transition-all ${isMatch ? 'border-emerald-100 bg-emerald-50/50' : 'border-red-100 bg-red-50/50 shadow-inner'}`}>
                                        <div className="font-bold text-sm text-slate-700 mb-3 flex items-center gap-2">
                                            <span className="w-5 h-5 flex items-center justify-center bg-emerald-500 text-white rounded text-xs">R</span>
                                            Runnable 총합 점검
                                        </div>
                                        <div className="flex justify-between items-center text-xs mb-1">
                                            <span className="text-slate-600">서브시스템 상세 합계:</span>
                                            <span className="font-bold text-slate-800">{runnTotalDetail}건</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs mb-3">
                                            <span className="text-slate-600">규칙 매트릭스 합계:</span>
                                            <span className="font-bold text-slate-800">{runnTotalMatrix}건</span>
                                        </div>
                                        <div className={`p-2 rounded-lg text-center text-xs font-bold ${isMatch ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                            {isMatch ? '✅ 완벽하게 일치합니다' : `❌ 불일치 (차이: ${Math.abs(runnTotalMatrix - runnTotalDetail)}건)`}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </section>
                )}

                {data ? (
                    <>
                        <div className="text-sm font-bold text-[var(--accent-color)] mb-2 mt-4">
                            현재 편집 중인 버전: [{versions[currentVersionIndex]}]
                        </div>

                {/* 일정 관리 */}
                <section className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-[var(--text-main)] mb-4 border-b border-[var(--border-color)] pb-2 flex items-center justify-between">
                        📅 프로젝트 검증 일정
                        <span className="text-xs text-[var(--accent-color)] font-normal">* 예상 일정 계산 시 활용됩니다.</span>
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">업무 시작일</label>
                            <input 
                                type="date" 
                                value={data.dashboardData?.startDate || ""} 
                                onChange={(e) => handleChangeDashboard('startDate', e.target.value)}
                                className="w-full border p-2 rounded-lg text-sm bg-white text-black border-[var(--border-color)]" 
                            />
                        </div>
                        <span className="text-[var(--text-muted)] font-bold mt-4">~</span>
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">업무 종료일</label>
                            <input 
                                type="date" 
                                value={data.dashboardData?.endDate || ""} 
                                onChange={(e) => handleChangeDashboard('endDate', e.target.value)}
                                className="w-full border p-2 rounded-lg text-sm bg-white text-black border-[var(--border-color)]" 
                            />
                        </div>
                    </div>
                </section>

                {/* 2. 서브시스템 현황 편집 (Component / Runnable 분리) */}
                <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
                    {/* Component 상세 데이터 */}
                    <section className="bg-[var(--bg-color)] border border-blue-200 dark:border-blue-900/50 rounded-2xl p-6 shadow-sm overflow-x-auto relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 rounded-t-2xl"></div>
                        <h2 className="text-lg font-bold text-[var(--text-main)] mb-4 border-b border-[var(--border-color)] pb-2 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                Component 상세 데이터 (A~P)
                            </div>
                        </h2>
                        <table className="w-full text-left border-collapse min-w-[500px]">
                            <thead>
                                <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] text-xs text-center">
                                    <th className="p-2 font-semibold">서브시스템</th>
                                    <th className="p-2 font-semibold">담당자</th>
                                    <th className="p-2 font-semibold">신규 검출 위배</th>
                                    <th className="p-2 font-semibold">분석 완료</th>
                                    <th className="p-2 font-semibold">진척도 (%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"].map((subsystemChar) => {
                                    const categoryType = 'Component';
                                    const itemId = `${subsystemChar}-${categoryType}`;
                                    const currentItem = data.subsystemsList.find((s: import('../../store/useStore').SubsystemData) => s.id === subsystemChar && s.category === categoryType) || {
                                        id: subsystemChar, category: categoryType, owner: "", newDetectedViolations: 0, analyzedViolations: 0, progress: 0
                                    };

                                    const updateSubsystem = (key: string, val: string | number) => {
                                        const newList = [...data.subsystemsList];
                                        const existingIdx = newList.findIndex((s: import('../../store/useStore').SubsystemData) => s.id === subsystemChar && s.category === categoryType);
                                        
                                        let updatedOwner = currentItem.owner;
                                        const nv = key === 'newDetectedViolations' ? Number(val) : (currentItem.newDetectedViolations || 0);
                                        const av = key === 'analyzedViolations' ? Number(val) : (currentItem.analyzedViolations || 0);

                                        if (nv > 0 || av > 0) {
                                            updatedOwner = currentUser?.name || "";
                                        } else {
                                            updatedOwner = "";
                                        }

                                        const mergedItem = existingIdx >= 0 
                                            ? { ...newList[existingIdx], [key]: val, owner: updatedOwner } 
                                            : { ...currentItem, [key]: val, owner: updatedOwner };
                                        
                                        if (key === 'newDetectedViolations' || key === 'analyzedViolations') {
                                            const total = (mergedItem.newDetectedViolations || 0) > 0 ? (mergedItem.newDetectedViolations || 0) : ((mergedItem.analyzedViolations || 0) > 0 ? (mergedItem.analyzedViolations || 0) : 1);
                                            mergedItem.progress = Number(Math.min(100, Math.round(((mergedItem.analyzedViolations || 0) / total) * 100)).toFixed(1));
                                            if ((mergedItem.newDetectedViolations || 0) === 0 && (mergedItem.analyzedViolations || 0) === 0) mergedItem.progress = 0;
                                        }

                                        if (existingIdx >= 0) newList[existingIdx] = mergedItem;
                                        else newList.push(mergedItem);

                                        const updatedDashboard = calculateAutomatedMetrics({ ...data, subsystemsList: newList });
                                        updateVersionData(currentVersionIndex, { subsystemsList: newList, dashboardData: updatedDashboard });
                                    };

                                    return (
                                        <tr key={itemId} className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--hover-bg)]">
                                            <td className="p-2 text-center font-bold text-[var(--text-main)] w-16">{subsystemChar}</td>
                                            <td className="p-2 w-24">
                                                <input 
                                                    readOnly 
                                                    value={currentItem.owner} 
                                                    placeholder="자동입력" 
                                                    className="w-full border border-[var(--border-color)] rounded p-1 text-xs text-center bg-gray-50 text-blue-600 font-bold placeholder:text-gray-500" 
                                                />
                                            </td>
                                            <td className="p-2 w-28">
                                                <input type="text" inputMode="numeric" pattern="[0-9]*" value={currentItem.newDetectedViolations === 0 ? "" : currentItem.newDetectedViolations} onChange={(e) => updateSubsystem('newDetectedViolations', e.target.value === "" ? 0 : Number(e.target.value.replace(/[^0-9]/g, '')))} className="w-full border border-[var(--border-color)] rounded p-1 text-xs text-center bg-white text-black" />
                                            </td>
                                            <td className="p-2 w-28">
                                                <input type="text" inputMode="numeric" pattern="[0-9]*" value={currentItem.analyzedViolations === 0 ? "" : currentItem.analyzedViolations} onChange={(e) => updateSubsystem('analyzedViolations', e.target.value === "" ? 0 : Number(e.target.value.replace(/[^0-9]/g, '')))} className="w-full border border-[var(--border-color)] rounded p-1 text-xs text-center bg-white text-black" />
                                            </td>
                                            <td className="p-2 w-24">
                                                <div className="w-full border border-[var(--border-color)] rounded p-1 text-xs text-center bg-gray-100 text-gray-500 font-bold">{currentItem.progress}%</div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </section>

                    {/* Runnable 상세 데이터 */}
                    <section className="bg-[var(--bg-color)] border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-6 shadow-sm overflow-x-auto relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 rounded-t-2xl"></div>
                        <h2 className="text-lg font-bold text-[var(--text-main)] mb-4 border-b border-[var(--border-color)] pb-2 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                                Runnable 상세 데이터 (A~P)
                            </div>
                        </h2>
                        <table className="w-full text-left border-collapse min-w-[500px]">
                            <thead>
                                <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] text-xs text-center">
                                    <th className="p-2 font-semibold">서브시스템</th>
                                    <th className="p-2 font-semibold">담당자</th>
                                    <th className="p-2 font-semibold">신규 검출 위배</th>
                                    <th className="p-2 font-semibold">분석 완료</th>
                                    <th className="p-2 font-semibold">진척도 (%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"].map((subsystemChar) => {
                                    const categoryType = 'Runnable';
                                    const itemId = `${subsystemChar}-${categoryType}`;
                                    const currentItem = data.subsystemsList.find((s: import('../../store/useStore').SubsystemData) => s.id === subsystemChar && s.category === categoryType) || {
                                        id: subsystemChar, category: categoryType, owner: "", newDetectedViolations: 0, analyzedViolations: 0, progress: 0
                                    };

                                    const updateSubsystem = (key: string, val: string | number) => {
                                        const newList = [...data.subsystemsList];
                                        const existingIdx = newList.findIndex((s: import('../../store/useStore').SubsystemData) => s.id === subsystemChar && s.category === categoryType);
                                        
                                        let updatedOwner = currentItem.owner;
                                        const nv = key === 'newDetectedViolations' ? Number(val) : (currentItem.newDetectedViolations || 0);
                                        const av = key === 'analyzedViolations' ? Number(val) : (currentItem.analyzedViolations || 0);

                                        if (nv > 0 || av > 0) {
                                            updatedOwner = currentUser?.name || "";
                                        } else {
                                            updatedOwner = "";
                                        }

                                        const mergedItem = existingIdx >= 0 
                                            ? { ...newList[existingIdx], [key]: val, owner: updatedOwner } 
                                            : { ...currentItem, [key]: val, owner: updatedOwner };
                                        
                                        if (key === 'newDetectedViolations' || key === 'analyzedViolations') {
                                            const total = (mergedItem.newDetectedViolations || 0) > 0 ? (mergedItem.newDetectedViolations || 0) : ((mergedItem.analyzedViolations || 0) > 0 ? (mergedItem.analyzedViolations || 0) : 1);
                                            mergedItem.progress = Number(Math.min(100, Math.round(((mergedItem.analyzedViolations || 0) / total) * 100)).toFixed(1));
                                            if ((mergedItem.newDetectedViolations || 0) === 0 && (mergedItem.analyzedViolations || 0) === 0) mergedItem.progress = 0;
                                        }

                                        if (existingIdx >= 0) newList[existingIdx] = mergedItem;
                                        else newList.push(mergedItem);

                                        const updatedDashboard = calculateAutomatedMetrics({ ...data, subsystemsList: newList });
                                        updateVersionData(currentVersionIndex, { subsystemsList: newList, dashboardData: updatedDashboard });
                                    };

                                    return (
                                        <tr key={itemId} className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--hover-bg)]">
                                            <td className="p-2 text-center font-bold text-[var(--text-main)] w-16">{subsystemChar}</td>
                                            <td className="p-2 w-24">
                                                <input 
                                                    readOnly 
                                                    value={currentItem.owner} 
                                                    placeholder="자동입력" 
                                                    className="w-full border border-[var(--border-color)] rounded p-1 text-xs text-center bg-gray-50 text-emerald-600 font-bold placeholder:text-gray-500" 
                                                />
                                            </td>
                                            <td className="p-2 w-28">
                                                <input type="text" inputMode="numeric" pattern="[0-9]*" value={currentItem.newDetectedViolations === 0 ? "" : currentItem.newDetectedViolations} onChange={(e) => updateSubsystem('newDetectedViolations', e.target.value === "" ? 0 : Number(e.target.value.replace(/[^0-9]/g, '')))} className="w-full border border-[var(--border-color)] rounded p-1 text-xs text-center bg-white text-black" />
                                            </td>
                                            <td className="p-2 w-28">
                                                <input type="text" inputMode="numeric" pattern="[0-9]*" value={currentItem.analyzedViolations === 0 ? "" : currentItem.analyzedViolations} onChange={(e) => updateSubsystem('analyzedViolations', e.target.value === "" ? 0 : Number(e.target.value.replace(/[^0-9]/g, '')))} className="w-full border border-[var(--border-color)] rounded p-1 text-xs text-center bg-white text-black" />
                                            </td>
                                            <td className="p-2 w-24">
                                                <div className="w-full border border-[var(--border-color)] rounded p-1 text-xs text-center bg-gray-100 text-gray-500 font-bold">{currentItem.progress}%</div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </section>
                </div>

                {data?.rulesList?.length === 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 p-5 rounded-2xl mb-2 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                        <div>
                            <h3 className="font-bold text-yellow-800 text-sm">⚠️ 기존 버전 마이그레이션이 필요합니다</h3>
                            <p className="text-xs text-yellow-700 mt-1">이 버전은 새로운 규칙 고정 시스템(총 540여 개 자동 할당) 도입 이전에 생성된 구형 버전입니다. 데이터를 수정하시려면 먼저 아래 버튼을 눌러 규칙 템플릿을 불러와 주세요.</p>
                        </div>
                        <button 
                            onClick={() => useStore.getState().populateInitialRules(currentVersionIndex)}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap shadow-sm border border-amber-600"
                        >
                            📥 전체 규칙 템플릿 불러오기
                        </button>
                    </div>
                )}

                {/* 3. 규칙 ID별 서브시스템 신규 위배 개수 산출 (A~P) - Component */}
                <section className="bg-[var(--bg-color)] border border-blue-200 rounded-2xl p-6 shadow-sm overflow-x-auto my-6 relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 rounded-t-2xl"></div>
                    <h2 className="text-lg font-bold text-[var(--text-main)] mb-4 border-b border-[var(--border-color)] pb-2 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-3">
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                            📋 3-1. 규칙 ID별 서브시스템 신규 위배 (Component)
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                            <label className="flex items-center gap-2 text-xs font-normal text-[var(--text-muted)]">
                                <span>카테고리:</span>
                                <select 
                                    className="border rounded p-1.5 bg-white text-black text-[10px] w-full sm:w-auto"
                                    value={compRuleCategoryFilter}
                                    onChange={(e) => { setCompRuleCategoryFilter(e.target.value as any); setCompRulePage(1); }}
                                >
                                    <option value="ALL">전체</option>
                                    <option value="MAB">MAB</option>
                                    <option value="MISRA">MISRA</option>
                                </select>
                            </label>
                            <div className="relative flex-1 sm:flex-none">
                                <input 
                                    type="text" 
                                    placeholder="규칙 ID 검색..." 
                                    className="border rounded p-1.5 pl-7 text-[10px] bg-white text-black w-full"
                                    value={compRuleSearch}
                                    onChange={(e) => { setCompRuleSearch(e.target.value); setCompRulePage(1); }}
                                />
                                <span className="absolute left-2 top-2 opacity-50 text-gray-400 text-[10px]">🔍</span>
                            </div>
                        </div>
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-max text-left border-collapse border border-[var(--border-color)] text-[10px]" onKeyDown={handleTableKeyDown}>
                            <thead>
                                <tr className="bg-[var(--hover-bg)] whitespace-nowrap">
                                    <th className="p-2 border border-[var(--border-color)] font-bold text-center sm:sticky sm:left-0 bg-[var(--hover-bg)] sm:z-10 w-40">규칙 ID</th>
                                    <th className="p-2 border border-[var(--border-color)] font-bold text-center w-24">Sub ID</th>
                                    <th className="p-1 border border-[var(--border-color)] font-bold text-center w-24 text-blue-800">위배 개수</th>
                                    <th className="p-1 border border-[var(--border-color)] font-bold text-center w-12">관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedCompRules.map((rule, displayedIdx) => {
                                    const realIdx = data.rulesList.indexOf(rule);
                                    const updateViolation = (ssId: string, val: number) => {
                                        const newViolations = { ...rule.subsystemViolations, [ssId]: val };
                                        updateRuleRow(currentVersionIndex, realIdx, { subsystemViolations: newViolations });
                                    };
                                    const updateField = (key: string, val: any) => {
                                        updateRuleRow(currentVersionIndex, realIdx, { [key]: val });
                                    };
                                    const total = Object.values(rule.subsystemViolations || {}).reduce((acc: number, val: any) => acc + (Number(val) || 0), 0);

                                    return (
                                        <tr key={displayedIdx} className="hover:bg-[var(--hover-bg)] transition-colors">
                                            <td className="p-1 border border-[var(--border-color)] font-medium sm:sticky sm:left-0 bg-white sm:z-10">
                                                <input readOnly value={rule.id} className="w-full p-1 border rounded text-slate-600 bg-slate-50 border-slate-200 text-[10px] font-bold cursor-not-allowed outline-none" title="기본 규칙 ID는 변경할 수 없습니다." />
                                            </td>
                                            <td className="p-1 border border-[var(--border-color)]">
                                                {rule.category === 'MAB' ? <input value={rule.mabSubId || ""} onChange={(e) => updateField('mabSubId', e.target.value)} className="w-full p-1 border rounded text-center bg-white text-blue-600 border-slate-300 font-bold text-[10px]" placeholder="Sub ID" /> : "-"}
                                            </td>
                                            <td className="p-0 border border-[var(--border-color)]">
                                                 <input type="text" inputMode="numeric" pattern="[0-9]*" value={rule.subsystemViolations?.['TOTAL'] === 0 ? "" : (rule.subsystemViolations?.['TOTAL'] || "")} onChange={(e) => updateViolation('TOTAL', e.target.value === "" ? 0 : Number(e.target.value.replace(/[^0-9]/g, '')))} className="w-full p-2 text-center bg-blue-50 text-blue-800 font-bold border-0 focus:ring-1 focus:ring-blue-400 outline-none text-[10px]" placeholder="0" />
                                            </td>
                                            <td className="p-1 border border-[var(--border-color)] text-center align-middle">
                                                <div className="flex flex-row gap-1 justify-center items-center px-1">
                                                    {rule.category === 'MAB' && (
                                                        <button onClick={() => useStore.getState().duplicateRuleRow(currentVersionIndex, realIdx)} className="flex-1 text-blue-600 font-bold bg-blue-50 py-0.5 rounded border border-blue-200" title="MAB 하위 ID 추가">+</button>
                                                    )}
                                                    <button onClick={() => deleteRuleRow(currentVersionIndex, realIdx)} className="flex-1 text-red-500 bg-red-50 py-0.5 rounded border border-red-200" title="행 삭제">🗑️</button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between mt-4 text-[10px]">
                        <div className="text-[var(--text-muted)]">총 <strong>{filteredCompRules.length}</strong>개 중 {(compRulePage-1)*rulesPerPage + 1}-{(Math.min(compRulePage*rulesPerPage, filteredCompRules.length))} 표시</div>
                        <div className="flex gap-2">
                            <button onClick={() => setCompRulePage(p => Math.max(1, p - 1))} disabled={compRulePage === 1} className="px-2 py-1 border rounded">이전</button>
                            <span>{compRulePage} / {Math.ceil(filteredCompRules.length / rulesPerPage) || 1}</span>
                            <button onClick={() => setCompRulePage(p => p + 1)} disabled={compRulePage >= Math.ceil(filteredCompRules.length / rulesPerPage)} className="px-2 py-1 border rounded">다음</button>
                        </div>
                    </div>
                </section>

                {/* 3. 규칙 ID별 서브시스템 신규 위배 개수 산출 (A~P) - Runnable */}
                <section className="bg-[var(--bg-color)] border border-emerald-200 rounded-2xl p-6 shadow-sm overflow-x-auto my-6 relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 rounded-t-2xl"></div>
                    <h2 className="text-lg font-bold text-[var(--text-main)] mb-4 border-b border-[var(--border-color)] pb-2 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-3">
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                            📋 3-2. 규칙 ID별 서브시스템 신규 위배 (Runnable)
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                            <label className="flex items-center gap-2 text-xs font-normal text-[var(--text-muted)]">
                                <span>카테고리:</span>
                                <select 
                                    className="border rounded p-1.5 bg-white text-black text-[10px] w-full sm:w-auto"
                                    value={runnRuleCategoryFilter}
                                    onChange={(e) => { setRunnRuleCategoryFilter(e.target.value as any); setRunnRulePage(1); }}
                                >
                                    <option value="ALL">전체</option>
                                    <option value="MAB">MAB</option>
                                    <option value="MISRA">MISRA</option>
                                </select>
                            </label>
                            <div className="relative flex-1 sm:flex-none">
                                <input 
                                    type="text" 
                                    placeholder="규칙 ID 검색..." 
                                    className="border rounded p-1.5 pl-7 text-[10px] bg-white text-black w-full"
                                    value={runnRuleSearch}
                                    onChange={(e) => { setRunnRuleSearch(e.target.value); setRunnRulePage(1); }}
                                />
                                <span className="absolute left-2 top-2 opacity-50 text-gray-400 text-[10px]">🔍</span>
                            </div>
                        </div>
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-max text-left border-collapse border border-[var(--border-color)] text-[10px]" onKeyDown={handleTableKeyDown}>
                            <thead>
                                <tr className="bg-[var(--hover-bg)] whitespace-nowrap">
                                    <th className="p-2 border border-[var(--border-color)] font-bold text-center sm:sticky sm:left-0 bg-[var(--hover-bg)] sm:z-10 w-40">규칙 ID</th>
                                    <th className="p-2 border border-[var(--border-color)] font-bold text-center w-24">Sub ID</th>
                                    <th className="p-1 border border-[var(--border-color)] font-bold text-center w-24 text-emerald-800">위배 개수</th>
                                    <th className="p-1 border border-[var(--border-color)] font-bold text-center w-12">관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedRunnRules.map((rule, displayedIdx) => {
                                    const realIdx = data.rulesList.indexOf(rule);
                                    const updateViolation = (ssId: string, val: number) => {
                                        const newViolations = { ...rule.subsystemViolations, [ssId]: val };
                                        updateRuleRow(currentVersionIndex, realIdx, { subsystemViolations: newViolations });
                                    };
                                    const updateField = (key: string, val: any) => {
                                        updateRuleRow(currentVersionIndex, realIdx, { [key]: val });
                                    };
                                    const total = Object.values(rule.subsystemViolations || {}).reduce((acc: number, val: any) => acc + (Number(val) || 0), 0);

                                    return (
                                        <tr key={displayedIdx} className="hover:bg-[var(--hover-bg)] transition-colors">
                                            <td className="p-1 border border-[var(--border-color)] font-medium sm:sticky sm:left-0 bg-white sm:z-10">
                                                <input readOnly value={rule.id} className="w-full p-1 border rounded text-slate-600 bg-slate-50 border-slate-200 text-[10px] font-bold cursor-not-allowed outline-none" title="기본 규칙 ID는 변경할 수 없습니다." />
                                            </td>
                                            <td className="p-1 border border-[var(--border-color)]">
                                                {rule.category === 'MAB' ? <input value={rule.mabSubId || ""} onChange={(e) => updateField('mabSubId', e.target.value)} className="w-full p-1 border rounded text-center bg-white text-emerald-600 border-slate-300 font-bold text-[10px]" placeholder="Sub ID" /> : "-"}
                                            </td>
                                            <td className="p-0 border border-[var(--border-color)]">
                                                 <input type="text" inputMode="numeric" pattern="[0-9]*" value={rule.subsystemViolations?.['TOTAL'] === 0 ? "" : (rule.subsystemViolations?.['TOTAL'] || "")} onChange={(e) => updateViolation('TOTAL', e.target.value === "" ? 0 : Number(e.target.value.replace(/[^0-9]/g, '')))} className="w-full p-2 text-center bg-emerald-50 text-emerald-800 font-bold border-0 focus:ring-1 focus:ring-emerald-400 outline-none text-[10px]" placeholder="0" />
                                            </td>
                                            <td className="p-1 border border-[var(--border-color)] text-center align-middle">
                                                <div className="flex flex-row gap-1 justify-center items-center px-1">
                                                    {rule.category === 'MAB' && (
                                                        <button onClick={() => useStore.getState().duplicateRuleRow(currentVersionIndex, realIdx)} className="flex-1 text-emerald-600 font-bold bg-emerald-50 py-0.5 rounded border border-emerald-200" title="MAB 하위 ID 추가">+</button>
                                                    )}
                                                    <button onClick={() => deleteRuleRow(currentVersionIndex, realIdx)} className="flex-1 text-red-500 bg-red-50 py-0.5 rounded border border-red-200" title="행 삭제">🗑️</button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between mt-4 text-[10px]">
                        <div className="text-[var(--text-muted)]">총 <strong>{filteredRunnRules.length}</strong>개 중 {(runnRulePage-1)*rulesPerPage + 1}-{(Math.min(runnRulePage*rulesPerPage, filteredRunnRules.length))} 표시</div>
                        <div className="flex gap-2">
                            <button onClick={() => setRunnRulePage(p => Math.max(1, p - 1))} disabled={runnRulePage === 1} className="px-2 py-1 border rounded">이전</button>
                            <span>{runnRulePage} / {Math.ceil(filteredRunnRules.length / rulesPerPage) || 1}</span>
                            <button onClick={() => setRunnRulePage(p => p + 1)} disabled={runnRulePage >= Math.ceil(filteredRunnRules.length / rulesPerPage)} className="px-2 py-1 border rounded">다음</button>
                        </div>
                    </div>
                </section>

                <datalist id="rule-ids">
                    {INITIAL_MAB_RULE_IDS.map(id => <option key={id} value={id} />)}
                    {INITIAL_MISRA_RULE_IDS.map(id => <option key={id} value={id} />)}
                </datalist>


                {/* 4. 정적검증 소요시간 평가 */}
                <section className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm overflow-x-auto">
                    <h2 className="text-lg font-bold text-[var(--text-main)] mb-4 border-b border-[var(--border-color)] pb-2 flex justify-between items-center">
                        ⏱️ 정적검증 소요시간 평가 (A~P)
                        <span className="text-xs font-normal text-[var(--accent-color)]">* 데이터 수정 즉시 소요시간 탭에 반영</span>
                    </h2>
                    
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {/* Component Time Array */}
                        <div>
                            <h3 className="font-bold text-sm mb-2 text-[var(--text-muted)] border-b border-[var(--border-color)] pb-1">Component 평가시간 (A~P)</h3>
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-[var(--border-color)] bg-[var(--hover-bg)]">
                                        <th className="p-2 font-semibold text-center">서브시스템</th>
                                        <th className="p-2 font-semibold">담당자</th>
                                        <th className="p-2 font-semibold">이번 (h)</th>
                                        <th className="p-2 font-semibold">이전 (h)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'].map((subsystemChar) => {
                                        const prevVersionData = currentVersionIndex > 0 ? versionedData[currentVersionIndex - 1] : null;
                                        const prevCompItem = prevVersionData?.timeEvaluationComponent?.find((c: import('../../store/useStore').TimeEvaluationData) => c.subsystem === subsystemChar);
                                        const autoPrevTime = prevCompItem ? prevCompItem.currentTime : "00:00:00";

                                        const compItem = data.timeEvaluationComponent.find((c: import('../../store/useStore').TimeEvaluationData) => c.subsystem === subsystemChar) || {
                                            subsystem: subsystemChar, owner: "", currentTime: "00:00:00", prevTime: autoPrevTime, diff: "-", diffColor: ""
                                        };
                                        const updateComp = (key: string, val: string) => {
                                            const newList = [...data.timeEvaluationComponent];
                                            const idx = newList.findIndex((c: import('../../store/useStore').TimeEvaluationData) => c.subsystem === subsystemChar);
                                            
                                            let updatedOwner = compItem.owner;
                                            if (key === 'currentTime' && val !== "" && val !== "00:00:00") {
                                                updatedOwner = currentUser?.name || "";
                                            } else if (key === 'currentTime' && (val === "" || val === "00:00:00")) {
                                                updatedOwner = "";
                                            }

                                            const currentHms = key === 'currentTime' ? val : (compItem.currentTime || "00:00:00");
                                            const prevHms = key === 'prevTime' ? val : (autoPrevTime || "00:00:00");
                                            
                                            // Calculate Diff
                                            const curSec = hmsToSeconds(currentHms);
                                            const prevSec = hmsToSeconds(prevHms);
                                            const diffSec = curSec - prevSec;
                                            const formattedDiff = secondsToHms(diffSec, true);
                                            const color = diffSec > 0 ? "text-red-500" : (diffSec < 0 ? "text-green-600" : "text-gray-400");

                                            if (idx >= 0) newList[idx] = { ...newList[idx], [key]: val, owner: updatedOwner, diff: formattedDiff, diffColor: color };
                                            else newList.push({ ...compItem, [key]: val, owner: updatedOwner, prevTime: autoPrevTime, diff: formattedDiff, diffColor: color });
                                            updateVersionData(currentVersionIndex, { timeEvaluationComponent: newList });
                                        };
                                        return (
                                            <tr key={subsystemChar} className="border-b border-[var(--border-color)]">
                                                <td className="p-1 text-center font-bold text-[var(--accent-color)]">{subsystemChar}</td>
                                                <td className="p-1">
                                                    <input 
                                                        readOnly 
                                                        value={compItem.owner} 
                                                        placeholder="자동입력" 
                                                        className="w-full border p-1 rounded bg-gray-50 text-blue-600 border-slate-300 text-center font-bold placeholder:text-gray-500" 
                                                    />
                                                </td>
                                                <td className="p-1">
                                                     <input 
                                                         type="text"
                                                         value={compItem.currentTime === "00:00:00" ? "" : compItem.currentTime} 
                                                         onChange={(e) => {
                                                             const val = e.target.value;
                                                             // Basic validation for HH:MM:SS
                                                             if (/^(\d{0,2}:?){0,2}\d{0,2}$/.test(val)) {
                                                                 updateComp('currentTime', val);
                                                             }
                                                         }} 
                                                         className="w-full border p-1 rounded bg-white text-black border-slate-300 text-center font-mono text-[10px]" 
                                                         placeholder="00:00:00" 
                                                     />
                                                </td>
                                                <td className="p-1"><input readOnly value={autoPrevTime} className="w-full border p-1 rounded bg-gray-100 text-gray-500 font-bold" /></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Runnable Time Array */}
                        <div>
                            <h3 className="font-bold text-sm mb-2 text-[var(--text-muted)] border-b border-[var(--border-color)] pb-1">Runnable 평가시간 (A~P)</h3>
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-[var(--border-color)] bg-[var(--hover-bg)]">
                                        <th className="p-2 font-semibold text-center">서브시스템</th>
                                        <th className="p-2 font-semibold">담당자</th>
                                        <th className="p-2 font-semibold">이번 (h)</th>
                                        <th className="p-2 font-semibold">직전 버전자료 (h)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"].map((subsystemChar) => {
                                        const prevVersionData = currentVersionIndex > 0 ? versionedData[currentVersionIndex - 1] : null;
                                        const prevRunnItem = prevVersionData?.timeEvaluationRunnable?.find((r: import('../../store/useStore').TimeEvaluationData) => r.subsystem === subsystemChar);
                                        const autoPrevTime = prevRunnItem ? prevRunnItem.currentTime : "00:00:00";

                                        const runnItem = data.timeEvaluationRunnable.find((r: import('../../store/useStore').TimeEvaluationData) => r.subsystem === subsystemChar) || {
                                            subsystem: subsystemChar, owner: "", currentTime: "00:00:00", prevTime: autoPrevTime, diff: "-", diffColor: ""
                                        };
                                        const updateRunn = (key: string, val: string) => {
                                            const newList = [...data.timeEvaluationRunnable];
                                            const idx = newList.findIndex((r: import('../../store/useStore').TimeEvaluationData) => r.subsystem === subsystemChar);
                                            
                                            let updatedOwner = runnItem.owner;
                                            if (key === 'currentTime' && val !== "" && val !== "00:00:00") {
                                                updatedOwner = currentUser?.name || "";
                                            } else if (key === 'currentTime' && (val === "" || val === "00:00:00")) {
                                                updatedOwner = "";
                                            }

                                            const currentHms = key === 'currentTime' ? val : (runnItem.currentTime || "00:00:00");
                                            const prevHms = key === 'prevTime' ? val : (autoPrevTime || "00:00:00");
                                            
                                            // Calculate Diff
                                            const curSec = hmsToSeconds(currentHms);
                                            const prevSec = hmsToSeconds(prevHms);
                                            const diffSec = curSec - prevSec;
                                            const formattedDiff = secondsToHms(diffSec, true);
                                            const color = diffSec > 0 ? "text-red-500" : (diffSec < 0 ? "text-green-600" : "text-gray-400");

                                            if (idx >= 0) newList[idx] = { ...newList[idx], [key]: val, owner: updatedOwner, diff: formattedDiff, diffColor: color };
                                            else newList.push({ ...runnItem, [key]: val, owner: updatedOwner, prevTime: autoPrevTime, diff: formattedDiff, diffColor: color });
                                            updateVersionData(currentVersionIndex, { timeEvaluationRunnable: newList });
                                        };
                                        return (
                                            <tr key={subsystemChar} className="border-b border-[var(--border-color)]">
                                                <td className="p-1 text-center font-bold text-[var(--accent-color)]">{subsystemChar}</td>
                                                <td className="p-1">
                                                    <input 
                                                        readOnly 
                                                        value={runnItem.owner} 
                                                        placeholder="자동입력" 
                                                        className="w-full border p-1 rounded bg-gray-50 text-emerald-600 border-slate-300 text-center font-bold placeholder:text-gray-500" 
                                                    />
                                                </td>
                                                <td className="p-1">
                                                     <input 
                                                         type="text"
                                                         value={runnItem.currentTime === "00:00:00" ? "" : runnItem.currentTime} 
                                                         onChange={(e) => {
                                                             const val = e.target.value;
                                                             if (/^(\d{0,2}:?){0,2}\d{0,2}$/.test(val)) {
                                                                 updateRunn('currentTime', val);
                                                             }
                                                         }} 
                                                         className="w-full border p-1 rounded bg-white text-black border-slate-300 text-center font-mono text-[10px]" 
                                                         placeholder="00:00:00" 
                                                     />
                                                </td>
                                                <td className="p-1"><div className="w-full border p-1 rounded bg-gray-100 text-gray-500 font-bold text-center">{autoPrevTime}</div></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                <div className="flex justify-end pt-4">
                    <p className="text-xs text-[var(--text-muted)]">* 수정하시는 모든 데이터는 글로벌 메모리 저장소에 즉시 100% 동기화(자동저장) 되어 모든 탭에 반영됩니다.</p>
                </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-[var(--bg-color)] border-2 border-dashed border-[var(--border-color)] rounded-2xl">
                        <div className="text-4xl mb-4">✍️</div>
                        <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">데이터 입력 준비</h3>
                        <p className="text-[var(--text-muted)] text-sm mb-6 text-center">
                            상단의 [신규 버전 데이터 생성] 영역에서 프로젝트의 새로운 버전을 생성해 주세요.<br/>
                            버전 생성 후에는 각 항목별 데이터를 직접 입력하고 관리할 수 있습니다.
                        </p>
                    </div>
                )}

            </div>

            {/* Floating Sync Status Indicator */}
            <div className={`fixed bottom-6 right-6 px-4 py-2 rounded-full border shadow-lg transition-all flex items-center gap-2 z-50 ${
                isSyncing 
                ? "bg-blue-500 border-blue-400 text-white animate-pulse" 
                : "bg-[var(--bg-color)] border-[var(--border-color)] text-[var(--text-muted)]"
            }`}>
                {isSyncing ? (
                    <>
                        <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                        <span className="text-xs font-bold">서버 동기화 중...</span>
                    </>
                ) : (
                    <>
                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                        <span className="text-xs">
                            {lastSyncedAt 
                                ? `모든 변경사항 저장됨 (${new Date(lastSyncedAt).toLocaleTimeString()})`
                                : "저장 완료"}
                        </span>
                    </>
                )}
            </div>
        </div>
    );
}
