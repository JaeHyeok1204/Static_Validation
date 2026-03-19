import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { initialVersionedData, initialVersions } from '@/app/data/mockData';
import { supabase } from '@/lib/supabase';
import { analyzeDataWithAI } from '@/lib/gemini';
import { hashPassword } from '@/lib/crypto';

type ThemeType = 'light' | 'dark' | 'blue' | 'red';

export interface User {
    id: string;
    email: string; // NEW: Required for recovery and standard compliance
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
    id: string; // A, B, C... P
    category?: string;
    owner?: string;
    newDetectedViolations?: number; // 신규 검출 위배
    analyzedViolations?: number; // 분석 완료
    progress?: number; // (analyzed / newDetected) * 100
}

export interface RuleData {
    id: string;
    mabSubId?: string; // MAB Sub ID support
    category: 'MAB' | 'MISRA';
    description?: string;
    location?: string;
    aiComment?: string;
    severity?: string;
    subsystemViolations: Record<string, number>; // SubsystemID -> Count mapping
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

export const INITIAL_MAB_RULE_IDS = [
    "MAB_AR_0001", "MAB_AR_0002", "MAB_DB_0042", "MAB_DB_0112", "MAB_DB_0126", "MAB_DB_0127", "MAB_DB_0129", "MAB_DB_0137", "MAB_DB_0141", "MAB_DB_0143", "MAB_HD_0001", "MAB_JC_0011", "MAB_JC_0081", "MAB_JC_0110", "MAB_JC_0121", "MAB_JC_0161", "MAB_JC_0171", "MAB_JC_0201", "MAB_JC_0211", "MAB_JC_0222", "MAB_JC_0231", "MAB_JC_0232", "MAB_JC_0241", "MAB_JC_0242", "MAB_JC_0243", "MAB_JC_0244", "MAB_JC_0245", "MAB_JC_0246", "MAB_JC_0247", "MAB_JC_0451", "MAB_JC_0481", "MAB_JC_0501", "MAB_JC_0511", "MAB_JC_0531", "MAB_JC_0602", "MAB_JC_0603", "MAB_JC_0604", "MAB_JC_0610", "MAB_JC_0611", "MAB_JC_0621", "MAB_JC_0622", "MAB_JC_0623", "MAB_JC_0624", "MAB_JC_0626", "MAB_JC_0627", "MAB_JC_0628", "MAB_JC_0630", "MAB_JC_0640", "MAB_JC_0641", "MAB_JC_0642", "MAB_JC_0643", "MAB_JC_0644", "MAB_JC_0650", "MAB_JC_0653", "MAB_JC_0655", "MAB_JC_0656", "MAB_JC_0659", "MAB_JC_0700", "MAB_JC_0701", "MAB_JC_0702", "MAB_JC_0711", "MAB_JC_0712", "MAB_JC_0721", "MAB_JC_0723", "MAB_JC_0731", "MAB_JC_0732", "MAB_JC_0733", "MAB_JC_0734", "MAB_JC_0736", "MAB_JC_0738", "MAB_JC_0739", "MAB_JC_0740", "MAB_JC_0741", "MAB_JC_0751", "MAB_JC_0752", "MAB_JC_0753", "MAB_JC_0760", "MAB_JC_0762", "MAB_JC_0763", "MAB_JC_0770", "MAB_JC_0771", "MAB_JC_0772", "MAB_JC_0773", "MAB_JC_0774", "MAB_JC_0775", "MAB_JC_0790", "MAB_JC_0791", "MAB_JC_0792", "MAB_JC_0794", "MAB_JC_0795", "MAB_JC_0796", "MAB_JC_0797", "MAB_JC_0800", "MAB_JC_0801", "MAB_JC_0802", "MAB_JC_0803", "MAB_JC_0804", "MAB_JC_0805", "MAB_JC_0806", "MAB_JM_0011", "MAB_NA_0001", "MAB_NA_0002", "MAB_NA_0003", "MAB_NA_0009", "MAB_NA_0011", "MAB_NA_0016", "MAB_NA_0017", "MAB_NA_0018", "MAB_NA_0019", "MAB_NA_0020", "MAB_NA_0021", "MAB_NA_0022", "MAB_NA_0024", "MAB_NA_0025", "MAB_NA_0031", "MAB_NA_0034", "MAB_NA_0036", "MAB_NA_0037", "MAB_NA_0042"
];

export const INITIAL_MISRA_RULE_IDS = [
    "MISRA_AC_SLSF_003_A", "MISRA_AC_SLSF_004_A", "MISRA_AC_SLSF_005_A", "MISRA_AC_SLSF_005_B", "MISRA_AC_SLSF_005_C", "MISRA_AC_SLSF_006_A", "MISRA_AC_SLSF_006_B", "MISRA_AC_SLSF_006_C", "MISRA_AC_SLSF_006_E", "MISRA_AC_SLSF_007_A", "MISRA_AC_SLSF_008_A", "MISRA_AC_SLSF_008_B", "MISRA_AC_SLSF_009_B", "MISRA_AC_SLSF_009_D", "MISRA_AC_SLSF_010_A", "MISRA_AC_SLSF_010_B", "MISRA_AC_SLSF_010_C", "MISRA_AC_SLSF_011_A", "MISRA_AC_SLSF_011_B", "MISRA_AC_SLSF_012_A", "MISRA_AC_SLSF_013_A", "MISRA_AC_SLSF_013_B", "MISRA_AC_SLSF_016_A", "MISRA_AC_SLSF_016_B", "MISRA_AC_SLSF_016_C", "MISRA_AC_SLSF_016_D", "MISRA_AC_SLSF_016_E", "MISRA_AC_SLSF_017_A", "MISRA_AC_SLSF_017_B", "MISRA_AC_SLSF_018_A", "MISRA_AC_SLSF_018_B", "MISRA_AC_SLSF_018_C", "MISRA_AC_SLSF_018_D", "MISRA_AC_SLSF_018_E", "MISRA_AC_SLSF_019_A", "MISRA_AC_SLSF_019_B", "MISRA_AC_SLSF_020_A", "MISRA_AC_SLSF_020_B", "MISRA_AC_SLSF_020_C", "MISRA_AC_SLSF_020_D", "MISRA_AC_SLSF_021_A", "MISRA_AC_SLSF_022_A", "MISRA_AC_SLSF_022_B", "MISRA_AC_SLSF_023_A", "MISRA_AC_SLSF_024_A", "MISRA_AC_SLSF_025_A", "MISRA_AC_SLSF_025_B", "MISRA_AC_SLSF_026_A", "MISRA_AC_SLSF_026_B", "MISRA_AC_SLSF_026_C", "MISRA_AC_SLSF_026_E", "MISRA_AC_SLSF_027_B", "MISRA_AC_SLSF_027_C", "MISRA_AC_SLSF_027_D", "MISRA_AC_SLSF_027_E", "MISRA_AC_SLSF_027_F", "MISRA_AC_SLSF_027_G", "MISRA_AC_SLSF_027_H", "MISRA_AC_SLSF_027_I", "MISRA_AC_SLSF_027_J", "MISRA_AC_SLSF_029_A", "MISRA_AC_SLSF_029_B", "MISRA_AC_SLSF_029_C", "MISRA_AC_SLSF_029_D", "MISRA_AC_SLSF_029_E", "MISRA_AC_SLSF_029_F", "MISRA_AC_SLSF_030_A", "MISRA_AC_SLSF_030_B", "MISRA_AC_SLSF_030_C", "MISRA_AC_SLSF_032_A", "MISRA_AC_SLSF_032_B", "MISRA_AC_SLSF_034_A", "MISRA_AC_SLSF_034_B", "MISRA_AC_SLSF_034_C", "MISRA_AC_SLSF_034_D", "MISRA_AC_SLSF_035_B", "MISRA_AC_SLSF_036_A", "MISRA_AC_SLSF_036_B", "MISRA_AC_SLSF_036_C", "MISRA_AC_SLSF_037_A", "MISRA_AC_SLSF_037_B", "MISRA_AC_SLSF_037_C", "MISRA_AC_SLSF_037_G", "MISRA_AC_SLSF_037_H", "MISRA_AC_SLSF_038_A", "MISRA_AC_SLSF_038_B", "MISRA_AC_SLSF_038_C", "MISRA_AC_SLSF_039_A", "MISRA_AC_SLSF_039_B", "MISRA_AC_SLSF_039_C", "MISRA_AC_SLSF_040_A", "MISRA_AC_SLSF_040_B", "MISRA_AC_SLSF_041_A", "MISRA_AC_SLSF_042_A", "MISRA_AC_SLSF_042_B", "MISRA_AC_SLSF_042_C", "MISRA_AC_SLSF_042_D", "MISRA_AC_SLSF_042_E", "MISRA_AC_SLSF_043_A", "MISRA_AC_SLSF_043_B", "MISRA_AC_SLSF_043_C", "MISRA_AC_SLSF_043_D", "MISRA_AC_SLSF_043_F", "MISRA_AC_SLSF_043_G", "MISRA_AC_SLSF_043_H", "MISRA_AC_SLSF_043_I", "MISRA_AC_SLSF_043_J", "MISRA_AC_SLSF_044_A", "MISRA_AC_SLSF_044_B", "MISRA_AC_SLSF_044_C", "MISRA_AC_SLSF_045_A", "MISRA_AC_SLSF_045_B", "MISRA_AC_SLSF_045_C", "MISRA_AC_SLSF_045_D", "MISRA_AC_SLSF_045_E", "MISRA_AC_SLSF_045_F", "MISRA_AC_SLSF_045_G", "MISRA_AC_SLSF_046_A", "MISRA_AC_SLSF_047_A", "MISRA_AC_SLSF_047_B", "MISRA_AC_SLSF_048_A", "MISRA_AC_SLSF_048_B", "MISRA_AC_SLSF_048_C", "MISRA_AC_SLSF_048_G", "MISRA_AC_SLSF_049_A", "MISRA_AC_SLSF_050_A", "MISRA_AC_SLSF_050_B", "MISRA_AC_SLSF_050_D", "MISRA_AC_SLSF_050_E", "MISRA_AC_SLSF_050_F", "MISRA_AC_SLSF_051_A", "MISRA_AC_SLSF_051_C", "MISRA_AC_SLSF_051_D", "MISRA_AC_SLSF_052_A", "MISRA_AC_SLSF_052_B", "MISRA_AC_SLSF_053_A", "MISRA_AC_SLSF_053_B", "MISRA_AC_SLSF_053_C", "MISRA_AC_SLSF_053_D", "MISRA_AC_SLSF_053_E", "MISRA_AC_SLSF_053_F", "MISRA_AC_SLSF_053_H", "MISRA_AC_SLSF_053_I", "MISRA_AC_SLSF_053_J", "MISRA_AC_SLSF_053_K", "MISRA_AC_SLSF_054_A", "MISRA_AC_SLSF_054_B", "MISRA_AC_SLSF_054_C", "MISRA_AC_SLSF_054_D", "MISRA_AC_SLSF_054_E", "MISRA_AC_SLSF_054_F", "MISRA_AC_SLSF_054_G", "MISRA_AC_SLSF_054_H", "MISRA_AC_SLSF_055_A", "MISRA_AC_SLSF_055_B", "MISRA_AC_SLSF_055_C", "MISRA_AC_SLSF_055_D"
];

const SUBSYSTEM_IDS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"];

const getInitialRules = (): RuleData[] => {
    return [];
};

const getInitialSubsystems = (): SubsystemData[] => {
    return SUBSYSTEM_IDS.map(id => ({
        id, newDetectedViolations: 0, analyzedViolations: 0, progress: 0
    }));
};

export const emptyVersionData: VersionData = {
    dashboardData: {
        overallProgress: "0%",
        violationInspectionComponent: "0",
        violationInspectionRunnable: "0",
        violationAnalysisComponent: "0",
        violationAnalysisRunnable: "0",
        newRuleViolationsCount: 0,
        expectedSchedule: "데이터 없음",
        aiSummary: "분석할 데이터가 없습니다.",
    },
    chartData: [],
    subsystemsList: getInitialSubsystems(),
    rulesList: [],
    issuesList: [],
    risksList: [],
    timeEvaluationComponent: [],
    timeEvaluationRunnable: [],
    reportsDraft: { team: "내용 없음", customer: "내용 없음" }
};

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
    createNewVersion: (versionName: string) => void;
    addRuleRow: (versionIndex: number) => void;
    deleteRuleRow: (versionIndex: number, ruleIndex: number) => void;
    updateRuleRow: (versionIndex: number, ruleIndex: number, ruleData: Partial<RuleData>) => void;
    login: (userId: string, passwordText: string) => Promise<boolean>;
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
    resetValidationData: () => Promise<void>;
    resetAiData: () => Promise<void>;
    
    // Password Reset Actions
    sendResetCode: (userId: string, name: string, email: string, birthDate: string) => Promise<boolean>;
    resetWithCode: (userId: string, code: string, newPasswordText: string) => Promise<boolean>;
    findUserId: (name: string, birthDate: string) => Promise<string | null>;

    INITIAL_MAB_RULE_IDS: string[];
    INITIAL_MISRA_RULE_IDS: string[];
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
    INITIAL_MAB_RULE_IDS,
    INITIAL_MISRA_RULE_IDS,

    setVersionIndex: (index) => set({ currentVersionIndex: index }),

    syncVersionIndex: (index: number) => set({ currentVersionIndex: index }),

    login: async (userIdText: string, passwordText: string): Promise<boolean> => {
        const userId = userIdText.trim();
        const rawPassword = passwordText.trim();
        try {
            const hashedPassword = await hashPassword(rawPassword);
            
            const { data, error } = await supabase
                .from('users')
                .select('id, email, name, birth_date, team_name, position, gemini_api_key')
                .eq('id', userId)
                .eq('password', hashedPassword)
                .maybeSingle();

            if (error || !data) {
                if (error) console.error("Login DB error:", error.message);
                return false;
            }

            const user: User = {
                id: data.id,
                email: data.email || "",
                name: data.name,
                birthDate: data.birth_date,
                teamName: data.team_name,
                position: data.position,
                geminiApiKey: data.gemini_api_key || ""
            };

            set({ 
                currentUser: user,
                geminiApiKey: user.geminiApiKey || get().geminiApiKey 
            });
            return true;
        } catch (err) {
            console.error("Critical login error:", err);
            return false;
        }
    },
    logout: () => {
        document.cookie = "auth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
        set({ currentUser: null, geminiApiKey: '' });
    },
    register: async (user: User) => {
        if (!user.password) return;
        
        try {
            const userId = user.id.trim();
            const rawPassword = user.password.trim();
            const hashedPassword = await hashPassword(rawPassword);
            
            const { password, ...userWithoutPassword } = { ...user, id: userId };
            
            // 2. Sync to Supabase
            const { error } = await supabase.from('users').insert([{
                id: userId,
                email: user.email.trim().toLowerCase(),
                password: hashedPassword,
                name: user.name.trim(),
                birth_date: user.birthDate,
                team_name: user.teamName.trim(),
                position: user.position,
                gemini_api_key: user.geminiApiKey || ""
            }]);
            
            if (error) {
                if (error.code === '23505') throw new Error("ALREADY_EXISTS");
                throw error;
            }
            
            set((state) => ({ usersList: [...state.usersList, userWithoutPassword] }));
        } catch (err: any) {
            console.error("Registration error detail:", err);
            throw err;
        }
    },

    syncFromDB: async () => {
        try {
            // 1. Load Users
            const { data: users, error: userError } = await supabase
                .from('users')
                .select('id, email, name, birth_date, team_name, position');
            if (userError) throw userError;

            const formattedUsers: User[] = (users || []).map(u => ({
                id: u.id,
                email: u.email || "",
                name: u.name,
                birthDate: u.birth_date,
                teamName: u.team_name,
                position: u.position
            }));
            
            set({ usersList: formattedUsers });

            // 2. Load App State (Versioned Data)
            const { data: appStates, error: stateError } = await supabase
                .from('app_state')
                .select('data')
                .limit(1)
                .maybeSingle();
            
            if (stateError) {
                console.error("Error loading app state:", stateError);
            }

            if (appStates && appStates.data) {
                const remoteData = appStates.data as any;
                if (remoteData.versions && remoteData.versionedData) {
                    set({
                        versions: remoteData.versions,
                        versionedData: remoteData.versionedData,
                        currentVersionIndex: remoteData.versions.length - 1
                    });
                }
            }

            // 3. Update current user if exists
            const state = get();
            if (state.currentUser) {
                const refreshedUser = formattedUsers.find(u => u.id === state.currentUser?.id);
                if (refreshedUser) {
                    set({ currentUser: refreshedUser });
                }
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

            const updatedData = {
                ...currentData,
                ...partialData
            };

            const newState = {
                versionedData: {
                    ...state.versionedData,
                    [versionIndex]: updatedData
                }
            };
            
            get().syncToDB({ ...state, ...newState });
            return newState;
        });
    },

    addRuleRow: (versionIndex: number) => {
        const state = get();
        const currentData = state.versionedData[versionIndex];
        if (!currentData) return;

        const newRule: RuleData = {
            id: '',
            mabSubId: '',
            category: 'MAB',
            subsystemViolations: {}
        };
        const newList = [...(currentData.rulesList || []), newRule];
        get().updateVersionData(versionIndex, { rulesList: newList });
    },

    deleteRuleRow: (versionIndex: number, ruleIndex: number) => {
        const state = get();
        const currentData = state.versionedData[versionIndex];
        if (!currentData) return;

        const newList = [...(currentData.rulesList || [])];
        newList.splice(ruleIndex, 1);
        get().updateVersionData(versionIndex, { rulesList: newList });
    },

    updateRuleRow: (versionIndex: number, ruleIndex: number, ruleData: Partial<RuleData>) => {
        const state = get();
        const currentData = state.versionedData[versionIndex];
        if (!currentData || !currentData.rulesList) return;

        const newList = [...currentData.rulesList];
        newList[ruleIndex] = { ...newList[ruleIndex], ...ruleData };
        get().updateVersionData(versionIndex, { rulesList: newList });
    },

    createNewVersion: (versionName: string) => {
        if (!versionName.trim()) return;
        set((state) => {
            const newIndex = state.versions.length;
            const newVersions = [...state.versions, versionName];
            
            const newState = {
                versions: newVersions,
                versionedData: {
                    ...state.versionedData,
                    [newIndex]: { 
                        ...emptyVersionData,
                        subsystemsList: getInitialSubsystems(),
                        rulesList: [] // Start with empty for dynamic management
                    }
                },
                currentVersionIndex: newIndex
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

        // Generate rule violation summary for prompt
        const ruleViolationSummary = currentData.rulesList
            .filter(r => Object.values(r.subsystemViolations || {}).some(v => (v as number) > 0))
            .map(r => {
                const total = Object.values(r.subsystemViolations || {}).reduce((acc, v) => acc + (v as number), 0);
                return `${r.id}: 총 ${total}건 위배`;
            })
            .join(', ');

        const prompt = `
            다음은 '정적검증 업무 포탈'의 현재 검증 데이터입니다. 
            전문적인 정적검증 엔지니어의 시각에서 전체 진행 상황을 요약하고, 지연이나 문제점이 있다면 이에 대한 원인과 대책을 한국어로 3~4문장 내외로 서술해줘.
            
            - 버전: ${state.versions[state.currentVersionIndex]}
            - 전체 진척도: ${currentData.dashboardData.overallProgress}
            - 검증 시작일: ${currentData.dashboardData.startDate || '미입력'}
            - 검증 종료일: ${currentData.dashboardData.endDate || '미입력'}
            - 예상 상태: ${currentData.dashboardData.expectedSchedule}
            - 이슈 개수: ${currentData.issuesList.length}개
            - 규칙 위배 현황: ${ruleViolationSummary || '검출된 규칙 위배 없음'}
            
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
    },

    resetValidationData: async () => {
        set({
            versions: [],
            versionedData: {},
            currentVersionIndex: 0
        });
        await get().syncToDB({
            versions: [],
            versionedData: {}
        } as any);
    },

    resetAiData: async () => {
        const state = get();
        const newVersionedData = { ...state.versionedData };

        Object.keys(newVersionedData).forEach((key: any) => {
            const data = newVersionedData[key];
            newVersionedData[key] = {
                ...data,
                dashboardData: {
                    ...data.dashboardData,
                    aiSummary: "AI 데이터가 초기화되었습니다."
                },
                risksList: [],
                issuesList: data.issuesList.map((issue: any) => ({
                    ...issue,
                    aiRecommendation: undefined
                }))
            };
        });

        set({ versionedData: newVersionedData });
        await get().syncToDB({
            versions: state.versions,
            versionedData: newVersionedData
        } as any);
    },

    sendResetCode: async (userIdText: string, nameText: string, emailText: string, birthDate: string) => {
        const userId = userIdText.trim();
        const userEmail = emailText.trim().toLowerCase();
        const userName = nameText.trim();
        
        console.log("Starting reset code verification for:", { userId, userName, userEmail, birthDate });

        // 1. Try case-sensitive exact match first
        let { data: user, error: userError } = await supabase
            .from('users')
            .select('id, email, name, birth_date')
            .eq('id', userId)
            .eq('name', userName)
            .eq('birth_date', birthDate)
            .maybeSingle();

        if (userError) {
            console.error("Supabase error during reset verification:", userError);
            return false;
        }

        if (!user) {
            console.error("No user found with exact ID/Name/BirthDate match.");
            return false;
        }

        // 2. Case-insensitive email check
        if (user.email && user.email.toLowerCase() !== userEmail) {
            console.error("Email mismatch (case-insensitive check failed):", { 
                provided: userEmail, 
                stored: user.email.toLowerCase() 
            });
            return false;
        }
        
        // If everything matches, proceed
        console.log("Identity verified for reset code.");

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60000).toISOString(); // 10 minutes

        try {
            // Save code to DB
            const { error: codeError } = await supabase.from('verification_codes').insert([{
                user_id: userId,
                code: code,
                expires_at: expiresAt
            }]);

            if (codeError) throw codeError;

            // Send email
            const { sendVerificationEmail } = await import('@/lib/email');
            const emailSent = await sendVerificationEmail(userEmail, code);
            
            return emailSent;
        } catch (err) {
            console.error("Failed to process reset code:", err);
            return false;
        }
    },

    resetWithCode: async (userIdText: string, codeText: string, newPasswordText: string) => {
        const userId = userIdText.trim();
        const code = codeText.trim();
        const newPassword = newPasswordText.trim();

        try {
            // 1. Verify code
            const { data: codeEntry, error: codeError } = await supabase
                .from('verification_codes')
                .select('*')
                .eq('user_id', userId)
                .eq('code', code)
                .gt('expires_at', new Date().toISOString())
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (codeError || !codeEntry) {
                console.error("Invalid or expired code");
                return false;
            }

            // 2. Hash new password
            const hashedPassword = await hashPassword(newPassword);

            // 3. Update password in users table
            const { error: updateError } = await supabase
                .from('users')
                .update({ password: hashedPassword })
                .eq('id', userId);

            if (updateError) throw updateError;

            // 4. Delete used code (cleanup)
            await supabase.from('verification_codes').delete().eq('user_id', userId);

            return true;
        } catch (err) {
            console.error("Reset password error:", err);
            return false;
        }
    },

    findUserId: async (name: string, birthDate: string) => {
        try {
            console.log("Starting ID recovery for:", { name: name.trim(), birthDate });
            const { data, error } = await supabase
                .from('users')
                .select('id')
                .eq('name', name.trim())
                .eq('birth_date', birthDate)
                .maybeSingle();
            
            if (error || !data) {
                console.error("ID recovery failed:", error || "No user found");
                return null;
            }
            return data.id;
        } catch (err) {
            console.error("Critical Find ID error:", err);
            return null;
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
          // usersList and geminiApiKey are sensitive and should not be persisted in plaintext
      }),
  }
));
