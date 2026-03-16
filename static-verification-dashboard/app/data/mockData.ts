export const initialVersions = ["T0020", "T0030", "T0040"];

export const initialVersionedData = {
    0: {
        // T0020
        dashboardData: {
            overallProgress: "78%",
            violationInspectionComponent: "82%",
            violationInspectionRunnable: "75%",
            violationAnalysisComponent: "60%",
            violationAnalysisRunnable: "55%",
            newRuleViolationsCount: 15,
            expectedSchedule: "+2.5일 지연 예상",
            aiSummary: "[T0020] 전체 모델 정적검증 진척은 78%이나, 최근 추가된 서브시스템 분석 지연으로 예상 일정이 2.5일 지연될 것으로 분석됩니다.",
        },
        chartData: [
            { date: '03-01', 발견된위배: 4000, 조치완료: 2400 },
            { date: '03-02', 발견된위배: 3000, 조치완료: 1398 },
            { date: '03-03', 발견된위배: 2000, 조치완료: 9800 },
            { date: '03-04', 발견된위배: 2780, 조치완료: 3908 },
            { date: '03-05', 발견된위배: 1890, 조치완료: 4800 },
        ],
        subsystemsList: [
            { version: "A", category: "Component", owner: "홍길동", detectedViolations: 120, newViolations: 15, analyzedViolations: 105, progress: 87.5 },
            { version: "B", category: "Runnable", owner: "김철수", detectedViolations: 45, newViolations: 5, analyzedViolations: 20, progress: 44.4 },
        ],
        rulesList: [
            { id: "db_0143", category: "Naming", description: "블록 이름은 연결된 시그널 이름과 동일하게 지정되어야 합니다. (MAB 5.0)", location: "Component (A)", aiComment: "우선 관리 필요. 시그널/블록명 불일치 방지.", severity: "High" },
        ],
        issuesList: [
            { id: 1, resolved: false, title: "[T0020] B 버전 분석 에러", type: "System Error", content: "모듈 로드 시 메모리 초과" },
        ],
        risksList: [
            { title: "고위험 규칙 누적", content: "High 심각도 위반 30% 증가함.", aiRecommendation: "우선순위 역전 필요", level: "High" },
        ],
        timeEvaluationComponent: [
            { subsystem: "A", owner: "홍길동", currentTime: "2.5h", prevTime: "3.0h", diff: "-0.5h (개선)", diffColor: "text-green-600" },
        ],
        timeEvaluationRunnable: [
            { subsystem: "B", owner: "김철수", currentTime: "1.8h", prevTime: "2.0h", diff: "-0.2h (개선)", diffColor: "text-green-600" },
        ],
        reportsDraft: {
            team: "[T0020 주진 보고 - 팀 내부용]\n- 주간 목표 달성률: 85%\n- 주요 이슈 파악: 신규 규칙 위반 다수 발생.",
            customer: "[T0020 주진 보고 - 대고객사]\n- 주간 진척 현황: 전체 완료율 78%.\n- 중점 검토: High 심각도 우선 해결.",
        }
    },
    1: {
        // T0030
        dashboardData: {
            overallProgress: "45%",
            violationInspectionComponent: "50%",
            violationInspectionRunnable: "40%",
            violationAnalysisComponent: "30%",
            violationAnalysisRunnable: "25%",
            newRuleViolationsCount: 42,
            expectedSchedule: "일정 준수 예상",
            aiSummary: "[T0030] 검증 초반 단계이며, T0020에서 이관된 규칙을 우선 적용 중입니다.",
        },
        chartData: [
            { date: '03-08', 발견된위배: 1200, 조치완료: 400 },
            { date: '03-09', 발견된위배: 2100, 조치완료: 600 },
        ],
        subsystemsList: [
            { version: "C", category: "Component", owner: "이영희", detectedViolations: 200, newViolations: 42, analyzedViolations: 100, progress: 50.0 },
            { version: "D", category: "Runnable", owner: "박민수", detectedViolations: 10, newViolations: 2, analyzedViolations: 5, progress: 50.0 },
        ],
        rulesList: [
            { id: "Rule 2.1.1", category: "Logic", description: "동일한 기능을 수행하는 블록들은 일관되게 사용되어야 합니다. (MISRA-AC-SLSF-2023)", location: "Runnable (D)", aiComment: "동일 기능 블록의 일관성 위반 확인", severity: "Medium" },
        ],
        issuesList: [
            { id: 2, resolved: true, title: "[T0030] 평가 툴 라이선스 만료", type: "Admin", content: "갱신 처리 완료" },
        ],
        risksList: [
            { title: "인력 부족 우려", content: "C 시스템 할당 인력 부재.", aiRecommendation: "일정 재조정 필요", level: "Medium" },
        ],
        timeEvaluationComponent: [
            { subsystem: "C", owner: "이영희", currentTime: "4.2h", prevTime: "3.5h", diff: "+0.7h (지연)", diffColor: "text-red-500" },
        ],
        timeEvaluationRunnable: [
            { subsystem: "D", owner: "박민수", currentTime: "3.1h", prevTime: "3.1h", diff: "0h (동일)", diffColor: "text-gray-500" },
        ],
        reportsDraft: {
            team: "[T0030 주진 보고 - 팀 내부용]\n- 초기 세팅 완료 및 C, D 시스템 동시 분석 시작.",
            customer: "[T0030 주진 보고 - 대고객사]\n- 진척 시작 단계. 툴 환경 구축 완료.",
        }
    },
    2: {
        // T0040
        dashboardData: {
            overallProgress: "98%",
            violationInspectionComponent: "100%",
            violationInspectionRunnable: "100%",
            violationAnalysisComponent: "95%",
            violationAnalysisRunnable: "98%",
            newRuleViolationsCount: 1,
            expectedSchedule: "조기 달성 예상",
            aiSummary: "[T0040] 마무리 단계입니다. 예비 승인 절차를 준비하시기 바랍니다.",
        },
        chartData: [
            { date: '03-10', 발견된위배: 50, 조치완료: 45 },
            { date: '03-11', 발견된위배: 10, 조치완료: 14 },
            { date: '03-12', 발견된위배: 5, 조치완료: 5 },
        ],
        subsystemsList: [
            { version: "E", category: "Component", owner: "최영진", detectedViolations: 5, newViolations: 0, analyzedViolations: 5, progress: 100 },
        ],
        rulesList: [
            { id: "jm_0011", category: "Format", description: "Stateflow 차트의 트랜지션은 반드시 유효한 목적지를 가져야 합니다. (MAB 5.0)", location: "Component (E)", aiComment: "단순 수정", severity: "Low" },
        ],
        issuesList: [
            { id: 3, resolved: false, title: "[T0040] 최종 산출물 포맷 에러", type: "Export", content: "엑셀 다운로드 폰트 깨짐 현상" },
        ],
        risksList: [
            { title: "최종 산출물 검수 요망", content: "자동 생성 포맷 확인", aiRecommendation: "담당자 수동 리뷰 1회 권장", level: "Low" },
        ],
        timeEvaluationComponent: [
            { subsystem: "E", owner: "최영진", currentTime: "1.0h", prevTime: "2.5h", diff: "-1.5h (개선)", diffColor: "text-green-600" },
        ],
        timeEvaluationRunnable: [],
        reportsDraft: {
            team: "[T0040 주진 보고 - 팀 내부용]\n- 검증 완료. 산출물 인계 준비.",
            customer: "[T0040 주진 보고 - 대고객사]\n- 모든 정적 검증 완료 및 최종 결과 보고서 첨부.",
        }
    }
};
