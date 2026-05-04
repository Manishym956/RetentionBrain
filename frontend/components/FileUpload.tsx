"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import axios from '@/lib/axios';

interface UploadResult {
    message: string;
    upload_id: number;
    customers_processed: number;
    high_risk_count: number;
    avg_churn_probability: number;
}

export const FileUpload = () => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<UploadResult | null>(null);
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setError('');
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setError('');
        setResult(null);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await axios.post('/upload/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResult(res.data);
            setFile(null);
        } catch (err: any) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <UploadCloud className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Upload your Dataset</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center max-w-sm">
                    Select a CSV file containing your user retention data. The file will be processed through our ML pipeline.
                </p>
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="block w-full max-w-xs text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50 mb-4 cursor-pointer"
                />
                <Button onClick={handleUpload} disabled={!file || uploading} className="w-full max-w-xs">
                    {uploading ? 'Processing ML Pipeline...' : 'Upload & Analyze'}
                </Button>
            </div>

            {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-red-800">Upload Failed</p>
                        <p className="text-sm text-red-600 mt-1">{error}</p>
                    </div>
                </div>
            )}

            {result && (
                <div className="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />
                        <h4 className="font-semibold text-green-800 dark:text-green-400">Analysis Complete</h4>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-100 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Customers Analyzed</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{result.customers_processed}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-100 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400">High Risk</p>
                            <p className="text-xl font-bold text-red-600 dark:text-red-500">{result.high_risk_count}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-100 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Avg Churn Risk</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{(result.avg_churn_probability * 100).toFixed(1)}%</p>
                        </div>
                    </div>
                    <Button variant="secondary" onClick={() => router.push('/dashboard')} className="w-full">
                        View Results in Dashboard
                    </Button>
                </div>
            )}
        </div>
    );
};
