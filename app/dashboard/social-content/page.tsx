'use client';

import { useState } from 'react';
import {
  Sparkles, Instagram, Copy, RefreshCw,
  CheckCircle, ChevronDown, Zap, TrendingUp,
  ShoppingBag, Megaphone, Hash,
} from 'lucide-react';
import { api } from '@/lib/api';

// ── Types ─────────────────────────────────────────────────────
type Platform  = 'instagram' | 'tiktok';
type Tone      = 'educational' | 'inspirational' | 'data-driven' | 'behind-the-scenes';
type Topic     = 'roas' | 'product-performance' | 'ads-tips' | 'ecommerce-growth' | 'platform-insights';

interface GeneratedPost {
  caption:  string;
  hashtags: string[];
  hook:     string;
  cta:      string;
}

// ── Config ────────────────────────────────────────────────────
const PLATFORMS: { id: Platform; label: string; icon: string; charLimit: number }[] = [
  { id: 'instagram', label: 'Instagram',  icon: '📸', charLimit: 2200 },
  { id: 'tiktok',    label: 'TikTok',     icon: '🎵', charLimit: 2200 },
];

const TONES: { id: Tone; label: string; desc: string }[] = [
  { id: 'educational',        label: 'Educational',         desc: 'Teach something valuable' },
  { id: 'inspirational',      label: 'Inspirational',       desc: 'Motivate & inspire action' },
  { id: 'data-driven',        label: 'Data-driven',         desc: 'Lead with numbers & stats' },
  { id: 'behind-the-scenes',  label: 'Behind the scenes',   desc: 'Authentic & relatable' },
];

const TOPICS: { id: Topic; label: string; icon: any }[] = [
  { id: 'roas',               label: 'ROAS & Ad Performance',    icon: TrendingUp },
  { id: 'product-performance', label: 'Product Performance',     icon: ShoppingBag },
  { id: 'ads-tips',           label: 'Advertising Tips',         icon: Megaphone },
  { id: 'ecommerce-growth',   label: 'Ecommerce Growth',         icon: Zap },
  { id: 'platform-insights',  label: 'Platform Insights',        icon: Sparkles },
];

// ── Component ─────────────────────────────────────────────────
export default function SocialContentPage() {
  const [platform,   setPlatform]   = useState<Platform>('instagram');
  const [tone,       setTone]       = useState<Tone>('educational');
  const [topic,      setTopic]      = useState<Topic>('roas');
  const [customCtx,  setCustomCtx]  = useState('');
  const [loading,    setLoading]    = useState(false);
  const [posts,      setPosts]      = useState<GeneratedPost[]>([]);
  const [copied,     setCopied]     = useState<number | null>(null);
  const [error,      setError]      = useState('');
  const [count,      setCount]      = useState(3);

  const generate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/ai/social-content', {
        platform,
        tone,
        topic,
        customContext: customCtx,
        count,
      });
      setPosts(res.data.posts ?? []);
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyPost = (index: number, post: GeneratedPost) => {
    const text = `${post.hook}\n\n${post.caption}\n\n${post.cta}\n\n${post.hashtags.map(h => `#${h}`).join(' ')}`;
    navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h1 className="font-display text-2xl font-800 text-white">AI Content Generator</h1>
        </div>
        <p className="text-slate-400 text-sm ml-12">
          Generate platform-ready posts for Instagram & TikTok — powered by your real store data.
        </p>
      </div>

      <div className="grid lg:grid-cols-[380px_1fr] gap-6">

        {/* ── Left: Controls ── */}
        <div className="space-y-5">

          {/* Platform */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Platform</label>
            <div className="grid grid-cols-2 gap-2">
              {PLATFORMS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                    platform === p.id
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <span>{p.icon}</span>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Topic */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Topic</label>
            <div className="space-y-2">
              {TOPICS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTopic(t.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    topic === t.id
                      ? 'bg-brand-600/20 border border-brand-500/40 text-brand-300'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <t.icon className="w-4 h-4 shrink-0" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tone */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Tone</label>
            <div className="grid grid-cols-2 gap-2">
              {TONES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={`flex flex-col items-start px-3 py-2.5 rounded-xl text-left transition-all ${
                    tone === t.id
                      ? 'bg-brand-600/20 border border-brand-500/40'
                      : 'bg-slate-700/30 hover:bg-slate-700/60'
                  }`}
                >
                  <span className={`text-xs font-semibold ${tone === t.id ? 'text-brand-300' : 'text-white'}`}>
                    {t.label}
                  </span>
                  <span className="text-xs text-slate-500 mt-0.5">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom context */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Add context <span className="text-slate-600 normal-case font-normal">(optional)</span>
            </label>
            <textarea
              value={customCtx}
              onChange={e => setCustomCtx(e.target.value)}
              placeholder="e.g. 'We just hit €10k revenue this month' or 'Launching a new product next week'"
              rows={3}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
            />
          </div>

          {/* Count + Generate */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Number of posts
            </label>
            <div className="flex gap-2 mb-4">
              {[1, 3, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                    count === n
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-700/50 text-slate-400 hover:text-white'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <button
              onClick={generate}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all text-sm"
            >
              {loading
                ? <><RefreshCw className="w-4 h-4 animate-spin" /> Generating...</>
                : <><Sparkles className="w-4 h-4" /> Generate posts</>
              }
            </button>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
        </div>

        {/* ── Right: Generated posts ── */}
        <div className="space-y-4">
          {posts.length === 0 && !loading && (
            <div className="h-full min-h-64 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-700/50 rounded-2xl p-12">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5 text-slate-600" />
              </div>
              <p className="text-slate-400 font-medium mb-1">No posts yet</p>
              <p className="text-slate-600 text-sm">Configure your settings and hit Generate</p>
            </div>
          )}

          {loading && (
            <div className="space-y-4">
              {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 animate-pulse">
                  <div className="h-3 bg-slate-700 rounded w-1/4 mb-4" />
                  <div className="h-3 bg-slate-700 rounded w-full mb-2" />
                  <div className="h-3 bg-slate-700 rounded w-4/5 mb-2" />
                  <div className="h-3 bg-slate-700 rounded w-3/5 mb-4" />
                  <div className="flex gap-2">
                    {[1,2,3,4].map(j => <div key={j} className="h-5 bg-slate-700 rounded-full w-16" />)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {posts.map((post, i) => (
            <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">

              {/* Post header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Post {i + 1}
                  </span>
                  <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">
                    {PLATFORMS.find(p => p.id === platform)?.icon} {platform}
                  </span>
                </div>
                <button
                  onClick={() => copyPost(i, post)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                    copied === i
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {copied === i
                    ? <><CheckCircle className="w-3.5 h-3.5" /> Copied!</>
                    : <><Copy className="w-3.5 h-3.5" /> Copy</>
                  }
                </button>
              </div>

              {/* Hook */}
              <div className="mb-3">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Hook</span>
                <p className="text-white font-semibold mt-1 leading-snug">{post.hook}</p>
              </div>

              {/* Caption */}
              <div className="mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Caption</span>
                <p className="text-slate-300 text-sm mt-1 leading-relaxed whitespace-pre-wrap">{post.caption}</p>
              </div>

              {/* CTA */}
              <div className="mb-4">
                <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">Call to action</span>
                <p className="text-brand-300 text-sm mt-1">{post.cta}</p>
              </div>

              {/* Hashtags */}
              <div className="flex flex-wrap gap-1.5">
                {post.hashtags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs bg-slate-700/60 text-slate-400 px-2 py-1 rounded-lg flex items-center gap-1"
                  >
                    <Hash className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
