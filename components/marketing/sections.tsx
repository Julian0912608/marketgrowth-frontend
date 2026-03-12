'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, ChevronDown, Zap } from 'lucide-react';

// ── Demo ──────────────────────────────────────────────────────
export function Demo() {
  return (
    <section id="demo" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-xl mb-12">
          <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            How it works
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-800 text-slate-900 mb-4">
            Up and running in minutes
          </h2>
          <p className="text-slate-500 text-lg">No complex setup. No developer needed.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            {[
              { step: '01', title: 'Connect your store', desc: 'Link Shopify, WooCommerce, Bol.com or any platform in one click. No developer needed.' },
              { step: '02', title: 'AI analyses your data', desc: 'MarketGrow imports your full order history and starts identifying patterns, peaks, and opportunities.' },
              { step: '03', title: 'Get actionable insights', desc: 'Your personalized dashboard and AI recommendations are ready. Start making smarter decisions today.' },
            ].map(s => (
              <div key={s.step} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand-600 text-white font-display font-700 text-sm flex items-center justify-center">
                  {s.step}
                </div>
                <div>
                  <h3 className="font-display font-700 text-slate-900 mb-1">{s.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="relative bg-slate-900 rounded-2xl overflow-hidden aspect-video flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-900/80 to-slate-900" />
            <div className="relative text-center">
              <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-white/20 transition-colors">
                <div className="w-0 h-0 border-t-8 border-b-8 border-l-12 border-transparent border-l-white ml-1" />
              </div>
              <p className="text-white/60 text-sm">Watch 2-min demo</p>
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
    slug:     'starter',
    name:     'Starter',
    price:    49,
    desc:     'Perfect for solo entrepreneurs just getting started.',
    features: [
      '1 connected store',
      '500 AI credits / month',
      'Sales dashboard',
      'Weekly AI report',
      'Email support',
    ],
    cta:      'Start free trial',
    popular:  false,
  },
  {
    slug:     'growth',
    name:     'Growth',
    price:    99,
    desc:     'For growing stores that need deeper insights.',
    features: [
      '3 connected stores',
      '5,000 AI credits / month',
      'Everything in Starter',
      'Daily AI insights',
      'Smart alerts',
      'Priority support',
    ],
    cta:      'Start free trial',
    popular:  true,
  },
  {
    slug:     'scale',
    name:     'Scale',
    price:    249,
    desc:     'For established brands and agencies managing multiple stores.',
    features: [
      'Unlimited stores',
      'Unlimited AI credits',
      'Everything in Growth',
      'Custom AI recommendations',
      'API access',
      'Dedicated account manager',
    ],
    cta:      'Contact sales',
    popular:  false,
  },
];

export function Pricing() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            Simple pricing
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-800 text-slate-900 mb-4">
            Grow without surprises
          </h2>
          <p className="text-slate-500 text-lg mb-8">Start free for 14 days. No credit card required.</p>

          <div className="inline-flex items-center gap-3 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${!annual ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${annual ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
            >
              Annual <span className="text-emerald-600 font-semibold">−20%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map(plan => {
            const price = annual ? Math.round(plan.price * 0.8) : plan.price;
            return (
              <div
                key={plan.slug}
                className={`relative rounded-2xl p-6 flex flex-col ${
                  plan.popular
                    ? 'bg-brand-600 text-white shadow-xl shadow-brand-600/30'
                    : 'bg-white border border-slate-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
                    Most popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className={`font-display font-700 text-lg mb-1 ${plan.popular ? 'text-white' : 'text-slate-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mb-4 ${plan.popular ? 'text-brand-100' : 'text-slate-500'}`}>{plan.desc}</p>
                  <div className="flex items-baseline gap-1">
                    <span className={`font-display text-4xl font-800 ${plan.popular ? 'text-white' : 'text-slate-900'}`}>
                      €{price}
                    </span>
                    <span className={`text-sm ${plan.popular ? 'text-brand-200' : 'text-slate-400'}`}>/mo</span>
                  </div>
                </div>

                <ul className="space-y-3 flex-1 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <Check className={`w-4 h-4 flex-shrink-0 ${plan.popular ? 'text-brand-200' : 'text-emerald-500'}`} />
                      <span className={plan.popular ? 'text-brand-50' : 'text-slate-600'}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.slug === 'scale' ? '/contact' : `/register?plan=${plan.slug}`}
                  className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${
                    plan.popular
                      ? 'bg-white text-brand-600 hover:bg-brand-50'
                      : 'bg-brand-600 text-white hover:bg-brand-700'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ──────────────────────────────────────────────
const testimonials = [
  {
    name:    'Sarah van den Berg',
    role:    'Founder, Bloom & Co',
    content: 'MarketGrow changed how I run my store. I used to spend hours in spreadsheets. Now I check my dashboard for 5 minutes and know exactly what to focus on.',
    avatar:  'SB',
    color:   'bg-rose-100 text-rose-700',
  },
  {
    name:    'Thomas Müller',
    role:    'CEO, TechGadgets GmbH',
    content: "The AI insights are genuinely useful. It flagged a drop in repeat purchases 2 weeks before I would have noticed it myself. That alone paid for a year's subscription.",
    avatar:  'TM',
    color:   'bg-brand-100 text-brand-700',
  },
  {
    name:    'Priya Sharma',
    role:    'Head of Ecommerce, StyleHub',
    content: 'We manage 4 stores across different markets. Having everything in one dashboard with unified AI reporting has been a game changer for our team.',
    avatar:  'PS',
    color:   'bg-violet-100 text-violet-700',
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-surface-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-xl mx-auto text-center mb-16">
          <h2 className="font-display text-4xl sm:text-5xl font-800 text-slate-900 mb-4">
            Trusted by 2,400+ stores
          </h2>
          <p className="text-slate-500 text-lg">Don't take our word for it.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map(t => (
            <div key={t.name} className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col gap-4">
              <p className="text-slate-600 leading-relaxed text-sm flex-1">"{t.content}"</p>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center font-display font-700 text-xs`}>
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{t.name}</div>
                  <div className="text-xs text-slate-400">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────
const faqs = [
  { q: 'Which platforms does MarketGrow support?',      a: 'We support Shopify, WooCommerce, Amazon, Bol.com, Meta Ads, Google Ads, Etsy and more. New integrations are added regularly.' },
  { q: 'Is my data secure?',                            a: 'Yes. All data is encrypted in transit and at rest. Each account is fully isolated — no data is ever shared between customers.' },
  { q: 'Can I cancel my subscription at any time?',     a: 'Absolutely. Cancel anytime from your account settings. If you cancel, you keep access until the end of your billing period.' },
  { q: 'What are AI credits?',                          a: 'AI credits power features like insight generation, recommendations, and automated reports. Unused credits do not roll over.' },
  { q: 'Do you offer a free trial?',                    a: 'Yes — all plans include a 14-day free trial. No credit card required to start.' },
  { q: 'What happens if I exceed my AI credit limit?',  a: "Your dashboard continues to work normally. AI-powered features pause until the next billing cycle — we'll notify you before that happens." },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl sm:text-5xl font-800 text-slate-900 mb-4">
            Frequently asked questions
          </h2>
          <p className="text-slate-500 text-lg">
            Still have questions?{' '}
            <a href="mailto:hello@marketgrow.ai" className="text-brand-600 hover:underline">We're here to help.</a>
          </p>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-slate-100 rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-medium text-slate-900 text-sm pr-4">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && (
                <div className="px-5 pb-4 text-sm text-slate-500 leading-relaxed border-t border-slate-100">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA ───────────────────────────────────────────────────────
export function CTA() {
  return (
    <section className="py-24 bg-brand-600">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="font-display text-4xl sm:text-5xl font-800 text-white mb-4 text-balance">
          Ready to grow smarter?
        </h2>
        <p className="text-brand-100 text-lg mb-10">
          Join 2,400+ store owners already using MarketGrow to make better decisions every day.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="group flex items-center gap-2 bg-white text-brand-600 font-semibold px-7 py-3.5 rounded-xl hover:bg-brand-50 transition-all shadow-lg"
          >
            Start free — no card needed
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <p className="text-brand-200 text-sm mt-6">14-day free trial · Cancel anytime</p>
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
              <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" fill="white" />
              </div>
              MarketGrow
            </div>
            <p className="text-sm leading-relaxed">AI-powered ecommerce intelligence for entrepreneurs who want to grow.</p>
          </div>

          {[
            { title: 'Product',  links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
            { title: 'Company',  links: ['About', 'Blog', 'Careers', 'Press'] },
            { title: 'Legal',    links: ['Privacy', 'Terms', 'Security', 'Cookies'] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-white text-sm font-semibold mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(l => (
                  <li key={l}><a href="#" className="text-sm hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
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
