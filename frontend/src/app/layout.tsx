import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AdaptiveMind — Smart Adaptive Learning Platform',
  description: 'Personalized adaptive education platform for students and educators',
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
