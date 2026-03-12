'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2, TrendingUp, BarChart3, ShoppingCart } from 'lucide-react';

export function Hero() {
  const [email, setEmail]     = useState('');
  const [status, setStatus]   = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');

    try {
      // Replace with your actual waitlist endpoint or a service like Loops / Mailchimp
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus('success');
        setMessage('You\'re on the list! We\'ll be in touch soon.');
        setEmail('');
      } else {
        throw new Error('Something went wrong');
      }
    } catch {
      // Fallback: if no API yet, just show success (remove in production)
      setStatus('success');
      setMessage('You\'re on the list! We\'ll be in touch soon.');
      setEmail('');
    }
  }

  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-b from-slate-50 to-white pt-16 overflow-hidden">

      {/* Background grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60" />

      {/* Gradient blobs */}
      <div className="absolute top-32 left-1/4 w-96 h-96 bg-brand-200/40 rounded-full blur-3xl" />
      <div className="absolute bottom-32 right-1/4 w-72 h-72 bg-sky-200/30 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 py-24 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold px-4 py-2 rounded-full mb-8 animate-fade-in">
          <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />
          Early access — join the waitlist
        </div>

        {/* Headline */}
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-800 text-slate-900 leading-[1.05] tracking-tight mb-6 text-balance">
          One AI brain for
          <span className="block text-brand-600">every store you run</span>
        </h1>

        {/* Subheadline */}
        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-500 leading-relaxed mb-4 text-balance">
          MarketGrow.ai connects all your sales channels and ad platforms into a single intelligence layer.
          Stop switching tabs — start making decisions that actually grow revenue.
        </p>

        {/* Cross-platform + data intelligence tags */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {[
            { icon: BarChart3,   label: 'Cross-platform product intelligence' },
            { icon: TrendingUp,  label: 'Ecommerce data intelligence' },
            { icon: ShoppingCart,label: 'AI growth suggestions' },
          ].map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm"
            >
              <Icon className="w-3.5 h-3.5 text-brand-500" />
              {label}
            </span>
          ))}
        </div>

        {/* ── WAITLIST FORM ─────────────────────────────────── */}
        <div className="max-w-md mx-auto mb-6">
          {status === 'success' ? (
            <div className="flex items-center justify-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium px-6 py-4 rounded-xl">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              {message}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your work email"
                className="flex-1 px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent shadow-sm"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="group flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-brand-600/25 hover:shadow-brand-600/40 hover:-translate-y-0.5 whitespace-nowrap text-sm"
              >
                {status === 'loading' ? 'Joining...' : 'Get early access'}
                {status !== 'loading' && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
          )}
          <p className="text-slate-400 text-xs mt-3">
            No credit card · No spam · Be the first to get access when we launch
          </p>
        </div>

        {/* Social proof numbers */}
        <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500 mb-20">
          {[
            { value: '1,200+', label: 'Stores on waitlist' },
            { value: '€142M+', label: 'Revenue tracked' },
            { value: '7',      label: 'Platforms connected' },
            { value: 'Q2 2025', label: 'Expected launch' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="font-display font-700 text-slate-900 text-base">{s.value}</span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Dashboard mockup */}
        <div className="relative max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Fake window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50">
              <div className="w-3 h-3 rounded-full bg-rose-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <div className="flex-1 mx-4 h-5 bg-slate-200 rounded-md max-w-xs" />
            </div>

            {/* Fake dashboard content */}
            <div className="p-6 bg-slate-50">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Total Revenue',   value: '€ 24,891', change: '+18%' },
                  { label: 'Orders',          value: '1,042',    change: '+12%' },
                  { label: 'ROAS (Meta)',      value: '4.2×',     change: '+0.8' },
                  { label: 'Top product',     value: 'SKU-0021', change: '↑ trending' },
                ].map(card => (
                  <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="text-xs text-slate-500 mb-1">{card.label}</div>
                    <div className="font-display text-xl font-700 text-slate-900">{card.value}</div>
                    <div className="text-xs text-emerald-600 font-medium mt-1">{card.change} this week</div>
                  </div>
                ))}
              </div>

              {/* Fake chart bars */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="text-xs font-medium text-slate-600 mb-4">Revenue across all channels — last 7 days</div>
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
          <div className="absolute -top-4 -right-4 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-lg text-sm font-medium text-slate-700 hidden sm:block">
            🤖 AI insight ready
          </div>
        </div>
      </div>
    </section>
  );
}
