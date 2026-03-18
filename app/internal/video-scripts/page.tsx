'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Copy, CheckCircle, RefreshCw, Sparkles } from 'lucide-react';

type Result = { hook: string; script: string; visualNotes: string[]; hashtags: string[] };

const SCENARIOS = [
  { id: 'roas-surprise', label: 'ROAS Reality Check', store: 'Shopify + Bol.com seller', revenue: '€42,800', adSpend: '€14,200', realRoas: '3.01x', metaRoas: '5.8x', googleRoas: '4.2x', bolRoas: '3.1x', insight: 'Blended ROAS was 3.01x — but every platform claimed 4x+', campaigns: 28, topProduct: 'Wooden cutting board set', margin: '58%' },
  { id: 'hidden-winner', label: 'Hidden Winning Product', store: 'Multi-channel homeware brand', revenue: '€31,400', adSpend: '€8,900', realRoas: '3.53x', metaRoas: '4.9x', googleRoas: '3.8x', bolRoas: '2.4x', insight: 'One product drove 67% of revenue but had 0% of ad budget', campaigns: 14, topProduct: 'Linen storage basket', margin: '71%' },
  { id: 'budget-drain', label: 'Budget Draining Campaign', store: 'Bol.com electronics seller', revenue: '€18,200', adSpend: '€9,400', realRoas: '1.94x', metaRoas: '—', googleRoas: '—', bolRoas: '1.94x', insight: '3 campaigns spent €6,200 with 0 conversions for 6 weeks', campaigns: 11, topProduct: 'USB-C charging hub', margin: '34%' },
  { id: 'scale-moment', label: 'The Scale Moment', store: 'DTC skincare brand', revenue: '€89,300', adSpend: '€22,100', realRoas: '4.04x', metaRoas: '6.2x', googleRoas: '5.1x', bolRoas: '—', insight: 'Hero product had 8x ROAS — they were underbudgeting it by 80%', campaigns: 34, topProduct: 'Vitamin C serum 30ml', margin: '76%' },
];

const FORMATS = [
  { id: '30s',  label: '30s Reel',        words: 75,  platform: 'Instagram / TikTok' },
  { id: '60s',  label: '60s TikTok',      words: 150, platform: 'TikTok / Instagram' },
  { id: '90s',  label: '90s Educational', words: 225, platform: 'TikTok / YouTube Shorts' },
];

const ANGLES = [
  { id: 'problem-reveal', label: 'Problem Reveal',  desc: 'Open with a painful problem, reveal the solution' },
  { id: 'data-story',     label: 'Data Story',      desc: 'Lead with a surprising number, unpack it' },
  { id: 'before-after',   label: 'Before & After',  desc: 'Show the transformation data brings' },
  { id: 'tip-listicle',   label: 'Tip List',        desc: '3 actionable tips backed by numbers' },
  { id: 'founder-story',  label: 'Founder Story',   desc: 'First-person authentic story' },
];

export default function VideoScriptsPage() {
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
  const [formatId,   setFormatId]   = useState(FORMATS[1].id);
  const [angleId,    setAngleId]    = useState(ANGLES[1].id);
  const [count,      setCount]      = useState(1);
  const [loading,    setLoading]    = useState(false);
  const [results,    setResults]    = useState<Result[]>([]);
  const [error,      setError]      = useState('');
  const [copied,     setCopied]     = useState<string | null>(null);

  const scenario = SCENARIOS.find(s => s.id === scenarioId)!;
  const format   = FORMATS.find(f => f.id === formatId)!;
  const angle    = ANGLES.find(a => a.id === angleId)!;

  const optionClass = (active: boolean) =>
    `w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all mb-2 cursor-pointer border ${
      active
        ? 'bg-brand-600/20 border-brand-500/40 text-brand-300'
        : 'bg-slate-700/30 border-transparent text-slate-400 hover:text-white'
    }`;

  const generate = async () => {
    setLoading(true);
    setError('');
    setResults([]);
    try {
      const calls = Array.from({ length: count }, (_, i) =>
        api.post('/ai/video-script', { scenario, format, angle, index: i, total: count })
           .then((r: any) => r.data)
      );
      const data = await Promise.all(calls);
      setResults(data);
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-lg">
          🎬
        </div>
        <h1 className="font-display text-2xl font-800 text-white">Video Script Generator</h1>
        <span className="text-xs bg-purple-900/50 text-purple-400 px-2.5 py-1 rounded-full font-semibold">
          INTERNAL
        </span>
      </div>
      <p className="text-slate-500 text-sm mb-8 ml-12">
        Generate AI voiceover scripts for MarketGrow social content
      </p>

      <div className="grid lg:grid-cols-[360px_1fr] gap-6">

        {/* ── Left: Controls ── */}
        <div>

          {/* Scenario */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">
              Data Scenario
            </span>
            {SCENARIOS.map(s => (
              <button
                key={s.id}
                onClick={() => setScenarioId(s.id)}
                className={optionClass(scenarioId === s.id)}
              >
                <div className="font-semibold">{s.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.store}</div>
              </button>
            ))}

            {/* Preview */}
            <div className="mt-3 bg-slate-900/60 rounded-xl p-3">
              <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Preview</div>
              {[
                ['Revenue',   scenario.revenue],
                ['Ad spend',  scenario.adSpend],
                ['Real ROAS', scenario.realRoas],
                ['Campaigns', String(scenario.campaigns)],
                ['Margin',    scenario.margin],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between mb-1">
                  <span className="text-xs text-slate-600">{k}</span>
                  <span className="text-xs text-slate-300 font-semibold">{v}</span>
                </div>
              ))}
              <div className="mt-2 pt-2 border-t border-slate-700 text-xs text-amber-400">
                💡 {scenario.insight}
              </div>
            </div>
          </div>

          {/* Format */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">
              Format
            </span>
            {FORMATS.map(f => (
              <button
                key={f.id}
                onClick={() => setFormatId(f.id)}
                className={optionClass(formatId === f.id)}
              >
                <span className="font-semibold">{f.label}</span>
                <span className="text-xs text-slate-500 ml-2">{f.platform}</span>
              </button>
            ))}
          </div>

          {/* Angle */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">
              Angle
            </span>
            {ANGLES.map(a => (
              <button
                key={a.id}
                onClick={() => setAngleId(a.id)}
                className={optionClass(angleId === a.id)}
              >
                <div className="font-semibold">{a.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{a.desc}</div>
              </button>
            ))}
          </div>

          {/* Count + Generate */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">
              Number of scripts
            </span>
            <div className="flex gap-2 mb-4">
              {[1, 3].map(n => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                    count === n
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <button
              onClick={generate}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition-all"
            >
              {loading
                ? <><RefreshCw className="w-4 h-4 animate-spin" /> Generating...</>
                : <><Sparkles className="w-4 h-4" /> Generate scripts</>
              }
            </button>
            {error && <p className="text-rose-400 text-xs mt-3">{error}</p>}
          </div>

        </div>

        {/* ── Right: Results ── */}
        <div>

          {results.length === 0 && !loading && (
            <div className="h-64 border-2 border-dashed border-slate-700/50 rounded-2xl flex flex-col items-center justify-center text-slate-600">
              <div className="text-4xl mb-3">🎬</div>
              <p className="font-semibold">No scripts yet</p>
              <p className="text-sm mt-1">Pick your settings and generate</p>
            </div>
          )}

          {loading && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 animate-pulse">
              {[100, 75, 55, 100, 65].map((w, i) => (
                <div key={i} className="h-3 bg-slate-700 rounded mb-3" style={{ width: `${w}%` }} />
              ))}
            </div>
          )}

          {results.map((r, i) => (
            <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 mb-4">

              {results.length > 1 && (
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                  Script {i + 1} of {results.length}
                </div>
              )}

              {/* Hook */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    ⚡ Hook — first 2 seconds
                  </span>
                  <button
                    onClick={() => copy(r.hook, `hook-${i}`)}
                    className={`text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                      copied === `hook-${i}`
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {copied === `hook-${i}`
                      ? <><CheckCircle className="w-3 h-3" /> Copied</>
                      : <><Copy className="w-3 h-3" /> Copy</>
                    }
                  </button>
                </div>
                <p className="text-white font-bold text-base leading-snug">"{r.hook}"</p>
              </div>

              {/* Script */}
              <div className="bg-slate-900/60 rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    🎙️ Full Script → paste into ElevenLabs
                  </span>
                  <button
                    onClick={() => copy(r.script, `script-${i}`)}
                    className={`text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                      copied === `script-${i}`
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {copied === `script-${i}`
                      ? <><CheckCircle className="w-3 h-3" /> Copied</>
                      : <><Copy className="w-3 h-3" /> Copy</>
                    }
                  </button>
                </div>
                <p
                  className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  {r.script}
                </p>
              </div>

              {/* Visual notes */}
              <div className="bg-slate-900/60 rounded-xl p-4 mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">
                  🎬 Visual Notes — what to show on screen
                </span>
                {(r.visualNotes ?? []).map((n, j) => (
                  <div key={j} className="flex gap-2 items-start mb-2">
                    <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-500 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {j + 1}
                    </span>
                    <span className="text-slate-400 text-sm">{n}</span>
                  </div>
                ))}
              </div>

              {/* Hashtags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {(r.hashtags ?? []).map(h => (
                  <span key={h} className="bg-slate-700/60 text-slate-400 text-xs px-2.5 py-1 rounded-lg">
                    #{h}
                  </span>
                ))}
              </div>

              {/* ElevenLabs workflow */}
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                <p className="text-emerald-400 text-xs font-bold mb-2">🎙️ Next: ElevenLabs voiceover</p>
                <ol className="text-slate-500 text-xs space-y-1 pl-4 list-decimal">
                  <li>Go to <strong className="text-slate-400">elevenlabs.io</strong> → Text to Speech</li>
                  <li>Paste the script, voice: <strong className="text-slate-400">Adam</strong> or <strong className="text-slate-400">Josh</strong>, speed: <strong className="text-slate-400">0.95x</strong></li>
                  <li>Download MP3 → import into <strong className="text-slate-400">CapCut</strong></li>
                  <li>Add visuals per notes above (free stock: <strong className="text-slate-400">pexels.com</strong>)</li>
                  <li>Export → post! 🚀</li>
                </ol>
              </div>

            </div>
          ))}

        </div>
      </div>
    </div>
  );
}
