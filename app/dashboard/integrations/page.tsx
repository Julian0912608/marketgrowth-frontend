'use client';

import { useState, useEffect } from 'react';
import { Plus, RefreshCw, Trash2, CheckCircle, AlertCircle, Clock, Loader2, Megaphone } from 'lucide-react';
import { api } from '@/lib/api';

const PLATFORMS = [
  { id: 'shopify',     name: 'Shopify',     color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', type: 'oauth',       fields: [] },
  { id: 'bolcom',      name: 'Bol.com',     color: 'bg-blue-500/10 border-blue-500/20 text-blue-400',         type: 'credentials', fields: ['apiKey', 'apiSecret'] },
  { id: 'etsy',        name: 'Etsy',        color: 'bg-amber-500/10 border-amber-500/20 text-amber-400',      type: 'credentials', fields: ['shopId', 'accessToken'] },
  { id: 'woocommerce', name: 'WooCommerce', color: 'bg-violet-500/10 border-violet-500/20 text-violet-400',   type: 'credentials', fields: ['siteUrl', 'consumerKey', 'consumerSecret'] },
  { id: 'amazon',      name: 'Amazon',      color: 'bg-orange-500/10 border-orange-500/20 text-orange-400',   type: 'coming_soon', fields: [] },
  { id: 'pinterest',   name: 'Pinterest',   color: 'bg-rose-500/10 border-rose-500/20 text-rose-400',         type: 'coming_soon', fields: [] },
];

const FIELD_LABELS: Record<string, string> = {
  apiKey:         'Client ID',
  apiSecret:      'Client Secret',
  shopId:         'Shop ID',
  accessToken:    'Access Token',
  siteUrl:        'Store URL (https://...)',
  consumerKey:    'Consumer Key',
  consumerSecret: 'Consumer Secret',
};

function StatusBadge({ status, errorMessage }: { status: string; errorMessage?: string }) {
  const config: Record<string, { icon: any; color: string; label: string }> = {
    active:       { icon: CheckCircle, color: 'text-emerald-400', label: 'Active' },
    error:        { icon: AlertCircle, color: 'text-rose-400',    label: 'Error' },
    syncing:      { icon: RefreshCw,   color: 'text-brand-400',   label: 'Syncing' },
    disconnected: { icon: Clock,       color: 'text-slate-400',   label: 'Disconnected' },
  };
  const cfg = config[status] ?? { icon: Clock, color: 'text-slate-400', label: status };
  return (
    <div className="flex flex-col gap-0.5">
      <div className={`flex items-center gap-1.5 text-xs font-medium ${cfg.color}`}>
        <cfg.icon className="w-3.5 h-3.5" />
        {cfg.label}
      </div>
      {status === 'error' && errorMessage && (
        <div className="text-xs text-rose-400/70 max-w-xs truncate">{errorMessage}</div>
      )}
    </div>
  );
}

export default function IntegrationsPage() {
  const [connections,    setConnections]    = useState<any[]>([]);
  const [connecting,     setConnecting]     = useState<string | null>(null);
  const [formData,       setFormData]       = useState<Record<string, string>>({});
  const [loading,        setLoading]        = useState(false);
  const [syncing,        setSyncing]        = useState<string | null>(null);
  const [error,          setError]          = useState('');
  // Bol.com Advertising state
  const [advConnecting,  setAdvConnecting]  = useState(false);
  const [advForm,        setAdvForm]        = useState({ clientId: '', clientSecret: '' });
  const [advLoading,     setAdvLoading]     = useState(false);
  const [advConnected,   setAdvConnected]   = useState(false);
  const [advSyncing,     setAdvSyncing]     = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/integrations');
      const data = res.data.connections ?? res.data ?? [];
      setConnections(data);
      setAdvConnected(data.some((c: any) => (c.platformSlug ?? c.platform) === 'bolcom_ads'));
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const handleShopifyInstall = async () => {
    const domain = prompt('Enter your Shopify store domain (e.g. mystore.myshopify.com)');
    if (!domain) return;
    try {
      const res = await api.post('/integrations/shopify/install', { shopDomain: domain });
      window.location.href = res.data.installUrl;
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to connect Shopify');
    }
  };

  const handleConnect = async (platformId: string) => {
    setLoading(true);
    setError('');
    try {
      await api.post('/integrations/connect', { platformSlug: platformId, ...formData });
      setConnecting(null);
      setFormData({});
      await load();
    } catch (err: any) {
      setError(err.response?.data?.error ?? err.response?.data?.message ?? 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (id: string) => {
    setSyncing(id);
    try {
      await api.post(`/integrations/${id}/sync`, { jobType: 'full_sync' });
      setTimeout(() => load(), 2000);
    } catch {}
    setSyncing(null);
  };

  const handleDisconnect = async (id: string) => {
    if (!confirm('Disconnect this store? All synced data will remain.')) return;
    try {
      await api.delete(`/integrations/${id}`);
      await load();
    } catch {}
  };

  const handleAdvConnect = async () => {
    if (!advForm.clientId || !advForm.clientSecret) return;
    setAdvLoading(true);
    setError('');
    try {
      await api.post('/integrations/advertising/bolcom/connect', {
        clientId:     advForm.clientId,
        clientSecret: advForm.clientSecret,
      });
      setAdvConnecting(false);
      setAdvForm({ clientId: '', clientSecret: '' });
      await load();
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Advertising koppeling mislukt');
    } finally {
      setAdvLoading(false);
    }
  };

  const handleAdvSync = async () => {
    setAdvSyncing(true);
    try {
      const res = await api.post('/integrations/advertising/bolcom/sync');
      alert(`Sync voltooid: ${res.data.campaigns} campagnes, €${res.data.totalSpend?.toFixed(2)} spend`);
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Sync mislukt');
    } finally {
      setAdvSyncing(false);
    }
  };

  const connectedPlatforms = new Set(connections.map((c: any) => c.platform ?? c.platformSlug));

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-800 text-white mb-1">Integrations</h1>
        <p className="text-slate-400 text-sm">Connect your stores and marketplaces to start syncing data.</p>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-xl mb-6">
          {error}
          <button onClick={() => setError('')} className="ml-2 underline text-xs">Sluiten</button>
        </div>
      )}

      {/* Connected stores */}
      {connections.filter((c: any) => (c.platform ?? c.platformSlug) !== 'bolcom_ads').length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Connected stores</h2>
          <div className="space-y-3">
            {connections
              .filter((c: any) => (c.platform ?? c.platformSlug) !== 'bolcom_ads')
              .map((c: any) => {
                const platformId  = c.platform ?? c.platformSlug;
                const platformMeta = PLATFORMS.find(p => p.id === platformId);
                return (
                  <div key={c.id} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-display font-700 text-xs ${platformMeta?.color ?? 'bg-slate-700 border-slate-600 text-slate-300'}`}>
                      {(platformMeta?.name ?? platformId ?? '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm">{c.shopName ?? c.shop_name ?? platformMeta?.name ?? platformId}</div>
                      <StatusBadge status={c.status} errorMessage={c.errorMessage ?? c.error_message} />
                    </div>
                    <div className="text-xs text-slate-500">
                      {c.ordersCount ?? c.orders_count ?? 0} orders
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSync(c.id)}
                        disabled={syncing === c.id}
                        className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                        title="Sync"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${syncing === c.id ? 'animate-spin' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleDisconnect(c.id)}
                        className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-rose-600/20 flex items-center justify-center text-slate-400 hover:text-rose-400 transition-colors"
                        title="Disconnect"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Add platform */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Add platform</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLATFORMS.map(platform => {
            const isConnected  = connectedPlatforms.has(platform.id);
            const isConnecting = connecting === platform.id;

            return (
              <div key={platform.id} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-display font-800 text-sm ${platform.color}`}>
                    {platform.name[0]}
                  </div>
                  {isConnected && (
                    <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Connected
                    </div>
                  )}
                </div>
                <h3 className="font-display font-700 text-white mb-1">{platform.name}</h3>

                {platform.type === 'coming_soon' ? (
                  <p className="text-xs text-slate-500 mt-2">Coming soon</p>
                ) : isConnecting ? (
                  <div className="space-y-2 mt-3">
                    {platform.fields.map(field => (
                      <input
                        key={field}
                        type={field.toLowerCase().includes('secret') || field.toLowerCase().includes('token') ? 'password' : 'text'}
                        placeholder={FIELD_LABELS[field] ?? field}
                        value={formData[field] ?? ''}
                        onChange={e => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    ))}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleConnect(platform.id)}
                        disabled={loading}
                        className="flex-1 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
                      >
                        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                        Connect
                      </button>
                      <button
                        onClick={() => { setConnecting(null); setFormData({}); setError(''); }}
                        className="px-3 py-2 bg-slate-700 text-slate-400 text-xs rounded-lg hover:bg-slate-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => platform.type === 'oauth' ? handleShopifyInstall() : setConnecting(platform.id)}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white text-xs font-medium py-2 rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {isConnected ? 'Add another' : 'Connect'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Advertising integraties */}
      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Advertising</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Bol.com Advertising */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl border bg-blue-500/10 border-blue-500/20 flex items-center justify-center">
                <Megaphone className="w-4 h-4 text-blue-400" />
              </div>
              {advConnected && (
                <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Connected
                </div>
              )}
            </div>
            <h3 className="font-display font-700 text-white mb-1">Bol.com Ads</h3>
            <p className="text-xs text-slate-500 mb-3">Campagne performance, spend en ROAS</p>

            {advConnected ? (
              <button
                onClick={handleAdvSync}
                disabled={advSyncing}
                className="w-full flex items-center justify-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white text-xs font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${advSyncing ? 'animate-spin' : ''}`} />
                {advSyncing ? 'Syncing...' : 'Sync nu'}
              </button>
            ) : advConnecting ? (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Advertising Client ID"
                  value={advForm.clientId}
                  onChange={e => setAdvForm(f => ({ ...f, clientId: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <input
                  type="password"
                  placeholder="Advertising Client Secret"
                  value={advForm.clientSecret}
                  onChange={e => setAdvForm(f => ({ ...f, clientSecret: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleAdvConnect}
                    disabled={advLoading || !advForm.clientId || !advForm.clientSecret}
                    className="flex-1 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
                  >
                    {advLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                    Connect
                  </button>
                  <button
                    onClick={() => { setAdvConnecting(false); setAdvForm({ clientId: '', clientSecret: '' }); }}
                    className="px-3 py-2 bg-slate-700 text-slate-400 text-xs rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
                <p className="text-xs text-slate-500 pt-1">
                  Haal je Advertising credentials op via{' '}
                  <a href="https://retailer.bol.com" target="_blank" rel="noopener noreferrer" className="text-brand-400 underline">
                    retailer.bol.com
                  </a>
                  {' '}→ Instellingen → API credentials → Advertising
                </p>
              </div>
            ) : (
              <button
                onClick={() => setAdvConnecting(true)}
                className="mt-1 w-full flex items-center justify-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white text-xs font-medium py-2 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Connect
              </button>
            )}
          </div>

          {/* Placeholder voor toekomstige ad platforms */}
          {['Meta Ads', 'Google Ads'].map(name => (
            <div key={name} className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-5 opacity-50">
              <div className="w-10 h-10 rounded-xl border bg-slate-700/50 border-slate-600/50 flex items-center justify-center mb-4">
                <Megaphone className="w-4 h-4 text-slate-500" />
              </div>
              <h3 className="font-display font-700 text-slate-400 mb-1">{name}</h3>
              <p className="text-xs text-slate-600">Coming soon</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
