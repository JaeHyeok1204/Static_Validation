import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, PageOrientation } from 'docx';
import fs from 'fs';

const TITLE_COLOR = "1F3864";
const HEADING1_COLOR = "2E4F8A";
const HEADING2_COLOR = "1E6B8A";
const HEADING3_COLOR = "21539E";
const CELL_HEADER_COLOR = "D6E4F0";
const LIGHT_ROW_COLOR = "F0F5FA";

const t = (text, opts = {}) => new TextRun({ text, font: "맑은 고딕", ...opts });

const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 400, after: 160 },
  children: [new TextRun({ text, font: "맑은 고딕", bold: true, size: 32, color: HEADING1_COLOR })]
});

const h2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 280, after: 120 },
  children: [new TextRun({ text, font: "맑은 고딕", bold: true, size: 26, color: HEADING2_COLOR })]
});

const h3 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  spacing: { before: 200, after: 80 },
  children: [new TextRun({ text, font: "맑은 고딕", bold: true, size: 22, color: HEADING3_COLOR })]
});

const p = (text, opts = {}) => new Paragraph({
  spacing: { after: 120 },
  children: [new TextRun({ text, font: "맑은 고딕", size: 20, ...opts })]
});

const bullet = (text) => new Paragraph({
  bullet: { level: 0 },
  spacing: { after: 60 },
  children: [new TextRun({ text, font: "맑은 고딕", size: 20 })]
});

const subbullet = (text) => new Paragraph({
  bullet: { level: 1 },
  spacing: { after: 60 },
  children: [new TextRun({ text, font: "맑은 고딕", size: 19 })]
});

const space = () => new Paragraph({ children: [new TextRun("")], spacing: { after: 80 } });

const headerCell = (text, span) => new TableCell({
  shading: { fill: CELL_HEADER_COLOR },
  columnSpan: span || 1,
  children: [new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text, font: "맑은 고딕", bold: true, size: 19 })]
  })]
});

const dataCell = (text, shade = false) => new TableCell({
  shading: shade ? { fill: LIGHT_ROW_COLOR } : undefined,
  children: [new Paragraph({
    children: [new TextRun({ text, font: "맑은 고딕", size: 19 })]
  })]
});

const simpleTable = (headers, rows) => new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    new TableRow({ children: headers.map(h => headerCell(h)) }),
    ...rows.map((row, i) => new TableRow({ children: row.map(c => dataCell(c, i % 2 === 1)) }))
  ]
});

const doc = new Document({
  sections: [{
    properties: {},
    children: [

      // ─── 표지 ───
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 1800, after: 400 },
        children: [new TextRun({ text: "정적검증 업무 포탈", font: "맑은 고딕", bold: true, size: 72, color: TITLE_COLOR })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: "기술 문서 (Technical Documentation)", font: "맑은 고딕", size: 40, color: "555555" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: "VPC-S 1.2 HEV 모델 정적검증 업무 포탈", font: "맑은 고딕", size: 26, color: "333333" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [new TextRun({ text: "작성일: 2026년 3월 24일", font: "맑은 고딕", size: 22, color: "666666" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [new TextRun({ text: "버전: v1.0", font: "맑은 고딕", size: 22, color: "666666" })]
      }),
      new Paragraph({ pageBreakBefore: true, children: [new TextRun("")] }),

      // ─── 1. 프로젝트 개요 ───
      h1("1. 프로젝트 개요"),
      h2("1.1 목적 및 배경"),
      p("본 시스템은 자동차 소프트웨어 개발 품질 확보를 위한 정적 검증(Static Verification) 업무를 디지털화하고 자동화하기 위한 웹 애플리케이션입니다."),
      p("기존의 엑셀 기반 수동 관리 방식에서 벗어나 실시간 데이터 공유, AI 기반 분석, 자동 저장 동기화를 통해 팀 전체의 검증 생산성을 극대화합니다."),
      space(),

      h2("1.2 시스템 명칭"),
      simpleTable(["항목", "내용"], [
        ["시스템명", "정적검증 업무 포탈 (Static Verification Portal)"],
        ["대상 프로젝트", "VPC-S 1.2 HEV 모델"],
        ["개발 언어", "TypeScript (Next.js 16, React 19)"],
        ["배포 URL", "GitHub Pages (정적 사이트 배포)"],
        ["저작권", "© 2026 Verification Portal"],
      ]),
      space(),

      h2("1.3 주요 기능 요약"),
      bullet("버전별 정적검증 데이터 입력 및 관리"),
      bullet("서브시스템별 진척도 및 위배 현황 실시간 시각화"),
      bullet("MAB / MISRA 규칙 매트릭스 관리 (Component / Runnable 분리)"),
      bullet("이슈 추적 및 업무 리스크 관리"),
      bullet("검사 소요시간 평가 (HH:MM:SS 형식)"),
      bullet("Gemini AI를 이용한 분석 보고서 자동 초안 생성"),
      bullet("자동 저장 및 Supabase 실시간 동기화"),
      bullet("사용자 인증 (회원가입 / 로그인 / 비밀번호 재설정)"),
      bullet("멀티 테마 지원 (라이트 / 다크 / 블루 / 레드)"),
      space(),
      new Paragraph({ pageBreakBefore: true, children: [new TextRun("")] }),

      // ─── 2. 기술 스택 ───
      h1("2. 기술 스택"),
      h2("2.1 프론트엔드"),
      simpleTable(["기술", "버전", "역할"], [
        ["Next.js", "16.1.6", "React 기반 풀스택 프레임워크, 정적 사이트 생성 (SSG)"],
        ["React", "19.2.3", "UI 컴포넌트 라이브러리"],
        ["TypeScript", "^5", "정적 타입 검사로 코드 안전성 확보"],
        ["Tailwind CSS", "^4", "유틸리티 기반 반응형 UI 스타일링"],
        ["Recharts", "^3.8.0", "데이터 시각화 차트 (진척도 그래프 등)"],
        ["Lucide React", "^0.577.0", "SVG 아이콘 라이브러리"],
        ["Zustand", "^5.0.11", "전역 상태 관리 (자동저장 미들웨어 포함)"],
      ]),
      space(),

      h2("2.2 백엔드 / 인프라"),
      simpleTable(["기술", "버전/플랜", "역할"], [
        ["Supabase", "PostgreSQL 기반", "데이터베이스 (앱 상태, 사용자 정보 저장)"],
        ["Supabase Auth (커스텀)", "—", "사용자 인증 처리 (해시 기반 비밀번호 검증)"],
        ["GitHub Pages", "Free", "Next.js 정적 빌드 결과물 배포"],
        ["GitHub Actions", "—", "CI/CD 파이프라인 (푸시 → 자동 빌드 → 배포)"],
      ]),
      space(),

      h2("2.3 AI 통합"),
      simpleTable(["기술", "버전", "역할"], [
        ["Google Gemini API", "@google/generative-ai ^0.24.1", "검증 데이터 분석, 리스크 평가, 이슈 해결방안 제안"],
        ["동적 모델 탐색", "v1beta / v1 지원", "사용 가능한 Gemini 모델을 자동 탐색하여 최적 모델 선택"],
      ]),
      space(),
      new Paragraph({ pageBreakBefore: true, children: [new TextRun("")] }),

      // ─── 3. 아키텍처 ───
      h1("3. 시스템 아키텍처"),
      h2("3.1 전체 구조"),
      p("본 시스템은 클라이언트-사이드 렌더링(CSR) 중심의 정적 웹 애플리케이션으로, Next.js의 App Router를 사용합니다. 모든 페이지는 정적으로 빌드되어 GitHub Pages에 배포되며, 런타임 백엔드 없이 Supabase 클라이언트 SDK를 통해 직접 데이터베이스에 접근합니다."),
      space(),
      p("[사용자 브라우저]", { bold: true }),
      p("  └─ Next.js (CSR) App Router"),
      p("      ├─ Zustand 전역 상태 스토어 (Auto-Sync + Persist 미들웨어)"),
      p("      ├─ Supabase JS 클라이언트 ──→ [Supabase PostgreSQL DB]"),
      p("      └─ Google Gemini API 클라이언트 ──→ [Google AI 서버]"),
      space(),

      h2("3.2 데이터 흐름"),
      simpleTable(["단계", "설명"], [
        ["1. 로그인", "사용자가 ID/비밀번호 입력 → SHA-256 해시 후 Supabase users 테이블과 대조"],
        ["2. 데이터 로드", "로그인 성공 시 syncFromDB() 호출 → Supabase에서 앱 전체 상태(app_state) 와 사용자 목록(users) 로드"],
        ["3. 데이터 편집", "사용자가 에디터에서 데이터 입력/수정 → Zustand 스토어 즉시 업데이트"],
        ["4. 자동 저장", "updateVersionData() 호출 → 1.5초 디바운스 후 syncToDB() → Supabase app_state 테이블 UPSERT"],
        ["5. AI 분석", "사용자가 AI 분석 요청 → 현재 데이터 기반 프롬프트 생성 → Gemini API 호출 → 결과를 스토어에 저장 → 자동 저장"],
      ]),
      space(),

      h2("3.3 배포 파이프라인"),
      bullet("개발자가 upload.bat 실행 → git add / commit / push to GitHub"),
      bullet("GitHub Actions 워크플로우 자동 트리거"),
      bullet("next build → next export(정적 HTML 생성)"),
      bullet("GitHub Pages (gh-pages 브랜치)에 자동 배포"),
      space(),
      new Paragraph({ pageBreakBefore: true, children: [new TextRun("")] }),

      // ─── 4. 디렉토리 구조 ───
      h1("4. 디렉토리 구조 및 파일 설명"),
      simpleTable(["경로", "설명"], [
        ["app/", "Next.js App Router 루트. 각 서브디렉토리가 하나의 페이지(라우트)에 대응"],
        ["app/page.tsx", "메인 대시보드 (개요) 페이지"],
        ["app/data_editor/", "데이터 통합 에디터 페이지 (핵심 데이터 입력 및 관리)"],
        ["app/subsystems/", "서브시스템별 현황 및 진척도 페이지"],
        ["app/rules/", "규칙 설명 및 중요도 페이지"],
        ["app/issues/", "이슈 관리 페이지"],
        ["app/risks/", "업무 리스크 관리 페이지"],
        ["app/time_evaluation/", "정적검증 소요시간 평가 페이지"],
        ["app/reports/", "AI 보고서 초안 관리 페이지"],
        ["app/ai_chat/", "Gemini AI 업무 대화 페이지"],
        ["app/setting/", "환경설정 페이지 (API 키, 테마, 데이터 관리)"],
        ["app/login/ | signup/", "사용자 로그인 및 회원가입 페이지"],
        ["app/find-id/ | forgot-password/ | reset-password/", "계정 찾기 및 비밀번호 재설정 페이지"],
        ["store/useStore.ts", "Zustand 전역 상태 스토어 (전체 앱 데이터 및 액션 정의)"],
        ["lib/supabase.ts", "Supabase 클라이언트 초기화"],
        ["lib/gemini.ts", "Gemini AI API 연동 (동적 모델 탐색 및 분석 함수)"],
        ["lib/crypto.ts", "SHA-256 기반 비밀번호 해싱 유틸리티"],
        ["lib/timeUtils.ts", "HH:MM:SS 형식 시간 변환 유틸리티"],
        ["components/Sidebar.tsx", "전역 내비게이션 사이드바"],
        ["components/AuthWrapper.tsx", "인증 보호 래퍼 (로그인 안 된 경우 로그인 페이지로 리다이렉트)"],
        ["components/PageHeader.tsx", "공통 페이지 헤더 컴포넌트"],
      ]),
      space(),
      new Paragraph({ pageBreakBefore: true, children: [new TextRun("")] }),

      // ─── 5. 데이터 모델 ───
      h1("5. 데이터 모델"),
      h2("5.1 핵심 인터페이스 (TypeScript)"),

      h3("User (사용자)"),
      simpleTable(["필드명", "타입", "설명"], [
        ["id", "string", "사용자 고유 ID"],
        ["email", "string", "이메일 (계정 복구용)"],
        ["password", "string (optional)", "SHA-256 해시된 비밀번호 (DB 저장용)"],
        ["name", "string", "실명"],
        ["birthDate", "string", "생년월일 (YYYY-MM-DD)"],
        ["teamName", "string", "소속 팀명"],
        ["position", "string", "직위"],
        ["geminiApiKey", "string (optional)", "사용자별 Gemini API 키"],
      ]),
      space(),

      h3("VersionData (버전별 데이터)"),
      simpleTable(["필드명", "타입", "설명"], [
        ["dashboardData", "DashboardData", "대시보드 요약 데이터"],
        ["chartData", "ChartDataPoint[]", "시간대별 추이 차트 데이터"],
        ["subsystemsList", "SubsystemData[]", "A~P 16개 서브시스템별 현황"],
        ["rulesList", "RuleData[]", "MAB/MISRA 규칙 위배 매트릭스"],
        ["issuesList", "IssueData[]", "등록된 이슈 목록"],
        ["risksList", "RiskData[]", "업무 리스크 목록"],
        ["timeEvaluationComponent", "TimeEvaluationData[]", "Component 검사 소요시간"],
        ["timeEvaluationRunnable", "TimeEvaluationData[]", "Runnable 검사 소요시간"],
        ["reportsDraft", "{ team, customer }", "보고서 초안 텍스트"],
      ]),
      space(),

      h3("RuleData (규칙 위배 데이터)"),
      simpleTable(["필드명", "타입", "설명"], [
        ["id", "string", "규칙 ID (예: MAB_JC_0011, MISRA_AC_SLSF_003_A)"],
        ["mabSubId", "string (optional)", "MAB 세부 규칙 ID"],
        ["category", "'MAB' | 'MISRA'", "규칙 분류"],
        ["scope", "'Component' | 'Runnable'", "적용 범위 (Component 또는 Runnable)"],
        ["subsystemViolations", "Record<string, number>", "서브시스템 ID → 위배 건수 매핑 (A~P)"],
      ]),
      space(),

      h2("5.2 Supabase 데이터베이스 테이블"),
      simpleTable(["테이블명", "주요 컬럼", "설명"], [
        ["users", "id, email, password, name, birth_date, team_name, position, gemini_api_key", "사용자 계정 정보"],
        ["app_state", "id (=1), data (JSONB), updated_at", "앱 전체 상태 (versions, versionedData) 저장"],
        ["verification_codes", "user_id, code, expires_at", "비밀번호 재설정 인증 코드 (10분 유효)"],
      ]),
      space(),
      new Paragraph({ pageBreakBefore: true, children: [new TextRun("")] }),

      // ─── 6. 주요 모듈 ───
      h1("6. 주요 모듈 상세 설명"),
      h2("6.1 전역 상태 관리 (useStore.ts)"),
      p("Zustand v5 라이브러리를 사용하여 전체 앱의 상태를 중앙에서 관리합니다."),
      simpleTable(["기능", "설명"], [
        ["persist 미들웨어", "localStorage에 핵심 상태(버전 데이터, 사용자, 설정 등)를 영속화하여 새로고침 후에도 유지"],
        ["자동 저장 (syncToDB)", "데이터 변경 시 1.5초 디바운스 후 Supabase에 UPSERT. isSyncing 상태로 UI 피드백 제공"],
        ["updateVersionData", "특정 버전의 데이터를 부분 업데이트하며, 호출될 때마다 자동 저장 트리거"],
        ["syncFromDB", "로그인 또는 페이지 마운트 시 Supabase에서 최신 상태를 가져와 로컬 스토어에 반영"],
        ["AI 분석 메서드", "runAIAnalysis, runAIRiskAnalysis, runIssueAIAnalysis 등 Gemini API와 연동된 분석 함수 포함"],
      ]),
      space(),

      h2("6.2 AI 분석 엔진 (lib/gemini.ts)"),
      p("Google Generative AI SDK를 활용한 지능형 분석 모듈입니다."),
      bullet("동적 모델 탐색: 사용 가능한 Gemini 모델을 실시간 조회 후 최적 모델 자동 선택"),
      bullet("폴백 전략: 모델 조회 실패 시 gemini-1.5-flash, gemini-1.5-pro 등 기본 목록으로 순차 시도"),
      bullet("오류 처리: 429(할당량 초과), 404(모델 미발견), 401/403(인증 오류) 등을 상황별 한국어 메시지로 처리"),
      bullet("API 버전 다중 지원: v1beta 및 v1 API 버전 모두 시도하여 호환성 극대화"),
      space(),

      h2("6.3 인증 시스템"),
      p("Supabase의 자체 Auth 대신 커스텀 사용자 인증 시스템을 구현하였습니다."),
      bullet("비밀번호 보안: SHA-256 해시(Web Crypto API)를 사용하여 평문 비밀번호를 해싱 후 저장"),
      bullet("로그인: ID + 해시된 비밀번호로 Supabase users 테이블 조회"),
      bullet("세션 관리: 로그인 성공 시 Zustand 스토어 및 localStorage에 사용자 정보 저장"),
      bullet("비밀번호 재설정: 사용자 실명/이메일/생년월일 검증 → Supabase DB에 6자리 인증 코드 저장 → 이메일 발송 (SQL 트리거)"),
      bullet("페이지 보호: AuthWrapper.tsx가 모든 보호 페이지에 래핑되어 비인증 접근 시 로그인 페이지로 리다이렉트"),
      space(),

      h2("6.4 시간 유틸리티 (lib/timeUtils.ts)"),
      p("검사 소요시간 데이터를 HH:MM:SS 형식으로 통일 관리하기 위한 유틸리티 함수 모음입니다."),
      bullet("hmsToSeconds(hms): 'HH:MM:SS' 또는 기존 decimal '2.5h' 형식 문자열을 초(second)로 변환"),
      bullet("secondsToHms(seconds): 초를 '[+/-]HH:MM:SS' 형식 문자열로 변환 (증감 비교 값 생성에 활용)"),
      bullet("formatTimeInput(value): 사용자 입력을 받아 HH:MM:SS 형식으로 자동 정규화"),
      space(),
      new Paragraph({ pageBreakBefore: true, children: [new TextRun("")] }),

      // ─── 7. 페이지별 기능 ───
      h1("7. 페이지별 기능 설명"),
      simpleTable(["페이지", "경로", "주요 기능"], [
        ["개요 (대시보드)", "/", "전체 진척도, 주요 지표, AI 요약, 진척도 차트 표시"],
        ["서브시스템별 현황", "/subsystems", "A~P 서브시스템별 신규 위배, 분석 완료, 진척률 조회 및 편집"],
        ["규칙 설명 및 중요도", "/rules", "MAB/MISRA 규칙의 설명 및 위험도 조회"],
        ["이슈 관리", "/issues", "이슈 등록, 유형/해결 여부 분류, AI 해결방안 제안"],
        ["업무 리스크", "/risks", "리스크 목록 관리, AI 리스크 분석 (Low/Medium/High)"],
        ["소요시간 평가", "/time_evaluation", "Component/Runnable 별 검사 소요시간 비교 (HH:MM:SS, 증감 색상 표시)"],
        ["AI 보고서 초안", "/reports", "팀 보고서 및 고객사 보고서 초안 텍스트 저장"],
        ["AI 업무 대화", "/ai_chat", "Gemini AI와 자유 업무 대화 (대화 이력 Supabase 저장)"],
        ["데이터 통합 에디터", "/data_editor", "버전 생성, 대시보드/서브시스템/규칙/소요시간 전체 데이터 입력 및 편집"],
        ["환경 설정", "/setting", "Gemini API 키 입력, 테마 변경, 데이터 Export/Import, 데이터 리셋"],
      ]),
      space(),
      new Paragraph({ pageBreakBefore: true, children: [new TextRun("")] }),

      // ─── 8. 보안 ───
      h1("8. 보안 고려사항"),
      simpleTable(["항목", "현황 및 설명"], [
        ["비밀번호 저장", "SHA-256 해시 후 저장 (평문 비밀번호 저장 없음)"],
        ["API 키 보안", "Gemini API 키는 사용자별 Supabase DB에 저장 및 Zustand localStorage 암호화 없이 저장 (추후 보완 필요)"],
        ["Supabase 접근", "Row Level Security (RLS) 정책 적용 권장 (현재 anon key로 클라이언트 직접 접근)"],
        ["인증 보호", "AuthWrapper로 모든 민감 페이지 보호. 클라이언트 사이드 보호라는 한계 존재"],
        ["환경 변수", "NEXT_PUBLIC_ 접두어 변수는 클라이언트에 노출됨. 민감 정보는 서버 전용 변수 사용 권장"],
      ]),
      space(),
      new Paragraph({ pageBreakBefore: true, children: [new TextRun("")] }),

      // ─── 9. 개발 및 배포 가이드 ───
      h1("9. 개발 환경 설정 및 배포 가이드"),
      h2("9.1 사전 요구사항"),
      bullet("Node.js 20 이상"),
      bullet("Supabase 프로젝트 생성 및 테이블 설정 (users, app_state, verification_codes)"),
      bullet("Google Gemini API 키 발급 (Google AI Studio)"),
      space(),

      h2("9.2 환경 변수 설정 (.env.local)"),
      p("NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co", { font: "Courier New" }),
      p("NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>", { font: "Courier New" }),
      p("NEXT_PUBLIC_GEMINI_API_KEY=<your-gemini-key>  (선택 사항)", { font: "Courier New" }),
      space(),

      h2("9.3 로컬 개발 실행"),
      p("npm install  # 의존성 설치", { font: "Courier New" }),
      p("npm run dev  # 개발 서버 실행 (http://localhost:3000)", { font: "Courier New" }),
      space(),

      h2("9.4 프로덕션 빌드 및 배포"),
      p("npx next build  # 정적 빌드 생성", { font: "Courier New" }),
      p("upload.bat 실행  # git commit + push → GitHub Actions CI/CD 자동 배포", { font: "Courier New" }),
      space(),
      new Paragraph({ pageBreakBefore: true, children: [new TextRun("")] }),

      // ─── 10. 변경 이력 ───
      h1("10. 버전 변경 이력"),
      simpleTable(["버전", "날짜", "주요 변경 내용"], [
        ["Phase 1~20", "2026.03 이전", "초기 프로젝트 설계, 데이터 모델 정의, 핵심 UI 구현"],
        ["Phase 21~30", "2026.03 초", "Supabase 연동, 사용자 인증 시스템, AI 분석 기능 구현"],
        ["Phase 31~33", "2026.03.13", "데이터 에디터 고도화, 숫자 입력 빈칸 처리 (0 자동 인식)"],
        ["Phase 34", "2026.03.17", "Gemini API 키 영속화 버그 수정 (로그아웃 후에도 유지)"],
        ["Phase 35", "2026.03.23", "규칙 매트릭스 Component / Runnable 구분 기능 추가"],
        ["Phase 36", "2026.03.24", "검사 소요시간 형식 변경 (decimal h → HH:MM:SS)"],
        ["Phase 37", "2026.03.24", "데이터 입력 시 자동 저장 및 실시간 동기화 인디케이터 추가"],
      ]),
      space(),

      // ─── 11. 부록 ───
      h1("11. 부록"),
      h2("지원 MAB 규칙 목록 (일부)"),
      p("MAB_AR_0001, MAB_AR_0002, MAB_DB_0042, MAB_DB_0112, MAB_JC_0011, MAB_JC_0081, MAB_JC_0110, MAB_JC_0161, MAB_NA_0001, MAB_NA_0002 외 약 100개 이상의 규칙 지원"),
      space(),
      h2("지원 MISRA 규칙 목록 (일부)"),
      p("MISRA_AC_SLSF_003_A, MISRA_AC_SLSF_004_A, MISRA_AC_SLSF_005_A, MISRA_AC_SLSF_006_A, MISRA_AC_SLSF_007_A, MISRA_AC_SLSF_008_A 외 약 150개 이상의 규칙 지원"),
      space(),

      // 마무리
      space(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 600, after: 200 },
        children: [new TextRun({ text: "─ 문서 끝 ─", font: "맑은 고딕", size: 20, color: "888888" })]
      }),
    ]
  }]
});

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync('c:/Static_Verification_Project/정적검증_업무포탈_기술문서.docx', buffer);
console.log('✅ 기술 문서가 성공적으로 생성되었습니다: 정적검증_업무포탈_기술문서.docx');
