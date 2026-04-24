"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { User, Upload, BarChart3, Clock, Loader2, Shield, AlertCircle } from 'lucide-react';
import api from '@/lib/axios';

interface Profile {
    id: number;
    username: string;
    email: string;
    full_name: string;
    avatar_url: string;
    email_notifications: boolean;
    system_alerts: boolean;
    theme: string;
    date_joined: string;
    last_login: string;
    datasets_uploaded: number;
    total_predictions: number;
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [fullName, setFullName] = useState('');
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [systemAlerts, setSystemAlerts] = useState(true);
    const [theme, setTheme] = useState('light');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/profile/');
                setProfile(res.data);
                setFullName(res.data.full_name);
                setEmailNotifications(res.data.email_notifications);
                setSystemAlerts(res.data.system_alerts);
                setTheme(res.data.theme);
            } catch (err: any) {
                // 401 is handled globally by the axios interceptor (redirects to login)
                if (err.response?.status !== 401) {
                    setError(err.response?.data?.detail || err.message || 'Failed to load profile.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setSuccess('');
        try {
            const res = await api.put('/profile/', {
                full_name: fullName,
                email_notifications: emailNotifications,
                system_alerts: systemAlerts,
                theme,
            });
            setProfile(res.data);
            setSuccess('Profile updated successfully.');
            setTimeout(() => setSuccess(''), 3000);
        } catch {
            console.error('Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="p-8 max-w-5xl mx-auto">
                {error && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-red-800">Error loading profile</p>
                            <p className="text-sm text-red-600 mt-0.5">{error}</p>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    const memberSince = new Date(profile.date_joined).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const lastLogin = profile.last_login
        ? formatRelativeTime(new Date(profile.last_login))
        : 'Never';

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Account Settings</h1>
                <p className="text-gray-500 mt-1">Update your personal details and account preferences.</p>
            </div>

            {/* User Header */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{fullName || profile.username}</h2>
                            <p className="text-sm text-gray-500">{profile.email}</p>
                            <p className="text-xs text-blue-600 mt-0.5">Member since {memberSince}</p>
                        </div>
                        <span className="ml-auto px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 uppercase tracking-wider">
                            Standard User
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="p-2.5 bg-blue-50 rounded-xl"><Upload className="w-5 h-5 text-blue-600" /></div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Datasets Uploaded</p>
                            <p className="text-2xl font-bold text-gray-900">{profile.datasets_uploaded} <span className="text-sm font-normal text-gray-400">files</span></p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="p-2.5 bg-gray-100 rounded-xl"><Clock className="w-5 h-5 text-gray-600" /></div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Last Login</p>
                            <p className="text-2xl font-bold text-gray-900">{lastLogin}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="p-2.5 bg-indigo-50 rounded-xl"><BarChart3 className="w-5 h-5 text-indigo-600" /></div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Total Predictions</p>
                            <p className="text-2xl font-bold text-gray-900">{profile.total_predictions.toLocaleString()}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* General Information */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-5">General Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                                    <input
                                        type="email"
                                        value={profile.email}
                                        disabled
                                        className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="password"
                                            value="••••••••"
                                            disabled
                                            className="flex-1 rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
                                        />
                                        <Button variant="outline" size="sm" className="shrink-0">Change</Button>
                                    </div>
                                </div>
                            </div>

                            {success && (
                                <div className="mt-4 text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-100">
                                    {success}
                                </div>
                            )}

                            <div className="mt-6 flex justify-end">
                                <Button onClick={handleSave} disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-red-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-red-600">Danger Zone</h3>
                                    <p className="text-sm text-gray-500 mt-1">Permanently delete your account and all associated prediction data. This action cannot be undone.</p>
                                </div>
                                <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 shrink-0">
                                    Delete Account
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Preferences Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-5">Preferences</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Email Notifications</p>
                                        <p className="text-xs text-gray-400">Receive weekly report digests</p>
                                    </div>
                                    <button
                                        onClick={() => setEmailNotifications(!emailNotifications)}
                                        className={`relative w-11 h-6 rounded-full transition-colors ${emailNotifications ? 'bg-blue-600' : 'bg-gray-200'}`}
                                    >
                                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${emailNotifications ? 'left-[22px]' : 'left-0.5'}`} />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">System Alerts</p>
                                        <p className="text-xs text-gray-400">Critical model updates</p>
                                    </div>
                                    <button
                                        onClick={() => setSystemAlerts(!systemAlerts)}
                                        className={`relative w-11 h-6 rounded-full transition-colors ${systemAlerts ? 'bg-blue-600' : 'bg-gray-200'}`}
                                    >
                                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${systemAlerts ? 'left-[22px]' : 'left-0.5'}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100">
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">Appearance</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setTheme('light')}
                                        className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                                            theme === 'light' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                    >
                                        Light
                                    </button>
                                    <button
                                        onClick={() => setTheme('dark')}
                                        className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                                            theme === 'dark' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                    >
                                        Dark
                                    </button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pro Upgrade Card */}
                    <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 border-0">
                        <CardContent className="p-6 text-center">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-3">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <h4 className="text-lg font-bold text-white mb-1">RetentionBrain Pro</h4>
                            <p className="text-sm text-blue-100 mb-4">Unlock advanced neural network models and real-time streaming analytics.</p>
                            <Button className="w-full bg-white !text-gray-900 hover:bg-gray-100 font-semibold">
                                Upgrade Now
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
}
