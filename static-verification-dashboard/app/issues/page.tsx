"use client";

import PageHeader from "@/components/PageHeader";
import { useStore } from "@/store/useStore";

// Mock AI recommendation generataion
const generateAIRecommendation = (title: string, type: string) => {
    if (!title) return "이슈 제목을 입력하시면 AI가 해결 방안을 추천해 드립니다.";
    if (type.includes("System") || type.includes("시스템")) {
        return "Gemini ✨: 시스템 연동 혹은 리소스 할당량이 초과되었을 가능성이 있습니다. 타임아웃 설정을 20% 늘리거나 서버 로그를 먼저 확인하세요.";
    }
    if (type.includes("Logic") || type.includes("로직")) {
        return "Gemini ✨: 조건문 처리 누락 혹은 분기 결함일 가능성이 높습니다. Coverage 테스트 리포트를 확인하고 Edge Case(경계값) 검증 로직을 추가하세요.";
    }
    if (type.includes("Performance") || type.includes("성능")) {
        return "Gemini ✨: 메모리 누수 혹은 비효율적인 루프가 원인일 수 있습니다. Profiler를 통해 병목 구간을 탐색하고 캐싱 레이어 도입을 고려하세요.";
    }
    return `Gemini ✨: '${title}' 이슈 수정을 위해 최신 코드베이스의 변경 이력을 살펴보고 관련 담당자와 리뷰를 진행하는 것을 권장합니다.`;
};

export default function IssuesPage() {
    const currentVersionIndex = useStore((state) => state.currentVersionIndex);
    const versionedData = useStore((state) => state.versionedData);
    const updateVersionData = useStore((state) => state.updateVersionData);
    
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
                                <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
                                    <div className="flex items-center gap-2">
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
                                <div className="bg-[#f0f4f8] dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] p-3 rounded-lg text-sm mt-1 flex gap-2 items-start shadow-inner">
                                    <span className="text-xl">🤖</span>
                                    <div className="text-[var(--text-main)] pt-0.5">
                                        <span className="font-bold text-[#0ea5e9]">AI 해결 제안: </span>
                                        {generateAIRecommendation(issue.title, issue.type)}
                                    </div>
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