"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { GlassEffect } from '@/components/ui/liquid-glass';

export default function OAuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [message, setMessage] = useState('Completing sign-in...');

    useEffect(() => {
        const access = searchParams.get('access');
        const refresh = searchParams.get('refresh');
        const nextPath = searchParams.get('next') || '/dashboard';
        const error = searchParams.get('error');

        if (error) {
            setMessage('Google sign-in could not be completed.');
            return;
        }

        if (!access || !refresh) {
            setMessage('Missing login tokens from OAuth callback.');
            return;
        }

        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        router.replace(nextPath);
    }, [router, searchParams]);

    const hasError = message !== 'Completing sign-in...';

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
            <GlassEffect className="max-w-md w-full rounded-2xl" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold text-white mb-3">Google Sign-In</h1>
                    <p className="text-sm text-gray-300 mb-6">{message}</p>
                    {hasError && (
                        <Link href="/auth/signin">
                            <Button className="w-full">Return to Sign In</Button>
                        </Link>
                    )}
                </div>
            </GlassEffect>
        </div>
    );
}
