"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/store/useStore";

export default function FindIdPage() {
    const [name, setName] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [foundId, setFoundId] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    
    const router = useRouter();
    const findUserId = useStore((state) => state.findUserId);

    const handleFindId = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setFoundId(null);

        if (!name || !birthDate) {
            setError("이름과 생년월일을 모두 입력해주세요.");
            return;
        }

        setLoading(true);
        try {
            const userId = await findUserId(name, birthDate);
            if (userId) {
                setFoundId(userId);
            } else {
                setError("일치하는 회원 정보가 없습니다. 입력하신 정보를 다시 확인해주세요.");
            }
        } catch (err) {
            console.error("Find ID error:", err);
            setError("ID 찾기 중 오류가 발생했습니다. 다시 시도해주세요.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-color)] flex items-center justify-center p-4">
            <div className="bg-[var(--bg-color)] border border-[var(--border-color)] shadow-xl rounded-2xl p-8 w-full max-w-md text-[var(--text-main)]">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold tracking-tight mb-2">ID 찾기</h1>
                    <p className="text-sm text-[var(--text-muted)]">가입 시 입력한 이름과 생년월일을 입력해주세요.</p>
                </div>

                {!foundId ? (
                    <form onSubmit={handleFindId} className="space-y-6">
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
                                {loading ? "찾는 중..." : "ID 찾기"}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="text-center py-6">
                        <div className="bg-[var(--hover-bg)] p-6 rounded-2xl border border-[var(--border-color)] mb-8">
                            <p className="text-sm text-[var(--text-muted)] mb-2">사용자님의 ID는 다음과 같습니다:</p>
                            <p className="text-2xl font-bold text-[var(--accent-color)]">{foundId}</p>
                        </div>
                        <button
                            onClick={() => router.push("/login")}
                            className="w-full bg-[var(--accent-color)] text-[var(--bg-color)] font-bold rounded-xl px-4 py-3 shadow-md hover:brightness-110 transition-all"
                        >
                            로그인하러 가기
                        </button>
                    </div>
                )}

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
