"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { GlassEffect } from '@/components/ui/liquid-glass';
import { Eye, EyeOff } from 'lucide-react';
import api from '@/lib/axios';

export default function SignInPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/login/', { username, password });
            localStorage.setItem('access_token', res.data.access);
            localStorage.setItem('refresh_token', res.data.refresh);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center py-12 px-4">
            <div className="mb-8 flex flex-col items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mb-3 shadow-lg shadow-blue-500/30">
                    <span className="text-white text-sm font-bold">RB</span>
                </div>
                <span className="text-xl font-bold text-white">RetentionBrain</span>
            </div>

            <GlassEffect className="max-w-md w-full rounded-2xl" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                <div className="p-8 w-full">
                    <h2 className="text-2xl font-bold text-center text-white mb-8">Login</h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-200 mb-1.5">Username or Email</label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full rounded-lg border border-white/20 px-3.5 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-white/10 backdrop-blur-sm"
                                placeholder="Enter your username"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-sm font-medium text-gray-200">Password</label>
                                <Link href="/auth/forgot-password" className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
                                    Forgot Password?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-lg border border-white/20 px-3.5 py-2.5 pr-10 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-white/10 backdrop-blur-sm"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                id="remember"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 rounded border-white/30 text-blue-600 focus:ring-blue-500 bg-white/10"
                            />
                            <label htmlFor="remember" className="text-sm text-gray-300">Remember this device</label>
                        </div>

                        {error && (
                            <div className="text-sm text-red-300 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Signing in...' : 'Log In'}
                        </Button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                        <div className="relative flex justify-center" />
                    </div>

                    <p className="text-center text-sm text-gray-300">
                        Don&apos;t have an account?{' '}
                        <Link href="/auth/signup" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
                            Create an account
                        </Link>
                    </p>
                </div>
            </GlassEffect>

            <div className="mt-8 flex items-center gap-6 text-xs text-gray-500">
                <Link href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
                <Link href="#" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
                <Link href="#" className="hover:text-gray-300 transition-colors">Support</Link>
            </div>
        </div>
    );
}
