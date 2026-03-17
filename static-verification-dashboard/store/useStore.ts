import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { initialVersionedData, initialVersions } from '@/app/data/mockData';
import { supabase } from '@/lib/supabase';
import { analyzeDataWithAI } from '@/lib/gemini';

type ThemeType = 'light' | 'dark' | 'blue' | 'red';

export interface User {
    id: string;
    password?: string;
    name: string;
    birthDate: string;
    teamName: string;
    position: string;
    geminiApiKey?: string;
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
    aiRecommendation?: string;
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
    
    // Remote Sync Actions
    syncFromDB: () => Promise<void>;
    syncToDB: (stateToSync?: Partial<AppState>) => Promise<void>;

    // Real AI Actions
    geminiApiKey: string;
    setGeminiApiKey: (key: string) => void;
    runAIAnalysis: () => Promise<void>;
    runAIRiskAnalysis: () => Promise<void>;
    runIssueAIAnalysis: (issueId: string | number) => Promise<void>;
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

    syncVersionIndex: (index: number) => set({ currentVersionIndex: index }),

    login: async (user: User) => {
        set({ 
            currentUser: user,
            // Automatically set the global Gemini key from the user's stored key if available
            geminiApiKey: user.geminiApiKey || get().geminiApiKey 
        });
    },
    logout: () => set({ currentUser: null, geminiApiKey: '' }),
    register: async (user: User) => {
        // 1. Update local state
        set((state) => ({ usersList: [...state.usersList, user] }));
        
        // 2. Sync to Supabase
        try {
            const { error } = await supabase.from('users').insert([{
                id: user.id,
                password: user.password,
                name: user.name,
                birth_date: user.birthDate,
                team_name: user.teamName,
                position: user.position,
                gemini_api_key: user.geminiApiKey || ""
            }]);
            if (error) throw error;
        } catch (err) {
            console.error("Failed to register user to Supabase:", err);
        }
    },

    syncFromDB: async () => {
        try {
            // Load Users
            const { data: users, error: userError } = await supabase.from('users').select('*');
            if (userError) throw userError;
            
            // Load App State (Versioned Data)
            const { data: appStates, error: stateError } = await supabase.from('app_state').select('data').limit(1).single();
            if (stateError) {
                if (stateError.code !== 'PGRST116') throw stateError; // Ignore if empty
            }

            const mappedUsers: User[] = (users || []).map(u => ({
                id: u.id,
                name: u.name,
                password: u.password,
                birthDate: u.birth_date,
                teamName: u.team_name,
                position: u.position,
                geminiApiKey: u.gemini_api_key || ""
            }));

            if (appStates && appStates.data && Object.keys(appStates.data).length > 0) {
                const remoteData = appStates.data as any;
                const stateUpdates: any = {
                    usersList: mappedUsers,
                    versions: remoteData.versions || initialVersions,
                    versionedData: remoteData.versionedData || initialVersionedData,
                };

                // CRITICAL: Update the current logged-in user's session from the refreshed list
                const state = get();
                if (state.currentUser) {
                    const refreshedUser = mappedUsers.find(u => u.id === state.currentUser?.id);
                    if (refreshedUser) {
                        stateUpdates.currentUser = refreshedUser;
                        // ONLY synchronize if the DB actually has a non-empty key.
                        // This prevents missing columns or empty DB fields from wiping out local persistence.
                        if (refreshedUser.geminiApiKey && refreshedUser.geminiApiKey.trim() !== "") {
                            stateUpdates.geminiApiKey = refreshedUser.geminiApiKey;
                        }
                    }
                }

                set(stateUpdates);
            } else {
                set({ usersList: mappedUsers });
            }
        } catch (err) {
            console.error("Critical: Failed to sync from Supabase:", err);
        }
    },

    syncToDB: async (stateToSync?: Partial<AppState>) => {
        const state = stateToSync || get();
        try {
            const payload = {
                versions: state.versions,
                versionedData: state.versionedData
            };
            
            // Use upsert to create or update the record with id 1
            const { error } = await supabase.from('app_state').upsert({
                id: 1,
                data: payload,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' });

            if (error) throw error;
            console.log("Successfully synced app state to Supabase.");
        } catch (err) {
            console.error("Failed to sync app state to Supabase:", err);
        }
    },
    
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

            const newState = {
                versionedData: {
                    ...state.versionedData,
                    [versionIndex]: {
                        ...currentData,
                        ...partialData
                    }
                }
            };
            
            get().syncToDB({ ...state, ...newState });
            return newState;
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

            const newState = {
                versions: newVersions,
                versionedData: {
                    ...state.versionedData,
                    [newIndex]: defaultEmptyData
                },
                currentVersionIndex: newIndex // Auto-switch to newly created version
            };
            
            get().syncToDB({ ...state, ...newState });
            return newState;
        });
    },

    geminiApiKey: '',
    setGeminiApiKey: async (key: string) => {
        const state = get();
        set({ geminiApiKey: key });

        // If a user is logged in, sync the key to their Supabase profile
        if (state.currentUser) {
            try {
                const { error } = await supabase
                    .from('users')
                    .update({ gemini_api_key: key })
                    .eq('id', state.currentUser.id);
                
                if (error) throw error;
                
                // Update local current user state as well
                set({ 
                    currentUser: { ...state.currentUser, geminiApiKey: key } 
                });
                console.log("Gemini API Key synced to user account.");
            } catch (err) {
                console.error("Failed to sync API Key to Supabase:", err);
            }
        }
    },

    runAIAnalysis: async () => {
        const state = get();
        const currentData = state.versionedData[state.currentVersionIndex];
        if (!currentData) return;

        const prompt = `
            다음은 '정적검증 업무 포탈'의 현재 검증 데이터입니다. 
            전문적인 정적검증 엔지니어의 시각에서 전체 진행 상황을 요약하고, 지연이나 문제점이 있다면 이에 대한 원인과 대책을 한국어로 3~4문장 내외로 서술해줘.
            
            - 버전: ${state.versions[state.currentVersionIndex]}
            - 전체 진척도: ${currentData.dashboardData.overallProgress}
            - 검증 시작일: ${currentData.dashboardData.startDate || '미입력'}
            - 검증 종료일: ${currentData.dashboardData.endDate || '미입력'}
            - 예상 상태: ${currentData.dashboardData.expectedSchedule}
            - 이슈 개수: ${currentData.issuesList.length}개
            
            분석을 시작해줘.
        `;

        const summary = await analyzeDataWithAI(prompt, state.geminiApiKey);
        
        if (summary === "ERROR_MISSING_KEY") {
            get().updateVersionData(state.currentVersionIndex, {
                dashboardData: {
                    ...currentData.dashboardData,
                    aiSummary: "AI API 키가 설정되지 않았습니다. 설정에서 키를 입력해 주세요."
                }
            });
            return;
        }

        get().updateVersionData(state.currentVersionIndex, {
            dashboardData: {
                ...currentData.dashboardData,
                aiSummary: summary
            }
        });
    },

    runAIRiskAnalysis: async () => {
        const state = get();
        const currentData = state.versionedData[state.currentVersionIndex];
        if (!currentData) return;

        const prompt = `
            다음 검증 데이터를 바탕으로 프로젝트의 '위험 요소(Risks)'를 분석해줘.
            JSON 형식으로 출력해주고, 각 항목은 { title: string, content: string, aiRecommendation: string, level: 'Low' | 'Medium' | 'High' } 구조로 3개 정도 만들어줘.
            불필요한 설명 없이 JSON 배열만 출력해.

            데이터:
            - 진척도: ${currentData.dashboardData.overallProgress}
            - 예상 상태: ${currentData.dashboardData.expectedSchedule}
            - 이슈 목록: ${JSON.stringify(currentData.issuesList.map(i => i.title))}
        `;

        try {
            const rawResponse = await analyzeDataWithAI(prompt, state.geminiApiKey);
            
            if (rawResponse === "ERROR_MISSING_KEY") {
                console.error("Gemini API Key missing");
                return;
            }

            // Clean markdown JSON block if exists
            const cleaned = rawResponse.replace(/```json|```/g, "").trim();
            const risks = JSON.parse(cleaned);
            
            get().updateVersionData(state.currentVersionIndex, {
                risksList: risks
            });
        } catch (err) {
            console.error("Risk analysis parsing error:", err);
        }
    },

    runIssueAIAnalysis: async (issueId: string | number) => {
        const state = get();
        const currentData = state.versionedData[state.currentVersionIndex];
        if (!currentData) return;

        const issue = currentData.issuesList.find(i => i.id === issueId);
        if (!issue || !issue.title) return;

        const prompt = `
            다음 소프트웨어 검증 이슈에 대한 전문적인 해결 방안을 권장해줘.
            - 제목: ${issue.title}
            - 분류: ${issue.type}
            - 상세 내용: ${issue.content || '내용 없음'}
            
            지침: 전문적이고 실천 가능한 조언을 1~2문장으로 제안해줘. Gemini ✨ 태그를 앞에 붙여줘.
        `;

        try {
            const recommendation = await analyzeDataWithAI(prompt, state.geminiApiKey);
            if (recommendation === "ERROR_MISSING_KEY") return;

            const newList = currentData.issuesList.map(i => 
                i.id === issueId ? { ...i, aiRecommendation: recommendation } : i
            );

            get().updateVersionData(state.currentVersionIndex, { issuesList: newList });
        } catch (err) {
            console.error("Issue AI analysis error:", err);
        }
    }
  }),
  {
      name: 'verification-portal-storage', // name of the item in the storage (must be unique)
      partialize: (state) => ({ 
          currentVersionIndex: state.currentVersionIndex,
          theme: state.theme,
          versions: state.versions,
          versionedData: state.versionedData,
          currentUser: state.currentUser,
          usersList: state.usersList,
          geminiApiKey: state.geminiApiKey
      }),
  }
));
