"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { GlassEffect } from '@/components/ui/liquid-glass';
import { Eye, EyeOff, UserCircle } from 'lucide-react';
import api from '@/lib/axios';

export default function SignUpPage() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }

        setLoading(true);
        try {
            const username = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') + Date.now().toString().slice(-4);
            await api.post('/register/', {
                username,
                email,
                password,
                full_name: fullName,
                confirm_password: confirmPassword,
            });
            const res = await api.post('/login/', { username, password });
            localStorage.setItem('access_token', res.data.access);
            localStorage.setItem('refresh_token', res.data.refresh);
            router.push('/onboarding/company');
        } catch (err: any) {
            const data = err.response?.data;
            if (data) {
                const firstError = Object.values(data).flat()[0];
                setError(typeof firstError === 'string' ? firstError : 'Registration failed. Please try again.');
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full rounded-lg border border-white/20 px-3.5 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-white/10 backdrop-blur-sm";

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
            <GlassEffect className="max-w-md w-full rounded-2xl" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                <div className="p-8 w-full">
                    <div className="flex justify-center mb-6">
                        <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                            <UserCircle className="w-8 h-8 text-gray-300" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-center text-white mb-1">Create Account</h2>
                    <p className="text-center text-sm text-gray-400 mb-8 font-normal">
                        Join RetentionBrain and start optimizing your customer lifecycle.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-200 mb-1.5">Full Name</label>
                            <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} placeholder="Enter your full name" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-200 mb-1.5">Email Address</label>
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="name@company.com" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-200 mb-1.5">Password</label>
                            <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputClass} pr-10`} placeholder="Min. 8 characters" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-200 mb-1.5">Confirm Password</label>
                            <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} placeholder="Re-enter your password" />
                        </div>

                        {error && (
                            <div className="text-sm text-red-300 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </Button>
                    </form>

                    <p className="text-xs text-center text-gray-400 mt-5 font-normal">
                        By signing up, you agree to our{' '}
                        <Link href="#" className="text-blue-400 hover:underline">Terms of Service</Link> and{' '}
                        <Link href="#" className="text-blue-400 hover:underline">Privacy Policy</Link>.
                    </p>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                        <div className="relative flex justify-center">
                            <span className="bg-transparent px-4 text-xs text-gray-500 uppercase tracking-wider">Already registered?</span>
                        </div>
                    </div>

                    <div className="text-center">
                        <Link href="/auth/signin" className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
                            Login to your account &rarr;
                        </Link>
                    </div>
                </div>
            </GlassEffect>

            <p className="fixed bottom-6 left-0 right-0 text-center text-xs text-gray-500 font-normal">
                &copy; {new Date().getFullYear()} RetentionBrain Inc. All rights reserved.
            </p>
        </div>
    );
}
