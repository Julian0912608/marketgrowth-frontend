'use client';

// ============================================================
// app/onboarding/page.tsx  (FIXED)
//
// useSearchParams() moet in een Suspense boundary zitten in Next.js 13+.
// Oplossing: split in <OnboardingInner> (gebruikt useSearchParams)
// en een default export die dat wrapet in <Suspense>.
// ============================================================

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Zap, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

const steps = [
  { id: 'plan_selected',     title: 'Choose your plan',   desc: 'Pick the plan that fits your store.' },
  { id: 'payment_completed', title: 'Set up billing',      desc: 'Secure payment via Stripe.' },
  { id: 'shop_connected',    title: 'Connect your store',  desc: 'Link your first webshop.' },
];

const plans = [
  { slug: 'starter', name: 'Starter',  price: '€49/mo',  desc: '1 store · 500 AI credits' },
  { slug: 'growth',  name: 'Growth',   price: '€99/mo',  desc: '3 stores · 5.000 AI credits', popular: true },
  { slug: 'scale',   name: 'Scale',    price: '€249/mo', desc: 'Unlimited stores & credits' },
];

function OnboardingInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep]       = useState(0);
  const [plan, setPlan]       = useState('growth');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // ── Terugkeer van Stripe Checkout ────────────────────────────
  // Stripe redirect naar /onboarding?session_id=cs_xxx
  // De webhook heeft de DB al bijgewerkt; wij hoeven alleen
  // de UI-stap vooruit te zetten.
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      // Verwijder session_id uit URL (clean URL)
      window.history.replaceState({}, '', '/onboarding');
      // Sla payment_completed op en ga naar stap 2 (shop)
      handlePaymentSuccess();
    }
  }, []);

  const handlePaymentSuccess = async () => {
    setLoading(true);
    setError('');
    try {
      // De webhook heeft DB al bijgewerkt via onCheckoutCompleted.
      // Wij markeren alleen de onboarding stap als compleet.
      await api.post('/onboarding/complete-step', { step: 'payment_completed' });
      setStep(2); // Ga naar "Connect your store"
    } catch (e: any) {
      // Webhook kan iets sneller of langzamer zijn — probeer opnieuw
      setError('Betaling ontvangen, maar er ging iets mis bij het bijwerken. Ververs de pagina.');
    } finally {
      setLoading(false);
    }
  };

  const completeStep = async (stepId: string) => {
    setLoading(true);
    setError('');
    try {
      await api.post('/onboarding/complete-step', { step: stepId });
      if (step < steps.length - 1) {
        setStep(step + 1);
      } else {
        router.push('/dashboard');
      }
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // FIX: markeer plan_selected in DB EERST, dan redirect naar Stripe
  const handlePlanStep = async () => {
    setLoading(true);
    setError('');
    try {
      if (plan === 'starter') {
        // Starter: geen betaling nodig, direct doorgaan
        await completeStep('plan_selected');
        return;
      }

      // Stap 1: Sla gekozen plan op zodat onboarding state klopt
      // ook als de klant de browser sluit na Stripe
      await api.post('/onboarding/complete-step', { step: 'plan_selected' });

      // Stap 2: Haal Stripe Checkout URL op
      const res = await api.post('/billing/checkout', { planSlug: plan });

      if (!res.data?.url) {
        throw new Error('Geen checkout URL ontvangen van de server.');
      }

      // Stap 3: Redirect naar Stripe
      window.location.href = res.data.url;

    } catch (e: any) {
      const msg = e.response?.data?.message ?? e.message ?? 'Something went wrong.';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl">

        {/* Logo */}
        <div className="flex items-center gap-2 font-display font-bold text-lg text-slate-900 mb-8 justify-center">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" fill="white" />
          </div>
          MarketGrowth
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-3 mb-8">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                i < step   ? 'bg-emerald-500 text-white' :
                i === step ? 'bg-brand-600 text-white ring-4 ring-brand-100' :
                             'bg-slate-200 text-slate-400'
              }`}>
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`h-0.5 flex-1 transition-all ${i < step ? 'bg-emerald-400' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <h2 className="font-display font-bold text-xl text-slate-900 mb-1">
            {steps[step].title}
          </h2>
          <p className="text-slate-500 text-sm mb-6">{steps[step].desc}</p>

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* ── Stap 0: Plan kiezen ────────────────────────── */}
          {step === 0 && (
            <div className="space-y-3">
              {plans.map(p => (
                <button
                  key={p.slug}
                  onClick={() => setPlan(p.slug)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                    plan === p.slug
                      ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200'
                      : 'border-slate-200 hover:border-brand-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm">{p.name}</span>
                      {p.popular && (
                        <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium">
                          Most popular
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 mt-0.5 block">{p.desc}</span>
                  </div>
                  <span className="font-bold text-slate-900 text-sm">{p.price}</span>
                </button>
              ))}

              <button
                onClick={handlePlanStep}
                disabled={loading}
                className="w-full mt-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {plan === 'starter' ? 'Start with Starter' : 'Continue to payment'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── Stap 1: Betaling (na Stripe redirect) ────── */}
          {step === 1 && (
            <div className="text-center py-4">
              {loading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
                  <p className="text-slate-500 text-sm">Betaling verwerken…</p>
                </div>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-6 h-6 text-emerald-600" />
                  </div>
                  <p className="text-slate-600 text-sm mb-6">
                    Betaling geslaagd! Je abonnement is nu actief.
                  </p>
                  <button
                    onClick={() => completeStep('payment_completed')}
                    disabled={loading}
                    className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    Doorgaan <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          )}

          {/* ── Stap 2: Webshop koppelen ──────────────────── */}
          {step === 2 && (
            <div className="space-y-3">
              {['Shopify', 'WooCommerce', 'Lightspeed', 'Magento'].map(platform => (
                <button
                  key={platform}
                  onClick={() => completeStep('shop_connected')}
                  disabled={loading}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50 text-left transition-all disabled:opacity-60"
                >
                  <span className="font-medium text-slate-900 text-sm">{platform}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
              ))}
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full text-center text-sm text-slate-400 hover:text-slate-600 py-2 mt-2 transition-colors"
              >
                Skip for now →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Suspense boundary is vereist door Next.js omdat useSearchParams()
// alleen client-side werkt en niet tijdens static prerendering.
export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-brand-600 animate-spin" />
      </div>
    }>
      <OnboardingInner />
    </Suspense>
  );
}
