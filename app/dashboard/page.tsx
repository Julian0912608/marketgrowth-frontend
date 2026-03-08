'use client';

import { useAuthStore } from '@/lib/store';
import { ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-800 text-white">
            Good morning, {user?.firstName ?? 'there'} 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">Here's what's happening with your store today.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Revenue today',   value: '—',   sub: 'Connect your store to see data' },
            { label: 'Orders today',    value: '—',   sub: 'Connect your store to see data' },
            { label: 'AI credits left', value: '500', sub: 'Resets next billing cycle' },
          ].map(stat => (
            <div key={stat.label} className="bg-slate-800/60 rounded-2xl border border-slate-700/50 p-5">
              <div className="text-xs font-medium text-slate-400 mb-2">{stat.label}</div>
              <div className="font-display text-2xl font-800 text-white mb-1">{stat.value}</div>
              <div className="text-xs text-slate-500">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Connect store CTA */}
        <div className="bg-slate-800/60 rounded-2xl border border-slate-700/50 p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-brand-600/20 border border-brand-600/30 flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-6 h-6 text-brand-400" />
          </div>
          <h2 className="font-display font-700 text-white mb-2">Connect your first store</h2>
          <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">
            Link your Shopify, WooCommerce, or Lightspeed store to start seeing AI-powered insights.
          </p>
          <button
            onClick={() => router.push('/dashboard/integrations')}
            className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
          >
            Connect store →
          </button>
        </div>

      </div>
    </div>
  );
}
