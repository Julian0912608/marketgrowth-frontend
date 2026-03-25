'use client';

import { useState, useEffect } from 'react';
import { Search, ShoppingBag, TrendingUp, ExternalLink, Package } from 'lucide-react';
import { api } from '@/lib/api';

const PLATFORM_LABELS: Record<string, string> = {
  shopify:     'Shopify',
  woocommerce: 'WooCommerce',
  bolcom:      'Bol.com',
  amazon:      'Amazon',
  etsy:        'Etsy',
  lightspeed:  'Lightspeed',
  bigcommerce: 'BigCommerce',
  magento:     'Magento',
};

const PLATFORM_COLORS: Record<string, string> = {
  shopify:     'bg-emerald-500/15 text-emerald-400',
  woocommerce: 'bg-purple-500/15 text-purple-400',
  bolcom:      'bg-blue-500/15 text-blue-400',
  amazon:      'bg-orange-500/15 text-orange-400',
  etsy:        'bg-rose-500/15 text-rose-400',
  lightspeed:  'bg-red-500/15 text-red-400',
  bigcommerce: 'bg-cyan-500/15 text-cyan-400',
  magento:     'bg-amber-500/15 text-amber-400',
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n ?? 0);
}

// Genereer een directe productlink per platform
function getProductUrl(product: any): string | null {
  if (!product) return null;

  if (product.platform === 'bolcom' && product.ean) {
    return `https://www.bol.com/nl/nl/s/?searchtext=${encodeURIComponent(product.ean)}`;
  }
  if (product.platform === 'bolcom' && product.external_id) {
    return `https://www.bol.com/nl/nl/p/product/${product.external_id}/`;
  }
  if (product.platform === 'shopify' && product.shop_domain && product.handle) {
    return `https://${product.shop_domain}/products/${product.handle}`;
  }
  if (product.platform === 'amazon' && product.external_id) {
    return `https://www.amazon.com/dp/${product.external_id}`;
  }
  if (product.platform === 'etsy' && product.external_id) {
    return `https://www.etsy.com/listing/${product.external_id}`;
  }
  return null;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [search,   setSearch]   = useState('');
  const [platform, setPlatform] = useState('');
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: '100' });
        if (platform) params.set('platform', platform);
        const res = await api.get(`/analytics/top-products?${params}`);
        setProducts(res.data.products ?? []);
      } catch {}
      setLoading(false);
    };
    load();
  }, [platform]);

  const filtered = products.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase()) ||
    p.ean?.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = filtered.reduce((s, p) => s + parseFloat(p.total_revenue ?? 0), 0);
  const totalSold    = filtered.reduce((s, p) => s + parseInt(p.total_sold ?? 0), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-800 text-white mb-1">Products</h1>
          <p className="text-slate-400 text-sm">Best performing products across all connected stores</p>
        </div>
        {!loading && filtered.length > 0 && (
          <div className="hidden sm:flex items-center gap-6 text-right">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">Total revenue</div>
              <div className="text-lg font-700 text-white">{formatCurrency(totalRevenue)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">Units sold</div>
              <div className="text-lg font-700 text-white">{totalSold.toLocaleString()}</div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, SKU or EAN..."
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
        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex gap-4 items-center">
                <div className="w-8 h-8 bg-slate-700/50 rounded-lg animate-pulse" />
                <div className="flex-1 h-4 bg-slate-700/50 rounded animate-pulse" />
                <div className="w-20 h-4 bg-slate-700/50 rounded animate-pulse" />
                <div className="w-24 h-4 bg-slate-700/50 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider w-8">#</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Product</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Platform</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Units sold</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Revenue</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg price</th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider w-10">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {filtered.map((p, i) => {
                  const productUrl = getProductUrl(p);
                  return (
                    <tr key={i} className="hover:bg-slate-700/20 transition-colors group">
                      <td className="px-5 py-4 text-slate-500 text-xs font-medium">{i + 1}</td>
                      <td className="px-5 py-4 max-w-xs">
                        <div className="font-medium text-white leading-snug line-clamp-2">{p.title}</div>
                        <div className="flex gap-2 mt-1">
                          {p.sku && <span className="text-xs text-slate-500">SKU: {p.sku}</span>}
                          {p.ean && <span className="text-xs text-slate-500">EAN: {p.ean}</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${PLATFORM_COLORS[p.platform] ?? 'bg-slate-700 text-slate-400'}`}>
                          {PLATFORM_LABELS[p.platform] ?? p.platform}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-slate-300 font-medium">{parseInt(p.total_sold ?? 0).toLocaleString()}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="font-semibold text-white">{formatCurrency(parseFloat(p.total_revenue ?? 0))}</span>
                          <TrendingUp className="w-3 h-3 text-emerald-400" />
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right text-slate-400">
                        {formatCurrency(parseFloat(p.avg_price ?? 0))}
                      </td>
                      <td className="px-5 py-4 text-center">
                        {productUrl ? (
                          <a
                            href={productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-700/50 hover:bg-brand-600/30 hover:text-brand-400 text-slate-500 transition-colors"
                            title={`View on ${PLATFORM_LABELS[p.platform] ?? p.platform}`}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-slate-700">
                            <Package className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium mb-1">
              {search ? 'No products match your search' : 'No products found'}
            </p>
            <p className="text-slate-500 text-sm">
              {!search && 'Connect a store and sync your data to see products here.'}
            </p>
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <p className="text-xs text-slate-600 mt-3 text-right">
          Showing {filtered.length} product{filtered.length !== 1 ? 's' : ''}
          {search && ` matching "${search}"`}
        </p>
      )}
    </div>
  );
}
