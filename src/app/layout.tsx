import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthGuard } from '@/components/AuthGuard';
import { CloudDoLogo } from '@/components/CloudDoLogo';

export const metadata: Metadata = {
  title: 'Kathir Xerox & E-Service Centre | Merchant Daybook & POS',
  description: 'Daily merchant register, POS counter, customer dues ledger, and automated WhatsApp dispatch engineered by Cloud.DO Technologies.',
  keywords: 'Kathir Xerox, Merchant Daybook, POS Billing, Tamil Nadu E-Sevai, Cloud.DO Technologies',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Comic+Neue:ital,wght@0,300;0,400;0,700;1,400;1,700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-sky-500/20 selection:text-sky-700 antialiased font-sans relative">
        {/* Subtle Wave Layer & Transparent Grid */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.22]"
            style={{ backgroundImage: "url('/bg-waves.jpg')" }}
          />
          <div className="absolute inset-0 bg-corporate-grid opacity-60" />
        </div>

        {/* Protected Application */}
        <AuthGuard>
          <div className="relative z-10 flex flex-col flex-1 min-h-screen">
            {children}
          </div>
        </AuthGuard>

        {/* Bottom Right Corner: Cloud.DO Technologies Official Badge */}
        <div className="fixed bottom-2.5 right-2.5 z-40">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/95 hover:bg-white text-slate-800 text-[11px] font-medium rounded-none border border-slate-300 shadow-sm backdrop-blur-md transition-all hover:shadow-md">
            <span className="text-[10px] text-slate-500 font-sans">Made by</span>
            <span className="font-bold text-slate-900 tracking-tight font-sans">Cloud.DO Technologies</span>
            <CloudDoLogo size="inline" />
          </div>
        </div>
      </body>
    </html>
  );
}

