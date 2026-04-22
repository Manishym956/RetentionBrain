"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { GlassEffect } from '@/components/ui/liquid-glass';
import api from '@/lib/axios';

import { Suspense } from 'react';

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const uid = searchParams.get('uid') || '';
    const token = searchParams.get('token') || '';
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!uid || !token) {
            setError('This reset link is incomplete.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/password-reset/confirm/', {
                uid,
                token,
                password,
                confirm_password: confirmPassword,
            });
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Unable to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <GlassEffect className="max-w-md w-full rounded-2xl" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
            <div className="p-8">
                <h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
                <p className="text-sm text-gray-400 mb-8">
                    Choose a new password for your RetentionBrain account.
                </p>

                {success ? (
                    <div className="space-y-5">
                        <p className="text-sm text-green-300">Your password has been updated successfully.</p>
                        <Link href="/auth/signin">
                            <Button className="w-full">Back to Sign In</Button>
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-200 mb-1.5">New Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-lg border border-white/20 px-3.5 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-white/10 backdrop-blur-sm"
                                placeholder="Min. 8 characters"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-200 mb-1.5">Confirm Password</label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full rounded-lg border border-white/20 px-3.5 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-white/10 backdrop-blur-sm"
                                placeholder="Re-enter your password"
                            />
                        </div>

                        {error && (
                            <div className="text-sm text-red-300 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Updating Password...' : 'Update Password'}
                        </Button>
                    </form>
                )}
            </div>
        </GlassEffect>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
            <Suspense fallback={
                <GlassEffect className="max-w-md w-full rounded-2xl" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                    <div className="p-8 text-center">
                        <p className="text-sm text-gray-400">Loading...</p>
                    </div>
                </GlassEffect>
            }>
                <ResetPasswordContent />
            </Suspense>
        </div>
    );
}

