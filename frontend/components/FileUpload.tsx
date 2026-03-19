"use client";
import React, { useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { Button } from './ui/Button';
import axios from '@/lib/axios';

export const FileUpload = () => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setMessage('');
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await axios.post('/upload/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage('Upload successful: ' + res.data.message);
            setFile(null);
        } catch (err: any) {
            setMessage('Upload failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
            <UploadCloud className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Upload your Dataset</h3>
            <p className="text-sm text-gray-500 mb-6 text-center max-w-sm">
                Select a CSV file containing your user retention data. The file should include relevant features for ML modeling.
            </p>
            <input 
                type="file" 
                accept=".csv"
                onChange={handleFileChange}
                className="block w-full max-w-xs text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4 cursor-pointer"
            />
            <Button onClick={handleUpload} disabled={!file || uploading} className="w-full max-w-xs">
                {uploading ? 'Uploading...' : 'Upload Data'}
            </Button>
            {message && (
                <p className={`mt-4 text-sm font-medium ${message.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>
                    {message}
                </p>
            )}
        </div>
    );
};
