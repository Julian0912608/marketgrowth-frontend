import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MarketGrowth — AI-Powered Ecommerce Intelligence',
  description: 'The all-in-one AI platform for ecommerce entrepreneurs.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="grain antialiased">
        {children}
      </body>
    </html>
  );
}
