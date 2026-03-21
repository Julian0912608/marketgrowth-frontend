'use client';

// app/dashboard/ai-insights/page.tsx
// Wijziging: channel badge toegevoegd aan acties + scherper taalgebruik

import { useState, useEffect } from 'react';
import {
  Sparkles, RefreshCw, AlertTriangle, TrendingUp,
  Zap, MessageSquare, Send, ChevronRight,
} from 'lucide-react';
import { api } from '@/lib/api';

interface Action {
  priority: 'high' | 'medium' | 'low';
  title:    string;
  description: string;
  channel?: string;
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
}

const PRIORITY_CONFIG = {
  high:   { color: 'bg-rose-500',   label: 'Vandaag',     text: 'text-rose-400'   },
  medium: { color: 'bg-amber-500',  label: 'Deze week',   text: 'text-amber-400'  },
  low:    { color: 'bg-slate-500',  label: 'Overweeg',    text: 'text-slate-400'  },
};

const CHANNEL_COLORS: Record<string, string> = {
  bolcom:   'bg-blue-500/20 text-blue-300',
  shopify:  'bg-emerald-500/20 text-emerald-300',
  amazon:   'bg-orange-500/20 text-orange-300',
  etsy:     'bg-amber-500/20 text-amber-300',
  meta:     'bg-blue-600/20 text-blue-300',
  google:   'bg-rose-500/20 text-rose-300',
  algemeen: 'bg-slate-700 text-slate-400',
};

const CHANNEL_LABELS: Record<string, string> = {
  bolcom:   'Bol.com',
  shopify:  'Shopify',
  amazon:   'Amazon',
  etsy:     'Etsy',
  meta:     'Meta Ads',
  google:   'Google Ads',
  algemeen: 'Algemeen',
};

export default function AiInsightsPage() {
  const [insight,     setInsight]     = useState<AiInsight | null>(null);
  const [credits,     setCredits]     = useState<Credits | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [chatMsg,     setChatMsg]     = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [error,       setError]       = useState('');

  const loadInsights = async (force = false) => {
    if (force) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const [ins, cr] = await Promise.all([
        api.get('/ai/insights' + (force ? '?force=true' : '')),
        api.get('/ai/credits'),
      ]);
      setInsight(ins.data);
      setCredits(cr.data);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Kon inzichten niet laden.');
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
    } catch {
      setChatHistory(h => [...h, { role: 'assistant', content: 'Er ging iets mis. Probeer opnieuw.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const creditsDisplay = credits
    ? (credits.unlimited ? '∞' : (credits.remaining ?? 0))
    : '–';

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-800 text-white">AI Acties</h1>
            <p className="text-slate-400 text-xs">Wat moet je vandaag doen</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <RefreshCw className="w-6 h-6 animate-spin text-brand-400 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">AI analyseert je data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-800 text-white">AI Acties</h1>
            <p className="text-slate-400 text-xs">
              {creditsDisplay} credits over · {insight?.fromCache ? 'Uit cache' : 'Net gegenereerd'}
            </p>
          </div>
        </div>
        <button
          onClick={() => loadInsights(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-xl transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Vernieuwen
        </button>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {insight && (
        <>
          {/* Dagelijkse briefing */}
          <div className="bg-gradient-to-br from-brand-900/40 to-violet-900/20 border border-brand-500/20 rounded-2xl p-6 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-brand-400" />
              <h2 className="text-sm font-semibold text-slate-300">Briefing van vandaag</h2>
            </div>
            <p className="text-white text-sm leading-relaxed">{insight.briefing}</p>
          </div>

          {/* Alerts */}
          {insight.alerts.length > 0 && (
            <div className="space-y-2 mb-4">
              {insight.alerts.map((alert, i) => (
                <div key={i} className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-300">{alert}</p>
                </div>
              ))}
            </div>
          )}

          {/* Acties — met channel badge */}
          {insight.actions.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 mb-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-slate-300">Wat moet je doen</h2>
              </div>
              <div className="space-y-3">
                {insight.actions.map((action, i) => {
                  const cfg     = PRIORITY_CONFIG[action.priority] || PRIORITY_CONFIG.low;
                  const chColor = action.channel ? (CHANNEL_COLORS[action.channel] ?? CHANNEL_COLORS.algemeen) : null;
                  const chLabel = action.channel ? (CHANNEL_LABELS[action.channel] ?? action.channel) : null;

                  return (
                    <div key={i} className="flex items-start gap-3 p-4 bg-slate-900/40 rounded-xl border border-slate-700/30">
                      <div className={'w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ' + cfg.color} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-1">
                          <span className="text-sm font-medium text-white">{action.title}</span>
                          <span className={'text-xs font-medium ' + cfg.text}>{cfg.label}</span>
                          {chLabel && (
                            <span className={'text-xs font-semibold px-2 py-0.5 rounded-full ' + chColor}>
                              {chLabel}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{action.description}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI Chat */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-4 h-4 text-brand-400" />
              <h2 className="text-sm font-semibold text-slate-300">Stel een vraag</h2>
            </div>
            {chatHistory.length > 0 && (
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {chatHistory.map((msg, i) => (
                  <div key={i} className={'flex ' + (msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                    <div className={'max-w-[80%] px-3 py-2 rounded-xl text-sm ' + (
                      msg.role === 'user'
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-700 text-slate-200'
                    )}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-700 px-3 py-2 rounded-xl">
                      <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={chatMsg}
                onChange={e => setChatMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleChat()}
                placeholder="Vraag iets over je data, kanalen of producten..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <button
                onClick={handleChat}
                disabled={chatLoading || !chatMsg.trim()}
                className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
