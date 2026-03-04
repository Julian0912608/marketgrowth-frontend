import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MarketGrowth — AI-Powered Ecommerce Intelligence',
  description: 'The all-in-one AI platform for ecommerce entrepreneurs. Connect your store, understand your data, and grow faster.',
  keywords: ['ecommerce', 'AI', 'analytics', 'Shopify', 'WooCommerce', 'sales dashboard'],
  openGraph: {
    title: 'MarketGrowth',
    description: 'AI-powered ecommerce intelligence for entrepreneurs who want to grow.',
    type: 'website',
  },
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
