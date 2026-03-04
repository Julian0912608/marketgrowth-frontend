'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

const steps = [
  { id: 'plan_selected',     title: 'Choose your plan',     desc: 'Pick the plan that fits your store.' },
  { id: 'payment_completed', title: 'Set up billing',        desc: 'Secure payment via Stripe.' },
  { id: 'shop_connected',    title: 'Connect your store',    desc: 'Link your first webshop.' },
];

const plans = [
  { slug: 'starter', name: 'Starter', price: '€49/mo', desc: '1 store · 500 AI credits' },
  { slug: 'growth',  name: 'Growth',  price: '€99/mo', desc: '3 stores · 5,000 AI credits', popular: true },
  { slug: 'scale',   name: 'Scale',   price: '€249/mo',desc: 'Unlimited stores & credits' },
];

export default function OnboardingPage() {
  const router  = useRouter();
  const [step, setStep]         = useState(0);
  const [plan, setPlan]         = useState('growth');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

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
      setError(e.response?.data?.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanStep = async () => {
    setLoading(true);
    try {
      if (plan !== 'starter') {
        const res = await api.post('/billing/checkout', { planSlug: plan });
        window.location.href = res.data.url; // redirect to Stripe
      } else {
        await completeStep('plan_selected');
      }
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
          MarketGrowth
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                i < step  ? 'bg-emerald-500 text-white' :
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
          <h2 className="font-display text-xl font-800 text-slate-900 mb-1">{steps[step].title}</h2>
          <p className="text-slate-500 text-sm mb-8">{steps[step].desc}</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Step 0: Plan selection */}
          {step === 0 && (
            <div className="space-y-3">
              {plans.map(p => (
                <button
                  key={p.slug}
                  onClick={() => setPlan(p.slug)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all ${
                    plan === p.slug
                      ? 'border-brand-600 bg-brand-50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-700 text-slate-900 text-sm">{p.name}</span>
                      {p.popular && <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">Popular</span>}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{p.desc}</p>
                  </div>
                  <span className="font-display font-700 text-slate-900 text-sm">{p.price}</span>
                </button>
              ))}
              <button
                onClick={handlePlanStep}
                disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-4"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 1: Payment (handled by Stripe redirect, show confirmation) */}
          {step === 1 && (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-slate-600 text-sm mb-6">Payment completed successfully. Your plan is now active.</p>
              <button
                onClick={() => completeStep('payment_completed')}
                disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2: Connect store */}
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
