'use client';

import { useState, useEffect } from 'react';
import { Megaphone, TrendingUp, MousePointer, Eye, ShoppingCart } from 'lucide-react';
import { api } from '@/lib/api';

const PLATFORM_LABELS: Record<string, string> = {
  shopify: 'Shopify', bolcom: 'Bol.com', etsy: 'Etsy',
  woocommerce: 'WooCommerce', amazon: 'Amazon', pinterest: 'Pinterest',
};

function formatCurrency(val: number) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val ?? 0);
}

function formatNumber(val: number) {
  return new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 0 }).format(val ?? 0);
}

function RoasBadge({ roas }: { roas: number }) {
  const color = roas >= 4 ? 'text-emerald-400 bg-emerald-400/10' :
                roas >= 2 ? 'text-amber-400 bg-amber-400/10' : 'text-rose-400 bg-rose-400/10';
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>
      {roas?.toFixed(1)}x
    </span>
  );
}

export default function AdsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [platform, setPlatform]   = useState('');
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/analytics/ads${platform ? `?platform=${platform}` : ''}`);
        setCampaigns(res.data.campaigns);
      } catch {}
      setLoading(false);
    };
    load();
  }, [platform]);

  const totalSpend    = campaigns.reduce((s, c) => s + (c.spend ?? 0), 0);
  const totalRevenue  = campaigns.reduce((s, c) => s + (c.revenue ?? 0), 0);
  const totalClicks   = campaigns.reduce((s, c) => s + (c.clicks ?? 0), 0);
  const totalImpressions = campaigns.reduce((s, c) => s + (c.impressions ?? 0), 0);
  const overallRoas   = totalSpend > 0 ? totalRevenue / totalSpend : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-800 text-white mb-1">Advertising</h1>
          <p className="text-slate-400 text-sm">Campaign performance across all platforms</p>
        </div>
        <select
          value={platform}
          onChange={e => setPlatform(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="">All platforms</option>
          {['shopify','etsy','amazon','pinterest'].map(p => (
            <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>
          ))}
        </select>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Spend',      value: formatCurrency(totalSpend),       icon: Megaphone,    color: 'bg-rose-500' },
          { label: 'Ad Revenue',       value: formatCurrency(totalRevenue),      icon: TrendingUp,   color: 'bg-emerald-500' },
          { label: 'Total Clicks',     value: formatNumber(totalClicks),         icon: MousePointer, color: 'bg-brand-500' },
          { label: 'Impressions',      value: formatNumber(totalImpressions),    icon: Eye,          color: 'bg-violet-500' },
        ].map(card => (
          <div key={card.label} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <div className={`w-8 h-8 rounded-lg ${card.color} flex items-center justify-center mb-3`}>
              <card.icon className="w-4 h-4 text-white" />
            </div>
            <div className="text-xs text-slate-400 mb-1">{card.label}</div>
            <div className="font-display text-xl font-800 text-white">{card.value}</div>
          </div>
        ))}
      </div>

      {/* ROAS highlight */}
      {totalSpend > 0 && (
        <div className="bg-gradient-to-r from-emerald-900/30 to-brand-900/20 border border-emerald-700/20 rounded-2xl p-5 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
            <ShoppingCart className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="text-sm text-slate-400">Overall ROAS</div>
            <div className="font-display text-3xl font-800 text-white">{overallRoas.toFixed(2)}x</div>
            <div className="text-xs text-slate-500 mt-0.5">
              {overallRoas >= 4 ? '🟢 Excellent' : overallRoas >= 2 ? '🟡 Good' : '🔴 Needs improvement'}
            </div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-xs text-slate-400">For every €1 spent</div>
            <div className="font-display text-lg font-700 text-emerald-400">€{overallRoas.toFixed(2)} returned</div>
          </div>
        </div>
      )}

      {/* Campaigns table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/50">
          <h2 className="font-display font-700 text-white">Campaigns</h2>
        </div>

        {campaigns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  {['Campaign', 'Platform', 'Status', 'Spend', 'Revenue', 'ROAS', 'Clicks', 'CTR'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {campaigns.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-white max-w-48 truncate">{c.name}</td>
                    <td className="px-4 py-3 text-slate-400">{PLATFORM_LABELS[c.platform] ?? c.platform}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        c.status === 'active' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {c.status ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{formatCurrency(c.spend)}</td>
                    <td className="px-4 py-3 text-slate-300">{formatCurrency(c.revenue)}</td>
                    <td className="px-4 py-3">
                      {c.roas ? <RoasBadge roas={c.roas} /> : <span className="text-slate-500">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{formatNumber(c.clicks)}</td>
                    <td className="px-4 py-3 text-slate-400">{c.ctr ? `${c.ctr}%` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <Megaphone className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium mb-1">No ad data yet</p>
            <p className="text-slate-500 text-sm">Connect Etsy, Pinterest or Amazon to see your campaign performance.</p>
          </div>
        )}
      </div>
    </div>
  );
}
