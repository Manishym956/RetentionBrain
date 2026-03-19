import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, UploadCloud, Settings, LogOut } from 'lucide-react';

export const Sidebar = () => {
    return (
        <aside className="w-64 border-r border-gray-200 bg-gray-50 h-[calc(100vh-4rem)] flex flex-col">
            <div className="flex-1 py-6 flex flex-col gap-2 px-4">
                <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-900 bg-gray-200/50 hover:bg-gray-200 transition-colors">
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="text-sm font-medium">Dashboard</span>
                </Link>
                <Link href="/upload" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors">
                    <UploadCloud className="h-4 w-4" />
                    <span className="text-sm font-medium">Upload CSV</span>
                </Link>
            </div>
            <div className="p-4 border-t border-gray-200">
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-red-600 hover:bg-red-50 transition-colors"
                onClick={() => {
                    localStorage.removeItem('access_token');
                    window.location.href = '/login';
                }}>
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
};
