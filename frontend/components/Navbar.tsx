'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GlassEffect } from '@/components/ui/liquid-glass';

export const Navbar = () => {
    const pathname = usePathname();

    const isDashboardRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/upload') || pathname.startsWith('/customers') || pathname.startsWith('/profile') || pathname.startsWith('/predictions');

    if (isDashboardRoute) return null;

    const isAuthRoute = pathname.startsWith('/auth') || pathname.startsWith('/onboarding');

    if (isAuthRoute) {
        return (
            <nav className="sticky top-0 z-50 w-full">
                <GlassEffect className="rounded-none w-full" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                    <div className="flex h-16 items-center justify-between px-6 max-w-7xl mx-auto w-full">
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-400">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white text-sm font-bold">RB</span>
                            </div>
                            <span className="text-white">RetentionBrain</span>
                        </Link>
                        <Link href="#" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                            Support
                        </Link>
                    </div>
                </GlassEffect>
            </nav>
        );
    }

    return (
        <nav className="sticky top-0 z-50 w-full">
            <GlassEffect className="rounded-none w-full" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                <div className="flex h-16 items-center px-6 max-w-7xl mx-auto w-full">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm font-bold">RB</span>
                        </div>
                        <span className="text-white">RetentionBrain</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-6 ml-10">
                        <Link href="#" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Product</Link>
                        <Link href="#" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Company</Link>
                        <Link href="#" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Resources</Link>
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                        <Link href="/auth/signin" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                            Login
                        </Link>
                        <Link href="/auth/signup" className="text-sm font-medium text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/25">
                            Get Started
                        </Link>
                    </div>
                </div>
            </GlassEffect>
        </nav>
    );
};
