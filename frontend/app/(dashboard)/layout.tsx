"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthChecking, setIsAuthChecking] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
        } else {
            setIsAuthChecking(false);
        }
    }, [router, pathname]);

    if (isAuthChecking) {
        return <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-8 text-gray-500 font-medium">Verifying access...</div>;
    }

    return (
        <div className="flex bg-white">
            <Sidebar />
            <main className="flex-1 overflow-y-auto h-[calc(100vh-4rem)] bg-white">
                {children}
            </main>
        </div>
    );
}
