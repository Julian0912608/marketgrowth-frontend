'use client';

// ============================================================
// components/dashboard/DashboardLayout.tsx
// Wijzigingen:
//   1. UpgradeModal geïmporteerd en toegevoegd
//   2. OnboardingChecklist geïmporteerd — staat in dashboard children
// ============================================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, TrendingUp, ShoppingBag, Megaphone,
  Plug, Settings, LogOut, Zap, Bell, Menu, Sparkles, Instagram,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { UpgradeModal } from '@/components/UpgradeModal';

const navItems = [
  { label: 'Overview',       href: '/dashboard',                 icon: LayoutDashboard },
  { label: 'Sales',          href: '/dashboard/analytics',      icon: TrendingUp },
  { label: 'Products',       href: '/dashboard/products',       icon: ShoppingBag },
  { label: 'Advertising',    href: '/dashboard/ads',            icon: Megaphone },
  { label: 'AI Insights',    href: '/dashboard/ai-insights',    icon: Sparkles },
  { label: 'Social Content', href: '/dashboard/social-content', icon: Instagram },
  { label: 'Integrations',   href: '/dashboard/integrations',   icon: Plug },
  { label: 'Settings',       href: '/settings',                 icon: Settings },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, updateUser, clearAuth } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const refreshUser = async () => {
      try {
        const res = await api.get('/auth/me');
        updateUser({
          userId:    res.data.userId,
          email:     res.data.email,
          firstName: res.data.firstName,
          lastName:  res.data.lastName,
          role:      res.data.role,
        });
      } catch {}
    };
    refreshUser();
  }, []);

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    clearAuth();
    router.push('/login');
  };

  const Sidebar = () => (
    <aside className="w-60 bg-slate-950 flex flex-col h-full border-r border-slate-800/50">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-slate-800/50">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
            <Zap className="w-3.5 h-3.5 text-white" fill="white" />
          </div>
          <span className="font-display font-700 text-white text-base">MarketGrow</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-brand-600/20 text-brand-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-2 py-4 border-t border-slate-800/50 space-y-0.5">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
          <div className="w-7 h-7 rounded-full bg-brand-600/30 flex items-center justify-center flex-shrink-0">
            <span className="text-brand-400 text-xs font-bold">
              {user?.firstName?.[0]?.toUpperCase() ?? 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-slate-500 text-xs truncate capitalize">
              {user?.planSlug ?? 'starter'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="w-60">
          <Sidebar />
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-60 h-full">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-slate-950 border-b border-slate-800/50">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-400 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-brand-600 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" fill="white" />
            </div>
            <span className="font-display font-700 text-white text-sm">MarketGrow</span>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* ── Upgrade modal — luistert globaal naar 403 events ── */}
      <UpgradeModal />

    </div>
  );
}
