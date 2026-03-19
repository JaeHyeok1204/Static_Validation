"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/store/useStore";

export default function ForgotPasswordPage() {
    const [userId, setUserId] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [birthDate, setBirthDate] = useState("");
    
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const sendResetCode = useStore((state) => state.sendResetCode);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!userId || !name || !email || !birthDate) {
            setError("모든 필드를 입력해부세요.");
            return;
        }

        setLoading(true);
        try {
            const result = await sendResetCode(userId, name, email.toLowerCase(), birthDate);
            if (result.success) {
                alert("인증번호가 이메일로 전송되었습니다.");
                router.push(`/reset-password?userId=${encodeURIComponent(userId)}`);
            } else {
                setError(result.error || "입력하신 정보가 일치하지 않습니다. 다시 확인해주세요.");
            }
        } catch (err) {
            console.error("Forgot password error:", err);
            setError("인증번호 전송 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-color)] flex items-center justify-center p-4">
            <div className="bg-[var(--bg-color)] border border-[var(--border-color)] shadow-xl rounded-2xl p-8 w-full max-w-md text-[var(--text-main)]">
                <div className="text-center mb-10">
                    <h1 className="text-2xl font-bold tracking-tight mb-2">비밀번호 재설정</h1>
                    <p className="text-sm text-[var(--text-muted)]">본인 확인을 위해 회원 정보를 입력해주세요.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold mb-1.5 ml-1">ID</label>
                        <input
                            type="text"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--accent-color)] outline-none transition-all"
                            placeholder="아이디 입력"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1.5 ml-1">이름</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--accent-color)] outline-none transition-all"
                            placeholder="성함 입력"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1.5 ml-1">이메일</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--accent-color)] outline-none transition-all"
                            placeholder="example@company.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1.5 ml-1">생년월일</label>
                        <input
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--accent-color)] outline-none transition-all"
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
                            {loading ? "전송 중..." : "인증번호 전송"}
                        </button>
                    </div>
                </form>

                <div className="mt-8 pt-6 border-t border-[var(--border-color)] text-center text-sm">
                    <Link 
                        href="/login"
                        className="text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-colors font-medium"
                    >
                        로그인 화면으로 돌아가기
                    </Link>
                </div>
            </div>
        </div>
    );
}
