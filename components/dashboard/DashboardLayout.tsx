'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, TrendingUp, ShoppingBag, Megaphone,
  Plug, Settings, LogOut, Zap, Bell, Menu, Sparkles
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';

const navItems = [
  { label: 'Overview',     href: '/dashboard',              icon: LayoutDashboard },
  { label: 'Sales',        href: '/dashboard/analytics',    icon: TrendingUp },
  { label: 'Products',     href: '/dashboard/products',     icon: ShoppingBag },
  { label: 'Advertising',  href: '/dashboard/ads',          icon: Megaphone },
  { label: 'AI Insights',  href: '/dashboard/ai-insights',  icon: Sparkles },
  { label: 'Integrations', href: '/dashboard/integrations', icon: Plug },
  { label: 'Settings',     href: '/settings',               icon: Settings },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const { user, updateUser, clearAuth } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Refresh user data from backend on every mount
  // This ensures naam/email altijd up-to-date is na een page refresh
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
      } catch {
        // 401 = token verlopen, axios interceptor handelt redirect af
      }
    };
    refreshUser();
  }, []);

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    clearAuth();
    router.push('/login');
  };

  const Sidebar = () => (
    <aside className="w-60 bg-slate-950 flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/30">
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <span className="font-display font-700 text-white text-base">MarketGrowth</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const active =
            pathname === item.href ||
            (item.href !== '/dashboard' && item.href !== '/settings' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-brand-600/15 text-brand-400 border border-brand-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1">
          <div className="w-7 h-7 rounded-full bg-brand-600/20 border border-brand-600/30 flex items-center justify-center text-xs font-bold text-brand-400">
            {user?.firstName?.[0]?.toUpperCase()}{user?.lastName?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-white truncate">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-xs text-slate-500 capitalize">{user?.planSlug ?? 'starter'} plan</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-60 flex-shrink-0"><Sidebar /></div>
          <div className="flex-1 bg-black/60" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <button className="relative w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <Bell className="w-4 h-4" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-slate-900/50">
          {children}
        </main>
      </div>
    </div>
  );
}
