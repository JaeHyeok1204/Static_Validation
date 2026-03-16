import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { initialVersionedData, initialVersions } from '@/app/data/mockData';

type ThemeType = 'light' | 'dark' | 'blue' | 'red';

export interface User {
    id: string;
    password?: string;
    name: string;
    birthDate: string;
    teamName: string;
    position: string;
}

export interface DashboardData {
    startDate?: string;
    endDate?: string;
    overallProgress: string;
    violationInspectionComponent: string;
    violationInspectionRunnable: string;
    violationAnalysisComponent: string;
    violationAnalysisRunnable: string;
    newRuleViolationsCount: number;
    expectedSchedule: string;
    aiSummary: string;
}

export interface SubsystemData {
    version: string;
    category?: string;
    owner?: string;
    detectedViolations?: number;
    newViolations?: number;
    analyzedViolations?: number;
    progress?: number;
}

export interface RuleData {
    id: string;
    category?: string;
    description?: string;
    location?: string;
    aiComment?: string;
    severity?: string;
}

export interface IssueData {
    id: string | number;
    title: string;
    type: string;
    content: string;
    resolved: boolean;
}

export interface RiskData {
    title: string;
    content: string;
    aiRecommendation: string;
    level: string;
}

export interface ChartDataPoint {
    date: string;
    detected?: number;
    analyzed?: number;
    발견된위배?: number;
    조치완료?: number;
}

export interface TimeEvaluationData {
    subsystem: string;
    owner?: string;
    currentTime?: string;
    prevTime?: string;
    diff?: string;
    diffColor?: string;
    analysisTime?: number;
    fixTime?: number;
    verifyTime?: number;
    note?: string;
}

export interface VersionData {
    dashboardData: DashboardData;
    chartData: ChartDataPoint[];
    subsystemsList: SubsystemData[];
    rulesList: RuleData[];
    issuesList: IssueData[];
    risksList: RiskData[];
    timeEvaluationComponent: TimeEvaluationData[];
    timeEvaluationRunnable: TimeEvaluationData[];
    reportsDraft: { team: string; customer: string };
    [key: string]: unknown;
}

interface AppState {
    theme: ThemeType;
    projectName: string;
    currentVersionIndex: number;
    versions: string[];
    versionedData: Record<number, VersionData>;
    currentUser: User | null;
    usersList: User[];
    
    setTheme: (theme: ThemeType) => void;
    setVersionIndex: (index: number) => void;
    
    // V4 & V5 Data Export & Import Actions
    exportData: () => string;
    importData: (jsonData: string) => boolean;

    // V7 Data Editor Actions
    updateVersionData: (versionIndex: number, partialData: Partial<VersionData>) => void;
    createNewVersion: (versionStr: string) => void;
    login: (user: User) => void;
    logout: () => void;
    register: (user: User) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
    currentVersionIndex: 0,
    theme: 'light',
    projectName: 'VPC-S 1.2 HEV 모델 정적검증 업무 포탈',
    versions: initialVersions,
    versionedData: initialVersionedData,
    currentUser: null,
    usersList: [],

    setVersionIndex: (index) => set({ currentVersionIndex: index }),

    login: (user: import('./useStore').User) => set({ currentUser: user }),
    logout: () => set({ currentUser: null }),
    register: (user: import('./useStore').User) => set((state) => ({ usersList: [...state.usersList, user] })),
    
    setTheme: (theme) => {
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', theme);
        }
        set({ theme });
    },

    exportData: () => {
        const state = get();
        const exportPayload = {
            versions: state.versions,
            versionedData: state.versionedData
        };
        return JSON.stringify(exportPayload, null, 2);
    },

    importData: (jsonData: string) => {
        try {
            const parsed = JSON.parse(jsonData);
            if (parsed.versions && parsed.versionedData) {
                set({
                    versions: parsed.versions,
                    versionedData: parsed.versionedData,
                    currentVersionIndex: 0 // reset logic
                });
                return true;
            }
            return false;
        } catch (e) {
            console.error("Failed to parse import JSON", e);
            return false;
        }
    },

    updateVersionData: (versionIndex: number, partialData: Partial<VersionData>) => {
        set((state) => {
            const currentData = state.versionedData[versionIndex];
            if (!currentData) return state;

            return {
                versionedData: {
                    ...state.versionedData,
                    [versionIndex]: {
                        ...currentData,
                        ...partialData
                    }
                }
            };
        });
    },

    createNewVersion: (versionStr: string) => {
        if (!versionStr.trim()) return;
        set((state) => {
            const newIndex = state.versions.length;
            const newVersions = [...state.versions, versionStr];
            
            // Blanket default template based on T0040 shape but reset
            const defaultEmptyData = {
                dashboardData: {
                    startDate: "",
                    endDate: "",
                    overallProgress: "0%",
                    violationInspectionComponent: "0%",
                    violationInspectionRunnable: "0%",
                    violationAnalysisComponent: "0%",
                    violationAnalysisRunnable: "0%",
                    newRuleViolationsCount: 0,
                    expectedSchedule: "분석 전",
                    aiSummary: "신규 발급된 버전입니다. 데이터 입력을 진행해주세요.",
                },
                chartData: [],
                subsystemsList: [],
                rulesList: [],
                issuesList: [],
                risksList: [],
                timeEvaluationComponent: [],
                timeEvaluationRunnable: [],
                reportsDraft: { team: "", customer: "" }
            };

            return {
                versions: newVersions,
                versionedData: {
                    ...state.versionedData,
                    [newIndex]: defaultEmptyData
                },
                currentVersionIndex: newIndex // Auto-switch to newly created version
            };
        });
    }
  }),
  {
      name: 'verification-portal-storage', // name of the item in the storage (must be unique)
      partialize: (state) => ({ 
          // Specify which parts of the state to persist
          currentVersionIndex: state.currentVersionIndex,
          theme: state.theme,
          versions: state.versions,
          versionedData: state.versionedData
      }),
  }
));
