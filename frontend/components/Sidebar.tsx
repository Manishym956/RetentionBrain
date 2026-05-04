'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, UploadCloud, BarChart3, User, LogOut } from 'lucide-react';
import api from '@/lib/axios';

interface NavItem {
    href: string;
    label: string;
    icon: React.ElementType;
}

const navItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/upload', label: 'Upload Dataset', icon: UploadCloud },
    { href: '/predictions', label: 'Predictions', icon: BarChart3 },
    { href: '/profile', label: 'Profile', icon: User },
];

export const Sidebar = () => {
    const pathname = usePathname();
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/profile/');
                setUserName(res.data.full_name || res.data.username);
                setUserEmail(res.data.email);
            } catch {
                // Silently fail - profile info is non-critical for sidebar
            }
        };
        fetchUser();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/auth/signin';
    };

    return (
        <aside className="w-64 border-r border-gray-200/80 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm h-screen flex flex-col relative overflow-hidden">
            {/* Glass shine overlay */}
            <div
                className="absolute inset-0 pointer-events-none z-0"
                style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 30%, rgba(255,255,255,0.1) 100%)',
                }}
            />

            <div className="relative z-10 flex flex-col h-full">
                {/* Logo */}
                <div className="px-5 py-5 border-b border-gray-100 dark:border-gray-800">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm shadow-blue-500/20">
                            <span className="text-white text-xs font-bold">RB</span>
                        </div>
                        <div>
                            <span className="text-base font-bold text-gray-900 dark:text-gray-100">RetentionBrain</span>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 -mt-0.5">Data Engine v2.0</p>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <div className="flex-1 py-4 flex flex-col gap-1 px-3">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 ${
                                    isActive
                                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-gray-100'
                                }`}
                            >
                                <item.icon className="h-4 w-4" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* User Section */}
                <div className="border-t border-gray-100 dark:border-gray-800 p-3 space-y-1">
                    {userName && (
                        <div className="flex items-center gap-3 px-3 py-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                    {userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                </span>
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{userName}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{userEmail}</p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};
