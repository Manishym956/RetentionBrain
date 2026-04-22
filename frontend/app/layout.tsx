import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { ShaderBackground } from '@/components/ShaderBackground';
import { GlassFilter } from '@/components/ui/liquid-glass';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RetentionBrain',
  description: 'Predictive User Retention Platform - Predict & Reduce Customer Churn',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GlassFilter />
        <ShaderBackground />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
