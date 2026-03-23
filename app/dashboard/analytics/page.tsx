'use client';

import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, ShoppingCart, Users, BarChart3, ArrowUpRight, ArrowDownRight, Calendar, Download } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { api } from '@/lib/api';
import { ExportButton } from '@/components/dashboard/ExportButton';

const PLATFORM_COLORS: Record<string, string> = {
  shopify: '#10b981', bolcom: '#3b82f6', etsy: '#f59e0b',
  woocommerce: '#8b5cf6', amazon: '#f97316', google_ads: '#4285F4',
};
const PLATFORM_LABELS: Record<string, string> = {
  shopify: 'Shopify', bolcom: 'Bol.com', etsy: 'Etsy',
  woocommerce: 'WooCommerce', amazon: 'Amazon', google_ads: 'Google Ads',
};

type Period = '24h' | '7d' | '30d' | '90d' | 'custom';

function formatCurrency(val: number) {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency', currency: 'EUR',
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(val ?? 0);
}

function formatDateLabel(dateStr: string, period: Period): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (period === '24h') {
    return d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
  }
  if (period === '7d') {
    return d.toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric' });
  }
  return d.toLocaleDateString('nl-NL', { month: 'short', day: 'numeric' });
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className="text-white font-semibold text-sm">{formatCurrency(payload[0]?.value ?? 0)}</p>
      {payload[1] && <p className="text-slate-400 text-xs mt-0.5">{payload[1].value} orders</p>}
    </div>
  );
}

function ChangeBadge({ change }: { change?: number }) {
  if (change === undefined || change === null) return null;
  const up = change >= 0;
  return (
    <div className={`flex items-center gap-1 text-xs font-medium ${up ? 'text-emerald-400' : 'text-rose-400'}`}>
      {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {Math.abs(Math.round(change * 10) / 10)}%
    </div>
  );
}

export default function AnalyticsPage() {
  const [period,      setPeriod]      = useState<Period>('30d');
  const [customFrom,  setCustomFrom]  = useState('');
  const [customTo,    setCustomTo]    = useState('');
  const [showCustom,  setShowCustom]  = useState(false);
  const [overview,    setOverview]    = useState<any>(null);
  const [daily,       setDaily]       = useState<any[]>([]);
  const [platforms,   setPlatforms]   = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading,     setLoading]     = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = period === 'custom' && customFrom && customTo
        ? `period=custom&from=${customFrom}&to=${customTo}`
        : `period=${period}`;

      const [ov, da, pl, tp] = await Promise.all([
        api.get(`/analytics/overview?${params}`),
        api.get(`/analytics/daily?${params}`),
        api.get(`/analytics/by-platform?${params}`),
        api.get(`/analytics/top-products?limit=10&${params}`),
      ]);
      setOverview(ov.data);
      setDaily(da.data.data ?? []);
      setPlatforms(pl.data.platforms ?? []);
      setTopProducts(tp.data.products ?? []);
    } catch (e) {
      console.error('Analytics load error:', e);
    }
    setLoading(false);
  }, [period, customFrom, customTo]);

  useEffect(() => {
    if (period !== 'custom') load();
  }, [period]);

  // Chart data
  const chartData = daily.map((d: any) => ({
    date:    d.date,
    label:   formatDateLabel(d.date, period),
    revenue: Math.round(parseFloat(d.revenue ?? 0) * 100) / 100,
    orders:  parseInt(d.orders_count ?? 0),
  }));

  const kpis = [
    { label: 'Revenue',       value: overview ? formatCurrency(parseFloat(overview.current.revenue)) : '—',        change: overview?.changes.revenue,      icon: TrendingUp, color: 'bg-emerald-500' },
    { label: 'Orders',        value: overview ? Number(overview.current.orders_count).toLocaleString() : '—',       change: overview?.changes.orders_count, icon: ShoppingCart, color: 'bg-blue-500' },
    { label: 'Avg Order',     value: overview ? formatCurrency(parseFloat(overview.current.avg_order_value)) : '—', change: undefined,                       icon: BarChart3, color: 'bg-violet-500' },
    { label: 'Customers',     value: overview ? Number(overview.current.unique_customers).toLocaleString() : '—',   change: undefined,                       icon: Users, color: 'bg-amber-500' },
  ];

  const PERIODS: { id: Period; label: string }[] = [
    { id: '24h',    label: 'Today' },
    { id: '7d',     label: '7 days' },
    { id: '30d',    label: '30 days' },
    { id: '90d',    label: '90 days' },
    { id: 'custom', label: 'Custom' },
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
          <ExportButton period={period === 'custom' ? `custom&from=${customFrom}&to=${customTo}` : period} />
        </div>
      </div>

      {/* Period selector */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/50 rounded-xl p-1">
          {PERIODS.map(p => (
            <button
              key={p.id}
              onClick={() => {
                setPeriod(p.id);
                setShowCustom(p.id === 'custom');
              }}
              className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
                period === p.id
                  ? 'bg-brand-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {p.id === 'custom' && <Calendar className="w-3 h-3 inline mr-1" />}
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom date range */}
        {showCustom && (
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/50 rounded-xl px-3 py-2">
            <input
              type="date"
              value={customFrom}
              onChange={e => setCustomFrom(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none"
            />
            <span className="text-slate-500 text-xs">→</span>
            <input
              type="date"
              value={customTo}
              onChange={e => setCustomTo(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none"
            />
            <button
              onClick={load}
              disabled={!customFrom || !customTo}
              className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-3 py-1 rounded-lg transition-colors disabled:opacity-40"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map(kpi => (
          <div key={kpi.label} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400">{kpi.label}</span>
              <div className={`w-7 h-7 rounded-lg ${kpi.color} bg-opacity-20 flex items-center justify-center`}>
                <kpi.icon className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            {loading ? (
              <div className="animate-pulse h-7 w-24 bg-slate-700 rounded" />
            ) : (
              <>
                <div className="text-xl font-display font-800 text-white mb-1">{kpi.value}</div>
                <ChangeBadge change={kpi.change} />
              </>
            )}
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 mb-6">
        <h2 className="font-display font-700 text-white mb-5">
          Revenue {period === '24h' ? 'today (by hour)' : `last ${period}`}
        </h2>
        {loading ? (
          <div className="animate-pulse h-48 bg-slate-700/50 rounded-xl" />
        ) : chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-slate-500 text-sm">No data for this period</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#4f46e5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} fill="url(#revGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">

        {/* Platform breakdown */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <h2 className="font-display font-700 text-white mb-5">Revenue by platform</h2>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="animate-pulse h-8 bg-slate-700/50 rounded-lg" />)}</div>
          ) : platforms.length === 0 ? (
            <p className="text-slate-500 text-sm">No data</p>
          ) : (
            <div className="space-y-4">
              {platforms.map((p: any) => {
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
                        <span>{Number(p.orders_count).toLocaleString()} orders</span>
                        <span className="text-white font-medium">{formatCurrency(parseFloat(p.revenue))}</span>
                        <span className="text-slate-500">{share}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${share}%`, background: color }} />
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
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="animate-pulse h-10 bg-slate-700/50 rounded-lg" />)}</div>
          ) : topProducts.length === 0 ? (
            <p className="text-slate-500 text-sm">No data</p>
          ) : (
            <div className="space-y-3">
              {topProducts.slice(0, 8).map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-bold text-slate-500 w-5 flex-shrink-0">#{i+1}</span>
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">{p.title}</p>
                      <p className="text-xs text-slate-500">{PLATFORM_LABELS[p.platform] ?? p.platform} · {p.total_sold} sold</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-emerald-400 flex-shrink-0 ml-3">
                    {formatCurrency(parseFloat(p.total_revenue))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
