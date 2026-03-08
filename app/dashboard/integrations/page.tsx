'use client';

import { useState, useEffect } from 'react';
import { Plus, RefreshCw, Trash2, CheckCircle, AlertCircle, Clock, ExternalLink, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

const PLATFORMS = [
  { id: 'shopify',     name: 'Shopify',      color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', type: 'oauth',       fields: [] },
  { id: 'bolcom',      name: 'Bol.com',      color: 'bg-blue-500/10 border-blue-500/20 text-blue-400',         type: 'credentials', fields: ['apiKey', 'apiSecret'] },
  { id: 'woocommerce', name: 'WooCommerce',  color: 'bg-violet-500/10 border-violet-500/20 text-violet-400',   type: 'credentials', fields: ['siteUrl', 'consumerKey', 'consumerSecret'] },
  { id: 'lightspeed',  name: 'Lightspeed',   color: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',         type: 'credentials', fields: ['siteUrl', 'apiKey'] },
  { id: 'bigcommerce', name: 'BigCommerce',  color: 'bg-purple-500/10 border-purple-500/20 text-purple-400',   type: 'credentials', fields: ['storeUrl', 'apiKey'] },
  { id: 'etsy',        name: 'Etsy',         color: 'bg-amber-500/10 border-amber-500/20 text-amber-400',      type: 'oauth',       fields: [] },
  { id: 'amazon',      name: 'Amazon',       color: 'bg-orange-500/10 border-orange-500/20 text-orange-400',   type: 'coming_soon', fields: [] },
  { id: 'magento',     name: 'Magento',      color: 'bg-rose-500/10 border-rose-500/20 text-rose-400',         type: 'credentials', fields: ['siteUrl', 'apiKey', 'apiSecret'] },
];

// Labels die getoond worden in de input placeholders
const FIELD_LABELS: Record<string, string> = {
  apiKey:         'Client ID',
  apiSecret:      'Client Secret',
  siteUrl:        'Store URL (https://...)',
  consumerKey:    'Consumer Key',
  consumerSecret: 'Consumer Secret',
  storeUrl:       'Store URL (https://...)',
};

function StatusBadge({ status }: { status: string }) {
  const config = {
    active:       { icon: CheckCircle, color: 'text-emerald-400', label: 'Active' },
    error:        { icon: AlertCircle, color: 'text-rose-400',    label: 'Error' },
    syncing:      { icon: RefreshCw,   color: 'text-brand-400 animate-spin', label: 'Syncing' },
    disconnected: { icon: Clock,       color: 'text-slate-400',   label: 'Disconnected' },
  }[status] ?? { icon: Clock, color: 'text-slate-400', label: status };

  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium ${config.color}`}>
      <config.icon className="w-3.5 h-3.5" />
      {config.label}
    </div>
  );
}

export default function IntegrationsPage() {
  const [connections, setConnections] = useState<any[]>([]);
  const [connecting, setConnecting]   = useState<string | null>(null);
  const [formData, setFormData]       = useState<Record<string, string>>({});
  const [loading, setLoading]         = useState(false);
  const [syncing, setSyncing]         = useState<string | null>(null);
  const [error, setError]             = useState('');

  const load = async () => {
    try {
      const res = await api.get('/integrations');
      setConnections(res.data ?? res.data?.connections ?? []);
    } catch {}
  };

  useEffect(() => { load(); }, []);

  // ── OAuth platforms (Shopify, Etsy) ──────────────────────
  const handleOAuthConnect = async (platformId: string) => {
    if (platformId === 'shopify') {
      const domain = prompt('Voer je Shopify store domein in (bijv. mystore.myshopify.com)');
      if (!domain) return;
      try {
        const res = await api.post('/integrations/connect', {
          platformSlug: 'shopify',
          shopDomain: domain.trim(),
        });
        if (res.data.authUrl) {
          window.location.href = res.data.authUrl;
        }
      } catch (err: any) {
        setError(err.response?.data?.error ?? 'Shopify verbinding mislukt');
      }
      return;
    }

    if (platformId === 'etsy') {
      try {
        const res = await api.post('/integrations/connect', { platformSlug: 'etsy' });
        if (res.data.authUrl) {
          window.location.href = res.data.authUrl;
        }
      } catch (err: any) {
        setError(err.response?.data?.error ?? 'Etsy verbinding mislukt');
      }
      return;
    }
  };

  // ── API key platforms (Bol.com, WooCommerce, etc.) ───────
  const handleConnect = async (platformId: string) => {
    setLoading(true);
    setError('');
    try {
      // Stuur altijd platformSlug mee + de ingevulde velden
      const payload: Record<string, string> = {
        platformSlug: platformId,
        ...formData,
      };

      const res = await api.post('/integrations/connect', payload);

      // OAuth redirect indien nodig (edge case)
      if (res.data.authUrl) {
        window.location.href = res.data.authUrl;
        return;
      }

      setConnecting(null);
      setFormData({});
      await load();
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Verbinding mislukt. Controleer je gegevens.');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (id: string) => {
    setSyncing(id);
    try {
      await api.post(`/integrations/${id}/sync`);
      await load();
    } catch {}
    setSyncing(null);
  };

  const handleDisconnect = async (id: string) => {
    if (!confirm('Weet je zeker dat je deze koppeling wil verwijderen?')) return;
    try {
      await api.delete(`/integrations/${id}`);
      await load();
    } catch {}
  };

  const connectedPlatforms = new Set(connections.map((c: any) => c.platformSlug ?? c.platform));

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-800 text-white mb-1">Integraties</h1>
        <p className="text-slate-400 text-sm">Koppel je webshops en marktplaatsen om data te synchroniseren.</p>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* Gekoppelde winkels */}
      {connections.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Gekoppelde winkels</h2>
          <div className="space-y-3">
            {connections.map((c: any) => {
              const platformId = c.platformSlug ?? c.platform;
              const platformMeta = PLATFORMS.find(p => p.id === platformId);
              return (
                <div key={c.id} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-display font-700 text-xs ${
                    platformMeta?.color ?? 'bg-slate-700 border-slate-600 text-slate-300'
                  }`}>
                    {(platformMeta?.name ?? platformId).slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-white">{c.shopName ?? platformMeta?.name ?? platformId}</span>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {c.shopDomain ?? c.platformName ?? platformMeta?.name}
                      {c.lastSyncAt && ` · Gesynchroniseerd ${new Date(c.lastSyncAt).toLocaleDateString('nl-NL')}`}
                      {c.ordersCount != null && ` · ${c.ordersCount} orders`}
                    </p>
                    {c.errorMessage && (
                      <p className="text-xs text-rose-400 mt-0.5 truncate">{c.errorMessage}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSync(c.id)}
                      disabled={syncing === c.id}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                      title="Synchroniseer nu"
                    >
                      <RefreshCw className={`w-4 h-4 ${syncing === c.id ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleDisconnect(c.id)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Ontkoppelen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Beschikbare platforms */}
      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Platforms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PLATFORMS.map(platform => {
            const isConnected  = connectedPlatforms.has(platform.id);
            const isConnecting = connecting === platform.id;

            return (
              <div
                key={platform.id}
                className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5"
              >
                <div className="flex items-center gap-3 mb-1">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center font-display font-700 text-xs ${platform.color}`}>
                    {platform.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{platform.name}</span>
                      {isConnected && (
                        <span className="text-xs text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Gekoppeld
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {platform.type === 'coming_soon' ? (
                  <p className="text-xs text-slate-500 mt-3">Binnenkort beschikbaar</p>
                ) : isConnecting ? (
                  <div className="space-y-2 mt-3">
                    {platform.fields.map(field => (
                      <input
                        key={field}
                        type={
                          field.toLowerCase().includes('secret') || field.toLowerCase().includes('token')
                            ? 'password'
                            : 'text'
                        }
                        placeholder={FIELD_LABELS[field] ?? field}
                        value={formData[field] ?? ''}
                        onChange={e => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    ))}
                    {/* Bol.com help tekst */}
                    {platform.id === 'bolcom' && (
                      <p className="text-xs text-slate-500">
                        Vind je Client ID en Secret op{' '}
                        <a
                          href="https://developer.bol.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-400 hover:underline inline-flex items-center gap-0.5"
                        >
                          developer.bol.com <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </p>
                    )}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleConnect(platform.id)}
                        disabled={loading || platform.fields.some(f => !formData[f]?.trim())}
                        className="flex-1 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1 disabled:opacity-60"
                      >
                        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                        Verbinden
                      </button>
                      <button
                        onClick={() => { setConnecting(null); setFormData({}); setError(''); }}
                        className="px-3 py-2 bg-slate-700 text-slate-400 text-xs rounded-lg hover:bg-slate-600 transition-colors"
                      >
                        Annuleren
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (platform.type === 'oauth') {
                        handleOAuthConnect(platform.id);
                      } else {
                        setConnecting(platform.id);
                        setFormData({});
                        setError('');
                      }
                    }}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white text-xs font-medium py-2 rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {isConnected ? 'Nog een toevoegen' : 'Koppelen'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
