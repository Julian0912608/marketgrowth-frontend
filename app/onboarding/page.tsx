'use client';

// ============================================================
// STAP 3B: app/onboarding/page.tsx
// Wijziging: starter plan toegevoegd, prijzen bijgewerkt
// ============================================================

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

const steps = [
  { id: 'plan_selected',     title: 'Choose your plan',   desc: 'Pick the plan that fits your store.' },
  { id: 'payment_completed', title: 'Set up billing',     desc: 'Secure payment via Stripe.' },
  { id: 'shop_connected',    title: 'Connect your store', desc: 'Link your first webshop.' },
];

// ── Bijgewerkte plannen — starter toegevoegd, prijzen aangepast ──
const plans = [
  {
    slug:    'starter',
    name:    'Starter',
    price:   '€20/mo',
    desc:    '1 store · 100 AI credits',
    popular: false,
    features: ['1 webshop', '100 AI credits / month', 'Sales dashboard', 'Weekly AI report'],
  },
  {
    slug:    'growth',
    name:    'Growth',
    price:   '€49/mo',
    desc:    '3 stores · 2,000 AI credits',
    popular: true,
    features: ['3 webshops', '2,000 AI credits / month', 'AI recommendations', 'Ad analytics', 'Daily briefing'],
  },
  {
    slug:    'scale',
    name:    'Scale',
    price:   '€150/mo',
    desc:    'Unlimited stores & credits',
    popular: false,
    features: ['Unlimited webshops', 'Unlimited AI credits', 'White-label', 'Team accounts', 'API access'],
  },
];

function OnboardingInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [step,    setStep]    = useState(0);
  const [plan,    setPlan]    = useState('growth');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // Terugkeer van Stripe — session_id in URL betekent betaling geslaagd
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) setStep(2);
  }, [searchParams]);

  const completeStep = async (stepId: string) => {
    setLoading(true);
    setError('');
    try {
      await api.post('/onboarding/complete-step', { step: stepId });
      if (step < steps.length - 1) {
        setStep(s => s + 1);
      } else {
        router.push('/dashboard');
      }
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // Alle plannen gaan via Stripe — 14 dagen gratis trial
  const handlePlanStep = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/billing/checkout', { planSlug: plan });
      window.location.href = res.data.url;
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Something went wrong.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl">

        {/* Logo */}
        <div className="flex items-center gap-2 font-display font-700 text-lg text-slate-900 mb-8 justify-center">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" fill="white" />
          </div>
          MarketGrow
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-3 mb-8">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                i < step   ? 'bg-emerald-500 text-white' :
                i === step ? 'bg-brand-600 text-white' :
                             'bg-slate-200 text-slate-400'
              }`}>
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 rounded ${i < step ? 'bg-emerald-400' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <h2 className="font-display text-xl font-800 text-slate-900 mb-1">
            {steps[step].title}
          </h2>
          <p className="text-slate-500 text-sm mb-8">{steps[step].desc}</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Stap 0: Plan kiezen */}
          {step === 0 && (
            <div className="space-y-3">
              {/* Trial banner */}
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-lg mb-2 text-center font-medium">
                🎉 14 days free — no costs until after the trial period
              </div>

              {plans.map(p => (
                <button
                  key={p.slug}
                  onClick={() => setPlan(p.slug)}
                  className={`w-full flex items-start justify-between p-4 rounded-xl border-2 text-left transition-all ${
                    plan === p.slug
                      ? 'border-brand-600 bg-brand-50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-900 text-sm">{p.name}</span>
                      {p.popular && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                          Most popular
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{p.desc}</p>
                    <ul className="space-y-0.5">
                      {p.features.map(f => (
                        <li key={f} className="text-xs text-slate-600 flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <span className="font-bold text-slate-900 text-sm">{p.price}</span>
                    <div className={`w-4 h-4 rounded-full border-2 mt-2 ml-auto transition-all ${
                      plan === p.slug ? 'bg-brand-600 border-brand-600' : 'border-slate-300'
                    }`} />
                  </div>
                </button>
              ))}

              <button
                onClick={handlePlanStep}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 mt-6 py-3 px-6 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all text-sm"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>Continue to payment <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          )}

          {/* Stap 1: Betaling (Stripe redirect — zie handlePlanStep) */}
          {step === 1 && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto mb-4" />
              <p className="text-slate-600 text-sm">Redirecting to secure payment...</p>
            </div>
          )}

          {/* Stap 2: Winkel koppelen */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-lg text-center font-medium">
                ✓ Payment successful! Now let's connect your first store.
              </div>
              <button
                onClick={() => completeStep('shop_connected')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all text-sm"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>Go to dashboard — connect store later <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingInner />
    </Suspense>
  );
}
