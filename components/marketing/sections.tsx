'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, ChevronDown, Zap, TrendingUp, BarChart3, Lightbulb, Sparkles, ExternalLink } from 'lucide-react';

// ── Platform SVG logos ────────────────────────────────────────
const platforms = [
  {
    name: 'Shopify',
    svg: `<svg viewBox="0 0 109 124" width="32" height="36" xmlns="http://www.w3.org/2000/svg"><path d="M94.5 13.8c-.1-.7-.7-1.1-1.2-1.1s-9.7-.7-9.7-.7-6.4-6.4-7.1-7.1c-.7-.7-2-.5-2.5-.3-.1 0-1.4.4-3.5 1.1C68.9 2.3 65.6 0 61.7 0c-9.8 0-14.5 12.3-16 18.5-3.8 1.2-6.5 2-6.8 2.1-2.1.7-2.2.7-2.4 2.7C36.3 24.7 26 106 26 106l68.7 12.9L109 113c0 .1-14.4-98.5-14.5-99.2z" fill="#95BF47"/><path d="M93.3 12.7c-.5 0-9.7-.7-9.7-.7s-6.4-6.4-7.1-7.1c-.3-.3-.6-.4-.9-.4L80 118.9l28.9-6.2-14.5-99.2c-.1-.5-.7-.8-1.1-.8z" fill="#5E8E3E"/><path d="M61.7 39.3l-3.4 10.1s-3-1.6-6.6-1.6c-5.3 0-5.6 3.3-5.6 4.2 0 4.6 12 6.4 12 17.2 0 8.5-5.4 14-12.7 14-8.7 0-13.2-5.4-13.2-5.4l2.3-7.7s4.6 3.9 8.4 3.9c2.5 0 3.6-2 3.6-3.4 0-6-9.8-6.2-9.8-16.2 0-8.3 6-16.4 18.1-16.4 4.7-.1 7 1.3 6.9 1.3z" fill="#fff"/></svg>`,
  },
  {
    name: 'WooCommerce',
    svg: `<svg viewBox="0 0 200 72" width="80" height="29" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="72" rx="10" fill="#7F54B3"/><text x="14" y="48" font-family="Arial Black,Arial" font-weight="900" font-size="38" fill="white">Woo</text></svg>`,
  },
  {
    name: 'Amazon',
    svg: `<svg viewBox="0 0 145 44" width="90" height="28" xmlns="http://www.w3.org/2000/svg"><text x="0" y="34" font-family="Arial Black,Arial" font-weight="900" font-size="36" fill="#232F3E">amazon</text><path d="M12 40 Q72 52 132 40" stroke="#FF9900" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M122 33 Q135 39 132 40 Q128 34 124 37z" fill="#FF9900"/></svg>`,
  },
  {
    name: 'Etsy',
    svg: `<svg viewBox="0 0 56 56" width="32" height="32" xmlns="http://www.w3.org/2000/svg"><circle cx="28" cy="28" r="28" fill="#F56400"/><path d="M17 13h22v7H24v8h13v7H24v9h15v7H17z" fill="white"/></svg>`,
  },
  {
    name: 'Meta Ads',
    svg: `<svg viewBox="0 0 56 56" width="32" height="32" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="mg2" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#0064E0"/><stop offset="100%" stop-color="#00C2FF"/></linearGradient></defs><circle cx="28" cy="28" r="28" fill="url(#mg2)"/><path d="M12 34c0-5 2-10 5-14 2-3 5-5 8-5 2.5 0 5 1.5 7.5 5.5l6 9.5c1.5 2.5 3 3.5 4.5 3.5 3.5 0 5.5-4 5.5-10 0-4-1.5-8-4.5-10.5" stroke="white" stroke-width="4.5" stroke-linecap="round" fill="none"/><path d="M44 34c0-5-2-10-5-14-2-3-5-5-8-5-2.5 0-5 1.5-7.5 5.5" stroke="white" stroke-width="4.5" stroke-linecap="round" fill="none"/></svg>`,
  },
  {
    name: 'Google Ads',
    svg: `<svg viewBox="0 0 56 56" width="32" height="32" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="28" width="14" height="22" rx="7" fill="#EA4335"/><rect x="21" y="6" width="14" height="44" rx="7" fill="#34A853"/><rect x="38" y="18" width="14" height="32" rx="7" fill="#FBBC04"/></svg>`,
  },
  {
    name: 'TikTok Ads',
    svg: `<svg viewBox="0 0 56 56" width="32" height="32" xmlns="http://www.w3.org/2000/svg"><circle cx="28" cy="28" r="28" fill="#010101"/><path d="M36 14h-6v19a5 5 0 1 1-5-5v-6a11 11 0 1 0 11 11V22a14 14 0 0 0 8 2.5V18a8 8 0 0 1-8-4z" fill="white"/></svg>`,
  },
];

// ── Platform connections ──────────────────────────────────────
export function PlatformBar() {
  return (
    <section className="py-14 border-y border-slate-100 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400 mb-10">
          One dashboard for all your ecommerce data
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {platforms.map(p => (
            <div key={p.name} className="flex flex-col items-center gap-2 group cursor-default">
              <div
                className="flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity duration-200"
                dangerouslySetInnerHTML={{ __html: p.svg }}
              />
              <span className="text-xs text-slate-400 group-hover:text-slate-600 font-medium transition-colors">{p.name}</span>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-slate-400 mt-8">
          All your revenue, ROAS, and product data — unified in seconds.
          <span className="text-slate-500 font-medium"> More integrations coming soon.</span>
        </p>
      </div>
    </section>
  );
}

// ── Product Performance ───────────────────────────────────────
export function ProductPerformance() {
  return (
    <section id="features" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <BarChart3 className="w-3.5 h-3.5" />
              Product performance
            </div>
            <h2 className="font-display text-4xl font-800 text-slate-900 mb-4 leading-tight">
              See which products perform best across every platform
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              Stop guessing where your products convert best. MarketGrow shows you real performance data across all your stores and marketplaces — side by side.
            </p>
          </div>

          {/* Mock product card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Product</p>
                <p className="font-display font-700 text-slate-900">Hydrating Face Serum</p>
              </div>
              <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-full border border-emerald-100">
                Trending ↑
              </span>
            </div>

            <div className="p-6 space-y-4">
              {[
                { platform: 'Amazon',       color: '#FF9900', letter: 'A', cr: '8.1', revenue: '€4,200', bar: 81 },
                { platform: 'TikTok Shop',  color: '#010101', letter: 'T', cr: '5.6', revenue: '€2,100', bar: 56 },
                { platform: 'Shopify',      color: '#96bf47', letter: 'S', cr: '2.4', revenue: '€1,800', bar: 24 },
              ].map(row => (
                <div key={row.platform}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: row.color }}>
                        {row.letter}
                      </div>
                      <span className="text-sm font-medium text-slate-700">{row.platform}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-500">CR <span className="font-semibold text-slate-900">{row.cr}%</span></span>
                      <span className="text-slate-500">{row.revenue}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full">
                    <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${row.bar}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* AI insight */}
            <div className="mx-6 mb-6 bg-brand-50 border border-brand-100 rounded-xl p-4 flex gap-3">
              <Sparkles className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-brand-700 mb-0.5">AI insight</p>
                <p className="text-sm text-brand-800">Amazon shows the highest conversion rate for this product. Consider increasing Amazon ad spend.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Marketing Insights ────────────────────────────────────────
export function MarketingInsights() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Mock marketing card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden order-2 lg:order-1">
            <div className="px-6 py-4 border-b border-slate-100">
              <p className="text-xs text-slate-400 mb-0.5">Campaign overview</p>
              <p className="font-display font-700 text-slate-900">Q1 Ad performance</p>
            </div>

            <div className="p-6 space-y-4">
              {[
                { platform: 'Meta Ads',    color: '#0082FB', letter: 'M', roas: 3.8, spend: '€1,200', bar: 76 },
                { platform: 'Google Ads',  color: '#4285F4', letter: 'G', roas: 2.1, spend: '€900',   bar: 42 },
                { platform: 'TikTok Ads',  color: '#010101', letter: 'T', roas: 1.4, spend: '€600',   bar: 28 },
              ].map(row => (
                <div key={row.platform}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: row.color }}>
                        {row.letter}
                      </div>
                      <span className="text-sm font-medium text-slate-700">{row.platform}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-500">ROAS <span className={`font-semibold ${row.roas >= 3 ? 'text-emerald-600' : 'text-slate-900'}`}>{row.roas}×</span></span>
                      <span className="text-slate-500">{row.spend}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full">
                    <div className="h-1.5 rounded-full" style={{ width: `${row.bar}%`, backgroundColor: row.color }} />
                  </div>
                </div>
              ))}
            </div>

            {/* AI insight */}
            <div className="mx-6 mb-6 bg-brand-50 border border-brand-100 rounded-xl p-4 flex gap-3">
              <Sparkles className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-brand-700 mb-0.5">AI insight</p>
                <p className="text-sm text-brand-800">Meta campaigns generate the highest return for this product category. TikTok Ads ROAS is below break-even — consider pausing.</p>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <TrendingUp className="w-3.5 h-3.5" />
              Marketing insights
            </div>
            <h2 className="font-display text-4xl font-800 text-slate-900 mb-4 leading-tight">
              Understand which campaigns actually drive revenue
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              ROAS per campaign, winning audiences, ad fatigue detection. Know exactly where to spend more and where to cut — before the money is wasted.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── AI Growth Opportunities ───────────────────────────────────
export function GrowthOpportunities() {
  const opportunities = [
    { icon: '📈', action: 'Scale Amazon ads for Hydrating Face Serum', reason: 'ROAS 4.8× — highest in portfolio', tag: 'Scale', tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    { icon: '⏸️', action: 'Pause Meta ad set B — Summer Collection', reason: 'ROAS 0.8× for 14 days — below break-even', tag: 'Pause', tagColor: 'bg-rose-50 text-rose-700 border-rose-100' },
    { icon: '🧪', action: 'Test TikTok campaign for Vitamin C Serum', reason: 'High search volume, no TikTok presence yet', tag: 'Test', tagColor: 'bg-amber-50 text-amber-700 border-amber-100' },
    { icon: '🚀', action: 'Launch Shopify bundle: Serum + Moisturizer', reason: 'AOV opportunity — frequently bought together', tag: 'Launch', tagColor: 'bg-brand-50 text-brand-700 border-brand-100' },
  ];

  return (
    <section id="demo" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Lightbulb className="w-3.5 h-3.5" />
            AI growth opportunities
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-800 text-slate-900 mb-4">
            MarketGrow tells you exactly what to do next
          </h2>
          <p className="text-slate-500 text-lg">
            Every day, our AI analyses your data and surfaces the highest-impact actions you can take right now.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-slate-700">Daily growth opportunities</p>
            <span className="text-xs bg-brand-600 text-white px-2.5 py-1 rounded-full font-semibold">4 new today</span>
          </div>

          {opportunities.map((op, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="text-2xl flex-shrink-0">{op.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-slate-900">{op.action}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${op.tagColor}`}>{op.tag}</span>
                </div>
                <p className="text-xs text-slate-500">{op.reason}</p>
              </div>
              <button className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 border border-brand-200 hover:border-brand-300 px-3 py-1.5 rounded-lg transition-colors">
                View <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── AI Ad Creative ────────────────────────────────────────────
export function AdCreative() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-rose-50 text-rose-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              AI ad creative
            </div>
            <h2 className="font-display text-4xl font-800 text-slate-900 mb-4 leading-tight">
              Generate new ad ideas based on what actually works
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              MarketGrow analyses your top-performing ads and products, then suggests fresh creative angles — so you never run out of ideas.
            </p>
          </div>

          {/* Mock ad creative card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Product</p>
                <p className="font-display font-700 text-slate-900">Hydrating Face Serum</p>
              </div>
              <span className="text-xs bg-rose-50 text-rose-700 font-semibold px-2.5 py-1 rounded-full border border-rose-100">AI generated</span>
            </div>

            <div className="p-6">
              {/* Top angle */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Top performing angle</p>
                <div className="bg-gradient-to-r from-brand-50 to-violet-50 border border-brand-100 rounded-xl p-4">
                  <p className="font-display font-700 text-slate-900 text-lg">"Hydrates skin in 24 hours"</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-slate-500">Used in 3 top ads</span>
                    <span className="text-xs font-semibold text-emerald-600">• Avg ROAS 4.1×</span>
                  </div>
                </div>
              </div>

              {/* Suggested concepts */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Suggested ad concepts</p>
                <div className="space-y-2">
                  {[
                    { concept: 'Before / after hydration test', format: 'Video · 15s', score: '94' },
                    { concept: 'Dermatologist reaction video',   format: 'Video · 30s', score: '89' },
                    { concept: 'Morning routine format',         format: 'Carousel',    score: '82' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{item.concept}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{item.format}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <div className="text-sm font-bold text-brand-600">{item.score}</div>
                        <div className="text-xs text-slate-400">score</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Pricing ───────────────────────────────────────────────────
const plans = [
  {
    slug: 'starter',
    name: 'Starter',
    price: 20,
    popular: false,
    desc: 'Perfect for entrepreneurs just starting with data-driven growth.',
    features: ['1 connected store', '100 AI credits / month', 'Sales dashboard', 'Order & revenue analytics', 'Weekly AI report', 'Email support'],
    cta: 'Start free trial',
  },
  {
    slug: 'growth',
    name: 'Growth',
    price: 49,
    popular: true,
    desc: 'For growing stores that need deeper insights and AI recommendations.',
    features: ['3 connected stores', '2,000 AI credits / month', 'Everything in Starter', 'AI product recommendations', 'Ad analytics', 'Customer LTV forecasting', 'Daily AI briefing', 'Report export', 'Priority support'],
    cta: 'Start free trial',
  },
  {
    slug: 'scale',
    name: 'Scale',
    price: 150,
    popular: false,
    desc: 'For established brands and agencies managing multiple stores.',
    features: ['Unlimited stores', 'Unlimited AI credits', 'Everything in Growth', 'AI ad optimisation', 'White-label dashboard', 'Team accounts', 'API access', 'Dedicated account manager'],
    cta: 'Contact sales',
  },
];

export function Pricing() {
  const [annual, setAnnual] = useState(true);
  return (
    <section id="pricing" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">Simple pricing</div>
          <h2 className="font-display text-4xl sm:text-5xl font-800 text-slate-900 mb-4">Grow without surprises</h2>
          <p className="text-slate-500 text-lg mb-8">Start free for 14 days. No credit card required.</p>
          <div className="inline-flex items-center gap-3 bg-white rounded-xl p-1 border border-slate-200">
            <button onClick={() => setAnnual(false)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${!annual ? 'bg-brand-600 text-white shadow' : 'text-slate-500'}`}>Monthly</button>
            <button onClick={() => setAnnual(true)}  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${annual  ? 'bg-brand-600 text-white shadow' : 'text-slate-500'}`}>Annual <span className={annual ? 'text-brand-200' : 'text-emerald-600'}>−20%</span></button>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map(plan => {
            const price = annual ? Math.round(plan.price * 0.8) : plan.price;
            return (
              <div key={plan.slug} className={`relative rounded-2xl p-6 flex flex-col ${plan.popular ? 'bg-brand-600 text-white shadow-xl shadow-brand-600/30' : 'bg-white border border-slate-200'}`}>
                {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">Most popular</div>}
                <h3 className={`font-display font-700 text-lg mb-1 ${plan.popular ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                <p className={`text-sm mb-4 ${plan.popular ? 'text-brand-100' : 'text-slate-500'}`}>{plan.desc}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className={`font-display text-4xl font-800 ${plan.popular ? 'text-white' : 'text-slate-900'}`}>€{price}</span>
                  <span className={`text-sm ${plan.popular ? 'text-brand-200' : 'text-slate-400'}`}>/mo</span>
                </div>
                <ul className="space-y-3 flex-1 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <Check className={`w-4 h-4 flex-shrink-0 ${plan.popular ? 'text-brand-200' : 'text-emerald-500'}`} />
                      <span className={plan.popular ? 'text-brand-50' : 'text-slate-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.slug === 'scale' ? '/contact' : `/register?plan=${plan.slug}`} className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${plan.popular ? 'bg-white text-brand-600 hover:bg-brand-50' : 'bg-brand-600 text-white hover:bg-brand-700'}`}>{plan.cta}</Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Early Access / Social Proof ───────────────────────────────
export function Testimonials() {
  const problems = [
    { emoji: '😓', title: 'Too many tabs open', desc: 'Switching between Shopify, Meta Ads and Amazon daily just to get a basic overview of your numbers.' },
    { emoji: '📊', title: 'Data without direction', desc: 'You see the numbers, but you don\'t know which product to scale, which ad to stop or where to focus next.' },
    { emoji: '⏱️', title: 'Hours lost every week', desc: 'Building reports manually in spreadsheets instead of actually growing your business.' },
  ];

  const waitlistAvatars = ['JK', 'MS', 'RB', 'LV', 'AT', 'PD', 'NW', 'CB'];

  return (
    <section id="testimonials" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            Built for real problems
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-800 text-slate-900 mb-4">
            Sound familiar?
          </h2>
          <p className="text-slate-500 text-lg">
            MarketGrow is built by ecommerce operators who lived these problems every day.
          </p>
        </div>

        {/* Problem cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {problems.map(p => (
            <div key={p.title} className="bg-slate-50 rounded-2xl border border-slate-100 p-6">
              <div className="text-3xl mb-4">{p.emoji}</div>
              <h3 className="font-display font-700 text-slate-900 mb-2">{p.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Waitlist social proof */}
        <div className="bg-gradient-to-br from-brand-50 to-violet-50 border border-brand-100 rounded-2xl p-8 sm:p-12 text-center max-w-3xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <div className="flex -space-x-2">
              {waitlistAvatars.map((initials, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full bg-brand-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                  style={{ opacity: 1 - i * 0.08 }}
                >
                  {initials}
                </div>
              ))}
            </div>
          </div>
          <h3 className="font-display text-2xl font-800 text-slate-900 mb-2">
            Join the waitlist
          </h3>
          <p className="text-slate-500 text-base mb-2">
            Ecommerce entrepreneurs from Shopify, Amazon and Bol.com stores are already signed up.
          </p>
          <p className="text-brand-600 font-semibold text-sm mb-6">
            Early access members get their first month free on launch.
          </p>
          <a
            href="#"
            onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg text-sm"
          >
            Claim your early access spot →
          </a>
        </div>

      </div>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────
const faqs = [
  { q: 'Which platforms does MarketGrow support?',     a: 'Shopify, WooCommerce, Amazon, Bol.com, Etsy, Meta Ads, Google Ads, TikTok Ads and more. New integrations are added regularly.' },
  { q: 'Is my data secure?',                           a: 'Yes. All data is encrypted in transit and at rest. Each account is fully isolated — no data is ever shared between customers.' },
  { q: 'Can I cancel my subscription at any time?',    a: 'Absolutely. Cancel anytime from your account settings. You keep access until the end of your billing period.' },
  { q: 'What are AI credits?',                         a: 'AI credits power insight generation, recommendations, and automated reports. Unused credits do not roll over.' },
  { q: 'Do you offer a free trial?',                   a: 'Yes — all plans include a 14-day free trial. No credit card required to start.' },
  { q: 'What happens if I exceed my AI credit limit?', a: "Your dashboard continues to work normally. AI-powered features pause until the next billing cycle — we'll notify you before that happens." },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" className="py-24 bg-slate-50">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl sm:text-5xl font-800 text-slate-900 mb-4">Frequently asked questions</h2>
          <p className="text-slate-500 text-lg">Still have questions? <a href="mailto:hello@marketgrow.ai" className="text-brand-600 hover:underline">We're here to help.</a></p>
        </div>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <button className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors" onClick={() => setOpen(open === i ? null : i)}>
                <span className="font-medium text-slate-900 text-sm pr-4">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && <div className="px-5 pb-4 text-sm text-slate-500 leading-relaxed border-t border-slate-100">{faq.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA ───────────────────────────────────────────────────────
export function CTA() {
  const [email, setEmail]   = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
    } catch {}
    setStatus('success');
    setEmail('');
  }

  return (
    <section id="waitlist" className="py-24 bg-brand-600">
      <div className="max-w-xl mx-auto px-6 text-center">
        <h2 className="font-display text-4xl sm:text-5xl font-800 text-white mb-4 text-balance">
          Ready to grow smarter?
        </h2>
        <p className="text-brand-100 text-lg mb-10">
          Be among the first to access MarketGrow. Early access members get their first month free.
        </p>

        {status === 'success' ? (
          <div className="flex items-center justify-center gap-3 bg-white/20 border border-white/30 text-white font-medium px-6 py-4 rounded-xl mb-4">
            ✓ You're on the list! We'll be in touch soon.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your work email"
              className="flex-1 px-4 py-3.5 rounded-xl border border-white/20 bg-white/10 text-white placeholder:text-brand-200 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="group flex items-center justify-center gap-2 bg-white text-brand-600 hover:bg-brand-50 disabled:opacity-60 font-semibold px-6 py-3.5 rounded-xl transition-all shadow-lg whitespace-nowrap text-sm"
            >
              {status === 'loading' ? 'Joining...' : 'Join the waitlist'}
              {status !== 'loading' && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>
        )}
        <p className="text-brand-200 text-sm">No credit card · No spam · First month free on launch</p>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────
export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 text-white font-display font-700 text-lg mb-3">
              <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center"><Zap className="w-3.5 h-3.5 text-white" fill="white" /></div>
              MarketGrow
            </div>
            <p className="text-sm leading-relaxed">AI-powered ecommerce intelligence for entrepreneurs who want to grow.</p>
          </div>
          {[
            { title: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
            { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
{
  title: 'Legal',
  links: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms',   href: '/terms' },
    { label: 'Security', href: '/privacy#security' },
    { label: 'Cookies', href: '/privacy#cookies' },
  ]
},          ].map(col => (
            <div key={col.title}>
              <h4 className="text-white text-sm font-semibold mb-4">{col.title}</h4>
              <ul className="space-y-2">{col.links.map((l: any) => (
  <li key={typeof l === 'string' ? l : l.label}>
    <a href={typeof l === 'string' ? '#' : l.href} className="text-sm hover:text-white transition-colors">
      {typeof l === 'string' ? l : l.label}
    </a>
  </li>
))}
            </div>
          ))}
        </div>
        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} MarketGrow. All rights reserved.</p>
          <p>Made for ecommerce entrepreneurs 🚀</p>
        </div>
      </div>
    </footer>
  );
}
