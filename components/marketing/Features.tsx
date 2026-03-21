'use client';

// components/marketing/Features.tsx
// Positionering: MarketGrow = action engine, niet attribution tool
// Onderscheid vs Triple Whale: TW = "wat is er gebeurd" / MG = "doe dit nu, op dit kanaal"

import { BarChart3, Zap, ShieldCheck, Globe, ArrowRight, Target, Layers, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Daily actions, not just dashboards',
    description: 'Every morning MarketGrow tells you exactly what to do: pause this campaign, scale this product on Bol.com, move budget from Meta to Google. Not a dashboard to interpret — a decision ready to execute.',
    color: 'bg-amber-50 text-amber-600',
    badge: 'AI-powered',
    example: '"Your ROAS on campaign #4 dropped below break-even. Pause it and reallocate €80/day to your top Bol.com product."',
  },
  {
    icon: Layers,
    title: 'Per-channel product intelligence',
    description: 'The same product can convert at 2% on your Shopify store and 9% on Bol.com. MarketGrow shows you exactly where each product performs best — and tells you where to push it harder and where to pull back.',
    color: 'bg-brand-50 text-brand-600',
    badge: 'Core feature',
    example: '"Product A converts 4× better on Bol.com than Shopify. Increase Bol.com ad spend by €50/day."',
  },
  {
    icon: Target,
    title: 'True cross-platform ROAS',
    description: "Meta says 4.2×. Google says 3.8×. Your actual blended ROAS is 1.9×. MarketGrow calculates your real numbers by combining ad spend with actual attributed revenue across every channel — no more platform inflation.",
    color: 'bg-rose-50 text-rose-600',
    badge: 'AI-powered',
    example: '"Your true blended ROAS this week: 2.1×. Meta is overreporting by 2×. Here\'s the real breakdown."',
  },
  {
    icon: BarChart3,
    title: 'Unified intelligence layer',
    description: 'Revenue, conversion, AOV, return rate, LTV — pulled from every platform and unified in one place. Stop switching between Shopify, Bol.com, Amazon, Meta Ads and Google. One source of truth.',
    color: 'bg-violet-50 text-violet-600',
    badge: 'Core feature',
    example: null,
  },
  {
    icon: Globe,
    title: 'Built for multi-channel sellers',
    description: 'Selling on Shopify, Bol.com, Amazon, Etsy — simultaneously? MarketGrow is built for exactly that. Every channel in one dashboard, with AI that understands how they interact.',
    color: 'bg-emerald-50 text-emerald-600',
    badge: null,
    example: null,
  },
  {
    icon: ShieldCheck,
    title: 'Accessible at every stage',
    description: 'Triple Whale starts at €129/month and is built for brands spending €20k+/month on ads. MarketGrow starts at €20/month — the same AI-driven intelligence, accessible from day one.',
    color: 'bg-sky-50 text-sky-600',
    badge: null,
    example: null,
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            What MarketGrow.ai does
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-800 text-slate-900 mb-4 text-balance">
            Stop analysing. Start acting.
          </h2>
          <p className="text-slate-500 text-lg leading-relaxed">
            Most analytics tools tell you what happened. MarketGrow tells you what to do next —
            with specific actions per channel, per product, per campaign.
          </p>
        </div>

        {/* Comparison callout */}
        <div className="max-w-3xl mx-auto mb-16 rounded-2xl border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-2">
            <div className="bg-slate-50 p-6 border-r border-slate-200">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Other tools</p>
              <ul className="space-y-3">
                {[
                  'Show you what happened last week',
                  'Attribution dashboards to interpret yourself',
                  'Require a data analyst to extract value',
                  '€129–€500+/month',
                  'Built for €20k+/month ad budgets',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-500">
                    <span className="text-slate-300 mt-0.5 flex-shrink-0">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-6">
              <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-3">MarketGrow</p>
              <ul className="space-y-3">
                {[
                  'Tell you what to do today',
                  'Specific actions per channel & product',
                  'AI does the analysis, you execute',
                  'From €20/month',
                  'Built for every stage of growth',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Feature grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-2xl border border-slate-100 p-6 hover:border-slate-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${feature.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {feature.badge && (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      feature.badge === 'AI-powered'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-brand-50 text-brand-600'
                    }`}>
                      {feature.badge}
                    </span>
                  )}
                </div>

                <h3 className="font-display font-700 text-slate-900 text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                  {feature.description}
                </p>

                {/* Real example van een AI actie */}
                {feature.example && (
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Example action
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed italic">
                      {feature.example}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            Start getting actionable insights
            <ArrowRight className="w-4 h-4" />
          </a>
          <p className="text-slate-400 text-xs mt-3">14 days free · No credit card required · Cancel anytime</p>
        </div>

      </div>
    </section>
  );
}
