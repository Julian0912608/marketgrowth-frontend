'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import {
  TrendingUp, ShoppingCart, Zap, Store,
  ArrowUpRight, ArrowDownRight, Sparkles,
  RefreshCw, AlertTriangle
} from 'lucide-react';
import { api } from '@/lib/api';

interface Overview {
  current: {
    revenue:          string;
    orders_count:     string;
    avg_order_value:  string;
    unique_customers: string;
  };
  changes: {
    revenue:      number;
    orders_count: number;
  };
}

interface Integration {
  id:          string;
  platformSlug: string;
  platformName: string;
  shopName:    string;
  status:      string;
  ordersCount: number;
  lastSyncAt:  string | null;
}

interface AiInsight {
  briefing:  string;
  actions:   { priority: string; title: string; description: string }[];
  alerts:    string[];
  fromCache: boolean;
}

interface Credits {
  used:      number;
  limit:     number | null;
  remaining: number | null;
  unlimited: boolean;
}

function formatCurrency(val: string | number, currency = 'EUR') {
  const n = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(n)) return '—';
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

function ChangeTag({ change }: { change?: number }) {
  if (change === undefined || change === null) return null;
  const up = change >= 0;
  return (
    <div className={'flex items-center gap-1 text-xs font-medium mt-1 ' + (up ? 'text-emerald-400' : 'text-rose-400')}>
      {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {Math.abs(change)}% vs vorige periode
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router   = useRouter();

  const [overview,     setOverview]     = useState<Overview | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [insight,      setInsight]      = useState<AiInsight | null>(null);
  const [credits,      setCredits]      = useState<Credits | null>(null);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [ov, int, ins, cr] = await Promise.allSettled([
          api.get('/analytics/overview?period=30d'),
          api.get('/integrations'),
          api.get('/ai/insights'),
          api.get('/ai/credits'),
        ]);

        if (ov.status === 'fulfilled')  setOverview(ov.value.data);
        if (int.status === 'fulfilled') setIntegrations(int.value.data ?? []);
        if (ins.status === 'fulfilled') setInsight(ins.value.data);
        if (cr.status === 'fulfilled')  setCredits(cr.value.data);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const hasStores = integrations.length > 0;
  const hasData   = overview && parseFloat(overview.current.orders_count) > 0;

  const stats = [
    {
      label: 'Revenue (30d)',
      value: hasData ? formatCurrency(overview.current.revenue) : '—',
      sub:   hasData ? undefined : 'Connect your store to see data',
      change: overview?.changes.revenue,
      icon:  TrendingUp,
      color: 'bg-emerald-500',
    },
    {
      label: 'Orders (30d)',
      value: hasData ? Number(overview.current.orders_count).toLocaleString('nl-NL') : '—',
      sub:   hasData ? undefined : 'Connect your store to see data',
      change: overview?.changes.orders_count,
      icon:  ShoppingCart,
      color: 'bg-blue-500',
    },
    {
      label: 'AI credits left',
      value: credits
        ? (credits.unlimited ? 'Unlimited' : (credits.remaining ?? 0).toLocaleString('nl-NL'))
        : '—',
      sub:   'Resets next billing cycle',
      icon:  Zap,
      color: 'bg-violet-500',
    },
    {
      label: 'Connected stores',
      value: String(integrations.length),
      sub:   integrations.length === 0 ? 'No stores connected' : integrations.map(i => i.shopName || i.platformName).join(', '),
      icon:  Store,
      color: 'bg-amber-500',
    },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-800 text-white">
          {getGreeting()}, {user?.firstName ?? 'there'} 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {hasStores ? "Here's what's happening with your store today." : "Connect your store to start seeing insights."}
        </p>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="bg-slate-800/60 rounded-2xl border border-slate-700/50 p-5">
            <div className={'w-8 h-8 rounded-lg ' + stat.color + ' flex items-center justify-center mb-3'}>
              <stat.icon className="w-4 h-4 text-white" />
            </div>
            <div className="text-xs font-medium text-slate-400 mb-1">{stat.label}</div>
            <div className="font-display text-2xl font-800 text-white">
              {loading ? <span className="animate-pulse text-slate-600">...</span> : stat.value}
            </div>
            {!loading && stat.change !== undefined && <ChangeTag change={stat.change} />}
            {!loading && stat.sub && !stat.change && (
              <div className="text-xs text-slate-500 mt-1 truncate">{stat.sub}</div>
            )}
          </div>
        ))}
      </div>

      {/* AI Briefing */}
      {insight && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <h2 className="text-sm font-semibold text-slate-300">AI Briefing van vandaag</h2>
            <button
              onClick={() => router.push('/dashboard/ai-insights')}
              className="ml-auto text-xs text-brand-400 hover:text-brand-300"
            >
              Meer inzichten →
            </button>
          </div>
          <p className="text-white text-sm leading-relaxed mb-4">{insight.briefing}</p>

          {/* Top 2 acties */}
          {insight.actions.slice(0, 2).map((action, i) => (
            <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
              <div className={'w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ' + (action.priority === 'high' ? 'bg-rose-400' : action.priority === 'medium' ? 'bg-amber-400' : 'bg-slate-400')} />
              <div>
                <div className="text-sm font-medium text-white">{action.title}</div>
                <div className="text-xs text-slate-400 mt-0.5">{action.description}</div>
              </div>
            </div>
          ))}

          {/* Alerts */}
          {insight.alerts.length > 0 && (
            <div className="mt-4 flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300">{insight.alerts[0]}</p>
            </div>
          )}
        </div>
      )}

      {/* Connected stores status */}
      {hasStores ? (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-300">Connected stores</h2>
            <button
              onClick={() => router.push('/dashboard/integrations')}
              className="text-xs text-slate-400 hover:text-white"
            >
              Manage →
            </button>
          </div>
          <div className="space-y-3">
            {integrations.map(integration => (
              <div key={integration.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-400">
                  {(integration.shopName || integration.platformName || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {integration.shopName || integration.platformName}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className={'w-1.5 h-1.5 rounded-full ' + (integration.status === 'active' ? 'bg-emerald-400' : 'bg-rose-400')} />
                    <span className="text-xs text-slate-500 capitalize">{integration.status}</span>
                    {integration.ordersCount > 0 && (
                      <span className="text-xs text-slate-500">{integration.ordersCount} orders</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => router.push('/dashboard/analytics')}
                  className="text-xs text-brand-400 hover:text-brand-300"
                >
                  View →
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Connect store CTA */
        <div className="bg-slate-800/60 rounded-2xl border border-slate-700/50 p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-brand-600/20 border border-brand-600/30 flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-6 h-6 text-brand-400" />
          </div>
          <h2 className="font-display font-700 text-white mb-2">Connect your first store</h2>
          <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">
            Link your Shopify, WooCommerce, or Bol.com store to start seeing AI-powered insights.
          </p>
          <button
            onClick={() => router.push('/dashboard/integrations')}
            className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
          >
            Connect store →
          </button>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Sales Analytics', icon: TrendingUp,  href: '/dashboard/analytics', color: 'text-emerald-400' },
          { label: 'AI Insights',     icon: Sparkles,    href: '/dashboard/ai-insights', color: 'text-brand-400' },
          { label: 'Advertising',     icon: RefreshCw,   href: '/dashboard/ads', color: 'text-violet-400' },
        ].map(item => (
          <button
            key={item.label}
            onClick={() => router.push(item.href)}
            className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 flex items-center gap-3 hover:border-slate-600 transition-colors text-left"
          >
            <item.icon className={'w-4 h-4 ' + item.color} />
            <span className="text-sm text-slate-300 font-medium">{item.label}</span>
          </button>
        ))}
      </div>

    </div>
  );
}
