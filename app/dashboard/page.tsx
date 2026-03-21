'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { OnboardingChecklist } from '@/components/dashboard/OnboardingChecklist';
import {
  TrendingUp, ShoppingCart, Zap, Store,
  ArrowUpRight, ArrowDownRight, Sparkles,
  RefreshCw, AlertTriangle, Package, ChevronRight,
  BarChart3
} from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface TodayStats {
  revenue:     number;
  orders:      number;
  avgOrder:    number;
  vsYesterday: { revenue: number; orders: number };
}

interface Overview {
  current: {
    revenue:         string;
    orders_count:    string;
    avg_order_value: string;
    unique_customers:string;
  };
  changes: { revenue: number; orders_count: number };
}

interface TopProduct {
  title:         string;
  platform:      string;
  total_sold:    number;
  total_revenue: string;
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
  fromCache: boolean;
}

interface Credits {
  used:      number;
  limit:     number | null;
  remaining: number | null;
  unlimited: boolean;
}

const PLATFORM_COLORS: Record<string, string> = {
  shopify:     '#10b981',
  bolcom:      '#3b82f6',
  etsy:        '#f59e0b',
  woocommerce: '#8b5cf6',
  amazon:      '#f97316',
};

function formatCurrency(val: number) {
   new Intl.NumberFormat('nl-NL', {
    style: 'currency', currency: 'EUR',
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(val ?? 0);
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Goedemorgen';
  if (h < 17) return 'Goedemiddag';
  return 'Goedenavond';
}

function ChangeBadge({ change }: { change: number }) {
  const up = change >= 0;
  return (
    <div className={'flex items-center gap-1 text-xs font-medium ' + (up ? 'text-emerald-400' : 'text-rose-400')}>
      {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {Math.abs(Math.round(change * 10) / 10)}% vs gisteren
    </div>
  );
}

export default function DashboardPage() {
  const { user }  = useAuthStore();
  const router    = useRouter();

  const [overview,     setOverview]     = useState<Overview | null>(null);
  const [today,        setToday]        = useState<TodayStats | null>(null);
  const [topProducts,  setTopProducts]  = useState<TopProduct[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [insight,      setInsight]      = useState<AiInsight | null>(null);
  const [credits,      setCredits]      = useState<Credits | null>(null);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      // Fase 1 — kritieke data parallel (winkels + dagcijfers)
      // Dit vult de KPI cards direct
      const [intRes, dailyRes] = await Promise.allSettled([
        api.get('/integrations'),
        api.get('/analytics/daily?period=7d'),
      ]);

      if (intRes.status === 'fulfilled') setIntegrations(intRes.value.data ?? []);

      if (dailyRes.status === 'fulfilled') {
        const rows = dailyRes.value.data.data ?? [];
        const today     = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const todayData = rows.filter((r: any) => r.date?.startsWith(today));
        const yestData  = rows.filter((r: any) => r.date?.startsWith(yesterday));
        const sumRev = (arr: any[]) => arr.reduce((s: number, r: any) => s + parseFloat(r.revenue ?? 0), 0);
        const sumOrd = (arr: any[]) => arr.reduce((s: number, r: any) => s + parseInt(r.orders_count ?? 0), 0);
        const todayRev = sumRev(todayData);
        const yestRev  = sumRev(yestData);
        const todayOrd = sumOrd(todayData);
        const yestOrd  = sumOrd(yestData);
        setToday({
          revenue:  todayRev,
          orders:   todayOrd,
          avgOrder: todayOrd > 0 ? todayRev / todayOrd : 0,
          vsYesterday: {
            revenue: yestRev > 0 ? ((todayRev - yestRev) / yestRev) * 100 : 0,
            orders:  yestOrd > 0 ? ((todayOrd - yestOrd) / yestOrd) * 100 : 0,
          },
        });
      }

      // Pagina tonen zodra kritieke data binnen is
      setLoading(false);

      // Fase 2 — secundaire data (overview, top products, AI, credits)
      // Laadt op de achtergrond zonder loading state
      const [ov, tp, ins, cr] = await Promise.allSettled([
        api.get('/analytics/overview?period=7d'),
        api.get('/analytics/top-products?limit=3&period=7d'),
        api.get('/ai/insights'),
        api.get('/ai/credits'),
      ]);
      if (ov.status === 'fulfilled')  setOverview(ov.value.data);
      if (tp.status === 'fulfilled')  setTopProducts(tp.value.data.products ?? []);
      if (ins.status === 'fulfilled') setInsight(ins.value.data);
      if (cr.status === 'fulfilled')  setCredits(cr.value.data);
    };
    load();
  }, []);

  const hasStores  = integrations.length > 0;
  const hasOrders  = today && today.orders > 0;
  const creditsStr = credits
    ? (credits.unlimited ? '∞' : (credits.remaining ?? 0).toLocaleString('nl-NL'))
    : '—';

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

      {/* Vandaag KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: 'Omzet vandaag',
            value: loading ? null : (hasOrders ? formatCurrency(today!.revenue) : '€ 0,00'),
            change: today?.vsYesterday.revenue,
            icon: TrendingUp, color: 'bg-emerald-500',
          },
          {
            label: 'Orders vandaag',
            value: loading ? null : (today?.orders ?? 0).toString(),
            change: today?.vsYesterday.orders,
            icon: ShoppingCart, color: 'bg-blue-500',
          },
          {
            label: 'AI credits',
            value: loading ? null : creditsStr,
            sub: 'Dit zijn je resterende credits',
            icon: Zap, color: 'bg-violet-500',
          },
          {
            label: 'Winkels',
            value: loading ? null : integrations.length.toString(),
            sub: integrations.length === 0 ? 'Nog geen winkels' : integrations.map(i => i.shopName || i.platformName).join(', '),
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
            {stat.sub && stat.value !== null && !stat.change && (
              <div className="text-xs text-slate-500 truncate">{stat.sub}</div>
            )}
          </div>
        ))}
      </div>

      {/* Twee kolommen: AI briefing + Top producten */}
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

          {loading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="h-3 bg-slate-700/50 rounded animate-pulse" />)}
            </div>
          ) : insight ? (
            <>
              <p className="text-white text-sm leading-relaxed mb-4">{insight.briefing}</p>
              {insight.alerts.length > 0 && (
                <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-3">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-300">{insight.alerts[0]}</p>
                </div>
              )}
              {insight.actions.slice(0, 2).map((action, i) => (
                <div key={i} className="flex items-start gap-2 mb-2 last:mb-0">
                  <div className={'w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ' + (
                    action.priority === 'high' ? 'bg-rose-400' :
                    action.priority === 'medium' ? 'bg-amber-400' : 'bg-slate-400'
                  )} />
                  <div>
                    <div className="text-xs font-medium text-white">{action.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{action.description}</div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <p className="text-slate-500 text-sm">Koppel een winkel voor AI inzichten.</p>
          )}
        </div>

        {/* Top producten deze week */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-slate-300">Top producten (7d)</h2>
            <Link href="/dashboard/products" className="ml-auto text-xs text-brand-400 hover:text-brand-300">
              Alle →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-10 bg-slate-700/50 rounded animate-pulse" />)}
            </div>
          ) : topProducts.length === 0 ? (
            <p className="text-slate-500 text-sm">Nog geen verkoopdata beschikbaar.</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-400 font-medium shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{p.title}</p>
                    <p className="text-xs text-slate-500">
                      {p.total_sold}x verkocht ·{' '}
                      <span style={{ color: PLATFORM_COLORS[p.platform] ?? '#64748b' }}>
                        {p.platform === 'bolcom' ? 'Bol.com' : p.platform}
                      </span>
                    </p>
                  </div>
                  <div className="text-sm font-semibold text-white shrink-0">
                    {formatCurrency(parseFloat(p.total_revenue))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Winkels sectie */}
      {hasStores ? (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-300">Gekoppelde winkels</h2>
            <Link href="/dashboard/integrations" className="text-xs text-slate-400 hover:text-white">
              Beheren →
            </Link>
          </div>
          <div className="space-y-3">
            {integrations.map(int => (
              <div key={int.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">
                  {(int.shopName || int.platformName || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {int.shopName || int.platformName}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className={'w-1.5 h-1.5 rounded-full ' + (int.status === 'active' ? 'bg-emerald-400' : 'bg-rose-400')} />
                    <span className="text-xs text-slate-500 capitalize">{int.status}</span>
                    {int.ordersCount > 0 && (
                      <span className="text-xs text-slate-500">{int.ordersCount} orders</span>
                    )}
                  </div>
                </div>
                <Link href="/dashboard/analytics" className="text-xs text-brand-400 hover:text-brand-300">
                  Bekijk →
                </Link>
              </div>
            ))}
          </div>
        </div>
      ) : (
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
      )}

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
