import React from 'react';
import Link from 'next/link';

export const Navbar = () => {
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
            <div className="flex h-16 items-center px-4 md:px-6">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
                    RetentionBrain
                </Link>
                <div className="ml-auto flex items-center space-x-4">
                    <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                        Login
                    </Link>
                    <Link href="/dashboard" className="text-sm font-medium text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Dashboard
                    </Link>
                </div>
            </div>
        </nav>
    );
};
