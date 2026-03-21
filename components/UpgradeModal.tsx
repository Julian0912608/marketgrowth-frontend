'use client';

// ============================================================
// components/UpgradeModal.tsx
// Toont automatisch als een 403 feature_not_available binnenkomt
// Werkt via een global event die de axios interceptor gooit
// ============================================================

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Zap, Check, ArrowRight, Lock } from 'lucide-react';

interface UpgradeEvent {
  feature:      string;
  requiredPlan: 'growth' | 'scale';
  message:      string;
}

const PLAN_INFO = {
  growth: {
    name:  'Growth',
    price: '€49/maand',
    color: 'bg-brand-600',
    features: [
      '3 webshops koppelen',
      '2.000 AI credits / maand',
      'AI product aanbevelingen',
      'Advertentie analyse',
      'Klant LTV prognose',
      'Dagelijkse AI briefing',
      'Rapportage export',
    ],
  },
  scale: {
    name:  'Scale',
    price: '€150/maand',
    color: 'bg-violet-600',
    features: [
      'Onbeperkte webshops',
      'Onbeperkte AI credits',
      'AI advertentie optimalisatie',
      'White-label dashboard',
      'Team accounts',
      'API toegang',
      'Dedicated account manager',
    ],
  },
};

const FEATURE_LABELS: Record<string, string> = {
  'ad-analytics':       'Advertentie analyse',
  'ai-recommendations': 'AI aanbevelingen',
  'ai-ad-optimization': 'AI advertentie optimalisatie',
  'customer-ltv':       'Klant LTV prognose',
  'multi-shop':         'Multi-webshop beheer',
  'report-export':      'Rapportage export',
  'api-access':         'API toegang',
  'white-label':        'White-label dashboard',
  'team-accounts':      'Team accounts',
};

export function UpgradeModal() {
  const router = useRouter();
  const [event, setEvent] = useState<UpgradeEvent | null>(null);

  useEffect(() => {
    const handler = (e: CustomEvent<UpgradeEvent>) => {
      setEvent(e.detail);
    };
    window.addEventListener('upgrade-required', handler as EventListener);
    return () => window.removeEventListener('upgrade-required', handler as EventListener);
  }, []);

  if (!event) return null;

  const plan = PLAN_INFO[event.requiredPlan] ?? PLAN_INFO.growth;
  const featureLabel = FEATURE_LABELS[event.feature] ?? event.feature;

  const handleUpgrade = () => {
    setEvent(null);
    router.push('/settings?tab=billing');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setEvent(null)}
      />

      {/* Modal */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className={`${plan.color} px-6 py-5`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Lock className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Upgrade vereist</p>
                <p className="text-white/70 text-xs">{featureLabel} is beschikbaar in {plan.name}</p>
              </div>
            </div>
            <button
              onClick={() => setEvent(null)}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-lg">{plan.name}</h2>
            <span className="text-slate-300 font-semibold">{plan.price}</span>
          </div>

          <ul className="space-y-2.5 mb-6">
            {plan.features.map(f => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <button
            onClick={handleUpgrade}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-all ${plan.color} hover:opacity-90`}
          >
            Upgrade naar {plan.name}
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setEvent(null)}
            className="w-full py-2.5 text-sm text-slate-500 hover:text-slate-400 transition-colors mt-2"
          >
            Misschien later
          </button>
        </div>

        {/* Trial note */}
        <div className="px-6 pb-5">
          <p className="text-xs text-slate-600 text-center">
            14 dagen gratis proberen · Geen creditcard vereist · Opzeggen wanneer je wilt
          </p>
        </div>
      </div>
    </div>
  );
}
