"use client";
import React, { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Table, TableHeader, TableHead, TableRow, TableCell } from '@/components/ui/Table';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Search, Filter, Download, Loader2, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import api from '@/lib/axios';

interface Customer {
    id: number;
    customer_id: string;
    churn_probability: number;
    risk_level: string;
    recency: number;
    frequency: number;
    monetary: number;
    created_at: string;
}

export default function PredictionsPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [riskFilter, setRiskFilter] = useState('');
    const [sort, setSort] = useState('-churn_probability');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const pageSize = 10;
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Debounce search input
    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            setDebouncedSearch(searchInput);
            setPage(1);
        }, 400);
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, [searchInput]);

    // Fetch customers when filters change
    useEffect(() => {
        let cancelled = false;

        const fetchCustomers = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await api.get('/customers/', {
                    params: {
                        page,
                        page_size: pageSize,
                        ...(riskFilter ? { risk: riskFilter } : {}),
                        ...(debouncedSearch ? { search: debouncedSearch } : {}),
                        ...(sort ? { sort } : {}),
                    },
                });
                if (!cancelled) {
                    setCustomers(res.data.results);
                    setTotal(res.data.total);
                }
            } catch (err: any) {
                if (!cancelled) {
                    if (err.response?.status === 401) {
                        setError('Session expired. Please log in again.');
                    } else {
                        setError(err.response?.data?.detail || err.message || 'Failed to load predictions.');
                    }
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchCustomers();
        return () => { cancelled = true; };
    }, [page, riskFilter, debouncedSearch, sort]);

    const totalPages = Math.ceil(total / pageSize);

    const avgChurn = customers.length > 0
        ? customers.reduce((sum, c) => sum + c.churn_probability, 0) / customers.length
        : 0;
    const highRiskCount = customers.filter(c => c.risk_level === 'high').length;

    const riskBadge = (level: string) => {
        const styles = {
            high: 'bg-red-100 text-red-700',
            medium: 'bg-yellow-100 text-yellow-700',
            low: 'bg-green-100 text-green-700',
        };
        return (
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full uppercase ${styles[level as keyof typeof styles] || ''}`}>
                {level} Risk
            </span>
        );
    };

    const churnBar = (probability: number) => {
        const color = probability >= 0.7 ? 'bg-red-500' : probability >= 0.4 ? 'bg-yellow-500' : 'bg-green-500';
        return (
            <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900 w-10">{(probability * 100).toFixed(0)}%</span>
                <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-[80px]">
                    <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${probability * 100}%` }} />
                </div>
            </div>
        );
    };

    const handleExport = () => {
        if (!customers || customers.length === 0) return;
        import('jspdf').then(({ default: jsPDF }) => {
            import('jspdf-autotable').then((autoTable) => {
                const doc = new jsPDF();
                
                doc.setFontSize(18);
                doc.text('RetentionBrain Prediction Report', 14, 22);
                
                doc.setFontSize(11);
                doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
                doc.text(`Total Records Extracted: ${customers.length}`, 14, 36);

                const headers = [['CustomerID', 'Churn Probability', 'Risk Level', 'Recency', 'Frequency', 'Monetary']];
                
                const data = customers.map(c => [
                    `#${c.customer_id}`,
                    (c.churn_probability * 100).toFixed(1) + '%',
                    c.risk_level.toUpperCase(),
                    c.recency > 0 ? `${c.recency} days` : '-',
                    c.frequency,
                    `$${c.monetary.toFixed(2)}`
                ]);

                // @ts-ignore - jspdf-autotable types are sometimes tricky with dynamic imports
                autoTable.default(doc, {
                    startY: 45,
                    head: headers,
                    body: data,
                    theme: 'grid',
                    styles: { fontSize: 9 },
                    headStyles: { fillColor: [37, 99, 235] }, // Blue-600
                    alternateRowStyles: { fillColor: [249, 250, 251] }, // Gray-50
                });

                doc.save('predictions_report.pdf');
            });
        });
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Predictions</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by CustomerID..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                    />
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center justify-between">
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                    {[
                        { label: 'All Customers', value: '' },
                        { label: 'High Risk', value: 'high' },
                        { label: 'Medium Risk', value: 'medium' },
                        { label: 'Low Risk', value: 'low' },
                    ].map(tab => (
                        <button
                            key={tab.value}
                            onClick={() => { setRiskFilter(tab.value); setPage(1); }}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                riskFilter === tab.value
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2 items-center">
                    <div className="relative border border-gray-300 rounded-md text-sm bg-white overflow-hidden flex items-center">
                        <Filter className="w-4 h-4 text-gray-500 ml-2" />
                        <select 
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="bg-transparent border-none focus:ring-0 text-sm py-1.5 pl-2 pr-8 cursor-pointer outline-none text-gray-700"
                        >
                            <option value="-churn_probability">Highest Risk First</option>
                            <option value="churn_probability">Lowest Risk First</option>
                            <option value="-monetary">Highest Revenue</option>
                            <option value="monetary">Lowest Revenue</option>
                        </select>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleExport}><Download className="w-4 h-4 mr-1.5" /> Export</Button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-red-800">Error loading predictions</p>
                        <p className="text-sm text-red-600 mt-0.5">{error}</p>
                    </div>
                </div>
            )}

            {/* Table */}
            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>CustomerID</TableHead>
                                    <TableHead>Churn Probability</TableHead>
                                    <TableHead>Risk Badge</TableHead>
                                    <TableHead>Last Purchase Date</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <tbody className="divide-y divide-gray-100">
                                {customers.map(c => (
                                    <TableRow key={c.id}>
                                        <TableCell className="font-medium text-blue-600">#{c.customer_id}</TableCell>
                                        <TableCell>{churnBar(c.churn_probability)}</TableCell>
                                        <TableCell>{riskBadge(c.risk_level)}</TableCell>
                                        <TableCell className="text-sm text-gray-500">
                                            {c.recency > 0 ? `${c.recency} days ago` : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/customers/${c.id}`}>
                                                <Button size="sm" variant="primary" className="text-xs">View Details</Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {customers.length === 0 && !error && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-gray-400 py-12">
                                            No customers found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </tbody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total.toLocaleString()} customers</span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            const pageNum = i + 1;
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setPage(pageNum)}
                                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                                        page === pageNum ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-600'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Bottom Stats */}
            {customers.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-5">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Average Churn Prob.</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{(avgChurn * 100).toFixed(1)}%</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">High Risk Count</p>
                            <p className="text-2xl font-bold text-red-600 mt-1">{highRiskCount}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Predictions Updated</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {formatRelativeTime(new Date(customers[0].created_at))}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}
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
