'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp, ShoppingCart, Users, BarChart3,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { api } from '@/lib/api';
import { ExportButton } from '@/components/dashboard/ExportButton';

const PLATFORM_COLORS: Record<string, string> = {
  shopify:     '#10b981',
  bolcom:      '#3b82f6',
  etsy:        '#f59e0b',
  woocommerce: '#8b5cf6',
  amazon:      '#f97316',
  pinterest:   '#f43f5e',
};

const PLATFORM_LABELS: Record<string, string> = {
  shopify:     'Shopify',
  bolcom:      'Bol.com',
  etsy:        'Etsy',
  woocommerce: 'WooCommerce',
  amazon:      'Amazon',
  pinterest:   'Pinterest',
};

function formatCurrency(val: number) {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency', currency: 'EUR',
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(val ?? 0);
}

function normalizeDate(raw: string): string {
  if (!raw) return '';
  return raw.split('T')[0];
}

function formatDateLabel(dateStr: string, period: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  if (period === '7d') return d.toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric' });
  return d.toLocaleDateString('nl-NL', { month: 'short', day: 'numeric' });
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className="text-white font-semibold text-sm">{formatCurrency(payload[0]?.value ?? 0)}</p>
      {payload[1] && (
        <p className="text-slate-400 text-xs mt-0.5">{payload[1].value} orders</p>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const [period,      setPeriod]      = useState<'7d' | '30d' | '90d'>('30d');
  const [overview,    setOverview]    = useState<any>(null);
  const [daily,       setDaily]       = useState<any[]>([]);
  const [platforms,   setPlatforms]   = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [ov, da, pl, tp] = await Promise.all([
          api.get(`/analytics/overview?period=${period}`),
          api.get(`/analytics/daily?period=${period}`),
          api.get(`/analytics/by-platform?period=${period}`),
          api.get(`/analytics/top-products?limit=10&period=${period}`),
        ]);
        setOverview(ov.data);
        setDaily(da.data.data ?? []);
        setPlatforms(pl.data.platforms ?? []);
        setTopProducts(tp.data.products ?? []);
      } catch (e) {
        console.error('Analytics load error:', e);
      }
      setLoading(false);
    };
    load();
  }, [period]);

  // Bouw volledige datumreeks — vul ontbrekende dagen op met €0
  const chartData = (() => {
    const byDate: Record<string, { revenue: number; orders: number }> = {};

    daily.forEach((d: any) => {
      const date = normalizeDate(d.date);
      if (!date) return;
      if (!byDate[date]) byDate[date] = { revenue: 0, orders: 0 };
      byDate[date].revenue += parseFloat(d.revenue ?? 0);
      byDate[date].orders  += parseInt(d.orders_count ?? 0, 10);
    });

    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const allDates: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      allDates.push(d.toISOString().split('T')[0]);
    }

    return allDates.map(date => ({
      date,
      label:   formatDateLabel(date, period),
      revenue: Math.round((byDate[date]?.revenue ?? 0) * 100) / 100,
      orders:  byDate[date]?.orders ?? 0,
    }));
  })();

  const daysWithData = chartData.filter(d => d.revenue > 0).length;

  const kpis = [
    {
      label:  'Revenue',
      value:  overview ? formatCurrency(parseFloat(overview.current.revenue)) : '—',
      change: overview?.changes.revenue,
      icon:   TrendingUp,
      color:  'bg-emerald-500',
    },
    {
      label:  'Orders',
      value:  overview ? Number(overview.current.orders_count).toLocaleString('nl-NL') : '—',
      change: overview?.changes.orders_count,
      icon:   ShoppingCart,
      color:  'bg-blue-500',
    },
    {
      label: 'Avg Order',
      value: overview ? formatCurrency(parseFloat(overview.current.avg_order_value)) : '—',
      icon:  BarChart3,
      color: 'bg-violet-500',
    },
    {
      label: 'Customers',
      value: overview ? Number(overview.current.unique_customers).toLocaleString('nl-NL') : '—',
      icon:  Users,
      color: 'bg-amber-500',
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-800 text-white mb-1">Sales Analytics</h1>
          <p className="text-slate-400 text-sm">All platforms combined</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton period={period} />
          <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/50 rounded-xl p-1">
            {(['7d', '30d', '90d'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  period === p
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p === '7d' ? '7 days' : p === '30d' ? '30 days' : '90 days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map(card => (
          <div key={card.label} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <div className={`w-8 h-8 rounded-lg ${card.color} flex items-center justify-center mb-3`}>
              <card.icon className="w-4 h-4 text-white" />
            </div>
            <div className="text-xs text-slate-400 mb-1">{card.label}</div>
            <div className="font-display text-xl font-800 text-white">
              {loading
                ? <span className="animate-pulse text-slate-600">...</span>
                : card.value
              }
            </div>
            {card.change !== undefined && !loading && (
              <div className={`flex items-center gap-1 text-xs mt-1 font-medium ${
                card.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {card.change >= 0
                  ? <ArrowUpRight className="w-3 h-3" />
                  : <ArrowDownRight className="w-3 h-3" />
                }
                {Math.abs(card.change)}%
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-700 text-white">Revenue over time</h2>
          {!loading && (
            <span className="text-xs text-slate-500">{daysWithData} days with data</span>
          )}
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval={period === '7d' ? 0 : period === '30d' ? 4 : 9}
              />
              <YAxis
                tickFormatter={v => `€${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#revenueGradient)"
                dot={false}
                activeDot={{ r: 4, fill: '#3b82f6' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Platform breakdown + Top products */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Per platform */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <h2 className="font-display font-700 text-white mb-4">Revenue by platform</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-10 bg-slate-700/40 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : platforms.length === 0 ? (
            <p className="text-slate-500 text-sm">No platform data yet.</p>
          ) : (
            <div className="space-y-3">
              {platforms.map((p: any) => {
                const revenue = parseFloat(p.revenue ?? 0);
                const maxRev  = parseFloat(platforms[0]?.revenue ?? 1);
                const pct     = maxRev > 0 ? (revenue / maxRev) * 100 : 0;
                const color   = PLATFORM_COLORS[p.platform] ?? '#64748b';
                const label   = PLATFORM_LABELS[p.platform] ?? p.platform;
                return (
                  <div key={p.platform}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-300">{label}</span>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>{p.orders_count} orders</span>
                        <span className="font-semibold text-white">{formatCurrency(revenue)}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top products */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <h2 className="font-display font-700 text-white mb-4">Top products</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-10 bg-slate-700/40 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : topProducts.length === 0 ? (
            <p className="text-slate-500 text-sm">No product data yet.</p>
          ) : (
            <div className="space-y-2">
              {topProducts.slice(0, 8).map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-slate-600 text-xs w-4 flex-shrink-0">{i + 1}</span>
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">{p.title}</p>
                      <p className="text-xs text-slate-500">
                        {PLATFORM_LABELS[p.platform] ?? p.platform} · {p.total_sold} sold
                      </p>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-white flex-shrink-0 ml-3">
                    {formatCurrency(parseFloat(p.total_revenue ?? 0))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
