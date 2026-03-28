'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  TrendingUp, ShoppingCart, Zap, Store,
  ArrowUpRight, ArrowDownRight, Sparkles, BarChart3,
  ChevronRight, RefreshCw,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { OnboardingChecklist } from '@/components/dashboard/OnboardingChecklist';

// ── Types ──────────────────────────────────────────────────────
interface Stats {
  revenue:    number;
  orders:     number;
  avgOrder:   number;
  change:     { revenue: number; orders: number };
}

interface TopProduct {
  title:        string;
  total_sold:   number;
  total_revenue: number;
  platform:     string;
}

interface Integration {
  id:           string;
  platformSlug: string;
  platformName: string;
  shopName:     string;
  status:       string;
  ordersCount:  number;
  lastSyncAt:   string | null;
}

interface AiInsight {
  briefing: string;
  actions:  { priority: string; title: string; description: string }[];
  alerts:   string[];
}

interface Credits { used: number; limit: number | null; remaining: number | null; unlimited: boolean; }

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(val ?? 0);
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Goedemorgen';
  if (h < 17) return 'Goedemiddag';
  return 'Goedenavond';
}

function ChangeBadge({ change, label = 'vs vorige week' }: { change: number; label?: string }) {
  const up = change >= 0;
  return (
    <div className={'flex items-center gap-1 text-xs font-medium ' + (up ? 'text-emerald-400' : 'text-rose-400')}>
      {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {Math.abs(Math.round(change * 10) / 10)}% {label}
    </div>
  );
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Nooit';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2)   return 'Zojuist';
  if (mins < 60)  return `${mins}m geleden`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}u geleden`;
  return `${Math.floor(hrs / 24)}d geleden`;
}

export default function DashboardPage() {
  const { user }  = useAuthStore();
  const router    = useRouter();

  const [stats,        setStats]        = useState<Stats | null>(null);
  const [topProducts,  setTopProducts]  = useState<TopProduct[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [insight,      setInsight]      = useState<AiInsight | null>(null);
  const [credits,      setCredits]      = useState<Credits | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [syncing,      setSyncing]      = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      // Fase 1 — kritieke data: winkels + 7d overzicht
      const [intRes, ovRes] = await Promise.allSettled([
        api.get('/integrations'),
        api.get('/analytics/overview?period=7d'),
      ]);

      if (intRes.status === 'fulfilled') {
        setIntegrations(intRes.value.data ?? []);
      }

      if (ovRes.status === 'fulfilled') {
        const curr = ovRes.value.data?.current;
        const prev = ovRes.value.data?.previous;
        const revenue  = parseFloat(curr?.revenue ?? 0);
        const prevRev  = parseFloat(prev?.revenue ?? 0);
        const orders   = parseInt(curr?.orders_count ?? 0);
        const prevOrd  = parseInt(prev?.orders_count ?? 0);
        setStats({
          revenue,
          orders,
          avgOrder: orders > 0 ? revenue / orders : 0,
          change: {
            revenue: ovRes.value.data?.changes?.revenue ?? 0,
            orders:  ovRes.value.data?.changes?.orders_count ?? 0,
          },
        });
      }

      setLoading(false);

      // Fase 2 — achtergrond: top producten, AI insights, credits
      const [tp, ins, cr] = await Promise.allSettled([
        api.get('/analytics/top-products?limit=3&period=7d'),
        api.get('/ai/insights'),
        api.get('/ai/credits'),
      ]);
      if (tp.status === 'fulfilled')  setTopProducts(tp.value.data.products ?? []);
      if (ins.status === 'fulfilled') setInsight(ins.value.data);
      if (cr.status === 'fulfilled')  setCredits(cr.value.data);
    };

    load();
  }, []);

  // Handmatige sync per integratie
  const handleSync = async (integrationId: string) => {
    setSyncing(integrationId);
    try {
      await api.post(`/integrations/${integrationId}/sync`, { jobType: 'incremental' });
      // Herlaad stats na 4 seconden
      setTimeout(async () => {
        const [intRes, ovRes] = await Promise.allSettled([
          api.get('/integrations'),
          api.get('/analytics/overview?period=7d'),
        ]);
        if (intRes.status === 'fulfilled') setIntegrations(intRes.value.data ?? []);
        if (ovRes.status === 'fulfilled') {
          const curr = ovRes.value.data?.current;
          const revenue = parseFloat(curr?.revenue ?? 0);
          const orders  = parseInt(curr?.orders_count ?? 0);
          setStats({
            revenue,
            orders,
            avgOrder: orders > 0 ? revenue / orders : 0,
            change: {
              revenue: ovRes.value.data?.changes?.revenue ?? 0,
              orders:  ovRes.value.data?.changes?.orders_count ?? 0,
            },
          });
        }
      }, 4000);
    } catch {}
    setSyncing(null);
  };

  const creditsStr = credits
    ? (credits.unlimited ? '∞' : (credits.remaining ?? 0).toLocaleString('nl-NL'))
    : '—';

  // Filter alleen echte winkels (geen advertentie integraties)
  const stores = integrations.filter(
    i => !['bolcom_ads', 'google_ads'].includes(i.platformSlug) && i.status !== 'disconnected'
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <OnboardingChecklist />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-800 text-white">
            {getGreeting()}, {user?.firstName ?? 'daar'} 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Link
          href="/dashboard/ai-insights"
          className="flex items-center gap-2 bg-brand-600/10 border border-brand-600/20 hover:bg-brand-600/20 text-brand-400 text-xs font-medium px-3 py-2 rounded-xl transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          AI Insights
        </Link>
      </div>

      {/* 7-dagen KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: 'Omzet (7d)',
            value: loading ? null : formatCurrency(stats?.revenue ?? 0),
            change: stats?.change.revenue,
            icon: TrendingUp, color: 'bg-emerald-500',
          },
          {
            label: 'Orders (7d)',
            value: loading ? null : (stats?.orders ?? 0).toString(),
            change: stats?.change.orders,
            icon: ShoppingCart, color: 'bg-blue-500',
          },
          {
            label: 'AI credits',
            value: loading ? null : creditsStr,
            sub: 'Resterende credits',
            icon: Zap, color: 'bg-violet-500',
          },
          {
            label: 'Winkels',
            value: loading ? null : stores.length.toString(),
            sub: stores.length === 0 ? 'Nog geen winkels' : stores.map(i => i.shopName || i.platformName).join(', '),
            icon: Store, color: 'bg-amber-500',
          },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-800/60 rounded-2xl border border-slate-700/50 p-5">
            <div className={'w-8 h-8 rounded-lg ' + stat.color + ' flex items-center justify-center mb-3'}>
              <stat.icon className="w-4 h-4 text-white" />
            </div>
            <div className="text-xs font-medium text-slate-400 mb-1">{stat.label}</div>
            <div className="font-display text-2xl font-800 text-white mb-1">
              {stat.value === null
                ? <span className="text-slate-600 animate-pulse">...</span>
                : stat.value
              }
            </div>
            {stat.change !== undefined && stat.value !== null && (
              <ChangeBadge change={stat.change} />
            )}
            {stat.sub && stat.value !== null && stat.change === undefined && (
              <div className="text-xs text-slate-500 truncate">{stat.sub}</div>
            )}
          </div>
        ))}
      </div>

      {/* AI Briefing + Top producten */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* AI Briefing */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <h2 className="text-sm font-semibold text-slate-300">AI Briefing</h2>
            <Link href="/dashboard/ai-insights" className="ml-auto text-xs text-brand-400 hover:text-brand-300">
              Meer →
            </Link>
          </div>

          {!insight ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="h-3 bg-slate-700/50 rounded animate-pulse" />)}
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">{insight.briefing}</p>
              {insight.alerts?.length > 0 && (
                <div className="mb-3 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-xs text-amber-400 font-medium">⚠ {insight.alerts[0]}</p>
                </div>
              )}
              <div className="space-y-2">
                {insight.actions?.slice(0, 2).map((a, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                      a.priority === 'high' ? 'bg-rose-400' :
                      a.priority === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
                    }`} />
                    <div>
                      <p className="text-xs font-semibold text-white">{a.title}</p>
                      <p className="text-xs text-slate-500">{a.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Top producten */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-slate-300">Top producten (7d)</h2>
            <Link href="/dashboard/products" className="ml-auto text-xs text-brand-400 hover:text-brand-300">
              Alle →
            </Link>
          </div>

          {topProducts.length === 0 ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="h-8 bg-slate-700/50 rounded animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-400">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{p.title}</p>
                    <p className="text-xs text-slate-500">
                      {p.total_sold}x verkocht · <span className="text-brand-400">{p.platform}</span>
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-400">
                    {formatCurrency(parseFloat(String(p.total_revenue)))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Winkels met sync knop */}
      {stores.length > 0 ? (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-300">Gekoppelde winkels</h2>
            <Link href="/dashboard/shops" className="text-xs text-brand-400 hover:text-brand-300">
              Beheer →
            </Link>
          </div>
          <div className="space-y-3">
            {stores.map((int) => (
              <div key={int.id} className="flex items-center gap-3 p-3 bg-slate-900/40 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-600/30 flex items-center justify-center text-xs font-bold text-brand-400">
                  {(int.shopName || int.platformName)?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {int.shopName || int.platformName}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className={'w-1.5 h-1.5 rounded-full ' + (int.status === 'active' ? 'bg-emerald-400' : 'bg-rose-400')} />
                    <span className="text-xs text-slate-500">
                      Sync {timeAgo(int.lastSyncAt)}
                    </span>
                    {int.ordersCount > 0 && (
                      <span className="text-xs text-slate-500">{int.ordersCount} orders</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleSync(int.id)}
                  disabled={syncing === int.id}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing === int.id ? 'animate-spin' : ''}`} />
                  Sync
                </button>
                <Link href="/dashboard/analytics" className="text-xs text-brand-400 hover:text-brand-300">
                  Analytics →
                </Link>
              </div>
            ))}
          </div>
        </div>
      ) : !loading ? (
        <div className="bg-slate-800/60 rounded-2xl border border-slate-700/50 p-8 text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-600/20 border border-brand-600/30 flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-6 h-6 text-brand-400" />
          </div>
          <h2 className="font-display font-700 text-white mb-2">Koppel je eerste winkel</h2>
          <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">
            Verbind je Shopify, Bol.com of WooCommerce winkel om AI-inzichten te ontvangen.
          </p>
          <button
            onClick={() => router.push('/dashboard/integrations')}
            className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
          >
            Winkel koppelen →
          </button>
        </div>
      ) : null}

      {/* Snelle navigatie */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Sales Analytics', icon: TrendingUp, href: '/dashboard/analytics', color: 'text-emerald-400' },
          { label: 'AI Insights',     icon: Sparkles,   href: '/dashboard/ai-insights', color: 'text-brand-400' },
          { label: 'Advertising',     icon: BarChart3,  href: '/dashboard/ads', color: 'text-violet-400' },
        ].map(item => (
          <Link
            key={item.label}
            href={item.href}
            className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 flex items-center gap-3 hover:border-slate-600 transition-colors"
          >
            <item.icon className={'w-4 h-4 ' + item.color} />
            <span className="text-sm text-slate-300 font-medium">{item.label}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 ml-auto" />
          </Link>
        ))}
      </div>
    </div>
  );
}
