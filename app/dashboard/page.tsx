'use client';

import { useAuthStore } from '@/lib/store';
import { TrendingUp, ShoppingCart, BarChart3, Zap, Settings, LogOut, Bell } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { api } from '@/lib/api';

const NAV_ITEMS = [
  { label: 'Dashboard',   icon: BarChart3,    href: '/dashboard' },
  { label: 'Sales',       icon: TrendingUp,   href: '/dashboard' },
  { label: 'Orders',      icon: ShoppingCart, href: '/dashboard' },
  { label: 'AI Insights', icon: Zap,          href: '/dashboard' },
  { label: 'Alerts',      icon: Bell,         href: '/dashboard' },
  { label: 'Settings',    icon: Settings,     href: '/settings' },
];

export default function DashboardPage() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    clearAuth();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-surface-50 flex">

      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-slate-100 flex flex-col p-4 fixed h-full">
        <div
          className="flex items-center gap-2 font-display font-700 text-base text-slate-900 mb-8 px-2 cursor-pointer"
          onClick={() => router.push('/dashboard')}
        >
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" fill="white" />
          </div>
          MarketGrowth
        </div>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href && item.href !== '/dashboard' || (item.href === '/dashboard' && pathname === '/dashboard');
            return (
              <button
                key={item.label}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 pt-4">
          <div className="px-2 mb-3">
            <div className="text-xs font-medium text-slate-900">{user?.firstName} {user?.lastName}</div>
            <div className="text-xs text-slate-400 capitalize">{user?.planSlug ?? 'starter'} plan</div>
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

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Revenue today',   value: '—',  sub: 'Connect your store to see data' },
              { label: 'Orders today',    value: '—',  sub: 'Connect your store to see data' },
              { label: 'AI credits left', value: '500', sub: 'Resets next billing cycle' },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="text-xs font-medium text-slate-400 mb-2">{stat.label}</div>
                <div className="font-display text-2xl font-800 text-slate-900 mb-1">{stat.value}</div>
                <div className="text-xs text-slate-400">{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* Connect store CTA */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-6 h-6 text-brand-600" />
            </div>
            <h2 className="font-display font-700 text-slate-900 mb-2">Connect your first store</h2>
            <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
              Link your Shopify, WooCommerce, or Lightspeed store to start seeing AI-powered insights.
            </p>
            <button
              onClick={() => router.push('/settings')}
              className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
            >
              Connect store →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
