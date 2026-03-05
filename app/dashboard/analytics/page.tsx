'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, ShoppingCart, Users, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { api } from '@/lib/api';

const PLATFORM_COLORS: Record<string, string> = {
  shopify: '#10b981', bolcom: '#3b82f6', etsy: '#f59e0b',
  woocommerce: '#8b5cf6', amazon: '#f97316', pinterest: '#f43f5e',
};
const PLATFORM_LABELS: Record<string, string> = {
  shopify: 'Shopify', bolcom: 'Bol.com', etsy: 'Etsy',
  woocommerce: 'WooCommerce', amazon: 'Amazon', pinterest: 'Pinterest',
};

function formatCurrency(val: number) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
}

export default function AnalyticsPage() {
  const [period, setPeriod]     = useState('30d');
  const [overview, setOverview] = useState<any>(null);
  const [daily, setDaily]       = useState<any[]>([]);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [ov, da, pl, tp] = await Promise.all([
          api.get(`/analytics/overview?period=${period}`),
          api.get(`/analytics/daily?period=${period}`),
          api.get(`/analytics/by-platform?period=${period}`),
          api.get('/analytics/top-products?limit=5'),
        ]);
        setOverview(ov.data);
        setDaily(da.data.data);
        setPlatforms(pl.data.platforms);
        setTopProducts(tp.data.products);
      } catch {}
      setLoading(false);
    };
    load();
  }, [period]);

  // Build chart data — group daily by date, sum revenue
  const chartData = (() => {
    const byDate: Record<string, number> = {};
    daily.forEach(d => {
      byDate[d.date] = (byDate[d.date] ?? 0) + parseFloat(d.revenue);
    });
    const entries = Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b));
    const max = Math.max(...entries.map(([, v]) => v), 1);
    return entries.map(([date, revenue]) => ({
      date,
      revenue,
      height: Math.max((revenue / max) * 100, 2),
      label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));
  })();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-800 text-white mb-1">Sales Analytics</h1>
          <p className="text-slate-400 text-sm">All platforms combined</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-800 rounded-xl p-1">
          {['7d', '30d', '90d'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                period === p ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
              }`}>
              {p === '7d' ? '7 days' : p === '30d' ? '30 days' : '90 days'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Revenue',      value: overview ? formatCurrency(overview.current.revenue) : '—',      change: overview?.changes.revenue,      icon: TrendingUp,   color: 'bg-emerald-500' },
          { label: 'Orders',       value: overview ? overview.current.orders_count.toLocaleString() : '—', change: overview?.changes.orders_count, icon: ShoppingCart, color: 'bg-brand-500' },
          { label: 'Avg Order',    value: overview ? formatCurrency(overview.current.avg_order_value) : '—', icon: BarChart3, color: 'bg-violet-500' },
          { label: 'Customers',    value: overview ? overview.current.unique_customers.toLocaleString() : '—', icon: Users, color: 'bg-amber-500' },
        ].map(card => (
          <div key={card.label} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <div className={`w-8 h-8 rounded-lg ${card.color} flex items-center justify-center mb-3`}>
              <card.icon className="w-4 h-4 text-white" />
            </div>
            <div className="text-xs text-slate-400 mb-1">{card.label}</div>
            <div className="font-display text-xl font-800 text-white">{card.value}</div>
            {card.change !== undefined && (
              <div className={`flex items-center gap-1 text-xs mt-1 font-medium ${card.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {card.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(card.change)}%
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 mb-6">
        <h2 className="font-display font-700 text-white mb-6">Revenue over time</h2>
        {chartData.length > 0 ? (
          <div className="flex items-end gap-1 h-40">
            {chartData.map((d, i) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                  {d.label}: {formatCurrency(d.revenue)}
                </div>
                <div
                  className="w-full rounded-t bg-brand-500/30 hover:bg-brand-500/60 transition-colors"
                  style={{ height: `${d.height}%` }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center">
            <p className="text-slate-500 text-sm">No data available for this period</p>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Platform breakdown */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <h2 className="font-display font-700 text-white mb-6">By platform</h2>
          {platforms.length > 0 ? (
            <div className="space-y-4">
              {platforms.map(p => (
                <div key={p.platform}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: PLATFORM_COLORS[p.platform] ?? '#64748b' }} />
                      <span className="text-sm text-slate-300">{PLATFORM_LABELS[p.platform] ?? p.platform}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-slate-500">{p.orders_count} orders</span>
                      <span className="font-medium text-white">{formatCurrency(p.revenue)}</span>
                      <span className="text-slate-500 w-10 text-right">{p.revenue_share}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${p.revenue_share}%`, background: PLATFORM_COLORS[p.platform] ?? '#64748b' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm text-center py-8">No platform data yet</p>
          )}
        </div>

        {/* Top products */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <h2 className="font-display font-700 text-white mb-6">Top products</h2>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-400">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{p.title}</div>
                    <div className="text-xs text-slate-500">{p.total_sold} sold · {PLATFORM_LABELS[p.platform] ?? p.platform}</div>
                  </div>
                  <div className="text-sm font-semibold text-white">{formatCurrency(p.total_revenue)}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm text-center py-8">No product data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
