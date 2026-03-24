"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
// Removed mockData import
import { useStore, emptyVersionData } from "@/store/useStore";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Zap, RefreshCw } from 'lucide-react';

export default function HomePage() {
  const currentVersionIndex = useStore((state) => state.currentVersionIndex);
  const versionedData = useStore((state) => state.versionedData);
  const versions = useStore((state) => state.versions); // Assuming versions is available in the store
    const data = versionedData[currentVersionIndex] || emptyVersionData;
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const aiSummary = data.dashboardData.aiSummary;
    const runAIAnalysis = useStore((state) => state.runAIAnalysis);

    const handleRunAI = async () => {
        setIsAnalyzing(true);
        await runAIAnalysis();
        setIsAnalyzing(false);
    };

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="정적검증 현황 대시보드"
        description={`[${versions[currentVersionIndex]}] 버전에 대한 실시간 프로젝트 통계 및 AI 요약 통계입니다.`}
        showVersionSelector={true}
      />

      {/* scrollable main area to prevent overflow out of viewport */}
      <div className="flex-1 overflow-y-auto pr-1 pb-4 sm:pr-2 sm:pb-6 space-y-4 sm:space-y-6">

        {/* 종합 요약 Card List - single col on mobile, 2-col sm, 5-col lg */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl p-3 sm:p-5 shadow-sm">
            <div className="text-xs sm:text-sm text-[var(--text-muted)]">전체 진행률</div>
            <div className="text-2xl sm:text-3xl font-bold mt-2 text-[var(--accent-color)]">{data.dashboardData.overallProgress}</div>
          </div>
          <div className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl p-3 sm:p-5 shadow-sm">
            <div className="text-xs sm:text-sm text-[var(--text-muted)]">Component 검사 / 분석</div>
            <div className="text-lg sm:text-xl font-bold mt-2 text-[var(--text-main)]">
              {data.dashboardData.violationInspectionComponent} / {data.dashboardData.violationAnalysisComponent}
            </div>
          </div>
          <div className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl p-3 sm:p-5 shadow-sm">
            <div className="text-xs sm:text-sm text-[var(--text-muted)]">Runnable 검사 / 분석</div>
            <div className="text-lg sm:text-xl font-bold mt-2 text-[var(--text-main)]">
              {data.dashboardData.violationInspectionRunnable} / {data.dashboardData.violationAnalysisRunnable}
            </div>
          </div>
          <div className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl p-3 sm:p-5 shadow-sm">
            <div className="text-xs sm:text-sm text-[var(--text-muted)]">신규 위배 규칙</div>
            <div className="text-2xl sm:text-3xl font-bold mt-2 text-[var(--accent-color)]">{data.dashboardData.newRuleViolationsCount}건</div>
          </div>
          <div className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl p-3 sm:p-5 shadow-sm">
            <div className="text-xs sm:text-sm text-[var(--text-muted)]">예상 일정</div>
            <div className={`text-base sm:text-lg font-bold mt-2 ${data.dashboardData.expectedSchedule?.includes('지연') ? 'text-red-500' : 'text-[var(--accent-color)]'}`}>
              {data.dashboardData.expectedSchedule}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* 서브시스템 현황 Table */}
          <section className="lg:col-span-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text-main)] mb-3 sm:mb-4">최근 주요 서브시스템 검증 현황</h2>
            <div className="overflow-x-auto flex-1">
              <table className="w-full min-w-[500px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] text-sm">
                    <th className="p-3 font-semibold">서브시스템</th>
                    <th className="p-3 font-semibold">분류</th>
                    <th className="p-3 font-semibold">진척도</th>
                  </tr>
                </thead>
                <tbody>
                  {data.subsystemsList.filter(s => (s.newDetectedViolations || 0) > 0 || (s.analyzedViolations || 0) > 0).length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-10 text-center text-[var(--text-muted)] italic">
                        최근 검증된 서브시스템이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    data.subsystemsList
                      .filter(s => (s.newDetectedViolations || 0) > 0 || (s.analyzedViolations || 0) > 0)
                      .slice(0, 6)
                      .map((item: import('@/store/useStore').SubsystemData, idx: number) => (
                        <tr key={idx} className="text-sm text-[var(--text-main)] border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--hover-bg)] transition-colors">
                          <td className="p-3 font-medium">{item.id}</td>
                          <td className="p-3"><span className="px-2 py-1 rounded text-xs bg-[var(--badge-bg)]">{item.category || "General"}</span></td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-[var(--border-color)] rounded-full h-2">
                                <div
                                  className="bg-[var(--accent-color)] h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${item.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-semibold">{item.progress}%</span>
                            </div>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* AI 종합 요약 */}
          <section className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent-color)]"></div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
                <Zap size={20} className="text-yellow-500 fill-yellow-500" />
                AI 실시간 분석 리포트
              </h2>
              <button 
                onClick={handleRunAI}
                disabled={isAnalyzing}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isAnalyzing 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                  : "bg-[var(--accent-color)] text-white hover:brightness-110 active:scale-95"
                }`}
              >
                <RefreshCw size={14} className={isAnalyzing ? "animate-spin" : ""} />
                {isAnalyzing ? "분석 중..." : "AI 실시간 분석 실행"}
              </button>
            </div>
            <div className="bg-[var(--badge-bg)] text-[var(--text-main)] rounded-xl p-4 text-sm leading-relaxed flex-grow border border-[var(--border-color)]">
              {aiSummary || "상단 'AI 실시간 분석 실행' 버튼을 눌러 프로젝트 요약을 생성하세요."}
            </div>
          </section>
        </div>

        {/* 검증 추이 그래프 */}
        <section className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm min-h-[350px] flex flex-col">
          <h2 className="text-lg font-bold text-[var(--text-main)] mb-4">검증 추이 그래프</h2>
          <div className="flex-grow w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={1}>
              <LineChart
                data={data.chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} dx={-10} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-main)', borderRadius: '12px', borderColor: 'var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Line type="monotone" dataKey="발견된위배" stroke="var(--accent-color)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="조치완료" stroke="var(--text-muted)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

      </div>
    </div>
  );
}