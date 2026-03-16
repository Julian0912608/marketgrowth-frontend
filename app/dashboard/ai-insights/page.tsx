'use client';

import { useState, useEffect } from 'react';
import {
  Sparkles, RefreshCw, ArrowUpRight, ArrowDownRight,
  AlertTriangle, Lightbulb, Zap, MessageSquare,
  Send, Lock, TrendingUp
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

interface Action {
  priority: 'high' | 'medium' | 'low';
  title:       string;
  description: string;
}

interface Insights {
  briefing:      string;
  actions:       Action[];
  opportunities: string[];
  alerts:        string[];
  generatedAt:   string;
  planSlug:      string;
  hasData:       boolean;
  fromCache:     boolean;
}

interface Credits {
  used:      number;
  limit:     number | null;
  remaining: number | null;
  unlimited: boolean;
  resetDate: string;
}

interface ChatMessage {
  role:    'user' | 'assistant';
  content: string;
}

const priorityConfig = {
  high:   { label: 'Hoog',   color: 'bg-rose-500/10 border-rose-500/20 text-rose-400',   dot: 'bg-rose-400' },
  medium: { label: 'Middel', color: 'bg-amber-500/10 border-amber-500/20 text-amber-400', dot: 'bg-amber-400' },
  low:    { label: 'Laag',   color: 'bg-slate-500/10 border-slate-500/20 text-slate-400', dot: 'bg-slate-400' },
};

export default function AIInsightsPage() {
  const { user } = useAuthStore();
  const planSlug = user?.planSlug ?? 'starter';

  const [insights,  setInsights]  = useState<Insights | null>(null);
  const [credits,   setCredits]   = useState<Credits | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,     setError]     = useState('');

  // Chat state
  const [messages,  setMessages]  = useState<ChatMessage[]>([]);
  const [input,     setInput]     = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    loadInsights();
    loadCredits();
  }, []);

  const loadInsights = async (forceRefresh = false) => {
    try {
      if (forceRefresh) setRefreshing(true);
      else setLoading(true);
      setError('');
      const res = await api.get(`/ai/insights${forceRefresh ? '?refresh=true' : ''}`);
      setInsights(res.data);
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Kon AI insights niet laden.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadCredits = async () => {
    try {
      const res = await api.get('/ai/credits');
      setCredits(res.data);
    } catch {}
  };

  const sendChat = async () => {
    if (!input.trim() || chatLoading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatLoading(true);
    try {
      const res = await api.post('/ai/chat', { message: userMsg });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
      loadCredits();
    } catch (e: any) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: e.response?.data?.message ?? 'Er ging iets mis. Probeer opnieuw.',
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const generatedTime = insights?.generatedAt
    ? new Date(insights.generatedAt).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-800 text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-brand-400" />
            AI Insights
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {planSlug === 'starter' ? 'Wekelijkse briefing' : planSlug === 'growth' ? 'Dagelijkse briefing' : 'Real-time inzichten'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Credits badge */}
          {credits && (
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2 text-center">
              <div className="text-xs text-slate-400">AI credits</div>
              <div className="text-sm font-semibold text-white">
                {credits.unlimited ? '∞' : `${credits.remaining} / ${credits.limit}`}
              </div>
            </div>
          )}
          {/* Refresh knop */}
          <button
            onClick={() => loadInsights(true)}
            disabled={refreshing || planSlug === 'starter'}
            title={planSlug === 'starter' ? 'Upgrade naar Growth voor on-demand refresh' : 'Ververs insights'}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:text-white hover:border-slate-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Ververs
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-slate-800/60 rounded-2xl border border-slate-700/50 p-6 animate-pulse">
              <div className="h-4 bg-slate-700 rounded w-1/3 mb-3" />
              <div className="h-3 bg-slate-700/60 rounded w-full mb-2" />
              <div className="h-3 bg-slate-700/60 rounded w-4/5" />
            </div>
          ))}
        </div>
      )}

      {insights && !loading && (
        <div className="space-y-6">

          {/* Geen data state */}
          {!insights.hasData && (
            <div className="bg-brand-600/10 border border-brand-600/20 rounded-2xl p-6 flex items-start gap-4">
              <TrendingUp className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-brand-300 mb-1">Koppel je winkel voor gepersonaliseerde inzichten</p>
                <p className="text-sm text-slate-400">Zodra je Shopify, Bol.com of een andere winkel koppelt, analyseert de AI je verkoopsdata dagelijks.</p>
              </div>
            </div>
          )}

          {/* Dagelijkse briefing */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-400" />
                <h2 className="text-sm font-semibold text-slate-300">Dagelijkse briefing</h2>
              </div>
              {generatedTime && (
                <span className="text-xs text-slate-500">
                  {insights.fromCache ? 'Gecached' : 'Gegenereerd'} om {generatedTime}
                </span>
              )}
            </div>
            <p className="text-white leading-relaxed">{insights.briefing}</p>
          </div>

          {/* Acties */}
          {insights.actions.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Aanbevolen acties
              </h2>
              <div className="space-y-3">
                {insights.actions.map((action, i) => {
                  const cfg = priorityConfig[action.priority];
                  return (
                    <div key={i} className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 flex gap-4">
                      <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${cfg.dot}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-white">{action.title}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed">{action.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Kansen & Alerts grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Kansen */}
            {insights.opportunities.length > 0 && (
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-semibold text-slate-300">Kansen</h3>
                </div>
                <ul className="space-y-2">
                  {insights.opportunities.map((opp, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      {opp}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Alerts */}
            {insights.alerts.length > 0 && (
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <h3 className="text-sm font-semibold text-slate-300">Aandachtspunten</h3>
                </div>
                <ul className="space-y-2">
                  {insights.alerts.map((alert, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                      <ArrowDownRight className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                      {alert}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* AI Chat */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-700/50">
              <MessageSquare className="w-4 h-4 text-brand-400" />
              <h3 className="text-sm font-semibold text-slate-300">Vraag de AI</h3>
              {planSlug === 'starter' && (
                <span className="ml-auto flex items-center gap-1 text-xs text-amber-400">
                  <Lock className="w-3 h-3" />
                  Growth plan
                </span>
              )}
            </div>

            {/* Chat messages */}
            {messages.length > 0 && (
              <div className="p-5 space-y-4 max-h-80 overflow-y-auto">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-brand-600 text-white rounded-br-sm'
                        : 'bg-slate-700/60 text-slate-200 rounded-bl-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-700/60 px-4 py-3 rounded-2xl rounded-bl-sm">
                      <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Input */}
            <div className="p-4">
              {planSlug === 'starter' ? (
                <div className="flex items-center justify-between bg-slate-700/30 rounded-xl px-4 py-3">
                  <span className="text-sm text-slate-500">Upgrade naar Growth voor AI chat</span>
                  <button
                    onClick={() => window.location.href = '/settings?tab=billing'}
                    className="text-xs text-brand-400 hover:text-brand-300 font-medium"
                  >
                    Upgrade →
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendChat()}
                    placeholder="Stel een vraag over je data..."
                    className="flex-1 bg-slate-700/40 border border-slate-600/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50 transition-colors"
                  />
                  <button
                    onClick={sendChat}
                    disabled={!input.trim() || chatLoading}
                    className="w-10 h-10 rounded-xl bg-brand-600 hover:bg-brand-700 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
