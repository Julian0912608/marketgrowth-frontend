'use client';

import Link from 'next/link';
import { ArrowRight, Play, Check } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-b from-slate-50 to-white pt-16 overflow-hidden">
      <div className="absolute top-32 left-1/4 w-96 h-96 bg-brand-200/40 rounded-full blur-3xl" />
      <div className="absolute bottom-32 right-1/4 w-72 h-72 bg-sky-200/30 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 py-24 text-center">

        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-4 py-2 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          Now live. Start your free trial today.
        </div>

        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-800 text-slate-900 leading-[1.05] tracking-tight mb-6 text-balance">
          Stop analysing.
          <span className="block text-brand-600">Start acting.</span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-500 leading-relaxed mb-10 text-balance">
          Connect your stores and ad accounts. MarketGrow's AI tells you exactly what to do today:
          which products to scale, which campaigns to cut, where to move your budget.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <Link
            href="/register"
            className="group flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg text-sm"
          >
            Start your free 14-day trial
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#demo"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
          >
            <div className="w-8 h-8 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center">
              <Play className="w-3 h-3 fill-slate-500 text-slate-500 ml-0.5" />
            </div>
            View demo
          </a>
        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-20">
          {[
            'No credit card required',
            'Cancel anytime',
            '14-day free trial',
          ].map(t => (
            <div key={t} className="flex items-center gap-1.5 text-xs text-slate-400">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              {t}
            </div>
          ))}
        </div>

        {/* Mock dashboard preview */}
        <div className="relative max-w-5xl mx-auto">
          <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700/50">
              <div className="w-3 h-3 rounded-full bg-rose-500/60" />
              <div className="w-3 h-3 rounded-full bg-amber-500/60" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
              <div className="ml-4 flex-1 bg-slate-800 rounded-md h-6 max-w-xs" />
            </div>
            <div className="p-6 grid sm:grid-cols-3 gap-4">
              {[
                { label: 'Revenue excl. VAT (7d)', value: '€24,810', change: '+12%', color: 'text-emerald-400' },
                { label: 'Orders (7d)',             value: '384',     change: '+8%',  color: 'text-blue-400'    },
                { label: 'Top ROAS campaign',       value: '4.8×',    change: '+0.6', color: 'text-violet-400'  },
              ].map(stat => (
                <div key={stat.label} className="bg-slate-800/60 rounded-xl p-4">
                  <p className="text-slate-400 text-xs mb-2">{stat.label}</p>
                  <p className={`font-display text-2xl font-800 ${stat.color} mb-1`}>{stat.value}</p>
                  <p className="text-emerald-400 text-xs font-medium">{stat.change} vs last week</p>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6">
              <div className="bg-slate-800/40 rounded-xl p-4 border border-brand-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded bg-brand-600 flex items-center justify-center">
                    <span className="text-white text-xs">⚡</span>
                  </div>
                  <span className="text-brand-400 text-xs font-semibold">AI actions for today</span>
                </div>
                <div className="space-y-2">
                  {[
                    { priority: 'High', text: 'Increase Amazon budget for Hydrating Face Serum. ROAS 4.8× and inventory at 340 units.', color: 'bg-rose-500' },
                    { priority: 'Medium', text: 'Pause TikTok ad set B. ROAS below break-even for 12 days.', color: 'bg-amber-500' },
                  ].map((action, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${action.color} mt-1.5 flex-shrink-0`} />
                      <p className="text-slate-300 text-xs leading-relaxed">{action.text}</p>
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
