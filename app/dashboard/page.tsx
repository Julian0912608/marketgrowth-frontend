'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, ShoppingCart, Users, ArrowUpRight, ArrowDownRight, Plug, BarChart3, Zap } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

interface OverviewData {
  current:  { orders_count: number; revenue: number; avg_order_value: number; unique_customers: number };
  previous: { orders_count: number; revenue: number };
  changes:  { revenue: number; orders_count: number };
}

interface PlatformData {
  platform: string; revenue: number; orders_count: number; revenue_share: number;
}

const PLATFORM_COLORS: Record<string, string> = {
  shopify:     'bg-emerald-500',
  bolcom:      'bg-blue-500',
  etsy:        'bg-amber-500',
  woocommerce: 'bg-violet-500',
  amazon:      'bg-orange-500',
  pinterest:   'bg-rose-500',
};

const PLATFORM_LABELS: Record<string, string> = {
  shopify: 'Shopify', bolcom: 'Bol.com', etsy: 'Etsy',
  woocommerce: 'WooCommerce', amazon: 'Amazon', pinterest: 'Pinterest',
};

function formatCurrency(val: number) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
}

function StatCard({ label, value, change, icon: Icon, color }: any) {
  const positive = change >= 0;
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
      <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center mb-4`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className="font-display text-2xl font-800 text-white mb-2">{value}</div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium ${positive ? 'text-emerald-400' : 'text-rose-400'}`}>
          {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(change)}% vs last period
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [overview, setOverview]   = useState<OverviewData | null>(null);
  const [platforms, setPlatforms] = useState<PlatformData[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [period, setPeriod]       = useState('30d');
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [ov, pl, cn] = await Promise.all([
          api.get(`/analytics/overview?period=${period}`),
          api.get(`/analytics/by-platform?period=${period}`),
          api.get('/integrations'),
        ]);
        setOverview(ov.data);
        setPlatforms(pl.data.platforms);
        setConnections(cn.data.connections);
      } catch {}
      setLoading(false);
    };
    load();
  }, [period]);

  const hasConnections = connections.length > 0;
  const hasData = overview && overview.current.revenue > 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-800 text-white">
            Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.firstName} 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">Here's your store overview</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-800 rounded-xl p-1">
          {['7d', '30d', '90d'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                period === p ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {p === '7d' ? '7 days' : p === '30d' ? '30 days' : '90 days'}
            </button>
          ))}
        </div>
      </div>

      {/* No connections prompt */}
      {!hasConnections && (
        <div className="bg-brand-600/10 border border-brand-600/20 rounded-2xl p-6 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center">
              <Plug className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h3 className="font-display font-700 text-white mb-0.5">Connect your first store</h3>
              <p className="text-slate-400 text-sm">Link Shopify, Bol.com, or any platform to see your data.</p>
            </div>
          </div>
          <Link
            href="/dashboard/integrations"
            className="bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors flex-shrink-0"
          >
            Connect store →
          </Link>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Revenue"
          value={overview ? formatCurrency(overview.current.revenue) : '—'}
          change={overview?.changes.revenue}
          icon={TrendingUp}
          color="bg-emerald-600"
        />
        <StatCard
          label="Orders"
          value={overview ? overview.current.orders_count.toLocaleString() : '—'}
          change={overview?.changes.orders_count}
          icon={ShoppingCart}
          color="bg-brand-600"
        />
        <StatCard
          label="Avg Order Value"
          value={overview ? formatCurrency(overview.current.avg_order_value) : '—'}
          icon={BarChart3}
          color="bg-violet-600"
        />
        <StatCard
          label="Unique Customers"
          value={overview ? overview.current.unique_customers.toLocaleString() : '—'}
          icon={Users}
          color="bg-amber-600"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Platform breakdown */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-700 text-white">Revenue by platform</h2>
            <Link href="/dashboard/analytics" className="text-xs text-brand-400 hover:text-brand-300">
              View details →
            </Link>
          </div>

          {platforms.length > 0 ? (
            <div className="space-y-4">
              {platforms.map(p => (
                <div key={p.platform}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${PLATFORM_COLORS[p.platform] ?? 'bg-slate-500'}`} />
                      <span className="text-sm text-slate-300">{PLATFORM_LABELS[p.platform] ?? p.platform}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-400">{p.orders_count} orders</span>
                      <span className="font-medium text-white">{formatCurrency(p.revenue)}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${PLATFORM_COLORS[p.platform] ?? 'bg-slate-500'} transition-all`}
                      style={{ width: `${p.revenue_share}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No data yet — connect a store to get started</p>
            </div>
          )}
        </div>

        {/* Connected stores */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-700 text-white">Connected stores</h2>
            <Link href="/dashboard/integrations" className="text-xs text-brand-400 hover:text-brand-300">
              Manage →
            </Link>
          </div>

          {connections.length > 0 ? (
            <div className="space-y-3">
              {connections.map(c => (
                <div key={c.id} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-xl">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    c.status === 'active' ? 'bg-emerald-400' :
                    c.status === 'error'  ? 'bg-rose-400' : 'bg-slate-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{c.shop_name}</div>
                    <div className="text-xs text-slate-400 capitalize">{PLATFORM_LABELS[c.platform] ?? c.platform}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Plug className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 text-sm mb-4">No stores connected yet</p>
              <Link
                href="/dashboard/integrations"
                className="text-xs bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Add store
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* AI Insight teaser */}
      <div className="mt-6 bg-gradient-to-r from-brand-900/40 to-violet-900/30 border border-brand-700/30 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center flex-shrink-0">
          <Zap className="w-5 h-5 text-brand-400" fill="currentColor" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-white mb-0.5">AI insights coming soon</div>
          <div className="text-xs text-slate-400">Connect your store and MarketGrowth AI will start analysing your data automatically.</div>
        </div>
      </div>
    </div>
  );
}
