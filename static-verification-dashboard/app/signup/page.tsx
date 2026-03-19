"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";

export default function SignupPage() {
    const router = useRouter();
    const register = useStore((state) => state.register);
    const usersList = useStore((state) => state.usersList);

    const [formData, setFormData] = useState({
        id: "",
        password: "",
        passwordConfirm: "",
        name: "",
        birthDate: "",
        teamName: "",
        position: ""
    });
    
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Basic validation
        if (Object.values(formData).some(val => val.trim() === "")) {
            setError("모든 필드를 입력해주세요.");
            return;
        }

        if (formData.password !== formData.passwordConfirm) {
            setError("비밀번호가 일치하지 않습니다.");
            return;
        }

        if (usersList.some(u => u.id === formData.id)) {
            setError("이미 사용 중인 ID입니다.");
            return;
        }

        const newUser = {
            id: formData.id.trim(),
            password: formData.password.trim(),
            name: formData.name.trim(),
            birthDate: formData.birthDate,
            teamName: formData.teamName.trim(),
            position: formData.position
        };

        try {
            await register(newUser);
            alert("회원가입이 완료되었습니다. 로그인 화면으로 이동합니다.");
            router.push("/login");
        } catch (err: any) {
            if (err.message === "ALREADY_EXISTS") {
                setError("이미 사용 중인 ID입니다. 다른 ID를 선택해주세요.");
            } else {
                setError(`회원가입 중 오류가 발생했습니다: ${err.message || "서버 통신 실패"}`);
            }
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-color)] flex items-center justify-center p-4 py-12">
            <div className="bg-[var(--bg-color)] border border-[var(--border-color)] shadow-xl rounded-2xl p-8 w-full max-w-lg">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold tracking-tight text-[var(--text-main)] mb-2">회원가입</h1>
                    <p className="text-sm text-[var(--text-muted)]">포탈 사용을 위한 계정 정보를 입력해주세요.</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-main)] mb-1">ID</label>
                            <input
                                name="id"
                                type="text"
                                value={formData.id}
                                onChange={handleChange}
                                className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                                placeholder="아이디"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-main)] mb-1">이름</label>
                            <input
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                                placeholder="이름 (예: 홍길동)"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-main)] mb-1">비밀번호</label>
                            <input
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                                placeholder="비밀번호"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-main)] mb-1">비밀번호 확인</label>
                            <input
                                name="passwordConfirm"
                                type="password"
                                value={formData.passwordConfirm}
                                onChange={handleChange}
                                className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                                placeholder="비밀번호 확인"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--text-main)] mb-1">생년월일</label>
                        <input
                            name="birthDate"
                            type="date"
                            value={formData.birthDate}
                            onChange={handleChange}
                            className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-main)] mb-1">팀명</label>
                            <input
                                name="teamName"
                                type="text"
                                value={formData.teamName}
                                onChange={handleChange}
                                className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                                placeholder="예: 개발 1팀"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-main)] mb-1">직위</label>
                            <select
                                name="position"
                                value={formData.position}
                                onChange={handleChange}
                                className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                            >
                                <option value="">선택하세요</option>
                                <option value="전임연구원">전임연구원</option>
                                <option value="선임연구원">선임연구원</option>
                                <option value="책임연구원">책임연구원</option>
                                <option value="수석연구원">수석연구원</option>
                                <option value="팀장">팀장</option>
                                <option value="실장">실장</option>
                            </select>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg border border-red-200 dark:border-red-800">
                            {error}
                        </div>
                    )}

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={() => router.push("/login")}
                            className="flex-1 bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-main)] font-medium rounded-xl px-4 py-3 hover:bg-[var(--hover-bg)] transition-colors"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-[var(--accent-color)] text-[var(--bg-color)] font-bold rounded-xl px-4 py-3 shadow-md hover:brightness-110 transition-all"
                        >
                            가입하기
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
