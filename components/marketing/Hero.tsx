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
          Now live — start your free trial today
        </div>

        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-800 text-slate-900 leading-[1.05] tracking-tight mb-6 text-balance">
          Stop analysing.
          <span className="block text-brand-600">Start acting.</span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-500 leading-relaxed mb-10 text-balance">
          Connect your stores and ad accounts. MarketGrow's AI tells you exactly what to do today —
          which products to scale, which campaigns to cut, where to move your budget.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <Link
            href="/register"
            className="group flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg text-sm"
          >
            Start free trial — 14 days free
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
        <div className="relative max-w-5xl mx-auto" id="demo">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50">
              <div className="w-3 h-3 rounded-full bg-rose-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <div className="flex-1 mx-4 bg-white rounded-md px-3 py-1 text-xs text-slate-400 border border-slate-200">
                app.marketgrow.ai/dashboard
              </div>
            </div>

            {/* Dashboard mock */}
            <div className="bg-slate-900 p-6">
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Revenue today', value: '€1,847', change: '+12%', color: 'text-emerald-400' },
                  { label: 'Orders today',  value: '23',     change: '+8%',  color: 'text-blue-400' },
                  { label: 'Avg order',     value: '€80',    change: '+3%',  color: 'text-violet-400' },
                  { label: 'AI credits',    value: '1,842',  change: '',     color: 'text-amber-400' },
                ].map(stat => (
                  <div key={stat.label} className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
                    <div className="text-xs text-slate-400 mb-2">{stat.label}</div>
                    <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                    {stat.change && <div className="text-xs text-emerald-400 mt-1">{stat.change} vs yesterday</div>}
                  </div>
                ))}
              </div>

              {/* AI actions */}
              <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-md bg-brand-600/30 flex items-center justify-center">
                    <span className="text-brand-400 text-xs">✦</span>
                  </div>
                  <span className="text-sm font-semibold text-white">AI Actions for today</span>
                </div>
                <div className="space-y-2">
                  {[
                    { priority: 'Today', text: 'Increase Bol.com Ads budget for maintenance oil by €25/day — 12 sales, €174 revenue', tag: 'Bol.com Ads', color: 'bg-blue-500/20 text-blue-300' },
                    { priority: 'This week', text: 'Cross-sell cutting board with maintenance oil orders on Shopify — perfect product combo', tag: 'Shopify', color: 'bg-emerald-500/20 text-emerald-300' },
                  ].map((action, i) => (
                    <div key={i} className="flex items-start gap-3 bg-slate-900/40 rounded-lg p-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${i === 0 ? 'bg-rose-400' : 'bg-amber-400'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-slate-400">{action.priority}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${action.color}`}>{action.tag}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{action.text}</p>
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
