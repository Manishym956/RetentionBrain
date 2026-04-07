"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableHead, TableRow, TableCell } from '@/components/ui/Table';
import { Users, TrendingDown, Activity, DollarSign, AlertTriangle, Loader2 } from 'lucide-react';
import api from '@/lib/axios';

interface Metrics {
    total_customers: number;
    avg_churn_risk: number;
    high_risk_count: number;
    revenue_at_risk: number;
    total_uploads: number;
    risk_distribution: { low: number; medium: number; high: number };
}

interface Customer {
    id: number;
    customer_id: string;
    recency: number;
    frequency: number;
    monetary: number;
    churn_probability: number;
    risk_level: string;
    top_features: { feature: string; impact: number }[];
}

export default function DashboardPage() {
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [riskFilter, setRiskFilter] = useState('');

    useEffect(() => {
        fetchData();
    }, [riskFilter]);

    const fetchData = async () => {
        try {
            const [metricsRes, customersRes] = await Promise.all([
                api.get('/dashboard/'),
                api.get('/customers/', {
                    params: {
                        page_size: 20,
                        ...(riskFilter ? { risk: riskFilter } : {}),
                    },
                }),
            ]);
            setMetrics(metricsRes.data);
            setCustomers(customersRes.data.results);
        } catch {
            console.error('Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const hasData = metrics && metrics.total_customers > 0;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-500 mt-1">High-level metrics and model predictions for your users.</p>
            </div>

            {!hasData ? (
                <Card className="bg-gradient-to-br from-blue-50 to-white">
                    <CardContent className="p-12 text-center">
                        <AlertTriangle className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Yet</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            Upload a CSV dataset to get started with churn predictions and retention analytics.
                        </p>
                        <Link href="/upload" className="inline-flex items-center justify-center rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 h-10 px-6 transition-colors">
                            Upload Dataset
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="bg-gradient-to-br from-white to-gray-50/50">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-500">Total Customers</p>
                                    <Users className="h-5 w-5 text-gray-400" />
                                </div>
                                <p className="text-3xl font-bold text-gray-900 mt-4">{metrics!.total_customers.toLocaleString()}</p>
                                <p className="text-sm text-gray-400 font-normal mt-1">{metrics!.total_uploads} uploads processed</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-white to-gray-50/50">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-500">Avg Churn Risk</p>
                                    <TrendingDown className="h-5 w-5 text-gray-400" />
                                </div>
                                <p className="text-3xl font-bold text-gray-900 mt-4">{metrics!.avg_churn_risk}%</p>
                                <p className="text-sm text-red-600 font-medium mt-1">{metrics!.high_risk_count} high risk</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-white to-gray-50/50">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-500">Revenue at Risk</p>
                                    <DollarSign className="h-5 w-5 text-gray-400" />
                                </div>
                                <p className="text-3xl font-bold text-gray-900 mt-4">${metrics!.revenue_at_risk.toLocaleString()}</p>
                                <p className="text-sm text-yellow-600 font-medium mt-1">From high-risk customers</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-white to-gray-50/50">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-500">Risk Distribution</p>
                                    <Activity className="h-5 w-5 text-gray-400" />
                                </div>
                                <div className="mt-4 space-y-2">
                                    {(['high', 'medium', 'low'] as const).map(level => {
                                        const count = metrics!.risk_distribution[level];
                                        const pct = metrics!.total_customers > 0 ? Math.round((count / metrics!.total_customers) * 100) : 0;
                                        const colors = { high: 'bg-red-500', medium: 'bg-yellow-500', low: 'bg-green-500' };
                                        return (
                                            <div key={level} className="flex items-center gap-2 text-sm">
                                                <div className={`w-2 h-2 rounded-full ${colors[level]}`} />
                                                <span className="capitalize text-gray-600">{level}</span>
                                                <span className="ml-auto font-medium text-gray-900">{count} ({pct}%)</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Customer Predictions</CardTitle>
                                <div className="flex gap-2">
                                    {['', 'high', 'medium', 'low'].map(filter => (
                                        <button
                                            key={filter}
                                            onClick={() => setRiskFilter(filter)}
                                            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                                                riskFilter === filter
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            {filter === '' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="px-0 pb-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Customer ID</TableHead>
                                        <TableHead>Recency</TableHead>
                                        <TableHead>Frequency</TableHead>
                                        <TableHead>Monetary</TableHead>
                                        <TableHead>Top Risk Factor</TableHead>
                                        <TableHead className="text-right">Churn Probability</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <tbody className="divide-y divide-gray-100">
                                    {customers.map(c => {
                                        const riskColors = {
                                            high: 'text-red-600',
                                            medium: 'text-yellow-600',
                                            low: 'text-green-600',
                                        };
                                        return (
                                            <TableRow key={c.id}>
                                                <TableCell>
                                                    <Link href={`/customers/${c.id}`} className="font-medium text-blue-600 hover:underline">
                                                        {c.customer_id}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>{c.recency} days</TableCell>
                                                <TableCell>{c.frequency}</TableCell>
                                                <TableCell>${c.monetary.toLocaleString()}</TableCell>
                                                <TableCell className="text-sm text-gray-500">
                                                    {c.top_features?.[0]?.feature || '-'}
                                                </TableCell>
                                                <TableCell className={`text-right font-semibold ${riskColors[c.risk_level as keyof typeof riskColors] || ''}`}>
                                                    {(c.churn_probability * 100).toFixed(1)}%
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {customers.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                                                No customers found for this filter.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </tbody>
                            </Table>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
