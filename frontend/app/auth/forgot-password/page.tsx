"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { GlassEffect } from '@/components/ui/liquid-glass';
import { ArrowLeft, Send, Info } from 'lucide-react';
import api from '@/lib/axios';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.post('/password-reset/', { email });
            setSent(true);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center py-12 px-4">
            <GlassEffect className="max-w-md w-full rounded-2xl" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                <div className="p-8 w-full">
                    {sent ? (
                        <div className="text-center py-4">
                            <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                                <Send className="w-6 h-6 text-green-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
                            <p className="text-sm text-gray-400 mb-6 font-normal">
                                If an account with <strong className="text-gray-200">{email}</strong> exists, we&apos;ve sent a password reset link.
                            </p>
                            <Link href="/auth/signin">
                                <Button className="w-full">Back to Login</Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold text-white mb-2">Forgot Password</h2>
                            <p className="text-sm text-gray-400 mb-8 font-normal">
                                Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-1.5">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full rounded-lg border border-white/20 px-3.5 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-white/10 backdrop-blur-sm"
                                        placeholder="e.g. name@company.com"
                                    />
                                </div>

                                {error && (
                                    <div className="text-sm text-red-300 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                        {error}
                                    </div>
                                )}

                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? 'Sending...' : 'Send Reset Link'}
                                    {!loading && <Send className="w-4 h-4 ml-2" />}
                                </Button>
                            </form>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                                <div className="relative flex justify-center" />
                            </div>

                            <div className="text-center">
                                <Link href="/auth/signin" className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1">
                                    <ArrowLeft className="w-3 h-3" /> Back to Login
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </GlassEffect>

            <div className="fixed bottom-6 right-6">
                <GlassEffect className="rounded-xl" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
                    <div className="p-4 max-w-xs">
                        <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-white">Security Tip</p>
                                <p className="text-xs text-gray-400 mt-0.5 font-normal">Never share your password or reset links with anyone, including RetentionBrain staff.</p>
                            </div>
                        </div>
                    </div>
                </GlassEffect>
            </div>

            <p className="fixed bottom-6 left-0 right-0 text-center text-xs text-gray-500 uppercase tracking-wider font-normal">
                &copy; {new Date().getFullYear()} RetentionBrain Inc. All rights reserved.
            </p>
        </div>
    );
}
