'use client';

// app/dashboard/shops/page.tsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Store, TrendingUp, RefreshCw, Plus, AlertCircle,
  CheckCircle, Clock, ArrowUpRight, ShoppingCart,
  Zap, ChevronRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';

interface ShopStats {
  id:           string;
  platformSlug: string;
  platformName: string;
  shopName:     string;
  status:       string;
  lastSyncAt:   string | null;
  errorMessage: string | null;
  revenue7d:    number;
  orders7d:     number;
  avgOrder7d:   number;
  revenueChange: number;
}

const PLATFORM_COLORS: Record<string, string> = {
  shopify:     'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  bolcom:      'bg-blue-500/20 text-blue-400 border-blue-500/30',
  woocommerce: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  amazon:      'bg-orange-500/20 text-orange-400 border-orange-500/30',
  etsy:        'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

const PLAN_LIMITS: Record<string, number> = {
  starter: 1,
  growth:  3,
  scale:   999,
};

function formatEur(val: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency', currency: 'EUR', minimumFractionDigits: 0,
  }).format(val ?? 0);
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ShopsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [shops,   setShops]   = useState<ShopStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);

  const planSlug  = (user as any)?.planSlug ?? 'starter';
  const shopLimit = PLAN_LIMITS[planSlug] ?? 1;

  const load = async () => {
    setLoading(true);
    try {
      const intRes = await api.get('/integrations');
      const integrations = (intRes.data ?? []).filter(
        (i: any) => i.platformSlug !== 'bolcom_ads' && i.status !== 'disconnected'
      );

      const statsPromises = integrations.map(async (int: any) => {
        try {
          const statsRes = await api.get(
            `/analytics/overview?period=7d&platform=${int.platformSlug}`
          );
          const curr = statsRes.data?.current;
          const prev = statsRes.data?.previous;
          const revenue    = parseFloat(curr?.revenue ?? '0');
          const prevRev    = parseFloat(prev?.revenue ?? '0');
          const orders     = parseInt(curr?.orders_count ?? '0');
          const revenueChg = prevRev > 0 ? Math.round(((revenue - prevRev) / prevRev) * 100) : 0;

          return {
            id:            int.id,
            platformSlug:  int.platformSlug,
            platformName:  int.platformName,
            shopName:      int.shopName || int.platformName,
            status:        int.status,
            lastSyncAt:    int.lastSyncAt,
            errorMessage:  int.errorMessage,
            revenue7d:     revenue / 1.21,
            orders7d:      orders,
            avgOrder7d:    orders > 0 ? (revenue / 1.21) / orders : 0,
            revenueChange: revenueChg,
          } as ShopStats;
        } catch {
          return {
            id:            int.id,
            platformSlug:  int.platformSlug,
            platformName:  int.platformName,
            shopName:      int.shopName || int.platformName,
            status:        int.status,
            lastSyncAt:    int.lastSyncAt,
            errorMessage:  int.errorMessage,
            revenue7d:     0,
            orders7d:      0,
            avgOrder7d:    0,
            revenueChange: 0,
          } as ShopStats;
        }
      });

      const results = await Promise.all(statsPromises);
      setShops(results);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSync = async (id: string) => {
    setSyncing(id);
    try {
      await api.post(`/integrations/${id}/sync`, { jobType: 'incremental' });
      setTimeout(() => load(), 3000);
    } catch {}
    setSyncing(null);
  };

  const totalRevenue = shops.reduce((s, sh) => s + sh.revenue7d, 0);
  const totalOrders  = shops.reduce((s, sh) => s + sh.orders7d, 0);

  return (
    <div className="p-6 max-w-6xl mx-auto">

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-800 text-white mb-1">My stores</h1>
          <p className="text-slate-400 text-sm">
            {shops.length} of {shopLimit === 999 ? 'unlimited' : shopLimit} stores connected
          </p>
        </div>
        {shops.length < shopLimit && (
          <Link
            href="/dashboard/integrations"
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add store
          </Link>
        )}
      </div>

      {shops.length > 1 && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Total revenue excl. VAT (7d)</p>
            <p className="text-2xl font-bold text-white">{formatEur(totalRevenue)}</p>
            <p className="text-xs text-slate-500 mt-1">across {shops.length} stores</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Total orders (7d)</p>
            <p className="text-2xl font-bold text-white">{totalOrders}</p>
            <p className="text-xs text-slate-500 mt-1">across all platforms</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-5 h-5 animate-spin text-slate-500" />
        </div>
      ) : shops.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-12 text-center">
          <Store className="w-10 h-10 text-slate-600 mx-auto mb-4" />
          <h2 className="text-white font-semibold mb-2">No stores connected yet</h2>
          <p className="text-slate-400 text-sm mb-6">Connect your first store to start collecting data.</p>
          <Link
            href="/dashboard/integrations"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            Connect store
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {shops.map(shop => {
            const colorClass = PLATFORM_COLORS[shop.platformSlug] ?? 'bg-slate-700/50 text-slate-400 border-slate-600/30';
            const isError    = shop.status === 'error';
            const isSyncing  = syncing === shop.id;

            return (
              <div key={shop.id} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600/50 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-sm ${colorClass}`}>
                      {shop.platformName[0]}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{shop.shopName}</p>
                      <p className="text-slate-400 text-xs">{shop.platformName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isError ? (
                      <span className="flex items-center gap-1 text-xs text-rose-400">
                        <AlertCircle className="w-3.5 h-3.5" /> Error
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-emerald-400">
                        <CheckCircle className="w-3.5 h-3.5" /> Active
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-slate-900/40 rounded-xl p-3 text-center">
                    <p className="text-slate-500 text-xs mb-1">Revenue excl. VAT (7d)</p>
                    <p className="text-white font-bold text-sm">{formatEur(shop.revenue7d)}</p>
                    {shop.revenueChange !== 0 && (
                      <p className={`text-xs mt-0.5 ${shop.revenueChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {shop.revenueChange >= 0 ? '+' : ''}{shop.revenueChange}%
                      </p>
                    )}
                  </div>
                  <div className="bg-slate-900/40 rounded-xl p-3 text-center">
                    <p className="text-slate-500 text-xs mb-1">Orders (7d)</p>
                    <p className="text-white font-bold text-sm">{shop.orders7d}</p>
                  </div>
                  <div className="bg-slate-900/40 rounded-xl p-3 text-center">
                    <p className="text-slate-500 text-xs mb-1">Avg. order</p>
                    <p className="text-white font-bold text-sm">{formatEur(shop.avgOrder7d)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    Last sync: {timeAgo(shop.lastSyncAt)}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSync(shop.id)}
                      disabled={isSyncing}
                      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-700/50 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      Sync
                    </button>
                    <Link
                      href={`/dashboard/analytics?platform=${shop.platformSlug}`}
                      className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 px-2.5 py-1.5 rounded-lg hover:bg-brand-600/10 transition-colors"
                    >
                      Analytics
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {isError && shop.errorMessage && (
                  <div className="mt-3 px-3 py-2 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                    <p className="text-xs text-rose-300">{shop.errorMessage}</p>
                  </div>
                )}
              </div>
            );
          })}

          {shops.length < shopLimit && (
            <Link
              href="/dashboard/integrations"
              className="bg-slate-800/20 border border-dashed border-slate-700/50 rounded-2xl p-5 flex items-center justify-center hover:border-slate-500/50 hover:bg-slate-800/40 transition-all group"
            >
              <div className="text-center">
                <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center mx-auto mb-3 group-hover:bg-slate-700 transition-colors">
                  <Plus className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-slate-400 text-sm font-medium group-hover:text-white transition-colors">Add store</p>
                <p className="text-slate-600 text-xs mt-1">
                  {shopLimit - shops.length} slot{shopLimit - shops.length !== 1 ? 's' : ''} available
                </p>
              </div>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
