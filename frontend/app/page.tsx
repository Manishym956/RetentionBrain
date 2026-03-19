import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
    return (
        <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-gray-100 p-8 text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 drop-shadow-sm">
                Unlock the Future of <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">User Retention</span>
            </h1>
            <p className="max-w-2xl text-lg md:text-xl text-gray-600 mb-10 leading-relaxed">
                RetentionBrain uses advanced ML to predict churn, analyze user behavior, and give you actionable insights all in one place.
            </p>
            <div className="flex items-center justify-center gap-4">
                <Link href="/login">
                    <Button size="lg" className="rounded-full shadow-lg shadow-blue-500/30 font-semibold px-8">
                        Get Started
                    </Button>
                </Link>
                <Link href="/dashboard">
                    <Button size="lg" variant="outline" className="rounded-full border-gray-300 font-semibold px-8 shadow-sm">
                        View Demo
                    </Button>
                </Link>
            </div>
            
            <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full text-left">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-blue-600 font-bold text-xl">1</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Data</h3>
                    <p className="text-gray-600">Connect your dataset effortlessly through our secure CSV upload.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="bg-indigo-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-indigo-600 font-bold text-xl">2</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Analyze Behavior</h3>
                    <p className="text-gray-600">Let our ML identify critical patterns and churn risk factors.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-purple-600 font-bold text-xl">3</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Take Action</h3>
                    <p className="text-gray-600">Deploy targeted campaigns to retain your most valuable users instantly.</p>
                </div>
            </div>
        </main>
    );
}
