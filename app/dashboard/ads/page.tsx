'use client';

import { useState, useEffect } from 'react';
import { Megaphone, TrendingUp, MousePointer, Eye, ShoppingCart, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';

const PLATFORM_LABELS: Record<string, string> = {
  shopify:     'Shopify',
  bolcom:      'Bol.com',
  bolcom_ads:  'Bol.com Ads',
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

function formatNumber(val: number) {
  return new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 0 }).format(val ?? 0);
}

function RoasBadge({ roas }: { roas: number }) {
  const color = roas >= 4 ? 'text-emerald-400 bg-emerald-400/10' :
                roas >= 2 ? 'text-amber-400 bg-amber-400/10'  :
                            'text-rose-400 bg-rose-400/10';
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>
      {roas?.toFixed(1)}x
    </span>
  );
}

export default function AdsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [platform,  setPlatform]  = useState('');
  const [loading,   setLoading]   = useState(true);
  const [syncing,   setSyncing]   = useState(false);
  const [hasBolAds, setHasBolAds] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [campsRes, intRes] = await Promise.all([
        api.get('/analytics/ads' + (platform ? '?platform=' + platform : '')),
        api.get('/integrations'),
      ]);
      setCampaigns(campsRes.data.campaigns ?? []);
      const integrations = intRes.data ?? [];
      setHasBolAds(integrations.some((i: any) => (i.platformSlug ?? i.platform) === 'bolcom_ads'));
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [platform]);

  const handleBolSync = async () => {
    setSyncing(true);
    try {
      await api.post('/integrations/advertising/bolcom/sync');
      await load();
    } catch {}
    setSyncing(false);
  };

  const totalSpend       = campaigns.reduce((s, c) => s + (parseFloat(c.spend) || 0), 0);
  const totalRevenue     = campaigns.reduce((s, c) => s + (parseFloat(c.revenue) || 0), 0);
  const totalClicks      = campaigns.reduce((s, c) => s + (parseInt(c.clicks) || 0), 0);
  const totalImpressions = campaigns.reduce((s, c) => s + (parseInt(c.impressions) || 0), 0);
  const overallRoas      = totalSpend > 0 ? totalRevenue / totalSpend : 0;

  // Unieke platforms in de data
  const platformsInData = [...new Set(campaigns.map(c => c.platform))];

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-800 text-white mb-1">Advertising</h1>
          <p className="text-slate-400 text-sm">Campagne performance per platform</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Bol.com sync knop — alleen tonen als gekoppeld */}
          {hasBolAds && (
            <button
              onClick={handleBolSync}
              disabled={syncing}
              className="flex items-center gap-2 bg-blue-600/10 border border-blue-600/20 hover:bg-blue-600/20 text-blue-400 text-xs font-medium px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
            >
              <RefreshCw className={'w-3.5 h-3.5 ' + (syncing ? 'animate-spin' : '')} />
              {syncing ? 'Syncing...' : 'Bol.com Ads sync'}
            </button>
          )}
          {/* Platform filter */}
          <select
            value={platform}
            onChange={e => setPlatform(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="">Alle platforms</option>
            <option value="bolcom">Bol.com</option>
            <option value="shopify">Shopify</option>
            <option value="etsy">Etsy</option>
            <option value="amazon">Amazon</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Totaal spend',   value: loading ? '...' : formatCurrency(totalSpend),       icon: Megaphone,    color: 'bg-rose-500' },
          { label: 'Ad omzet',       value: loading ? '...' : formatCurrency(totalRevenue),      icon: TrendingUp,   color: 'bg-emerald-500' },
          { label: 'Totaal clicks',  value: loading ? '...' : formatNumber(totalClicks),         icon: MousePointer, color: 'bg-brand-500' },
          { label: 'Impressions',    value: loading ? '...' : formatNumber(totalImpressions),    icon: Eye,          color: 'bg-violet-500' },
        ].map(card => (
          <div key={card.label} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <div className={`w-8 h-8 rounded-lg ${card.color} flex items-center justify-center mb-3`}>
              <card.icon className="w-4 h-4 text-white" />
            </div>
            <div className="text-xs text-slate-400 mb-1">{card.label}</div>
            <div className={'font-display text-xl font-800 ' + (loading ? 'text-slate-600 animate-pulse' : 'text-white')}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* ROAS highlight */}
      {!loading && totalSpend > 0 && (
        <div className="bg-gradient-to-r from-emerald-900/30 to-brand-900/20 border border-emerald-700/20 rounded-2xl p-5 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
            <ShoppingCart className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="text-sm text-slate-400">Overall ROAS</div>
            <div className="font-display text-3xl font-800 text-white">{overallRoas.toFixed(2)}x</div>
            <div className="text-xs text-slate-500 mt-0.5">
              {overallRoas >= 4 ? '🟢 Uitstekend' : overallRoas >= 2 ? '🟡 Goed' : '🔴 Onder break-even'}
            </div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-xs text-slate-400">Per € 1 uitgegeven</div>
            <div className="font-display text-lg font-700 text-emerald-400">€ {overallRoas.toFixed(2)} terug</div>
          </div>
        </div>
      )}

      {/* Platform breakdown — als meerdere platforms */}
      {!loading && platformsInData.length > 1 && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 mb-6">
          <h2 className="font-display font-700 text-white mb-4 text-sm">Per platform</h2>
          <div className="space-y-3">
            {platformsInData.map(p => {
              const platCampaigns = campaigns.filter(c => c.platform === p);
              const platSpend     = platCampaigns.reduce((s, c) => s + (parseFloat(c.spend) || 0), 0);
              const platRevenue   = platCampaigns.reduce((s, c) => s + (parseFloat(c.revenue) || 0), 0);
              const platRoas      = platSpend > 0 ? platRevenue / platSpend : 0;
              const shareOfSpend  = totalSpend > 0 ? (platSpend / totalSpend) * 100 : 0;

              return (
                <div key={p}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-white">{PLATFORM_LABELS[p] ?? p}</span>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span>{formatCurrency(platSpend)} spend</span>
                      <span className="text-white font-medium">{platRoas.toFixed(1)}x ROAS</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full" style={{ width: shareOfSpend + '%' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Campagne tabel */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
          <h2 className="font-display font-700 text-white">Campagnes</h2>
          {!loading && campaigns.length > 0 && (
            <span className="text-xs text-slate-500">{campaigns.length} campagnes</span>
          )}
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-12 bg-slate-700/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : campaigns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  {['Campagne', 'Platform', 'Status', 'Spend', 'Omzet', 'ROAS', 'Clicks', 'CTR', 'ACoS'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {campaigns.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-white max-w-48 truncate">{c.name}</td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{PLATFORM_LABELS[c.platform] ?? c.platform}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        c.status === 'active' ? 'bg-emerald-400/10 text-emerald-400' :
                        c.status === 'paused' ? 'bg-amber-400/10 text-amber-400' :
                        'bg-slate-700 text-slate-400'
                      }`}>
                        {c.status ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{formatCurrency(parseFloat(c.spend) || 0)}</td>
                    <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{formatCurrency(parseFloat(c.revenue) || 0)}</td>
                    <td className="px-4 py-3">
                      {c.roas ? <RoasBadge roas={parseFloat(c.roas)} /> : <span className="text-slate-500">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{formatNumber(parseInt(c.clicks) || 0)}</td>
                    <td className="px-4 py-3 text-slate-400">{c.ctr ? c.ctr + '%' : '—'}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {c.revenue > 0 && c.spend > 0
                        ? Math.round((parseFloat(c.spend) / parseFloat(c.revenue)) * 10000) / 100 + '%'
                        : '—'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 px-6">
            <Megaphone className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium mb-1">Nog geen advertentiedata</p>
            <p className="text-slate-500 text-sm mb-4">
              {hasBolAds
                ? 'Klik op "Bol.com Ads sync" om de nieuwste campagnedata op te halen.'
                : 'Koppel Bol.com Advertising via Integraties → Advertising om campagnedata te zien.'
              }
            </p>
            {!hasBolAds && (
              <a
                href="/dashboard/integrations"
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                Ga naar Integraties →
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
