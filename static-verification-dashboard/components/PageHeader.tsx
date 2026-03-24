"use client";

import { useStore } from "@/store/useStore";

type PageHeaderProps = {
    title: string;
    description: string;
    showVersionSelector?: boolean;
};

export default function PageHeader({
    title,
    description,
    showVersionSelector = true,
}: PageHeaderProps) {
    const currentVersionIndex = useStore((state) => state.currentVersionIndex);
    const versions = useStore((state) => state.versions);
    const setVersionIndex = useStore((state) => state.setVersionIndex);

    const handlePrev = () => {
        if (currentVersionIndex > 0) {
            setVersionIndex(currentVersionIndex - 1);
        }
    };

    const handleNext = () => {
        if (currentVersionIndex < versions.length - 1) {
            setVersionIndex(currentVersionIndex + 1);
        }
    };

    return (
        <div className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-sm flex flex-col gap-3 shrink-0 transition-colors w-full min-w-0">
            {/* Title row */}
            <div className="min-w-0 w-full break-words">
                <h1 className="m-0 text-xl sm:text-3xl font-bold text-[var(--text-main)] leading-tight break-keep sm:break-normal">{title}</h1>
                <p className="mt-1 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed break-keep sm:break-normal">{description}</p>
            </div>

            {/* Version selector — full-width on mobile, inline on desktop */}
            {showVersionSelector && (
                <div className="flex items-center gap-2 bg-[var(--hover-bg)] p-2 rounded-xl border border-[var(--border-color)] self-start w-full sm:w-auto">
                    <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider pl-1 shrink-0">버전</span>
                    <div className="flex items-center bg-[var(--bg-color)] rounded-lg border border-[var(--border-color)] shadow-sm flex-1 sm:flex-none">
                        <button
                            onClick={handlePrev}
                            disabled={currentVersionIndex === 0}
                            aria-label="이전 버전"
                            className="flex items-center justify-center w-11 h-11 text-[var(--text-main)] hover:text-[var(--accent-color)] disabled:opacity-30 transition-colors shrink-0"
                        >
                            ◀
                        </button>
                        <div className="flex-1 sm:min-w-[100px] px-3 py-2 font-mono font-bold text-[var(--accent-color)] bg-[var(--badge-bg)] border-x border-[var(--border-color)] text-center text-sm truncate">
                            {versions[currentVersionIndex] || "—"}
                        </div>
                        <button
                            onClick={handleNext}
                            disabled={currentVersionIndex === versions.length - 1}
                            aria-label="다음 버전"
                            className="flex items-center justify-center w-11 h-11 text-[var(--text-main)] hover:text-[var(--accent-color)] disabled:opacity-30 transition-colors shrink-0"
                        >
                            ▶
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}