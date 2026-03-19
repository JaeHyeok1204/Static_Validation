"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/store/useStore";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const projectName = useStore((state) => state.projectName);
  const currentUser = useStore((state) => state.currentUser);
  const logout = useStore((state) => state.logout);
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { title: "개요", path: "/" },
    { title: "서브시스템별 현황 및 진척도", path: "/subsystems" },
    { title: "규칙 설명 및 중요도", path: "/rules" },
    { title: "이슈 관리", path: "/issues" },
    { title: "업무 리스크", path: "/risks" },
    { title: "정적검증 소요시간 평가", path: "/time_evaluation" },
    { title: "AI 보고서 초안 관리", path: "/reports" },
    { title: "Gemini AI 업무 대화", path: "/ai_chat" },
    { title: "데이터 통합 에디터", path: "/data_editor" },
    { title: "환경 설정", path: "/setting" },
  ];

  return (
    <>
      <button 
        className="md:hidden fixed top-4 right-4 z-50 p-2 rounded-lg shadow-md transition-colors"
        style={{ backgroundColor: 'var(--sidebar-bg)', color: 'var(--sidebar-text)' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      <div 
        className={`fixed md:relative top-0 left-0 h-screen w-64 flex flex-col shrink-0 transition-transform duration-300 z-40 shadow-xl md:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={{ backgroundColor: 'var(--sidebar-bg)' }}
      >
      <div className="p-6">
        <h1 
          className="text-xl font-bold tracking-tight mb-8 leading-snug break-keep"
          style={{ color: 'var(--sidebar-text)' }}
        >
          {projectName}
        </h1>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            
            return (
              <Link 
                key={item.path} 
                href={item.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'shadow-md' : ''
                }`}
                style={{
                  backgroundColor: isActive ? 'var(--sidebar-active)' : 'transparent',
                  color: 'var(--sidebar-text)',
                  opacity: isActive ? 1 : 0.7
                }}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>

      {currentUser && (
        <div className="p-4 border-t border-[var(--border-color)] mt-auto bg-black/10">
          <div className="flex flex-col gap-1 mb-3">
            <span className="text-xs font-bold text-[var(--sidebar-text)] opacity-70">로그인 정보</span>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-baseline gap-2 text-[var(--sidebar-text)]">
                <span className="text-sm font-bold">{currentUser.name}</span>
                <span className="text-xs opacity-80">{currentUser.position}</span>
              </div>
              <div className="text-xs text-[var(--sidebar-text)] opacity-60">
                {currentUser.teamName}
              </div>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="w-full text-xs font-bold bg-white/10 hover:bg-white/20 text-[var(--sidebar-text)] py-2 rounded-lg transition-colors"
          >
            로그아웃
          </button>
        </div>
      )}
      <div className="p-6 text-xs text-center border-t opacity-50 transition-colors duration-300"
           style={{ color: 'var(--sidebar-text)', borderColor: 'var(--sidebar-hover)' }}>
        © 2026 Verification Portal.<br/>All rights reserved.
      </div>
    </div>
    </>
  );
}