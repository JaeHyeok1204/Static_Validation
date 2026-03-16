"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { title: "개요", path: "/" },
    { title: "서브시스템별 현황 및 진척도", path: "/subsystems" },
    { title: "규칙 설명 및 중요도", path: "/rules" },
    { title: "이슈 관리", path: "/issues" },
    { title: "업무 리스크", path: "/risks" },
    { title: "정적검증 소요시간 평가", path: "/time_evaluation" },
    { title: "AI 보고서 초안 관리", path: "/reports" },
    { title: "데이터 통합 에디터", path: "/data_editor" },
    { title: "환경 설정", path: "/setting" },
  ];

  return (
    <div 
      className="w-64 h-screen flex flex-col shrink-0 transition-colors duration-300"
      style={{ backgroundColor: 'var(--sidebar-bg)' }}
    >
      <div className="p-6">
        <h1 
          className="text-xl font-bold tracking-tight mb-8"
          style={{ color: 'var(--sidebar-text)' }}
        >
          모델 정적검증<br />운영 포털
        </h1>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            
            return (
              <Link 
                key={item.path} 
                href={item.path}
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
      
      <div className="mt-auto p-6 text-xs text-center border-t opacity-50 transition-colors duration-300"
           style={{ color: 'var(--sidebar-text)', borderColor: 'var(--sidebar-hover)' }}>
        © 2026 Verification Portal.<br/>All rights reserved.
      </div>
    </div>
  );
}