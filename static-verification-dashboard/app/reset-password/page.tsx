"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/store/useStore";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const resetWithCode = useStore((state) => state.resetWithCode);

    const [userId, setUserId] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const idParam = searchParams.get("id");
        if (idParam) {
            setUserId(idParam);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!userId) {
            setError("ID를 입력해주세요.");
            return;
        }
        if (!code) {
            setError("인증번호를 입력해주세요.");
            return;
        }
        if (!newPassword) {
            setError("새 비밀번호를 입력해주세요.");
            return;
        }
        if (!confirmPassword) {
            setError("새 비밀번호 확인을 입력해주세요.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
            return;
        }

        if (newPassword.length < 4) {
            setError("비밀번호는 최소 4자 이상이어야 합니다.");
            return;
        }

        setLoading(true);
        try {
            const result = await resetWithCode(userId, code, newPassword);
            if (result) {
                setSuccess(true);
                setTimeout(() => {
                    router.push("/login");
                }, 3000);
            } else {
                setError("인증번호가 올바르지 않거나 만료되었습니다. 다시 확인해주세요.");
            }
        } catch (err) {
            setError("비밀번호 재설정 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-color)] flex items-center justify-center p-4">
            <div className="bg-[var(--bg-color)] border border-[var(--border-color)] shadow-xl rounded-2xl p-8 w-full max-w-md text-[var(--text-main)]">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold tracking-tight mb-2">비밀번호 재설정</h1>
                    <p className="text-sm text-[var(--text-muted)]">메일로 받으신 인증번호와<br/>새로운 비밀번호를 입력해주세요.</p>
                </div>

                {success ? (
                    <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 p-6 rounded-xl border border-blue-200 dark:border-blue-800 text-center">
                        <div className="text-3xl mb-3">✅</div>
                        <p className="font-bold mb-1">비밀번호가 성공적으로 변경되었습니다!</p>
                        <p className="text-sm">잠시 후 로그인 페이지로 이동합니다.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">ID</label>
                            <input
                                type="text"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50"
                                placeholder="아이디 입력"
                                disabled={loading || !!searchParams.get("id")}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">인증번호 (6자리)</label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-center text-xl font-bold tracking-widest focus:ring-2 focus:ring-[var(--accent-color)] outline-none"
                                placeholder="000000"
                                disabled={loading}
                            />
                        </div>

                        <div className="pt-2">
                            <label className="block text-sm font-medium mb-1">새 비밀번호</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[var(--accent-color)] outline-none"
                                placeholder="새 비밀번호 입력"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">새 비밀번호 확인</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[var(--accent-color)] outline-none"
                                placeholder="비밀번호 재입력"
                                disabled={loading}
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg border border-red-200 dark:border-red-800">
                                {error}
                            </div>
                        )}

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[var(--accent-color)] text-[var(--bg-color)] font-bold rounded-xl px-4 py-3 shadow-md hover:brightness-110 transition-all disabled:opacity-50"
                            >
                                {loading ? "처리 중..." : "비밀번호 변경하기"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
