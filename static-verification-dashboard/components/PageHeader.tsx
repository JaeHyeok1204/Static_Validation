"use client";

import { useStore } from "@/store/useStore";
// Remove mockData import

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
        <div className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl p-6 mb-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 transition-colors">
            <div>
                <h1 className="m-0 text-3xl font-bold text-[var(--text-main)]">{title}</h1>
                <p className="mt-2 text-sm text-[var(--text-muted)]">{description}</p>
            </div>
            
            {showVersionSelector && (
                <div className="flex items-center gap-3 bg-[var(--hover-bg)] p-2 rounded-xl border border-[var(--border-color)]">
                    <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider pl-2">진행 버전</span>
                    <div className="flex items-center bg-[var(--bg-color)] rounded-lg border border-[var(--border-color)] shadow-sm">
                        <button 
                            onClick={handlePrev}
                            disabled={currentVersionIndex === 0}
                            className="px-3 py-2 text-[var(--text-main)] hover:text-[var(--accent-color)] disabled:opacity-30 disabled:hover:text-[var(--text-main)] transition-colors"
                        >
                            ◀
                        </button>
                        <div className="px-4 py-2 font-mono font-bold text-[var(--accent-color)] bg-[var(--badge-bg)] border-x border-[var(--border-color)] min-w-[100px] text-center">
                            {versions[currentVersionIndex]}
                        </div>
                        <button 
                            onClick={handleNext}
                            disabled={currentVersionIndex === versions.length - 1}
                            className="px-3 py-2 text-[var(--text-main)] hover:text-[var(--accent-color)] disabled:opacity-30 disabled:hover:text-[var(--text-main)] transition-colors"
                        >
                            ▶
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}