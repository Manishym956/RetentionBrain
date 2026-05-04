import React from 'react';
import { FileUpload } from '@/components/FileUpload';

export default function UploadPage() {
    return (
        <div className="p-8 max-w-4xl mx-auto min-h-full flex flex-col justify-center">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-2">Data Ingestion</h1>
                <p className="text-gray-500 dark:text-gray-400">Upload your historical dataset to retrain the ML model or predict new user behavior.</p>
            </div>
            <FileUpload />
            
            <div className="mt-12 bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Required CSV Format:</h4>
                <ul className="list-disc list-inside text-sm text-blue-800 dark:text-blue-300 space-y-1">
                    <li>Must contain a <code className="bg-white dark:bg-gray-800 px-1 py-0.5 rounded text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-gray-700">user_id</code> column</li>
                    <li>Feature columns describing user metadata</li>
                    <li>For training data, include a <code className="bg-white dark:bg-gray-800 px-1 py-0.5 rounded text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-gray-700">churn</code> binary label column</li>
                </ul>
            </div>
        </div>
    );
}
