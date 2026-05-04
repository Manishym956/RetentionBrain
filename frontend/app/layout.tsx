import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { ShaderBackground } from '@/components/ShaderBackground';
import { GlassFilter } from '@/components/ui/liquid-glass';
import { ThemeProvider } from '@/components/theme-provider';

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
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <GlassFilter />
          <ShaderBackground />
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
