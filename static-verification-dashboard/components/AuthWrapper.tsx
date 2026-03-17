"use client";

import { useStore } from "@/store/useStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
    const currentUser = useStore((state) => state.currentUser);
    const router = useRouter();
    const pathname = usePathname();
    const [isMounted, setIsMounted] = useState(false);

    const syncFromDB = useStore((state) => state.syncFromDB);
    const hasSynced = useRef(false);

    useEffect(() => {
        setIsMounted(true);
        // Trigger initial sync from DB if not already done in this session/mount
        if (!hasSynced.current) {
            syncFromDB();
            hasSynced.current = true;
        }
    }, [syncFromDB]);

    useEffect(() => {
        if (!isMounted) return;
        
        const isAuthRoute = pathname === '/login' || pathname === '/signup';

        if (!currentUser && !isAuthRoute) {
            router.push('/login');
        } else if (currentUser && isAuthRoute) {
            router.push('/');
        }
    }, [currentUser, isMounted, pathname, router]);

    if (!isMounted) {
        return <div className="min-h-screen bg-[var(--bg-color)] flex items-center justify-center text-[var(--text-main)]">로딩 중...</div>;
    }

    if (!currentUser && pathname !== '/login' && pathname !== '/signup') {
        return null;
    }

    return <>{children}</>;
}
