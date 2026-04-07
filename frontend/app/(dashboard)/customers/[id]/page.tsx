"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ArrowLeft, Loader2, TrendingDown, Clock, ShoppingCart, DollarSign, RotateCcw, CalendarDays } from 'lucide-react';
import api from '@/lib/axios';

interface CustomerDetail {
    id: number;
    customer_id: string;
    recency: number;
    frequency: number;
    monetary: number;
    avg_order_value: number;
    total_returns: number;
    return_ratio: number;
    customer_lifetime: number;
    churn_probability: number;
    is_churned: boolean;
    risk_level: string;
    top_features: { feature: string; impact: number }[];
    created_at: string;
    upload_name: string;
}

export default function CustomerDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [customer, setCustomer] = useState<CustomerDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const res = await api.get(`/customers/${params.id}/`);
                setCustomer(res.data);
            } catch {
                setError('Customer not found');
            } finally {
                setLoading(false);
            }
        };
        fetchCustomer();
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error || !customer) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Link href="/dashboard" className="text-blue-600 hover:underline">Back to Dashboard</Link>
            </div>
        );
    }

    const riskColors = {
        high: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
        medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
        low: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
    };
    const colors = riskColors[customer.risk_level as keyof typeof riskColors] || riskColors.low;

    const featureLabels: Record<string, string> = {
        Recency: 'Days since last activity',
        Frequency: 'Purchase frequency',
        Monetary: 'Total spend value',
        ReturnRatio: 'Product return rate',
        CustomerLifetime: 'Account age (days)',
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Customer {customer.customer_id}</h1>
                    <p className="text-gray-500 text-sm">From upload: {customer.upload_name}</p>
                </div>
                <span className={`ml-auto px-3 py-1 text-sm font-medium rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
                    {customer.risk_level.toUpperCase()} RISK
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Churn Prediction</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-6 mb-6">
                            <div className="flex-1">
                                <p className="text-sm text-gray-500 mb-1">Churn Probability</p>
                                <p className="text-4xl font-bold text-gray-900">{(customer.churn_probability * 100).toFixed(1)}%</p>
                            </div>
                            <div className="w-32 h-32 relative">
                                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                                    <circle
                                        cx="50" cy="50" r="40" fill="none"
                                        stroke={customer.risk_level === 'high' ? '#ef4444' : customer.risk_level === 'medium' ? '#eab308' : '#22c55e'}
                                        strokeWidth="10"
                                        strokeDasharray={`${customer.churn_probability * 251.2} 251.2`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </div>
                        </div>

                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Top Risk Factors (SHAP)</h4>
                        <div className="space-y-3">
                            {customer.top_features.map((f, i) => {
                                const maxImpact = Math.max(...customer.top_features.map(x => Math.abs(x.impact)));
                                const width = maxImpact > 0 ? (Math.abs(f.impact) / maxImpact) * 100 : 0;
                                return (
                                    <div key={i} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-700 font-medium">{featureLabels[f.feature] || f.feature}</span>
                                            <span className={f.impact > 0 ? 'text-red-600' : 'text-green-600'}>
                                                {f.impact > 0 ? '+' : ''}{f.impact.toFixed(4)}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${f.impact > 0 ? 'bg-red-400' : 'bg-green-400'}`}
                                                style={{ width: `${width}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    {[
                        { label: 'Recency', value: `${customer.recency} days`, icon: Clock, desc: 'Days since last activity' },
                        { label: 'Frequency', value: customer.frequency.toString(), icon: ShoppingCart, desc: 'Number of transactions' },
                        { label: 'Monetary', value: `$${customer.monetary.toLocaleString()}`, icon: DollarSign, desc: 'Total spend' },
                        { label: 'Avg Order Value', value: `$${customer.avg_order_value.toLocaleString()}`, icon: DollarSign, desc: 'Average per order' },
                        { label: 'Total Returns', value: customer.total_returns.toString(), icon: RotateCcw, desc: 'Returned transactions' },
                        { label: 'Return Ratio', value: `${(customer.return_ratio * 100).toFixed(1)}%`, icon: RotateCcw, desc: 'Product return rate' },
                        { label: 'Lifetime', value: `${customer.customer_lifetime} days`, icon: CalendarDays, desc: 'Account age' },
                    ].map(stat => (
                        <Card key={stat.label}>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <stat.icon className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">{stat.label}</p>
                                        <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
