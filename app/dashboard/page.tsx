'use client';

import { useAuthStore } from '@/lib/store';
import { TrendingUp, ShoppingCart, BarChart3, Zap, Settings, LogOut, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function DashboardPage() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    clearAuth();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-surface-50 flex">

      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-slate-100 flex flex-col p-4 fixed h-full">
        <div className="flex items-center gap-2 font-display font-700 text-base text-slate-900 mb-8 px-2">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" fill="white" />
          </div>
          MarketGrowth
        </div>

        <nav className="flex-1 space-y-1">
          {[
            { label: 'Dashboard',  icon: BarChart3,    active: true },
            { label: 'Sales',      icon: TrendingUp,   active: false },
            { label: 'Orders',     icon: ShoppingCart, active: false },
            { label: 'AI Insights',icon: Zap,          active: false },
            { label: 'Alerts',     icon: Bell,         active: false },
            { label: 'Settings',   icon: Settings,     active: false },
          ].map(item => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                item.active
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-slate-100 pt-4">
          <div className="px-2 mb-3">
            <div className="text-xs font-medium text-slate-900">{user?.firstName} {user?.lastName}</div>
            <div className="text-xs text-slate-400 capitalize">{user?.planSlug} plan</div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-56 p-8">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-2xl font-800 text-slate-900">
              Good morning, {user?.firstName ?? 'there'} 👋
            </h1>
            <p className="text-slate-500 text-sm mt-1">Here's what's happening with your store today.</p>
          </div>

          {/* Connect store prompt if no store connected */}
          <div className="bg-brand-50 border border-brand-200 rounded-2xl p-6 mb-8 flex items-center justify-between">
            <div>
              <h3 className="font-display font-700 text-brand-900 mb-1">Connect your first store</h3>
              <p className="text-brand-700 text-sm">Link your Shopify or WooCommerce store to start seeing your data.</p>
            </div>
            <button
              onClick={() => router.push('/onboarding')}
              className="bg-brand-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-brand-700 transition-colors flex-shrink-0"
            >
              Connect store →
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Total Revenue',   value: '—',  change: 'No data yet', icon: TrendingUp,   color: 'text-emerald-600 bg-emerald-50' },
              { label: 'Orders Today',    value: '—',  change: 'No data yet', icon: ShoppingCart, color: 'text-brand-600 bg-brand-50' },
              { label: 'Avg Order Value', value: '—',  change: 'No data yet', icon: BarChart3,    color: 'text-violet-600 bg-violet-50' },
            ].map(card => (
              <div key={card.label} className="bg-white rounded-2xl border border-slate-100 p-5">
                <div className={`w-9 h-9 rounded-xl ${card.color} flex items-center justify-center mb-3`}>
                  <card.icon className="w-4 h-4" />
                </div>
                <div className="text-xs text-slate-500 mb-1">{card.label}</div>
                <div className="font-display text-2xl font-800 text-slate-900">{card.value}</div>
                <div className="text-xs text-slate-400 mt-1">{card.change}</div>
              </div>
            ))}
          </div>

          {/* Empty state */}
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="font-display font-700 text-slate-900 mb-2">No data yet</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">
              Connect your store to start seeing real-time sales data, AI insights, and growth recommendations.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
