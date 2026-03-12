'use client';

import { BarChart3, Zap, ShieldCheck, Globe, Bell, TrendingUp, Layers, Target } from 'lucide-react';

const features = [
  {
    icon: Layers,
    title: 'Cross-platform product intelligence',
    description: 'See exactly which products perform on Shopify vs Amazon vs Bol.com — side by side. Identify your winners, cut your losers, and scale with confidence across every channel.',
    color: 'bg-brand-50 text-brand-600',
    badge: 'Core feature',
  },
  {
    icon: BarChart3,
    title: 'Ecommerce data intelligence',
    description: 'Every metric that matters — revenue, conversion, AOV, return rate, LTV — pulled from all your platforms and unified in one clean intelligence layer. No more spreadsheet chaos.',
    color: 'bg-violet-50 text-violet-600',
    badge: 'Core feature',
  },
  {
    icon: Zap,
    title: 'AI growth suggestions',
    description: 'Our AI analyses your data 24/7 and tells you exactly what to do next: which product to scale, which ad to stop, where to launch. Decisions in seconds, not days.',
    color: 'bg-amber-50 text-amber-600',
    badge: 'AI-powered',
  },
  {
    icon: Target,
    title: 'Marketing insights that pay off',
    description: 'Understand your true ROAS per campaign, detect ad fatigue before it hurts your budget, and find the winning audiences hiding in your data.',
    color: 'bg-rose-50 text-rose-600',
    badge: 'AI-powered',
  },
  {
    icon: Globe,
    title: 'Multi-store & multi-market',
    description: 'Selling across multiple countries or brands? Manage every store, every currency, every market from a single dashboard built for scale.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise-grade security',
    description: 'Data encrypted at rest and in transit. Strict tenant isolation. Built from day one to handle 500+ users without compromising on privacy or performance.',
    color: 'bg-sky-50 text-sky-600',
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
            Stop guessing. Start growing.
          </h2>
          <p className="text-slate-500 text-lg leading-relaxed">
            Every feature is built around one goal: give ecommerce entrepreneurs the intelligence
            they need to make the right call — fast.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(f => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                {f.badge && (
                  <span className="absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-100">
                    {f.badge}
                  </span>
                )}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-700 text-slate-900 mb-2 leading-snug pr-16">
                  {f.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
