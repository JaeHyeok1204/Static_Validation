"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";

export default function ForgotPasswordPage() {
    const [userId, setUserId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    
    const router = useRouter();
    const sendResetCode = useStore((state) => state.sendResetCode);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        
        if (!userId.trim()) {
            setError("ID(이메일)를 입력해주세요.");
            return;
        }

        setLoading(true);
        try {
            const result = await sendResetCode(userId);
            if (result) {
                setSuccess(true);
                // After 2 seconds, redirect to reset page with userId as param
                setTimeout(() => {
                    router.push(`/reset-password?id=${encodeURIComponent(userId)}`);
                }, 2000);
            } else {
                setError("해당 계정을 찾을 수 없거나 메일 발송에 실패했습니다. 입력한 ID가 정확한지 확인해주세요.");
            }
        } catch (err) {
            setError("오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-color)] flex items-center justify-center p-4">
            <div className="bg-[var(--bg-color)] border border-[var(--border-color)] shadow-xl rounded-2xl p-8 w-full max-w-md text-[var(--text-main)]">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold tracking-tight mb-2">비밀번호 찾기</h1>
                    <p className="text-sm text-[var(--text-muted)]">가입 시 사용한 ID(이메일)를 입력하시면<br/>인증번호를 발송해 드립니다.</p>
                </div>

                {success ? (
                    <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-6 rounded-xl border border-green-200 dark:border-green-800 text-center">
                        <div className="text-3xl mb-3">📧</div>
                        <p className="font-bold mb-1">인증번호가 발송되었습니다!</p>
                        <p className="text-sm">잠시 후 비밀번호 재설정 페이지로 이동합니다.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium mb-1">ID (이메일 주소)</label>
                            <input
                                type="text"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition-shadow"
                                placeholder="abc@example.com"
                                disabled={loading}
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
                                {loading ? "발송 중..." : "인증번호 받기"}
                            </button>
                        </div>
                        
                        <button
                            type="button"
                            onClick={() => router.push("/login")}
                            className="w-full text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors mt-2"
                        >
                            로그인 화면으로 돌아가기
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
