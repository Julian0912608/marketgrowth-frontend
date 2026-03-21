'use client';

// ============================================================
// components/dashboard/OnboardingChecklist.tsx
// Toont een activatie checklist voor nieuwe gebruikers
// Verdwijnt automatisch als alle stappen voltooid zijn
// ============================================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronRight, X, Zap } from 'lucide-react';
import { api } from '@/lib/api';

interface OnboardingStatus {
  currentStep:     string;
  completedSteps:  string[];
  percentComplete: number;
  isComplete:      boolean;
}

const STEPS = [
  {
    id:          'account_created',
    label:       'Account aangemaakt',
    description: 'Je bent geregistreerd en ingelogd.',
    href:        null,
    cta:         null,
  },
  {
    id:          'payment_completed',
    label:       'Abonnement activeren',
    description: 'Kies een plan en start je 14 dagen gratis trial.',
    href:        '/onboarding',
    cta:         'Plan kiezen →',
  },
  {
    id:          'shop_connected',
    label:       'Eerste winkel koppelen',
    description: 'Verbind Bol.com, Shopify of een ander platform.',
    href:        '/dashboard/integrations',
    cta:         'Winkel koppelen →',
  },
  {
    id:          'first_insight',
    label:       'Eerste AI acties bekijken',
    description: 'Ontdek wat je vandaag moet doen om sneller te groeien.',
    href:        '/dashboard/ai-insights',
    cta:         'AI acties bekijken →',
  },
];

export function OnboardingChecklist() {
  const router = useRouter();
  const [status,    setStatus]    = useState<OnboardingStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    // Check of gebruiker de checklist al heeft weggedrukt
    const wasDismissed = localStorage.getItem('onboarding_dismissed') === 'true';
    if (wasDismissed) { setDismissed(true); setLoading(false); return; }

    api.get('/onboarding/status')
      .then(res => setStatus(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const dismiss = () => {
    localStorage.setItem('onboarding_dismissed', 'true');
    setDismissed(true);
  };

  // Niet tonen als: loading, dismissed, of volledig compleet
  if (loading || dismissed || !status) return null;
  if (status.isComplete && status.percentComplete >= 100) return null;

  // Bepaal welke stappen compleet zijn
  const isStepDone = (stepId: string) => {
    if (stepId === 'account_created') return true; // altijd done
    if (stepId === 'first_insight')   return status.completedSteps.includes('shop_connected');
    return status.completedSteps.includes(stepId);
  };

  const completedCount = STEPS.filter(s => isStepDone(s.id)).length;
  const progress       = Math.round((completedCount / STEPS.length) * 100);

  // Vind de eerste niet-voltooide stap
  const nextStep = STEPS.find(s => !isStepDone(s.id));

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 mb-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600/20 flex items-center justify-center">
            <Zap className="w-4 h-4 text-brand-400" fill="currentColor" />
          </div>
          <div>
            <p className="text-white text-sm font-semibold">Aan de slag</p>
            <p className="text-slate-400 text-xs">{completedCount} van {STEPS.length} stappen voltooid</p>
          </div>
        </div>
        <button
          onClick={dismiss}
          className="w-7 h-7 rounded-lg bg-slate-700/50 hover:bg-slate-700 flex items-center justify-center transition-colors"
          title="Verberg checklist"
        >
          <X className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* Voortgangsbalk */}
      <div className="h-1.5 bg-slate-700 rounded-full mb-5 overflow-hidden">
        <div
          className="h-full bg-brand-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stappen */}
      <div className="space-y-2">
        {STEPS.map((step) => {
          const done    = isStepDone(step.id);
          const isNext  = nextStep?.id === step.id;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                isNext
                  ? 'bg-brand-600/10 border border-brand-500/20'
                  : done
                    ? 'opacity-60'
                    : 'opacity-40'
              }`}
            >
              {/* Status icoon */}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                done
                  ? 'bg-emerald-500'
                  : isNext
                    ? 'bg-brand-600'
                    : 'bg-slate-700'
              }`}>
                {done
                  ? <Check className="w-3.5 h-3.5 text-white" />
                  : <span className="text-xs font-bold text-white">{STEPS.indexOf(step) + 1}</span>
                }
              </div>

              {/* Tekst */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${done ? 'text-slate-400 line-through' : 'text-white'}`}>
                  {step.label}
                </p>
                {isNext && (
                  <p className="text-xs text-slate-400 mt-0.5">{step.description}</p>
                )}
              </div>

              {/* CTA */}
              {isNext && step.href && (
                <button
                  onClick={() => router.push(step.href!)}
                  className="flex items-center gap-1 text-xs font-semibold text-brand-400 hover:text-brand-300 flex-shrink-0 transition-colors"
                >
                  {step.cta}
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
