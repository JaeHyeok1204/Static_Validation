"use client";

import PageHeader from "@/components/PageHeader";
import { useStore } from "@/store/useStore";

// Mock AI recommendation generataion

export default function IssuesPage() {
    const currentVersionIndex = useStore((state) => state.currentVersionIndex);
    const versionedData = useStore((state) => state.versionedData);
    const updateVersionData = useStore((state) => state.updateVersionData);
    const runIssueAIAnalysis = useStore((state) => state.runIssueAIAnalysis);
    
    const data = versionedData[currentVersionIndex];
    if (!data) return null;

    const issues = data.issuesList || [];

    const updateIssuesList = (newList: import('../../store/useStore').IssueData[]) => {
        updateVersionData(currentVersionIndex, { issuesList: newList });
    };

    return (
        <div className="h-full flex flex-col">
            <PageHeader
                title="이슈 관리"
                description="모델 검증 과정 중 발생한 이슈를 확인하고 직접 관리합니다."
            />

            <div className="flex-1 overflow-y-auto pr-2 pb-6 space-y-6">
                <div className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4 border-b border-[var(--border-color)] pb-2">
                        <h2 className="text-lg font-bold text-[var(--text-main)]">🔥 발생 이슈 리스트</h2>
                        <button 
                            onClick={() => updateIssuesList([...issues, { id: Date.now(), title: "", type: "System", content: "", resolved: false }])}
                            className="bg-[var(--badge-bg)] text-[var(--accent-color)] border border-[var(--border-color)] px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm transition-all hover:brightness-95"
                        >
                            + 신규 이슈 추가
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {issues.map((issue: import('../../store/useStore').IssueData, idx: number) => (
                            <div key={issue.id} className="bg-[var(--hover-bg)] p-4 rounded-xl border border-[var(--border-color)] flex flex-col gap-3 transition-colors hover:border-[var(--accent-color)]">
                                <div className="flex flex-wrap lg:flex-nowrap gap-3 items-start lg:items-center">
                                    <div className="flex items-center gap-2 shrink-0">
                                        <input 
                                            type="checkbox" 
                                            checked={issue.resolved} 
                                            onChange={(e) => { 
                                                const n = [...issues]; 
                                                n[idx].resolved = e.target.checked; 
                                                updateIssuesList(n); 
                                            }} 
                                            className="w-5 h-5 cursor-pointer accent-[var(--accent-color)] rounded" 
                                        />
                                        <span className="text-sm font-bold text-[var(--text-muted)] w-16 text-center">
                                            #{String(issue.id).substring(0, 4)}
                                        </span>
                                    </div>
                                    <input 
                                        value={issue.title} 
                                        onChange={(e) => { const n = [...issues]; n[idx].title = e.target.value; updateIssuesList(n); }} 
                                        placeholder="이슈 제목을 입력하세요" 
                                        className="flex-1 border border-[var(--border-color)] p-2 rounded-lg text-sm font-bold bg-[var(--bg-color)] text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)]" 
                                    />
                                    <input 
                                        value={issue.type} 
                                        onChange={(e) => { const n = [...issues]; n[idx].type = e.target.value; updateIssuesList(n); }} 
                                        placeholder="분류 (예: System, Logic)" 
                                        className="w-full md:w-32 border border-[var(--border-color)] p-2 rounded-lg text-sm bg-[var(--bg-color)] text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)]" 
                                    />
                                    <button 
                                        onClick={() => { const n = [...issues]; n.splice(idx, 1); updateIssuesList(n); }} 
                                        className="text-red-500 font-bold px-3 py-2 border border-red-200 bg-red-50 hover:bg-red-100 rounded-lg text-sm transition-colors"
                                    >
                                        삭제
                                    </button>
                                </div>
                                <div className="flex gap-3">
                                    <textarea 
                                        value={issue.content} 
                                        onChange={(e) => { const n = [...issues]; n[idx].content = e.target.value; updateIssuesList(n); }} 
                                        placeholder="이슈의 상세 내용을 입력하세요" 
                                        className="container flex-1 border border-[var(--border-color)] p-2 rounded-lg text-sm bg-[var(--bg-color)] text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)] min-h-[60px] resize-y" 
                                    />
                                </div>
                                <div className="bg-[#1e293b] border border-[#334155] p-4 rounded-xl text-sm mt-1 flex flex-col sm:flex-row gap-3 items-start shadow-md transition-all">
                                    <div className="flex gap-2 items-start flex-1 text-white">
                                        <span className="text-xl shrink-0">🤖</span>
                                        <div className="pt-0.5 break-words w-full">
                                            <span className="font-bold text-[#38bdf8]">AI 해결 제안: </span>
                                            {issue.aiRecommendation || "이슈 정보를 입력하고 우측의 분석 버튼을 눌러주세요."}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => runIssueAIAnalysis(issue.id)}
                                        className="shrink-0 w-full sm:w-auto bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-sm active:scale-95"
                                    >
                                        ✨ AI 분석/갱신
                                    </button>
                                </div>
                            </div>
                        ))}
                        {issues.length === 0 && (
                            <div className="text-center py-12 text-[var(--text-muted)] text-sm border-2 border-dashed border-[var(--border-color)] rounded-xl">
                                <div>현재 등록된 이슈가 없습니다.</div>
                                <div className="mt-2 text-xs">우측 상단의 버튼을 눌러 새로운 이슈를 추가해보세요.</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}