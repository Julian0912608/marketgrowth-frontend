'use client';

// app/dashboard/ai-insights/page.tsx
//
// FIXES:
//  1. Starter plan heeft toegang tot AI Insights (dagelijkse briefing)
//     met 100 credits/maand — matcht pricing pagina.
//  2. AI Chat en Social Content zijn Growth+ only — Starter ziet een
//     nette upsell card in plaats van een crash.
//  3. Error boundary rondom de hele pagina.
//  4. Credits-exhausted state met upgrade CTA.

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles, RefreshCw, AlertTriangle, TrendingUp,
  Zap, MessageSquare, Send, ChevronRight, Lock,
  ArrowUpRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import { usePermissions } from '@/lib/usePermissions';
import { PageErrorBoundary, CardErrorBoundary } from '@/components/ErrorBoundary';

interface Action {
  priority:    'high' | 'medium' | 'low';
  title:       string;
  description: string;
  channel?:    string;
}

interface AiInsight {
  briefing:  string;
  actions:   Action[];
  alerts:    string[];
  fromCache: boolean;
}

interface Credits {
  used:      number;
  limit:     number | null;
  remaining: number | null;
  unlimited: boolean;
  planSlug?: string;
}

const PRIORITY_CONFIG = {
  high:   { color: 'bg-rose-500',  label: 'Today',      text: 'text-rose-400'  },
  medium: { color: 'bg-amber-500', label: 'This week',  text: 'text-amber-400' },
  low:    { color: 'bg-slate-500', label: 'Consider',   text: 'text-slate-400' },
};

const CHANNEL_COLORS: Record<string, string> = {
  bolcom:     'bg-blue-500/20 text-blue-300',
  bolcom_ads: 'bg-blue-500/20 text-blue-300',
  shopify:    'bg-emerald-500/20 text-emerald-300',
  amazon:     'bg-orange-500/20 text-orange-300',
  etsy:       'bg-amber-500/20 text-amber-300',
  meta:       'bg-blue-600/20 text-blue-300',
  google:     'bg-rose-500/20 text-rose-300',
  algemeen:   'bg-slate-700 text-slate-400',
};

const CHANNEL_LABELS: Record<string, string> = {
  bolcom:     'Bol.com',
  bolcom_ads: 'Bol.com Ads',
  shopify:    'Shopify',
  amazon:     'Amazon',
  etsy:       'Etsy',
  meta:       'Meta Ads',
  google:     'Google Ads',
  algemeen:   'General',
};

// ── Upsell card voor Starter plan ────────────────────────────
function StarterUpsellCard({ feature }: { feature: string }) {
  const features: Record<string, { title: string; desc: string; items: string[] }> = {
    chat: {
      title: 'AI Chat — Growth plan',
      desc:  'Ask your AI advisor anything about your store performance.',
      items: ['Unlimited questions', 'Context-aware answers', 'Actionable recommendations'],
    },
    social: {
      title: 'Social Content — Growth plan',
      desc:  'Generate ready-to-post content for Instagram, TikTok, and LinkedIn.',
      items: ['Instagram captions + hashtags', 'TikTok scripts', 'Carousel posts'],
    },
  };

  const info = features[feature] ?? features.chat;

  return (
    <div className="bg-slate-800/30 border border-brand-600/20 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-3">
        <Lock className="w-4 h-4 text-brand-400" />
        <span className="text-sm font-semibold text-brand-400">{info.title}</span>
      </div>
      <p className="text-slate-400 text-sm mb-4 leading-relaxed">{info.desc}</p>
      <ul className="space-y-2 mb-5">
        {info.items.map(item => (
          <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
            <div className="w-1 h-1 rounded-full bg-brand-400" />
            {item}
          </li>
        ))}
      </ul>
      <Link
        href="/settings/billing"
        className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
      >
        Upgrade to Growth
        <ArrowUpRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

// ── Credits exhausted state ───────────────────────────────────
function CreditsExhausted({ credits }: { credits: Credits }) {
  return (
    <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-8 text-center">
      <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
        <Zap className="w-6 h-6 text-rose-400" />
      </div>
      <h3 className="font-display font-700 text-white text-lg mb-2">
        Monthly credits used up
      </h3>
      <p className="text-slate-400 text-sm mb-6 leading-relaxed max-w-sm mx-auto">
        You've used all {credits.limit} AI credits this month. Credits reset on the 1st of next month, or upgrade now for more.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/settings/billing"
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          Upgrade plan
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

// ── Hoofdcomponent ────────────────────────────────────────────
function AiInsightsContent() {
  const { planSlug, aiLimit } = usePermissions();

  const [insight,     setInsight]     = useState<AiInsight | null>(null);
  const [credits,     setCredits]     = useState<Credits | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [chatMsg,     setChatMsg]     = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [error,       setError]       = useState('');
  const [creditsExhausted, setCreditsExhausted] = useState(false);

  const isStarter = planSlug === 'starter';

  const loadInsights = async (force = false) => {
    if (force) setRefreshing(true);
    else setLoading(true);
    setError('');
    setCreditsExhausted(false);

    try {
      const [ins, cr] = await Promise.all([
        api.get('/ai/insights' + (force ? '?force=true' : '')),
        api.get('/ai/credits'),
      ]);
      setInsight(ins.data);
      setCredits(cr.data);
    } catch (e: any) {
      if (e.response?.status === 402) {
        setCreditsExhausted(true);
        // Haal credits nog wel op voor de UI
        try {
          const cr = await api.get('/ai/credits');
          setCredits(cr.data);
        } catch {}
      } else {
        setError(e.response?.data?.message || 'Insights couldn\'t load. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadInsights(); }, []);

  const handleChat = async () => {
    if (!chatMsg.trim() || chatLoading) return;
    const userMsg = chatMsg.trim();
    setChatMsg('');
    setChatHistory(h => [...h, { role: 'user', content: userMsg }]);
    setChatLoading(true);
    try {
      const res = await api.post('/ai/chat', { message: userMsg });
      setChatHistory(h => [...h, { role: 'assistant', content: res.data.response }]);
    } catch (e: any) {
      const msg = e.response?.data?.message || 'Something went wrong. Try again.';
      setChatHistory(h => [...h, { role: 'assistant', content: msg }]);
    } finally {
      setChatLoading(false);
    }
  };

  const creditsDisplay = credits
    ? (credits.unlimited ? '∞' : (credits.remaining ?? 0))
    : '–';

  const creditsPct = credits && !credits.unlimited && credits.limit
    ? Math.min(100, Math.round(((credits.used ?? 0) / credits.limit) * 100))
    : 0;

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-800 text-white">AI Insights</h1>
            <p className="text-slate-400 text-xs">Daily briefing for your store</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <RefreshCw className="w-6 h-6 animate-spin text-brand-400 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">AI is analysing your data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-800 text-white">AI Insights</h1>
            <p className="text-slate-400 text-xs">
              {credits ? `${creditsDisplay} credits remaining` : 'Loading credits...'} 
              {insight?.fromCache && ' · Cached'}
            </p>
          </div>
        </div>
        <button
          onClick={() => loadInsights(true)}
          disabled={refreshing || creditsExhausted}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-xl transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Credit bar */}
      {credits && !credits.unlimited && credits.limit && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-500">
              {credits.used} of {credits.limit} credits used this month
              {isStarter && (
                <Link href="/settings/billing" className="ml-2 text-brand-400 hover:text-brand-300">
                  Upgrade for {planSlug === 'starter' ? '2,000' : 'unlimited'} →
                </Link>
              )}
            </span>
            <span className="text-xs text-slate-500">{creditsPct}%</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                creditsPct >= 100 ? 'bg-rose-500' : creditsPct >= 80 ? 'bg-amber-500' : 'bg-brand-500'
              }`}
              style={{ width: `${creditsPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Credits exhausted */}
      {creditsExhausted && credits && (
        <CreditsExhausted credits={credits} />
      )}

      {/* Error state */}
      {error && !creditsExhausted && (
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-6 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-rose-400 font-medium text-sm mb-1">Couldn't load insights</p>
            <p className="text-slate-400 text-sm">{error}</p>
            <button
              onClick={() => loadInsights()}
              className="text-brand-400 text-sm mt-2 hover:text-brand-300 transition-colors"
            >
              Try again →
            </button>
          </div>
        </div>
      )}

      {/* Insight content */}
      {insight && !creditsExhausted && (
        <>
          {/* Briefing */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 mb-4">
            <p className="text-slate-200 leading-relaxed">{insight.briefing}</p>
          </div>

          {/* Alerts */}
          {insight.alerts?.length > 0 && (
            <div className="space-y-2 mb-4">
              {insight.alerts.map((alert, i) => (
                <div key={i} className="flex items-center gap-3 bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <p className="text-amber-300 text-sm">{alert}</p>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          {insight.actions?.length > 0 && (
            <div className="space-y-3 mb-6">
              {insight.actions.map((action, i) => {
                const cfg     = PRIORITY_CONFIG[action.priority] ?? PRIORITY_CONFIG.low;
                const channel = action.channel?.toLowerCase() ?? 'algemeen';
                return (
                  <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
                    <div className="flex items-start gap-4">
                      <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${cfg.color}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-xs font-semibold ${cfg.text}`}>{cfg.label}</span>
                          {action.channel && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CHANNEL_COLORS[channel] ?? CHANNEL_COLORS.algemeen}`}>
                              {CHANNEL_LABELS[channel] ?? action.channel}
                            </span>
                          )}
                        </div>
                        <p className="text-white font-medium text-sm mb-1">{action.title}</p>
                        <p className="text-slate-400 text-sm leading-relaxed">{action.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* AI Chat — Growth+ only */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">AI Chat</h2>
        {isStarter ? (
          <StarterUpsellCard feature="chat" />
        ) : (
          <CardErrorBoundary>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
              {/* Chat history */}
              {chatHistory.length > 0 && (
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs text-sm rounded-xl px-3 py-2 ${
                        msg.role === 'user'
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-700 text-slate-200'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-700 rounded-xl px-3 py-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatMsg}
                  onChange={e => setChatMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleChat()}
                  placeholder="Ask about your store performance..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                />
                <button
                  onClick={handleChat}
                  disabled={chatLoading || !chatMsg.trim()}
                  className="w-10 h-10 rounded-xl bg-brand-600 hover:bg-brand-700 flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </CardErrorBoundary>
        )}
      </div>

      {/* Social Content link — Growth+ only */}
      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Social Content</h2>
        {isStarter ? (
          <StarterUpsellCard feature="social" />
        ) : (
          <Link
            href="/dashboard/social-content"
            className="flex items-center justify-between bg-slate-800/50 border border-slate-700/50 hover:border-brand-600/30 rounded-2xl p-5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Generate social content</p>
                <p className="text-slate-500 text-xs">Instagram, TikTok, LinkedIn posts based on your data</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
          </Link>
        )}
      </div>
    </div>
  );
}

export default function AiInsightsPage() {
  return (
    <PageErrorBoundary label="ai-insights">
      <AiInsightsContent />
    </PageErrorBoundary>
  );
}
