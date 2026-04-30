import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { LangProvider } from '@/context/LangContext';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'AppGen — Config-Driven App Builder',
  description: 'Build full-stack apps from JSON configuration',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LangProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-right" toastOptions={{ style: { background: '#1a1a24', color: '#f1f1f3', border: '1px solid #2a2a3a', borderRadius: '12px' } }} />
          </AuthProvider>
        </LangProvider>
      </body>
    </html>
  );
}