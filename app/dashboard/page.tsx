'use client';

// app/dashboard/page.tsx
//
// FIXES:
//  1. Proper empty state als er geen integraties zijn (geen nullen meer)
//  2. Error boundaries rondom API-afhankelijke secties
//  3. AI credits tonen met limiet-context per plan
//  4. Starter plan ziet AI Insights als available (100 credits)

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  TrendingUp, ShoppingCart, Zap, ArrowUpRight, ArrowDownRight,
  Store, RefreshCw, Sparkles, Plus, AlertCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { usePermissions } from '@/lib/usePermissions';
import { AppLoader } from '@/components/dashboard/AppLoader';
import { OnboardingChecklist } from '@/components/dashboard/OnboardingChecklist';
import { PageErrorBoundary, CardErrorBoundary } from '@/components/ErrorBoundary';

// ── Types ─────────────────────────────────────────────────────
interface Stats {
  revenue:  number;
  orders:   number;
  avgOrder: number;
  change:   { revenue: number; orders: number };
}

interface TopProduct {
  title:       string;
  platform:    string;
  units_sold:  number;
  revenue:     number;
}

interface Integration {
  id:           string;
  platformSlug: string;
  shopName:     string;
  status:       string;
  lastSyncAt:   string | null;
  ordersCount:  number;
}

interface AiInsight {
  briefing: string;
  actions:  { priority: string; title: string; description: string; channel: string }[];
  alerts:   string[];
}

interface Credits {
  used:      number;
  limit:     number | null;
  remaining: number | null;
  unlimited: boolean;
}

// ── Helpers ───────────────────────────────────────────────────
function formatCurrency(n: number) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n ?? 0);
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function ChangeBadge({ change, label = 'vs last week' }: { change: number; label?: string }) {
  const up = change >= 0;
  return (
    <div className={'flex items-center gap-1 text-xs font-medium ' + (up ? 'text-emerald-400' : 'text-rose-400')}>
      {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {Math.abs(Math.round(change * 10) / 10)}% {label}
    </div>
  );
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2)   return 'Just now';
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Empty state als er geen stores gekoppeld zijn ─────────────
function EmptyDashboard() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-600/10 border border-brand-600/20 flex items-center justify-center mb-6">
        <Store className="w-8 h-8 text-brand-400" />
      </div>
      <h2 className="font-display text-2xl font-800 text-white mb-3">
        Connect your first store
      </h2>
      <p className="text-slate-400 text-sm max-w-sm leading-relaxed mb-8">
        Connect Bol.com, Shopify, or another platform and MarketGrow will start analysing your data immediately.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/dashboard/integrations"
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-3 rounded-xl transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Connect a store
        </Link>
        <Link
          href="/dashboard/ai-insights"
          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-5 py-3 rounded-xl transition-colors text-sm"
        >
          <Sparkles className="w-4 h-4 text-brand-400" />
          Preview AI Insights
        </Link>
      </div>

      {/* Platforms grid */}
      <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg">
        {[
          { name: 'Shopify',     color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
          { name: 'Bol.com',     color: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
          { name: 'WooCommerce', color: 'bg-purple-500/10 border-purple-500/20 text-purple-400' },
          { name: 'Etsy',        color: 'bg-orange-500/10 border-orange-500/20 text-orange-400' },
        ].map(p => (
          <div key={p.name} className={`rounded-xl border px-3 py-2 text-xs font-semibold text-center ${p.color}`}>
            {p.name}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Credit bar voor Starter plan ──────────────────────────────
function CreditBar({ credits, planSlug }: { credits: Credits | null; planSlug: string }) {
  if (!credits) return null;
  if (credits.unlimited) return null;

  const used      = credits.used ?? 0;
  const limit     = credits.limit ?? 100;
  const pct       = Math.min(100, Math.round((used / limit) * 100));
  const isLow     = pct >= 80;
  const isExhausted = pct >= 100;

  return (
    <div className={`rounded-xl border p-4 mb-6 ${isExhausted ? 'bg-rose-500/5 border-rose-500/20' : isLow ? 'bg-amber-500/5 border-amber-500/20' : 'bg-slate-800/50 border-slate-700/50'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Zap className={`w-3.5 h-3.5 ${isExhausted ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-brand-400'}`} />
          <span className="text-xs font-medium text-slate-300">
            AI Credits this month — {planSlug.charAt(0).toUpperCase() + planSlug.slice(1)} plan
          </span>
        </div>
        <span className={`text-xs font-semibold ${isExhausted ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-slate-400'}`}>
          {used} / {limit}
        </span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isExhausted ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-brand-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {isExhausted && (
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-rose-400">Monthly limit reached</p>
          <Link href="/settings/billing" className="text-xs text-brand-400 font-medium hover:text-brand-300 transition-colors">
            Upgrade plan →
          </Link>
        </div>
      )}
      {isLow && !isExhausted && (
        <p className="text-xs text-amber-400 mt-2">
          {limit - used} credits remaining — <Link href="/settings/billing" className="underline underline-offset-2 hover:text-amber-300">upgrade for more</Link>
        </p>
      )}
    </div>
  );
}

// ── Dashboard stats card ──────────────────────────────────────
function StatCard({
  label, value, change, icon: Icon, color, sub,
}: {
  label:   string;
  value:   string | null;
  change?: number;
  icon:    any;
  color:   string;
  sub?:    string;
}) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-slate-400 text-xs font-medium">{label}</p>
        <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      {value === null ? (
        <div className="h-7 bg-slate-700/50 rounded-lg animate-pulse mb-2" />
      ) : (
        <p className="font-display text-2xl font-800 text-white mb-1">{value}</p>
      )}
      {sub && <p className="text-slate-500 text-xs">{sub}</p>}
      {change !== undefined && value !== null && <ChangeBadge change={change} />}
    </div>
  );
}

// ── Hoofdcomponent ────────────────────────────────────────────
export default function DashboardPage() {
  const { user }        = useAuthStore();
  const { planSlug }    = usePermissions();

  const [stats,        setStats]        = useState<Stats | null>(null);
  const [topProducts,  setTopProducts]  = useState<TopProduct[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [insight,      setInsight]      = useState<AiInsight | null>(null);
  const [credits,      setCredits]      = useState<Credits | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [syncing,      setSyncing]      = useState<string | null>(null);
  const [appReady,     setAppReady]     = useState(false);
  const [insightError, setInsightError] = useState(false);

  const handleAppReady = (data: {
    integrations: any[];
    overview:     any;
    topProducts:  any[];
    credits:      any;
  }) => {
    setIntegrations(data.integrations ?? []);
    setTopProducts(data.topProducts ?? []);
    setCredits(data.credits);

    if (data.overview) {
      const curr    = data.overview.current;
      const revenue = parseFloat(curr?.revenue ?? 0);
      const orders  = parseInt(curr?.orders_count ?? 0);
      setStats({
        revenue,
        orders,
        avgOrder: orders > 0 ? revenue / orders : 0,
        change: {
          revenue: data.overview.changes?.revenue ?? 0,
          orders:  data.overview.changes?.orders_count ?? 0,
        },
      });
    }

    setLoading(false);
    setAppReady(true);

    // Achtergrond: AI insights laden (alle plannen hebben toegang)
    api.get('/ai/insights')
      .then(res => setInsight(res.data))
      .catch(() => setInsightError(true));
  };

  const reloadStats = async () => {
    try {
      const [intRes, ovRes] = await Promise.allSettled([
        api.get('/integrations'),
        api.get('/analytics/overview?period=7d'),
      ]);
      if (intRes.status === 'fulfilled') setIntegrations(intRes.value.data ?? []);
      if (ovRes.status === 'fulfilled') {
        const curr    = ovRes.value.data?.current;
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
    } catch {
      // stil falen is ok bij reload
    }
  };

  if (!appReady) {
    return <AppLoader onReady={handleAppReady} />;
  }

  const handleSync = async (integrationId: string) => {
    setSyncing(integrationId);
    try {
      await api.post(`/integrations/${integrationId}/sync`, { jobType: 'incremental' });
      setTimeout(() => reloadStats(), 4000);
    } catch {}
    setSyncing(null);
  };

  const creditsStr = credits
    ? (credits.unlimited ? '∞' : (credits.remaining ?? 0).toLocaleString('nl-NL'))
    : '—';

  const stores = integrations.filter(
    i => !['bolcom_ads', 'google_ads'].includes(i.platformSlug) && i.status !== 'disconnected'
  );

  const hasStores = stores.length > 0;

  return (
    <PageErrorBoundary label="dashboard">
      <div className="p-6 max-w-5xl mx-auto">
        <OnboardingChecklist />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-800 text-white">
              {getGreeting()}, {user?.firstName ?? 'there'} 👋
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
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

        {/* Credit bar voor Starter (en Growth als bijna op) */}
        {credits && !credits.unlimited && (
          <CreditBar credits={credits} planSlug={planSlug} />
        )}

        {/* Empty state als geen stores */}
        {!hasStores && !loading && (
          <CardErrorBoundary>
            <EmptyDashboard />
          </CardErrorBoundary>
        )}

        {/* Normale dashboard content als er stores zijn */}
        {hasStores && (
          <>
            {/* 7-dagen KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                label="Revenue excl. VAT (7d)"
                value={loading ? null : formatCurrency((stats?.revenue ?? 0) / 1.21)}
                change={stats?.change.revenue}
                icon={TrendingUp}
                color="bg-emerald-500"
              />
              <StatCard
                label="Orders (7d)"
                value={loading ? null : (stats?.orders ?? 0).toString()}
                change={stats?.change.orders}
                icon={ShoppingCart}
                color="bg-blue-500"
              />
              <StatCard
                label="AI credits"
                value={loading ? null : creditsStr}
                sub={credits?.unlimited ? 'Unlimited' : `of ${credits?.limit ?? 100} this month`}
                icon={Zap}
                color="bg-violet-500"
              />
              <StatCard
                label="Avg order value (7d)"
                value={loading ? null : formatCurrency(stats?.avgOrder ?? 0)}
                icon={TrendingUp}
                color="bg-amber-500"
              />
            </div>

            {/* Stores + Top products */}
            <div className="grid lg:grid-cols-2 gap-4 mb-6">

              {/* Connected stores */}
              <CardErrorBoundary>
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-slate-300">Connected stores</h2>
                    <Link href="/dashboard/integrations" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                      Manage →
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {stores.map(store => (
                      <div key={store.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center">
                            <Store className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{store.shopName || store.platformSlug}</p>
                            <p className="text-xs text-slate-500">Last sync: {timeAgo(store.lastSyncAt)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSync(store.id)}
                          disabled={syncing === store.id}
                          className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-colors disabled:opacity-50"
                          title="Sync now"
                        >
                          <RefreshCw className={`w-3 h-3 text-slate-400 ${syncing === store.id ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardErrorBoundary>

              {/* Top products */}
              <CardErrorBoundary>
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-slate-300">Top products (7d)</h2>
                    <Link href="/dashboard/products" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                      All products →
                    </Link>
                  </div>
                  {topProducts.length === 0 ? (
                    <p className="text-slate-500 text-sm py-4 text-center">No sales data yet</p>
                  ) : (
                    <div className="space-y-3">
                      {topProducts.slice(0, 4).map((p, i) => (
                        <div key={i} className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{p.title}</p>
                            <p className="text-xs text-slate-500">{p.units_sold} sold</p>
                          </div>
                          <p className="text-sm font-semibold text-emerald-400 flex-shrink-0">
                            {formatCurrency(p.revenue)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardErrorBoundary>
            </div>

            {/* AI Insight preview (alle plans) */}
            <CardErrorBoundary>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-brand-600/20 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                    </div>
                    <h2 className="text-sm font-semibold text-slate-300">Today's AI Insight</h2>
                  </div>
                  <Link href="/dashboard/ai-insights" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                    Full briefing →
                  </Link>
                </div>

                {insightError ? (
                  <div className="flex items-center gap-2 text-slate-500 text-sm py-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Insight couldn't load. <Link href="/dashboard/ai-insights" className="text-brand-400 hover:text-brand-300">Try the full page →</Link></span>
                  </div>
                ) : insight ? (
                  <div>
                    <p className="text-slate-300 text-sm leading-relaxed mb-4">{insight.briefing}</p>
                    {insight.actions?.slice(0, 2).map((action, i) => (
                      <div key={i} className="flex items-start gap-3 py-2 border-t border-slate-700/50 first:border-0 first:pt-0">
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                          action.priority === 'high' ? 'bg-rose-400' :
                          action.priority === 'medium' ? 'bg-amber-400' : 'bg-slate-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-white">{action.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{action.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-700/50 rounded animate-pulse w-3/4" />
                    <div className="h-4 bg-slate-700/50 rounded animate-pulse w-1/2" />
                  </div>
                )}
              </div>
            </CardErrorBoundary>
          </>
        )}
      </div>
    </PageErrorBoundary>
  );
}
