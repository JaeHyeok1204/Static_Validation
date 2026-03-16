"use client";

import PageHeader from "@/components/PageHeader";
// Removed mockData import
import { useStore } from "@/store/useStore";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function HomePage() {
  const currentVersionIndex = useStore((state) => state.currentVersionIndex);
  const versionedData = useStore((state) => state.versionedData);
  const data = versionedData[currentVersionIndex];

  if (!data) return null;

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="개요"
        description="업무 공수 절감과 판단 효율 향상을 위한 핵심 정보를 시각적으로 제공합니다."
        showVersionSelector={true}
      />

      {/* scrollable main area to prevent overflow out of viewport */}
      <div className="flex-1 overflow-y-auto pr-2 pb-6 space-y-6">

        {/* 종합 요약 Card List */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm">
            <div className="text-sm text-[var(--text-muted)]">전체 진행률</div>
            <div className="text-3xl font-bold mt-2 text-[var(--accent-color)]">{data.dashboardData.overallProgress}</div>
          </div>
          <div className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm">
            <div className="text-sm text-[var(--text-muted)]">Component 검사 / 분석</div>
            <div className="text-xl font-bold mt-2 text-[var(--text-main)]">
              {data.dashboardData.violationInspectionComponent} / {data.dashboardData.violationAnalysisComponent}
            </div>
          </div>
          <div className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm">
            <div className="text-sm text-[var(--text-muted)]">Runnable 검사 / 분석</div>
            <div className="text-xl font-bold mt-2 text-[var(--text-main)]">
              {data.dashboardData.violationInspectionRunnable} / {data.dashboardData.violationAnalysisRunnable}
            </div>
          </div>
          <div className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm">
            <div className="text-sm text-[var(--text-muted)]">신규 위배 규칙</div>
            <div className="text-3xl font-bold mt-2 text-[var(--accent-color)]">{data.dashboardData.newRuleViolationsCount}건</div>
          </div>
          <div className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm">
            <div className="text-sm text-[var(--text-muted)]">예상 일정</div>
            <div className={`text-lg font-bold mt-2 ${data.dashboardData.expectedSchedule?.includes('지연') ? 'text-red-500' : 'text-[var(--accent-color)]'}`}>
              {data.dashboardData.expectedSchedule}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 서브시스템 현황 Table */}
          <section className="lg:col-span-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm flex flex-col">
            <h2 className="text-lg font-bold text-[var(--text-main)] mb-4">최근 주요 서브시스템 검증 현황</h2>
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
                  {data.subsystemsList.slice(0, 3).map((item: import('@/store/useStore').SubsystemData, idx: number) => (
                    <tr key={idx} className="text-sm text-[var(--text-main)] border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--hover-bg)] transition-colors">
                      <td className="p-3 font-medium">{item.version}</td>
                      <td className="p-3"><span className="px-2 py-1 rounded text-xs bg-[var(--badge-bg)]">{item.category}</span></td>
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
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* AI 종합 요약 */}
          <section className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm flex flex-col">
            <h2 className="text-lg font-bold text-[var(--text-main)] mb-4">AI 종합 요약</h2>
            <div className="bg-[var(--badge-bg)] text-[var(--text-main)] rounded-xl p-4 text-sm leading-relaxed flex-grow">
              {data.dashboardData.aiSummary}
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