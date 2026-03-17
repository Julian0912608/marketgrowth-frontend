'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, TrendingUp, Search } from 'lucide-react';
import { api } from '@/lib/api';

const PLATFORM_LABELS: Record<string, string> = {
  shopify: 'Shopify', bolcom: 'Bol.com', etsy: 'Etsy',
  woocommerce: 'WooCommerce', amazon: 'Amazon', pinterest: 'Pinterest',
};
const PLATFORM_COLORS: Record<string, string> = {
  shopify: 'bg-emerald-500/10 text-emerald-400', bolcom: 'bg-blue-500/10 text-blue-400',
  etsy: 'bg-amber-500/10 text-amber-400', woocommerce: 'bg-violet-500/10 text-violet-400',
  amazon: 'bg-orange-500/10 text-orange-400', pinterest: 'bg-rose-500/10 text-rose-400',
};

function formatCurrency(val: number) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val ?? 0);
}

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch]     = useState('');
  const [platform, setPlatform] = useState('');
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: '50' });
        if (platform) params.set('platform', platform);
        const res = await api.get(`/analytics/top-products?${params}`);
        setProducts(res.data.products);
      } catch {}
      setLoading(false);
    };
    load();
  }, [platform]);

  const filtered = products.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-800 text-white mb-1">Products</h1>
          <p className="text-slate-400 text-sm">Best performing products across all stores</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 placeholder-slate-500"
          />
        </div>
        <select
          value={platform}
          onChange={e => setPlatform(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="">All platforms</option>
          {Object.entries(PLATFORM_LABELS).map(([id, label]) => (
            <option key={id} value={id}>{label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  {['#', 'Product', 'Platform', 'Units Sold', 'Revenue', 'Avg Price'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {filtered.map((p, i) => (
                  <tr key={i} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-5 py-4 text-slate-500 text-xs font-medium">{i + 1}</td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-white">{p.title}</div>
                      {p.sku && <div className="text-xs text-slate-500 mt-0.5">SKU: {p.sku}</div>}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-lg ${PLATFORM_COLORS[p.platform] ?? 'bg-slate-700 text-slate-400'}`}>
                        {PLATFORM_LABELS[p.platform] ?? p.platform}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-300 font-medium">{p.total_sold?.toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{formatCurrency(p.total_revenue)}</span>
                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-400">{formatCurrency(p.avg_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium mb-1">
              {loading ? 'Loading products...' : 'No products found'}
            </p>
            <p className="text-slate-500 text-sm">
              {!loading && 'Connect a store and sync your data to see products here.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
