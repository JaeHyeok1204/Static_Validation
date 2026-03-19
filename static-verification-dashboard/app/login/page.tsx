"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/store/useStore";

export default function LoginPage() {
    const [id, setId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    
    const router = useRouter();
    const login = useStore((state) => state.login);
    const syncFromDB = useStore((state) => state.syncFromDB);

    // Sync from DB on mount to ensure we have the latest user list for local checks if any
    useEffect(() => {
        syncFromDB();
    }, [syncFromDB]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!id || !password) {
            setError("ID와 비밀번호를 모두 입력해주세요.");
            return;
        }

        setLoading(true);
        try {
            const success = await login(id, password);
            
            if (success) {
                // Set a simple cookie for middleware to see
                document.cookie = `auth_session=true; path=/; max-age=86400; SameSite=Lax`;
                router.push("/");
            } else {
                setError("회원 정보가 일치하지 않습니다. 가입 여부나 비밀번호를 확인해주세요.");
            }
        } catch (err) {
            console.error("Login component error:", err);
            setError("로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-color)] flex items-center justify-center p-4">
            <div className="bg-[var(--bg-color)] border border-[var(--border-color)] shadow-xl rounded-2xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold tracking-tight text-[var(--text-main)] mb-1">정적검증 업무 포탈</h1>
                    <p className="text-sm text-[var(--text-muted)]">서비스 이용을 위해 로그인해주세요.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-main)] mb-1.5 ml-1">ID (사원번호)</label>
                        <input
                            type="text"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition-all"
                            placeholder="사원번호 입력"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-main)] mb-1.5 ml-1">비밀번호</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition-all"
                            placeholder="비밀번호 입력"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg border border-red-200 dark:border-red-800">
                            {error}
                        </div>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[var(--accent-color)] text-[var(--bg-color)] font-bold rounded-xl px-4 py-3 shadow-md hover:brightness-110 transition-all flex justify-center items-center disabled:opacity-50"
                        >
                            {loading ? "로그인 중..." : "로그인"}
                        </button>
                    </div>
                </form>

                <div className="mt-8 pt-6 border-t border-[var(--border-color)]">
                    <div className="flex justify-between items-center text-xs mb-4 px-1">
                        <Link 
                            href="/find-id"
                            className="text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-colors"
                        >
                            아이디 찾기
                        </Link>
                        <Link 
                            href="/forgot-password"
                            className="text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-colors"
                        >
                            비밀번호 재설정
                        </Link>
                    </div>
                    
                    <p className="text-center text-sm text-[var(--text-muted)]">
                        아직 계정이 없으신가요?
                        <Link 
                            href="/signup"
                            className="ml-2 text-[var(--accent-color)] font-bold hover:underline"
                        >
                            회원가입
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
