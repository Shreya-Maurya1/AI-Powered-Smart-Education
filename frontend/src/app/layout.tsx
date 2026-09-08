import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AdaptiveMind — Smart Adaptive Learning Platform',
  description: 'AI-Powered Adaptive Smart Education Platform (SIH Problem Statement 19)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
