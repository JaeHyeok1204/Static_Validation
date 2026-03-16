import { create } from 'zustand';
import { initialVersionedData, initialVersions } from '@/app/data/mockData';

type ThemeType = 'light' | 'dark' | 'blue' | 'red';

interface AppState {
    currentVersionIndex: number;
    theme: ThemeType;
    versions: string[];
    versionedData: Record<number, any>;

    setVersionIndex: (index: number) => void;
    setTheme: (theme: ThemeType) => void;
    
    // V4 & V5 Data Export & Import Actions
    exportData: () => string;
    importData: (jsonData: string) => boolean;

    // V7 Data Editor Actions
    updateVersionData: (versionIndex: number, partialData: any) => void;
    createNewVersion: (versionStr: string) => void;
}

export const useStore = create<AppState>((set, get) => ({
    currentVersionIndex: 0,
    theme: 'light',
    versions: initialVersions,
    versionedData: initialVersionedData,

    setVersionIndex: (index) => set({ currentVersionIndex: index }),
    
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

    updateVersionData: (versionIndex: number, partialData: any) => {
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
}));
