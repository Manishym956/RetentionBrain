"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { GlassEffect } from '@/components/ui/liquid-glass';
import { Building2, ArrowRight } from 'lucide-react';
import api from '@/lib/axios';

const INDUSTRIES = [
    'Technology', 'E-commerce', 'SaaS', 'Finance', 'Healthcare',
    'Education', 'Media', 'Retail', 'Manufacturing', 'Other',
];

const SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

export default function CompanyOnboardingPage() {
    const [name, setName] = useState('');
    const [industry, setIndustry] = useState('');
    const [size, setSize] = useState('');
    const [website, setWebsite] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.post('/company/', { name, industry, size, website });
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to save company details.');
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        router.push('/dashboard');
    };

    const inputClass = "w-full rounded-lg border border-white/20 px-3.5 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/10 backdrop-blur-sm";

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
            <div className="max-w-lg w-full">
                <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-blue-600/20 flex items-center justify-center mx-auto mb-4 animate-float">
                        <Building2 className="w-7 h-7 text-blue-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-1">Tell us about your company</h1>
                    <p className="text-sm text-gray-400 font-normal">This helps us tailor the experience for your team.</p>
                </div>

                <GlassEffect className="rounded-2xl w-full" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                    <div className="p-8 w-full">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-1.5">Company Name</label>
                                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Acme Inc." />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-1.5">Industry</label>
                                <select value={industry} onChange={(e) => setIndustry(e.target.value)} className={inputClass}>
                                    <option value="" className="bg-gray-900">Select your industry</option>
                                    {INDUSTRIES.map(i => <option key={i} value={i} className="bg-gray-900">{i}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-1.5">Company Size</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {SIZES.map(s => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setSize(s)}
                                            className={`py-2 px-3 rounded-lg border text-sm transition-colors ${
                                                size === s
                                                    ? 'border-blue-500 bg-blue-500/20 text-blue-300 font-medium'
                                                    : 'border-white/15 bg-white/5 text-gray-400 hover:border-white/30 font-normal'
                                            }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-1.5">Website (optional)</label>
                                <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className={inputClass} placeholder="https://yourcompany.com" />
                            </div>

                            {error && (
                                <div className="text-sm text-red-300 bg-red-500/10 p-3 rounded-lg border border-red-500/20 font-normal">{error}</div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <Button type="button" variant="ghost" className="flex-1 text-gray-300" onClick={handleSkip}>
                                    Skip for now
                                </Button>
                                <Button type="submit" className="flex-1" disabled={loading || !name}>
                                    {loading ? 'Saving...' : 'Continue'}
                                    {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                                </Button>
                            </div>
                        </form>
                    </div>
                </GlassEffect>

                <div className="mt-6 flex justify-center gap-2">
                    <div className="w-8 h-1.5 rounded-full bg-blue-600" />
                    <div className="w-8 h-1.5 rounded-full bg-white/20" />
                </div>
            </div>
        </div>
    );
}
