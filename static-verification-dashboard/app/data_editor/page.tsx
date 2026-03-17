"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { useStore } from "@/store/useStore";

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

    const data = versionedData[currentVersionIndex];
    const [newVersionStr, setNewVersionStr] = useState("");
    
    // Rule Matrix State
    const [ruleSearch, setRuleSearch] = useState("");
    const [ruleCategoryFilter, setRuleCategoryFilter] = useState<'ALL' | 'MAB' | 'MISRA'>('ALL');
    const [rulePage, setRulePage] = useState(1);
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

        // 1. Calculate overall progress
        if (subsystemsList && subsystemsList.length > 0) {
            const validSubsystems = subsystemsList.filter((s: import('../../store/useStore').SubsystemData) => s.progress !== undefined);
            if (validSubsystems.length > 0) {
                const totalProgress = validSubsystems.reduce((acc: number, s: import('../../store/useStore').SubsystemData) => acc + (s.progress || 0), 0);
                newDashboard.overallProgress = Math.round(totalProgress / validSubsystems.length) + "%";
            } else {
                newDashboard.overallProgress = "0%";
            }
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

    // Rule Matrix Logic
    const filteredRules = (data?.rulesList || []).filter(r => {
        const matchesSearch = r.id.toLowerCase().includes(ruleSearch.toLowerCase());
        const matchesCategory = ruleCategoryFilter === 'ALL' || r.category === ruleCategoryFilter;
        return matchesSearch && matchesCategory;
    });

    const paginatedRules = filteredRules.slice((rulePage - 1) * rulesPerPage, rulePage * rulesPerPage);

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
                    <div className="flex gap-3">
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

                        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3">
                            {['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P'].map(ss => {
                                const comp = data.subsystemsList.find(s => s.id === ss && s.category === 'Component')?.newDetectedViolations || 0;
                                const runn = data.subsystemsList.find(s => s.id === ss && s.category === 'Runnable')?.newDetectedViolations || 0;
                                const totalDetail = comp + runn;

                                const totalMatrix = (data.rulesList || [])
                                    .filter(r => r.id.trim() !== '')
                                    .reduce((acc, rule) => acc + (Number(rule.subsystemViolations?.[ss]) || 0), 0);

                                const isMatch = totalDetail === totalMatrix;
                                const diff = totalMatrix - totalDetail;

                                return (
                                    <div key={ss} className={`p-3 rounded-xl border-2 transition-all ${isMatch ? 'border-emerald-100 bg-emerald-50/50' : 'border-red-100 bg-red-50/50 shadow-inner'}`}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className={`text-sm font-black w-6 h-6 flex items-center justify-center rounded-lg ${isMatch ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                                                {ss}
                                            </span>
                                            {isMatch ? (
                                                <span className="text-emerald-600 text-[10px] font-bold">✅ 일치</span>
                                            ) : (
                                                <span className="text-red-600 text-[10px] font-bold animate-pulse">❌ 불일치</span>
                                            )}
                                        </div>
                                        <div className="space-y-1 text-center">
                                            <div className="text-[10px] text-slate-500 leading-tight">상세: <span className="font-bold text-slate-700">{totalDetail}</span></div>
                                            <div className="text-[10px] text-slate-500 leading-tight">규칙: <span className="font-bold text-slate-700">{totalMatrix}</span></div>
                                            {!isMatch && (
                                                <div className="text-[10px] font-black text-red-600 border-t border-red-200 mt-1 pt-1">
                                                    {diff > 0 ? `+${diff}` : diff}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {!['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P'].every(ss => {
                            const comp = data.subsystemsList.find(s => s.id === ss && s.category === 'Component')?.newDetectedViolations || 0;
                            const runn = data.subsystemsList.find(s => s.id === ss && s.category === 'Runnable')?.newDetectedViolations || 0;
                            const totalMatrix = (data.rulesList || []).filter(r => r.id.trim() !== '').reduce((acc, rule) => acc + (Number(rule.subsystemViolations?.[ss]) || 0), 0);
                            return (comp + runn) === totalMatrix;
                        }) && (
                            <p className="text-[10px] text-red-500 mt-4 font-bold text-center">
                                ⚠️ 주의: 상단 상세 데이터의 '신규 검출 위배' 합계와 하단 '규칙 ID별 서브시스템 위배' 합계가 다른 서브시스템이 있습니다. 데이터를 확인해 주세요.
                            </p>
                        )}
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
                    <div className="flex gap-4 items-center">
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
                                                <input type="number" onFocus={(e) => e.target.onwheel = (ev) => ev.preventDefault()} value={currentItem.newDetectedViolations} onChange={(e) => updateSubsystem('newDetectedViolations', Number(e.target.value))} className="w-full border border-[var(--border-color)] rounded p-1 text-xs text-center bg-white text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                            </td>
                                            <td className="p-2 w-28">
                                                <input type="number" onFocus={(e) => e.target.onwheel = (ev) => ev.preventDefault()} value={currentItem.analyzedViolations} onChange={(e) => updateSubsystem('analyzedViolations', Number(e.target.value))} className="w-full border border-[var(--border-color)] rounded p-1 text-xs text-center bg-white text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
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
                                                <input type="number" onFocus={(e) => e.target.onwheel = (ev) => ev.preventDefault()} value={currentItem.newDetectedViolations} onChange={(e) => updateSubsystem('newDetectedViolations', Number(e.target.value))} className="w-full border border-[var(--border-color)] rounded p-1 text-xs text-center bg-white text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                            </td>
                                            <td className="p-2 w-28">
                                                <input type="number" onFocus={(e) => e.target.onwheel = (ev) => ev.preventDefault()} value={currentItem.analyzedViolations} onChange={(e) => updateSubsystem('analyzedViolations', Number(e.target.value))} className="w-full border border-[var(--border-color)] rounded p-1 text-xs text-center bg-white text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
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

                {/* 3. 규칙 ID별 서브시스템 신규 위배 개수 산출 (A~P) */}
                <section className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm overflow-x-auto my-6">
                    <h2 className="text-lg font-bold text-[var(--text-main)] mb-4 border-b border-[var(--border-color)] pb-2 flex justify-between items-center">
                        📋 5. 규칙 ID별 서브시스템 신규 위배 개수 산출 (A~P)
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 text-xs font-normal">
                                <span>카테고리:</span>
                                <select 
                                    className="border rounded p-1 bg-white text-black"
                                    value={ruleCategoryFilter}
                                    onChange={(e) => { setRuleCategoryFilter(e.target.value as any); setRulePage(1); }}
                                >
                                    <option value="ALL">전체</option>
                                    <option value="MAB">MAB</option>
                                    <option value="MISRA">MISRA</option>
                                </select>
                            </label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="규칙 ID 검색..." 
                                    className="border rounded p-1 pl-7 text-xs bg-white text-black w-48"
                                    value={ruleSearch}
                                    onChange={(e) => { setRuleSearch(e.target.value); setRulePage(1); }}
                                />
                                <span className="absolute left-2 top-1.5 opacity-50 text-gray-400">🔍</span>
                            </div>
                            <button 
                                onClick={() => addRuleRow(currentVersionIndex)}
                                className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-700 transition-colors"
                            >
                                + 규칙 추가
                            </button>
                        </div>
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse border border-[var(--border-color)] text-[10px]">
                            <thead>
                                <tr className="bg-[var(--hover-bg)] whitespace-nowrap">
                                    <th className="p-2 border border-[var(--border-color)] font-bold text-center sticky left-0 bg-[var(--hover-bg)] z-10 w-40">규칙 ID</th>
                                    <th className="p-2 border border-[var(--border-color)] font-bold text-center w-24">Sub ID</th>
                                    {['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P'].map(ss => (
                                        <th key={ss} className="p-1 border border-[var(--border-color)] font-bold text-center w-10 text-blue-600">{ss}</th>
                                    ))}
                                    <th className="p-1 border border-[var(--border-color)] font-bold text-center w-12 bg-blue-50">합계</th>
                                    <th className="p-1 border border-[var(--border-color)] font-bold text-center w-10">삭제</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedRules.map((rule, displayedIdx) => {
                                    const realIdx = (rulePage - 1) * rulesPerPage + displayedIdx;
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
                                            <td className="p-1 border border-[var(--border-color)] font-medium sticky left-0 bg-white z-10">
                                                <div className="flex gap-1 flex-col">
                                                    <input 
                                                        list="rule-ids"
                                                        value={rule.id}
                                                        onChange={(e) => updateField('id', e.target.value)}
                                                        className="w-full p-1 border rounded text-black bg-white border-slate-300 text-[10px]"
                                                        placeholder="ID 입력"
                                                    />
                                                    <datalist id="rule-ids">
                                                        {INITIAL_MAB_RULE_IDS.map(id => <option key={id} value={id} />)}
                                                        {INITIAL_MISRA_RULE_IDS.map(id => <option key={id} value={id} />)}
                                                    </datalist>
                                                </div>
                                            </td>
                                            <td className="p-1 border border-[var(--border-color)]">
                                                {rule.category === 'MAB' ? (
                                                    <input 
                                                        value={rule.mabSubId || ""} 
                                                        onChange={(e) => updateField('mabSubId', e.target.value)}
                                                        className="w-full p-1 border rounded text-center bg-white text-blue-600 border-slate-300 font-bold text-[10px]"
                                                        placeholder="Sub ID 입력"
                                                    />
                                                ) : <div className="text-center text-gray-300">-</div>}
                                            </td>
                                            {['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P'].map(ss => (
                                                <td key={ss} className="p-0 border border-[var(--border-color)] group relative">
                                                    <input 
                                                        type="number" 
                                                        onFocus={(e) => e.target.onwheel = (ev) => ev.preventDefault()}
                                                        value={rule.subsystemViolations?.[ss] || 0}
                                                        onChange={(e) => updateViolation(ss, Math.max(0, Number(e.target.value)))}
                                                        className="w-full p-2 text-center bg-white text-black border-0 focus:ring-1 focus:ring-blue-400 focus:bg-blue-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none outline-none text-[10px]"
                                                        title={`${rule.id} - Subsystem ${ss}`}
                                                    />
                                                </td>
                                            ))}
                                            <td className="p-1 border border-[var(--border-color)] text-center font-bold bg-blue-50 text-blue-700 text-[10px]">
                                                {total}
                                            </td>
                                            <td className="p-1 border border-[var(--border-color)] text-center">
                                                <button 
                                                    onClick={() => deleteRuleRow(currentVersionIndex, realIdx)}
                                                    className="w-6 h-6 flex items-center justify-center text-red-500 hover:bg-red-50 rounded"
                                                    title="행 삭제"
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination for Rules Matrix */}
                    <div className="flex items-center justify-between mt-4 text-xs">
                        <div className="text-[var(--text-muted)]">
                            총 <strong>{filteredRules.length}</strong>개 규칙 중 {(rulePage-1)*rulesPerPage + 1}-{(Math.min(rulePage*rulesPerPage, filteredRules.length))} 표시 중
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setRulePage(p => Math.max(1, p - 1))}
                                disabled={rulePage === 1}
                                className="px-3 py-1 border rounded disabled:opacity-30 hover:bg-[var(--hover-bg)]"
                            >이전</button>
                            <span className="px-3 py-1 font-bold">{rulePage} / {Math.ceil(filteredRules.length / rulesPerPage) || 1}</span>
                            <button 
                                onClick={() => setRulePage(p => p + 1)}
                                disabled={rulePage >= Math.ceil(filteredRules.length / rulesPerPage)}
                                className="px-3 py-1 border rounded disabled:opacity-30 hover:bg-[var(--hover-bg)]"
                            >다음</button>
                        </div>
                    </div>
                </section>


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
                                        const autoPrevTime = prevCompItem ? prevCompItem.currentTime : "0h";

                                        const compItem = data.timeEvaluationComponent.find((c: import('../../store/useStore').TimeEvaluationData) => c.subsystem === subsystemChar) || {
                                            subsystem: subsystemChar, owner: "", currentTime: "0h", prevTime: autoPrevTime, diff: "-", diffColor: ""
                                        };
                                        const updateComp = (key: string, val: string) => {
                                            const newList = [...data.timeEvaluationComponent];
                                            const idx = newList.findIndex((c: import('../../store/useStore').TimeEvaluationData) => c.subsystem === subsystemChar);
                                            
                                            let updatedOwner = compItem.owner;
                                            if (key === 'currentTime' && val !== "" && val !== "0h") {
                                                updatedOwner = currentUser?.name || "";
                                            } else if (key === 'currentTime' && (val === "" || val === "0h")) {
                                                updatedOwner = "";
                                            }

                                            if (idx >= 0) newList[idx] = { ...newList[idx], [key]: val, owner: updatedOwner };
                                            else newList.push({ ...compItem, [key]: val, owner: updatedOwner, prevTime: autoPrevTime });
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
                                                        type="number"
                                                        step="0.1"
                                                        value={parseFloat(compItem.currentTime || "0")} 
                                                        onChange={(e) => updateComp('currentTime', (e.target.value || "0") + "h")} 
                                                        onFocus={(e) => e.target.onwheel = (ev) => ev.preventDefault()}
                                                        className="w-full border p-1 rounded bg-white text-black border-slate-300 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                                                        placeholder="0" 
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
                                        const autoPrevTime = prevRunnItem ? prevRunnItem.currentTime : "0h";

                                        const runnItem = data.timeEvaluationRunnable.find((r: import('../../store/useStore').TimeEvaluationData) => r.subsystem === subsystemChar) || {
                                            subsystem: subsystemChar, owner: "", currentTime: "0h", prevTime: autoPrevTime, diff: "-", diffColor: ""
                                        };
                                        const updateRunn = (key: string, val: string) => {
                                            const newList = [...data.timeEvaluationRunnable];
                                            const idx = newList.findIndex((r: import('../../store/useStore').TimeEvaluationData) => r.subsystem === subsystemChar);
                                            
                                            let updatedOwner = runnItem.owner;
                                            if (key === 'currentTime' && val !== "" && val !== "0h") {
                                                updatedOwner = currentUser?.name || "";
                                            } else if (key === 'currentTime' && (val === "" || val === "0h")) {
                                                updatedOwner = "";
                                            }

                                            if (idx >= 0) newList[idx] = { ...newList[idx], [key]: val, owner: updatedOwner };
                                            else newList.push({ ...runnItem, [key]: val, owner: updatedOwner, prevTime: autoPrevTime });
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
                                                        type="number"
                                                        step="0.1"
                                                        value={parseFloat(runnItem.currentTime || "0")} 
                                                        onChange={(e) => updateRunn('currentTime', (e.target.value || "0") + "h")} 
                                                        onFocus={(e) => e.target.onwheel = (ev) => ev.preventDefault()}
                                                        className="w-full border p-1 rounded bg-white text-black border-slate-300 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                                                        placeholder="0" 
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
        </div>
    );
}
