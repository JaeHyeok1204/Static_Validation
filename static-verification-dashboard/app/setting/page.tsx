"use client";

import PageHeader from "@/components/PageHeader";
import { useStore } from "@/store/useStore";

export default function SettingPage() {
    const theme = useStore((state) => state.theme);
    const setTheme = useStore((state) => state.setTheme);
    const exportData = useStore((state) => state.exportData);

    const handleResetValidation = () => {
        if (confirm("정말로 모든 [검증 데이터]를 초기화하시겠습니까? 이 작업은 복구할 수 없습니다.")) {
            alert("검증 데이터가 초기화되었습니다.");
        }
    };

    const handleResetAi = () => {
        if (confirm("정말로 모든 [AI 분석 이력 및 캐시 데이터]를 초기화하시겠습니까?")) {
            alert("AI 데이터가 초기화되었습니다.");
        }
    };

    const handleSave = () => {
        alert("설정이 저장되었습니다.");
    };

    const handleExport = () => {
        const jsonData = exportData();
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `verification_data_export.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="h-full flex flex-col">
            <PageHeader
                title="환경 설정"
                description="포털 운영, 권한, 테마, AI 분석 임계치 및 데이터를 관리합니다."
                showVersionSelector={false}
            />

            <div className="flex-1 overflow-y-auto pr-2 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 1. 기본 시스템 설정 */}
                    <section className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-[var(--text-main)] mb-4 border-b border-[var(--border-color)] pb-2 flex items-center justify-between">
                            기본 시스템 설정
                        </h2>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-[var(--text-main)] mb-2">테마 변경</label>
                                <div className="flex flex-wrap gap-3">
                                    {(["light", "dark", "blue", "red"] as const).map(t => (
                                        <label key={t} className={`flex-1 flex justify-center items-center gap-2 p-2.5 border rounded-lg cursor-pointer transition-colors ${
                                            theme === t 
                                            ? 'bg-[var(--badge-bg)] border-[var(--accent-color)]' 
                                            : 'border-[var(--border-color)] hover:bg-[var(--hover-bg)]'
                                        }`}>
                                            <input
                                                type="radio"
                                                name="theme"
                                                value={t}
                                                checked={theme === t}
                                                onChange={() => setTheme(t)}
                                                className="hidden"
                                            />
                                            <span className={`text-sm font-medium capitalize ${theme === t ? 'text-[var(--accent-color)]' : 'text-[var(--text-muted)]'}`}>{t}</span>
                                        </label>
                                    ))}
                                </div>
                                <p className="text-xs text-[var(--text-muted)] mt-2">* 테마 변경 즉시 글로벌 포털 UI 전역 색상이 통일감 있게 반영됩니다.</p>
                            </div>
                        </div>
                    </section>

                    {/* 2. AI 서비스 설정 (NEW) */}
                    <section className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-[var(--text-main)] mb-4 border-b border-[var(--border-color)] pb-2 flex items-center gap-2">
                           <span className="text-xl">🤖</span> AI 서비스 설정 (Gemini)
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-[var(--text-main)] mb-2">Gemini API Key</label>
                                <div className="flex flex-col gap-2">
                                    <input 
                                        type="password"
                                        value={useStore(s => s.geminiApiKey)}
                                        onChange={(e) => useStore.getState().setGeminiApiKey(e.target.value)}
                                        placeholder="AIzaSy..."
                                        className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--accent-color)] outline-none transition-all"
                                    />
                                    <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
                                        * 이 키는 브라우저 로컬 저장소에만 안전하게 저장되며, 소스 코드나 외부 서버로 전송되지 않습니다. <br/>
                                        * 키가 없으면 대시보드 요약 및 AI 채팅 기능이 작동하지 않습니다.
                                    </p>
                                    <button 
                                        onClick={async () => {
                                            const key = useStore.getState().geminiApiKey;
                                            const { listAvailableModels } = await import('@/lib/gemini');
                                            const result = await listAvailableModels(key);
                                            alert(`[AI 진단 결과]\n${Array.isArray(result) ? "접속 가능 모델: " + result.join(", ") : "오류: " + result}`);
                                        }}
                                        className="mt-2 text-[11px] font-bold text-[var(--accent-color)] hover:underline text-left"
                                    >
                                        🔍 내 API 키로 접속 가능한 모델 진단하기
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-[var(--text-main)] mb-4 border-b border-[var(--border-color)] pb-2 flex items-center justify-between">데이터 동기화 설정 (Export)</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-[var(--text-main)] mb-1">데이터 내보내기</label>
                                <button 
                                    onClick={handleExport}
                                    className="bg-[var(--badge-bg)] hover:brightness-95 text-[var(--accent-color)] text-sm font-bold py-3 px-4 rounded-lg border border-[var(--border-color)] w-full text-left transition-all shadow-sm"
                                >
                                    💾 로컬 데이터 외부로 내보내기 실행
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* 3. 위험 구역 (Data Reset) */}
                    <section className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl p-6 shadow-sm md:col-span-2 mt-4">
                        <h2 className="text-lg font-bold text-red-800 dark:text-red-400 mb-1">데이터 초기화 (Danger Zone)</h2>
                        <p className="text-sm text-red-600 dark:text-red-500 mb-4 pb-2 border-b border-red-200 dark:border-red-900/50">이 작업은 복구할 수 없으므로 주의하시기 바랍니다.</p>

                        <div className="flex flex-col md:flex-row gap-4">
                            <button
                                onClick={handleResetValidation}
                                className="flex-1 bg-white dark:bg-gray-900 hover:bg-red-100 dark:hover:bg-red-950 text-red-700 dark:text-red-400 font-bold py-3 px-4 rounded-xl border border-red-300 dark:border-red-800 shadow-sm transition-colors text-sm"
                            >
                                ⚠️ 검증 데이터 초기화
                            </button>
                            <button
                                onClick={handleResetAi}
                                className="flex-1 bg-white dark:bg-gray-900 hover:bg-orange-100 dark:hover:bg-orange-950 text-orange-700 dark:text-orange-400 font-bold py-3 px-4 rounded-xl border border-orange-300 dark:border-orange-800 shadow-sm transition-colors text-sm"
                            >
                                🤖 AI 데이터 초기화
                            </button>
                        </div>
                    </section>

                    {/* 4. 최종 저장 */}
                    <section className="col-span-1 md:col-span-2 pt-4">
                        <div className="flex justify-end gap-3 mt-2">
                            <button className="px-6 py-2 border border-[var(--border-color)] rounded-xl text-[var(--text-main)] bg-[var(--bg-color)] hover:bg-[var(--hover-bg)] font-bold text-sm transition-colors shadow-sm">취소</button>
                            <button onClick={handleSave} className="px-6 py-2 bg-[var(--accent-color)] hover:brightness-90 text-[var(--bg-color)] rounded-xl font-bold text-sm shadow-sm transition-all">변경 사항 적용하기</button>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}