'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, Download, BookOpen, BarChart3, TrendingUp, Lightbulb, Shield } from 'lucide-react';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/sections';

const highlights = [
  { icon: BarChart3,   text: 'Why platform ROAS numbers are systematically misleading — and how to fix it' },
  { icon: TrendingUp,  text: '2026 ROAS benchmarks across 6 ecommerce categories' },
  { icon: Lightbulb,   text: 'The 5 intelligence gaps costing multi-channel brands revenue every month' },
  { icon: Shield,      text: 'A practical 90-day framework to close the gap with AI-driven analytics' },
];

export default function ResourcesPage() {
  const [email,  setEmail]  = useState('');
  const [name,   setName]   = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleDownload(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');

    try {
      // Register on waitlist + tag as whitepaper download
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, source: 'whitepaper' }),
      });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Header */}
      <section className="pt-20 pb-0 bg-slate-50 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to blog
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 items-end pb-0">
            {/* Left: info */}
            <div className="pb-12">
              <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                <BookOpen className="w-3.5 h-3.5" /> Free Research Report · 2026
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-800 text-slate-900 mb-4 leading-tight">
                The Multi-Channel<br />Ecommerce{' '}
                <span className="text-brand-600">Intelligence Gap</span>
              </h1>
              <p className="text-slate-500 text-lg leading-relaxed mb-8">
                Why ecommerce entrepreneurs are flying blind across Shopify, Amazon and their ad platforms — and how AI-driven intelligence closes the gap.
              </p>
              <div className="space-y-3">
                {highlights.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-brand-600" />
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex items-center gap-4 text-sm text-slate-400">
                <span>📄 18 pages</span>
                <span>·</span>
                <span>📊 12 data tables</span>
                <span>·</span>
                <span>⏱ 15 min read</span>
              </div>
            </div>

            {/* Right: form card */}
            <div className="lg:self-end">
              <div className="bg-white rounded-t-2xl border border-b-0 border-slate-200 shadow-xl p-8">
                {status === 'success' ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Download className="w-7 h-7 text-emerald-600" />
                    </div>
                    <h3 className="font-display text-xl font-700 text-slate-900 mb-2">Check your inbox</h3>
                    <p className="text-slate-500 text-sm mb-6">
                      We've sent the report to <strong>{email}</strong>. While you wait — you're also on the MarketGrow waitlist and will get first month free on launch.
                    </p>
                    <a
                      href="/marketgrow-intelligence-gap-report-2026.pdf"
                      download
                      className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" /> Download directly
                    </a>
                  </div>
                ) : (
                  <>
                    <h3 className="font-display text-xl font-700 text-slate-900 mb-1">Get the free report</h3>
                    <p className="text-slate-500 text-sm mb-6">Enter your email and we'll send it instantly. No spam, unsubscribe anytime.</p>

                    <form onSubmit={handleDownload} className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Your name</label>
                        <input
                          type="text"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder="Alex Johnson"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Work email <span className="text-rose-500">*</span></label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="alex@yourstore.com"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors text-sm"
                      >
                        {status === 'loading' ? (
                          'Sending...'
                        ) : (
                          <><Download className="w-4 h-4" /> Download free report</>
                        )}
                      </button>

                      {status === 'error' && (
                        <p className="text-rose-600 text-xs text-center">Something went wrong. Please try again.</p>
                      )}
                    </form>

                    <p className="text-xs text-slate-400 text-center mt-4">
                      By downloading, you'll also join the MarketGrow waitlist and get early access when we launch.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Report preview */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-display text-2xl font-700 text-slate-900 mb-8 text-center">What's inside</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { num: '01', title: 'The multi-channel landscape', desc: 'How ecommerce operators actually work in 2026 — the average number of platforms, ad channels, and hours spent on data.' },
              { num: '02', title: 'The 5 intelligence gaps', desc: 'Attribution fragmentation, product performance blindness, decision latency, reactive analytics, and inventory misalignment.' },
              { num: '03', title: 'ROAS benchmark data', desc: '2026 blended ROAS benchmarks across 6 ecommerce categories, plus how to calculate your break-even point.' },
              { num: '04', title: 'Attribution explained', desc: "Why Meta, Google, and TikTok all report different numbers for the same sales — and what your real ROAS actually is." },
              { num: '05', title: 'The AI opportunity', desc: 'How AI-driven intelligence platforms close the gaps that traditional analytics tools can\'t — with real capability comparisons.' },
              { num: '06', title: '90-day action framework', desc: 'Immediate, short-term, and strategic actions to close your intelligence gaps and start making better decisions this week.' },
            ].map(item => (
              <div key={item.num} className="rounded-xl border border-slate-200 p-5 hover:border-brand-200 hover:bg-brand-50/30 transition-all">
                <span className="text-3xl font-black text-slate-100 font-display block mb-3">{item.num}</span>
                <h3 className="font-semibold text-slate-900 text-sm mb-2">{item.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Other resources CTA */}
      <section className="py-12 bg-slate-50 border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h3 className="font-display text-xl font-700 text-slate-900 mb-3">Also worth reading</h3>
          <p className="text-slate-500 text-sm mb-6">Practical articles on ecommerce analytics, ROAS, and channel strategy.</p>
          <Link href="/blog" className="inline-flex items-center gap-2 text-brand-600 font-semibold text-sm hover:gap-3 transition-all">
            Browse the blog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
