import type { Metadata } from "next";
import Link from 'next/link';
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CookieBanner } from "@/components/CookieBanner";
import { Navigation } from "@/components/Navigation";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

import { Radar } from 'lucide-react';

export const metadata: Metadata = {
  metadataBase: new URL('https://settleradar.com'),
  title: {
    default: "SettleRadar | The Ultimate Expat & Relocation Guide",
    template: "%s | SettleRadar",
  },
  description: "Advanced data analytics for expats, digital nomads, and global investors. Compare countries, taxes, climate, English proficiency, and economic indicators.",
  keywords: ["expat", "relocation", "digital nomad", "country comparison", "tax optimization", "quality of life", "move abroad"],
  authors: [{ name: "SettleRadar Team" }],
  creator: "SettleRadar",
  publisher: "SettleRadar",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://settleradar.com",
    title: "SettleRadar | The Ultimate Expat & Relocation Guide",
    description: "Compare global relocation destinations. Real-time data on taxes, climate, English proficiency, and cost of living.",
    siteName: "SettleRadar",
    images: [{
      url: "/og-image.jpg",
      width: 1200,
      height: 630,
      alt: "SettleRadar - Find your perfect country",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SettleRadar | The Ultimate Expat & Relocation Guide",
    description: "Compare global relocation destinations. Real-time data on taxes, climate, English proficiency, and cost of living.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} antialiased h-full`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'light') {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.style.colorScheme = 'light';
                } else {
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.colorScheme = 'dark';
                }
              } catch (_) {}
            `,
          }}
        />

        {/* STEP 1: Consent Mode defaults — runs BEFORE any GA script loads */}
        <Script
          id="ga-consent"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;

              gtag('consent', 'default', {
                'ad_storage': 'denied',
                'analytics_storage': 'denied'
              });

              // If user previously accepted, upgrade BEFORE config fires
              try {
                if (localStorage.getItem('cookie_consent') === 'granted') {
                  gtag('consent', 'update', { 'analytics_storage': 'granted' });
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col font-sans bg-background text-foreground transition-colors duration-300">
        <ThemeProvider>
          {/* Main Glassmorphism Navbar */}
          <nav className="sticky top-0 z-50 glass-panel border-b border-glass-border px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-lg overflow-hidden shadow-[0_0_15px_rgba(59,130,246,0.3)] group-hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-400 transition-all">
                  <Radar className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight">Settle<span className="text-blue-500 text-glow">Radar</span></span>
              </Link>
              <Navigation />
            </div>
          </nav>
          
          <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
            {children}
          </main>

          <footer className="w-full border-t border-glass-border bg-slate-50 dark:bg-slate-900/50 py-8 mt-12">
            <div className="max-w-7xl mx-auto px-6 text-center space-y-4">
              <p className="text-xs text-slate-500 max-w-3xl mx-auto">
                <strong>Disclaimer:</strong> SettleRadar is a data aggregation tool for informational purposes only. We are not financial or legal advisors. 
                Data points may contain inaccuracies or be outdated. Some summaries are generated using AI. <strong>Use at your own risk.</strong>
              </p>
              <div className="flex items-center justify-center gap-4 text-sm font-medium">
                <Link href="/privacy" className="text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-colors">Privacy Policy</Link>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <Link href="/cookies" className="text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-colors">Cookie Policy</Link>
              </div>
              <p className="text-xs font-mono text-slate-400">© {new Date().getFullYear()} SettleRadar. All rights reserved.</p>
            </div>
          </footer>

          <CookieBanner />
          <GoogleAnalytics gaId="G-03P3QS7E3H" />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
