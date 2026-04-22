"use client";
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';
import { GlassEffect, GlassCard } from '@/components/ui/liquid-glass';
import { Upload, BarChart3, Users } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="flex flex-col relative">
            {/* Hero Section with Scroll Animation */}
            <div className="flex flex-col overflow-hidden">
                <ContainerScroll
                    titleComponent={
                        <>
                            <h1 className="text-4xl font-semibold text-white mb-2">
                                AI-Powered Insights to <br />
                                <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                                    Predict & Reduce Churn
                                </span>
                            </h1>
                            <p className="text-lg text-gray-300 max-w-2xl mx-auto mt-4 mb-8">
                                Upload customer data, analyze behavior, and identify churn risks instantly.
                                Empower your team with AI-driven insights to keep your users happy.
                            </p>
                            <div className="flex items-center justify-center gap-4 mb-4">
                                <Link href="/auth/signup">
                                    <Button size="lg" className="rounded-lg shadow-lg shadow-blue-500/25 font-semibold px-8">
                                        Get Started Today
                                    </Button>
                                </Link>
                                <Link href="/dashboard">
                                    <Button size="lg" variant="outline" className="rounded-lg font-semibold px-8 border-white/20 text-white hover:bg-white/10">
                                        View Demo
                                    </Button>
                                </Link>
                            </div>
                        </>
                    }
                >
                    <Image
                        src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&q=80"
                        alt="RetentionBrain Dashboard - Analytics Overview"
                        height={720}
                        width={1400}
                        className="mx-auto rounded-2xl object-cover h-full object-left-top"
                        draggable={false}
                    />
                </ContainerScroll>
            </div>

            {/* How It Works */}
            <section className="py-24 border-y border-white/10">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight text-white">How It Works</h2>
                        <p className="mt-3 text-gray-400 text-lg max-w-2xl mx-auto">
                            Our 3-step workflow to master customer retention and drive long-term growth.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
                        {[
                            {
                                title: 'Upload',
                                desc: 'Securely import your CSV or connect your CRM. We support all major platforms and custom data structures.',
                                icon: Upload,
                                gradient: 'from-blue-500/20 to-blue-600/10',
                                iconColor: 'text-blue-400',
                            },
                            {
                                title: 'Predict',
                                desc: 'Our AI identifies patterns and calculates churn scores based on behavioral data and historical trends.',
                                icon: BarChart3,
                                gradient: 'from-indigo-500/20 to-indigo-600/10',
                                iconColor: 'text-indigo-400',
                            },
                            {
                                title: 'Retain',
                                desc: 'Act on automated insights to save your most valuable customers with personalized retention campaigns.',
                                icon: Users,
                                gradient: 'from-violet-500/20 to-violet-600/10',
                                iconColor: 'text-violet-400',
                            },
                        ].map((item, i) => (
                            <GlassCard key={item.title} className="rounded-2xl">
                                <div className="p-8 text-center">
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mx-auto mb-5 animate-float`} style={{ animationDelay: `${i * 0.3}s` }}>
                                        <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{i + 1}. {item.title}</h3>
                                    <p className="text-gray-400 leading-relaxed font-normal">{item.desc}</p>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <GlassCard className="rounded-2xl">
                        <div className="px-8 py-16 text-center">
                            <h2 className="text-3xl font-bold text-white mb-4">Ready to reduce your churn?</h2>
                            <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto font-normal">
                                Join hundreds of companies using RetentionBrain to keep their customers and increase lifetime value today.
                            </p>
                            <Link href="/auth/signup">
                                <Button size="lg" className="rounded-lg font-semibold px-8">
                                    Get Started Today
                                </Button>
                            </Link>
                        </div>
                    </GlassCard>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10 py-12 mt-auto">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <Link href="/" className="text-lg font-bold text-blue-400">RetentionBrain</Link>
                            <p className="mt-3 text-sm text-gray-500 leading-relaxed font-normal">
                                Advanced churn prediction for modern growth teams. Build lasting relationships with your customers through data.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Product</h4>
                            <ul className="space-y-2 text-sm text-gray-500 font-normal">
                                <li><Link href="#" className="hover:text-blue-400 transition-colors">Features</Link></li>
                                <li><Link href="#" className="hover:text-blue-400 transition-colors">Pricing</Link></li>
                                <li><Link href="#" className="hover:text-blue-400 transition-colors">Security</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Company</h4>
                            <ul className="space-y-2 text-sm text-gray-500 font-normal">
                                <li><Link href="#" className="hover:text-blue-400 transition-colors">About</Link></li>
                                <li><Link href="#" className="hover:text-blue-400 transition-colors">Careers</Link></li>
                                <li><Link href="#" className="hover:text-blue-400 transition-colors">Contact</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm text-gray-500 font-normal">
                                <li><Link href="#" className="hover:text-blue-400 transition-colors">Privacy</Link></li>
                                <li><Link href="#" className="hover:text-blue-400 transition-colors">Terms</Link></li>
                                <li><Link href="#" className="hover:text-blue-400 transition-colors">Cookie Policy</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-10 pt-6 border-t border-white/5 text-center text-sm text-gray-600 font-normal">
                        &copy; {new Date().getFullYear()} RetentionBrain. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
