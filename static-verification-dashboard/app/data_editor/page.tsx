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

    const data = versionedData[currentVersionIndex];
    const [newVersionStr, setNewVersionStr] = useState("");

    const handleCreateVersion = () => {
        if (!newVersionStr.trim()) return;
        createNewVersion(newVersionStr);
        setNewVersionStr("");
        alert("신규 버전이 생성되었습니다.");
    };

    if (!data) return null;

    // Helpers to write to Zustand
    const calculateAutomatedMetrics = (updatedData: any) => {
        const { dashboardData, subsystemsList } = updatedData;
        const newDashboard = { ...dashboardData };

        // 1. Calculate overall progress
        if (subsystemsList && subsystemsList.length > 0) {
            const totalProgress = subsystemsList.reduce((acc: number, s: any) => acc + (s.progress || 0), 0);
            newDashboard.overallProgress = Math.round(totalProgress / subsystemsList.length) + "%";
        }

        // 2. Calculate expected schedule status
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
            newDashboard.expectedSchedule = "일정 미입력 / 분석 대기";
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
                            className="flex-1 border border-[var(--border-color)] bg-[var(--bg-color)] rounded-lg p-2.5 text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]" 
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
                                className="w-full border p-2 rounded-lg text-sm bg-[var(--bg-color)] text-[var(--text-main)] border-[var(--border-color)]" 
                            />
                        </div>
                        <span className="text-[var(--text-muted)] font-bold mt-4">~</span>
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">업무 종료일</label>
                            <input 
                                type="date" 
                                value={data.dashboardData?.endDate || ""} 
                                onChange={(e) => handleChangeDashboard('endDate', e.target.value)}
                                className="w-full border p-2 rounded-lg text-sm bg-[var(--bg-color)] text-[var(--text-main)] border-[var(--border-color)]" 
                            />
                        </div>
                    </div>
                </section>

                {/* 2. 서브시스템 현황 편집 (Array Mapping) */}
                <section className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm overflow-x-auto">
                    <h2 className="text-lg font-bold text-[var(--text-main)] mb-4 border-b border-[var(--border-color)] pb-2 flex justify-between items-center">
                        📋 서브시스템 상세 데이터 (A~M)
                        <span className="text-xs font-normal text-[var(--accent-color)]">* 데이터 수정 즉시 부분 반영 (진척도는 자동계산됨)</span>
                    </h2>
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] text-xs text-center">
                                <th className="p-2 font-semibold">서브시스템</th>
                                <th className="p-2 font-semibold">분류 (C/R)</th>
                                <th className="p-2 font-semibold">담당자</th>
                                <th className="p-2 font-semibold">검출 위배</th>
                                <th className="p-2 font-semibold">신규 위배</th>
                                <th className="p-2 font-semibold">분석 완료</th>
                                <th className="p-2 font-semibold">진척도 (%) - 자동</th>
                            </tr>
                        </thead>
                        <tbody>
                            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'].map((subsystemChar) => {
                                const currentItem = data.subsystemsList.find((s: any) => s.version === subsystemChar) || {
                                    version: subsystemChar, category: "Component", owner: "", detectedViolations: 0, newViolations: 0, analyzedViolations: 0, progress: 0
                                };

                                const updateSubsystem = (key: string, val: string | number) => {
                                    const newList = [...data.subsystemsList];
                                    const existingIdx = newList.findIndex((s: any) => s.version === subsystemChar);
                                    
                                    // Automatic calculation hook for analyzed / detected violations
                                    let mergedItem = existingIdx >= 0 ? { ...newList[existingIdx], [key]: val } : { ...currentItem, [key]: val };
                                    
                                    if (key === 'detectedViolations' || key === 'analyzedViolations') {
                                        const detected = mergedItem.detectedViolations > 0 ? mergedItem.detectedViolations : 1;
                                        mergedItem.progress = Number(Math.min(100, Math.round((mergedItem.analyzedViolations / detected) * 100)).toFixed(1));
                                        if (mergedItem.detectedViolations === 0 && mergedItem.analyzedViolations === 0) {
                                            mergedItem.progress = 0;
                                        }
                                    }

                                    if (existingIdx >= 0) {
                                        newList[existingIdx] = mergedItem;
                                    } else {
                                        newList.push(mergedItem);
                                    }

                                    // Refresh dashboard metrics based on new subsystem data
                                    const updatedDashboard = calculateAutomatedMetrics({
                                        ...data,
                                        subsystemsList: newList
                                    });

                                    updateVersionData(currentVersionIndex, { 
                                        subsystemsList: newList,
                                        dashboardData: updatedDashboard
                                    });
                                };

                                return (
                                    <tr key={subsystemChar} className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--hover-bg)]">
                                        <td className="p-2 text-center font-bold text-[var(--text-main)] w-16">{subsystemChar}</td>
                                        <td className="p-2 w-32">
                                            <select 
                                                value={currentItem.category} 
                                                onChange={(e) => updateSubsystem('category', e.target.value)}
                                                className="w-full border border-[var(--border-color)] rounded p-1 text-xs bg-[var(--bg-color)] text-[var(--text-main)]"
                                            >
                                                <option value="Component">Component</option>
                                                <option value="Runnable">Runnable</option>
                                            </select>
                                        </td>
                                        <td className="p-2 w-24">
                                            <input value={currentItem.owner} onChange={(e) => updateSubsystem('owner', e.target.value)} placeholder="담당자" className="w-full border border-[var(--border-color)] rounded p-1 text-xs text-center bg-[var(--bg-color)] text-[var(--text-main)]" />
                                        </td>
                                        <td className="p-2 w-20">
                                            <input type="number" value={currentItem.detectedViolations} onChange={(e) => updateSubsystem('detectedViolations', Number(e.target.value))} className="w-full border border-[var(--border-color)] rounded p-1 text-xs text-center bg-[var(--bg-color)] text-[var(--text-main)]" />
                                        </td>
                                        <td className="p-2 w-20">
                                            <input type="number" value={currentItem.newViolations} onChange={(e) => updateSubsystem('newViolations', Number(e.target.value))} className="w-full border border-[var(--border-color)] rounded p-1 text-xs text-center bg-[var(--bg-color)] text-[var(--text-main)]" />
                                        </td>
                                        <td className="p-2 w-20">
                                            <input type="number" value={currentItem.analyzedViolations} onChange={(e) => updateSubsystem('analyzedViolations', Number(e.target.value))} className="w-full border border-[var(--border-color)] rounded p-1 text-xs text-center bg-[var(--bg-color)] text-[var(--text-main)]" />
                                        </td>
                                        <td className="p-2 w-20">
                                            <input readOnly type="number" value={currentItem.progress} className="w-full border border-[var(--border-color)] rounded p-1 text-xs text-center bg-gray-100 text-gray-500 font-bold" />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </section>

                <div className="grid grid-cols-1 gap-6">
                    {/* 3. 이슈 관리 */}
                    <section className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-4 border-b border-[var(--border-color)] pb-2">
                            <h2 className="text-lg font-bold text-[var(--text-main)]">🔥 발생 이슈</h2>
                            <button 
                                onClick={() => updateVersionData(currentVersionIndex, { issuesList: [...data.issuesList, { id: Date.now(), title: "", type: "System", content: "", resolved: false }] })}
                                className="bg-[var(--badge-bg)] text-[var(--accent-color)] border border-[var(--border-color)] px-3 py-1 rounded text-xs font-bold transition-all hover:bg-[var(--hover-bg)]"
                            >
                                + 이슈 추가
                            </button>
                        </div>
                        <div className="flex gap-2 items-center px-4 mb-2 text-xs font-semibold text-[var(--text-muted)] text-center">
                            <div className="w-16">해결 여부</div>
                            <div className="w-1/3 text-left pl-2">이슈 제목</div>
                            <div className="w-1/4 text-left pl-2">종류</div>
                            <div className="flex-1 text-left pl-2">세부 내용</div>
                            <div className="w-8"></div>
                        </div>
                        <div className="space-y-3">
                            {data.issuesList.map((issue: any, idx: number) => (
                                <div key={idx} className="flex gap-2 items-center bg-[var(--hover-bg)] p-3 rounded-xl border border-[var(--border-color)]">
                                    <div className="w-16 flex justify-center">
                                        <input type="checkbox" checked={issue.resolved} onChange={(e) => { const n = [...data.issuesList]; n[idx].resolved = e.target.checked; updateVersionData(currentVersionIndex, { issuesList: n }); }} className="w-4 h-4 cursor-pointer accent-[var(--accent-color)]" />
                                    </div>
                                    <input value={issue.title} onChange={(e) => { const n = [...data.issuesList]; n[idx].title = e.target.value; updateVersionData(currentVersionIndex, { issuesList: n }); }} placeholder="이슈 제목" className="w-1/3 border p-1.5 rounded text-xs bg-[var(--bg-color)] text-[var(--text-main)]" />
                                    <input value={issue.type} onChange={(e) => { const n = [...data.issuesList]; n[idx].type = e.target.value; updateVersionData(currentVersionIndex, { issuesList: n }); }} placeholder="종류" className="w-1/4 border p-1.5 rounded text-xs bg-[var(--bg-color)] text-[var(--text-main)]" />
                                    <input value={issue.content} onChange={(e) => { const n = [...data.issuesList]; n[idx].content = e.target.value; updateVersionData(currentVersionIndex, { issuesList: n }); }} placeholder="세부 내용" className="flex-1 border p-1.5 rounded text-xs bg-[var(--bg-color)] text-[var(--text-main)]" />
                                    <button onClick={() => { const n = [...data.issuesList]; n.splice(idx, 1); updateVersionData(currentVersionIndex, { issuesList: n }); }} className="text-red-500 font-bold px-2 py-1 w-8 hover:bg-red-50 rounded">X</button>
                                </div>
                            ))}
                            {data.issuesList.length === 0 && <p className="text-xs text-[var(--text-muted)] text-center py-2">등록된 이슈가 없습니다.</p>}
                        </div>
                    </section>
                </div>

                {/* 4. 정적검증 소요시간 평가 */}
                <section className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm overflow-x-auto">
                    <h2 className="text-lg font-bold text-[var(--text-main)] mb-4 border-b border-[var(--border-color)] pb-2 flex justify-between items-center">
                        ⏱️ 정적검증 소요시간 평가 (A~M)
                        <span className="text-xs font-normal text-[var(--accent-color)]">* 데이터 수정 즉시 소요시간 탭에 반영</span>
                    </h2>
                    
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {/* Component Time Array */}
                        <div>
                            <h3 className="font-bold text-sm mb-2 text-[var(--text-muted)] border-b border-[var(--border-color)] pb-1">Component 평가시간 (A~M)</h3>
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
                                    {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'].map((subsystemChar) => {
                                        const prevVersionData = currentVersionIndex > 0 ? versionedData[currentVersionIndex - 1] : null;
                                        const prevCompItem = prevVersionData?.timeEvaluationComponent?.find((c: any) => c.subsystem === subsystemChar);
                                        const autoPrevTime = prevCompItem ? prevCompItem.currentTime : "0h";

                                        const compItem = data.timeEvaluationComponent.find((c: any) => c.subsystem === subsystemChar) || {
                                            subsystem: subsystemChar, owner: "", currentTime: "0h", prevTime: autoPrevTime, diff: "-", diffColor: ""
                                        };
                                        const updateComp = (key: string, val: string) => {
                                            const newList = [...data.timeEvaluationComponent];
                                            const idx = newList.findIndex((c: any) => c.subsystem === subsystemChar);
                                            if (idx >= 0) newList[idx] = { ...newList[idx], [key]: val };
                                            else newList.push({ ...compItem, [key]: val, prevTime: autoPrevTime });
                                            updateVersionData(currentVersionIndex, { timeEvaluationComponent: newList });
                                        };
                                        return (
                                            <tr key={subsystemChar} className="border-b border-[var(--border-color)]">
                                                <td className="p-1 text-center font-bold text-[var(--accent-color)]">{subsystemChar}</td>
                                                <td className="p-1"><input value={compItem.owner} onChange={(e) => updateComp('owner', e.target.value)} className="w-full border p-1 rounded bg-[var(--bg-color)]" placeholder="담당자" /></td>
                                                <td className="p-1"><input value={compItem.currentTime} onChange={(e) => updateComp('currentTime', e.target.value)} className="w-full border p-1 rounded bg-[var(--bg-color)]" placeholder="예: 4.2h" /></td>
                                                <td className="p-1"><input readOnly value={autoPrevTime} className="w-full border p-1 rounded bg-gray-100 text-gray-500 font-bold" /></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Runnable Time Array */}
                        <div>
                            <h3 className="font-bold text-sm mb-2 text-[var(--text-muted)] border-b border-[var(--border-color)] pb-1">Runnable 평가시간 (A~M)</h3>
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
                                    {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'].map((subsystemChar) => {
                                        const prevVersionData = currentVersionIndex > 0 ? versionedData[currentVersionIndex - 1] : null;
                                        const prevRunnItem = prevVersionData?.timeEvaluationRunnable?.find((r: any) => r.subsystem === subsystemChar);
                                        const autoPrevTime = prevRunnItem ? prevRunnItem.currentTime : "0h";

                                        const runnItem = data.timeEvaluationRunnable.find((r: any) => r.subsystem === subsystemChar) || {
                                            subsystem: subsystemChar, owner: "", currentTime: "0h", prevTime: autoPrevTime, diff: "-", diffColor: ""
                                        };
                                        const updateRunn = (key: string, val: string) => {
                                            const newList = [...data.timeEvaluationRunnable];
                                            const idx = newList.findIndex((r: any) => r.subsystem === subsystemChar);
                                            if (idx >= 0) newList[idx] = { ...newList[idx], [key]: val };
                                            else newList.push({ ...runnItem, [key]: val, prevTime: autoPrevTime });
                                            updateVersionData(currentVersionIndex, { timeEvaluationRunnable: newList });
                                        };
                                        return (
                                            <tr key={subsystemChar} className="border-b border-[var(--border-color)]">
                                                <td className="p-1 text-center font-bold text-[var(--accent-color)]">{subsystemChar}</td>
                                                <td className="p-1"><input value={runnItem.owner} onChange={(e) => updateRunn('owner', e.target.value)} className="w-full border p-1 rounded bg-[var(--bg-color)]" placeholder="담당자" /></td>
                                                <td className="p-1"><input value={runnItem.currentTime} onChange={(e) => updateRunn('currentTime', e.target.value)} className="w-full border p-1 rounded bg-[var(--bg-color)]" placeholder="예: 4.2h" /></td>
                                                <td className="p-1"><input readOnly value={autoPrevTime} className="w-full border p-1 rounded bg-gray-100 text-gray-500 font-bold" /></td>
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

            </div>
        </div>
    );
}
