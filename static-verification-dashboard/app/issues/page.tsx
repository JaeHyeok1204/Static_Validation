"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import { useStore } from "@/store/useStore";
// Remove mockData import

export default function IssuesPage() {
    const currentVersionIndex = useStore((state) => state.currentVersionIndex);
    const versionedData = useStore((state) => state.versionedData);
    const data = versionedData[currentVersionIndex];

    const issues = data.issuesList || [];

    return (
        <div className="h-full flex flex-col">
            <PageHeader
                title="이슈 관리"
                description="모델 검증 과정 중 발생한 이슈를 확인합니다. (읽기 전용)"
            />

            <div className="flex-1 overflow-y-auto pr-2 pb-6">
                <div className="mb-4 bg-[var(--hover-bg)] border-l-4 border-[var(--chart-orange)] p-4 rounded-r-lg shadow-sm">
                    <p className="text-sm font-semibold text-[var(--text-main)] flex items-center gap-2">
                        <span>⚠️</span> 데이터 추가 및 수정은 메뉴 좌측 하단의 <strong>'데이터 통합 에디터'</strong>에서 진행해주세요.
                    </p>
                </div>

                <div className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] text-sm whitespace-nowrap">
                                    <th className="p-4 font-semibold w-16 text-center">ID</th>
                                    <th className="p-4 font-semibold w-28 text-center">해결 여부</th>
                                    <th className="p-4 font-semibold">제목</th>
                                    <th className="p-4 font-semibold w-32">종류</th>
                                    <th className="p-4 font-semibold w-1/3">내용</th>
                                    <th className="p-4 font-semibold w-32 text-center">관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {issues.map((issue: any) => (
                                    <tr key={issue.id} className="text-sm text-[var(--text-main)] border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--hover-bg)] transition-colors">
                                        <td className="p-4 text-center text-[var(--text-muted)]">
                                            #{String(issue.id).substring(0, 4)}
                                        </td>
                                        
                                        <td className="p-4 text-center">
                                            {issue.resolved ? (
                                                <span className="bg-[var(--badge-bg)] text-[var(--accent-color)] border border-[var(--border-color)] px-2 py-1 rounded text-xs font-bold">해결 (Y)</span>
                                            ) : (
                                                <span className="bg-[var(--hover-bg)] text-red-500 border border-[var(--border-color)] px-2 py-1 rounded text-xs font-bold">미해결 (N)</span>
                                            )}
                                        </td>

                                        <td className="p-4 font-medium">
                                            {issue.title}
                                        </td>

                                        <td className="p-4 text-[var(--text-muted)]">
                                            {issue.type}
                                        </td>

                                        <td className="p-4">
                                            {issue.content}
                                        </td>

                                        <td className="p-4 text-center text-xs text-[var(--text-muted)]">
                                            -
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {issues.length === 0 && (
                            <div className="text-center py-8 text-[var(--text-muted)] text-sm">등록된 이슈가 없습니다.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}