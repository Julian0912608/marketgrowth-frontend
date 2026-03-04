'use client';

import Link from 'next/link';
import { ArrowRight, TrendingUp, ShoppingCart, BarChart3 } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-b from-surface-50 to-white pt-16 overflow-hidden">

      {/* Background grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60" />

      {/* Gradient blobs */}
      <div className="absolute top-32 left-1/4 w-96 h-96 bg-brand-200/40 rounded-full blur-3xl" />
      <div className="absolute bottom-32 right-1/4 w-72 h-72 bg-sky-200/30 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 py-24 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold px-4 py-2 rounded-full mb-8 animate-fade-in">
          <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />
          AI-powered ecommerce intelligence
        </div>

        {/* Headline */}
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-800 text-slate-900 leading-[1.05] tracking-tight mb-6 animate-fade-up text-balance">
          Grow your store with
          <span className="block text-brand-600"> AI that actually works</span>
        </h1>

        {/* Subheadline */}
        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-500 leading-relaxed mb-10 animate-fade-up animate-delay-100 text-balance">
          Connect Shopify, WooCommerce or any platform. Get instant AI-driven insights, automated reporting, and actionable growth recommendations — all in one place.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up animate-delay-200">
          <Link
            href="/register"
            className="group flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-brand-600/25 hover:shadow-brand-600/40 hover:-translate-y-0.5"
          >
            Start for free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#demo"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium px-7 py-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-white/80"
          >
            See how it works
          </a>
        </div>

        {/* Social proof numbers */}
        <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500 animate-fade-up animate-delay-300 mb-20">
          {[
            { value: '2,400+', label: 'Active stores' },
            { value: '€142M+', label: 'Revenue tracked' },
            { value: '4.9/5',  label: 'Average rating' },
            { value: '99.9%',  label: 'Uptime' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="font-display font-700 text-slate-900 text-base">{s.value}</span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Dashboard mockup */}
        <div className="relative max-w-5xl mx-auto animate-fade-up animate-delay-400">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-200/80 overflow-hidden">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 mx-4 bg-white border border-slate-200 rounded-md px-3 py-1 text-xs text-slate-400 text-left">
                app.marketgrowth.io/dashboard
              </div>
            </div>

            {/* Dashboard content */}
            <div className="p-6 bg-slate-50 min-h-80">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Total Revenue',  value: '€48,291', change: '+12.4%', icon: TrendingUp,   color: 'text-emerald-600 bg-emerald-50' },
                  { label: 'Orders Today',   value: '184',      change: '+8.1%',  icon: ShoppingCart, color: 'text-brand-600 bg-brand-50' },
                  { label: 'Avg Order Value',value: '€262',     change: '+3.7%',  icon: BarChart3,    color: 'text-violet-600 bg-violet-50' },
                ].map(card => (
                  <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-4 text-left">
                    <div className={`w-8 h-8 rounded-lg ${card.color} flex items-center justify-center mb-3`}>
                      <card.icon className="w-4 h-4" />
                    </div>
                    <div className="text-xs text-slate-500 mb-1">{card.label}</div>
                    <div className="font-display text-xl font-700 text-slate-900">{card.value}</div>
                    <div className="text-xs text-emerald-600 font-medium mt-1">{card.change} this week</div>
                  </div>
                ))}
              </div>

              {/* Fake chart bars */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="text-xs font-medium text-slate-600 mb-4">Revenue last 7 days</div>
                <div className="flex items-end gap-2 h-24">
                  {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t-md bg-brand-500/20 hover:bg-brand-500/40 transition-colors"
                        style={{ height: `${h}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-400">
                  {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <span key={d}>{d}</span>)}
                </div>
              </div>
            </div>
          </div>

          {/* Floating badge */}
          <div className="absolute -top-4 -right-4 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-lg text-sm font-medium text-slate-700 hidden sm:block animate-float">
            🤖 AI insight ready
          </div>
        </div>
      </div>
    </section>
  );
}
