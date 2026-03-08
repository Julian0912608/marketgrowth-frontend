'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, ShoppingCart, Users, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
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
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
  }).format(val);
}

// Normaliseer datum — PostgreSQL stuurt soms ISO timestamps, soms "YYYY-MM-DD"
function normalizeDate(raw: string): string {
  if (!raw) return '';
  // Haal alleen het datum-deel op (voor het T-teken)
  return raw.split('T')[0];
}

function formatDateLabel(dateStr: string, period: string): string {
  const d = new Date(dateStr + 'T12:00:00'); // voeg T12 toe om timezone-issues te voorkomen
  if (period === '7d') {
    return d.toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric' });
  }
  if (period === '90d') {
    return d.toLocaleDateString('nl-NL', { month: 'short', day: 'numeric' });
  }
  return d.toLocaleDateString('nl-NL', { month: 'short', day: 'numeric' });
}

// Custom Recharts tooltip
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className="text-white font-semibold text-sm">
        {formatCurrency(payload[0]?.value ?? 0)}
      </p>
      {payload[1] && (
        <p className="text-slate-400 text-xs mt-0.5">
          {payload[1].name}: {payload[1].value} orders
        </p>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const [period, setPeriod]         = useState('30d');
  const [overview, setOverview]     = useState<any>(null);
  const [daily, setDaily]           = useState<any[]>([]);
  const [platforms, setPlatforms]   = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [ov, da, pl, tp] = await Promise.all([
          api.get(`/analytics/overview?period=${period}`),
          api.get(`/analytics/daily?period=${period}`),
          api.get(`/analytics/by-platform?period=${period}`),
          api.get('/analytics/top-products?limit=10'),
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

  // Bouw chart data — groepeer per datum, normaliseer ISO timestamps
  const chartData = (() => {
    const byDate: Record<string, { revenue: number; orders: number }> = {};

    daily.forEach(d => {
      const date = normalizeDate(d.date);
      if (!date) return;
      if (!byDate[date]) byDate[date] = { revenue: 0, orders: 0 };
      byDate[date].revenue += parseFloat(d.revenue ?? 0);
      byDate[date].orders  += parseInt(d.orders_count ?? 0, 10);
    });

    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, vals]) => ({
        date,
        label:   formatDateLabel(date, period),
        revenue: Math.round(vals.revenue * 100) / 100,
        orders:  vals.orders,
      }));
  })();

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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map(card => (
          <div
            key={card.label}
            className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5"
          >
            <div className={`w-8 h-8 rounded-lg ${card.color} flex items-center justify-center mb-3`}>
              <card.icon className="w-4 h-4 text-white" />
            </div>
            <div className="text-xs text-slate-400 mb-1">{card.label}</div>
            <div className="font-display text-xl font-800 text-white">
              {loading ? <span className="animate-pulse text-slate-600">...</span> : card.value}
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
          {chartData.length > 0 && (
            <span className="text-xs text-slate-500">{chartData.length} days with data</span>
          )}
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
            No data for this period
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
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={v => `€${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={55}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#revenueGradient)"
                dot={false}
                activeDot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* By platform + Top products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* By platform */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <h2 className="font-display font-700 text-white mb-5">By platform</h2>
          {loading ? (
            <div className="space-y-3">
              {[1,2].map(i => (
                <div key={i} className="animate-pulse h-8 bg-slate-700/50 rounded-lg" />
              ))}
            </div>
          ) : platforms.length === 0 ? (
            <p className="text-slate-500 text-sm">No data</p>
          ) : (
            <div className="space-y-4">
              {platforms.map(p => {
                const color = PLATFORM_COLORS[p.platform] ?? '#64748b';
                const label = PLATFORM_LABELS[p.platform] ?? p.platform;
                const share = parseFloat(p.revenue_share ?? 0);
                return (
                  <div key={p.platform}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                        <span className="text-sm text-white font-medium">{label}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>{Number(p.orders_count).toLocaleString('nl-NL')} orders</span>
                        <span className="text-white font-medium">
                          {formatCurrency(parseFloat(p.revenue))}
                        </span>
                        <span className="text-slate-500">{share}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${share}%`, background: color }}
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
          <h2 className="font-display font-700 text-white mb-5">Top products</h2>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="animate-pulse h-10 bg-slate-700/50 rounded-lg" />
              ))}
            </div>
          ) : topProducts.length === 0 ? (
            <p className="text-slate-500 text-sm">No data</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => {
                const color = PLATFORM_COLORS[p.platform] ?? '#64748b';
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-400 font-medium shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{p.title}</p>
                      <p className="text-xs text-slate-500">
                        {Number(p.total_sold).toLocaleString('nl-NL')} sold ·{' '}
                        <span style={{ color }}>{PLATFORM_LABELS[p.platform] ?? p.platform}</span>
                      </p>
                    </div>
                    <div className="text-sm font-semibold text-white shrink-0">
                      {formatCurrency(parseFloat(p.total_revenue))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
