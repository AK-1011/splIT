import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Righteous } from 'next/font/google';
import AppInitializer from './_app';
import Link from 'next/link';
import { AuthProvider } from '@/lib/auth';
import AuthNavigation from '@/components/AuthNavigation';

const righteous = Righteous({ 
  subsets: ['latin'],
  weight: '400',
  display: 'swap'
});

export const viewport: Viewport = {
  themeColor: '#2563EB',
};

export const metadata: Metadata = {
  title: 'splIT - Expense Tracker',
  description: 'Local-first expense tracker with multi-user sync',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'splIT',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${righteous.className} bg-black min-h-screen text-white overflow-hidden`}>
        <AuthProvider>
          <AppInitializer>
            <div className="flex flex-col h-screen overflow-hidden">
              <header className="flex-none bg-gray-900 border-b border-gray-800 py-3 h-14">
                <div className="container mx-auto px-4">
                  <Link href="/" className="flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-500">spl<span className="text-white">IT</span></span>
                  </Link>
                </div>
              </header>
              
              <main className="flex-1 overflow-hidden relative">
                {children}
              </main>
              
              {/* Navigation components are now in the AuthNavigation component */}
              <AuthNavigation />
            </div>
          </AppInitializer>
        </AuthProvider>
      </body>
    </html>
  );
} 