'use client';

// ============================================================
// components/dashboard/TrialBanner.tsx
// Toont een banner als de gebruiker in trial zit
// Verdwijnt automatisch als het plan actief is
// Voeg toe aan app/dashboard/layout.tsx of DashboardLayout
// ============================================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Zap, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export function TrialBanner() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [daysLeft,  setDaysLeft]  = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    // Alleen tonen voor trialing gebruikers
    api.get('/billing/overview')
      .then(res => {
        const data = res.data;
        if (data.status !== 'trialing') { setLoading(false); return; }

        const end  = new Date(data.currentPeriodEnd);
        const now  = new Date();
        const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        setDaysLeft(days);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || dismissed || daysLeft === null) return null;
  if (daysLeft > 14) return null; // veiligheidscheck

  // Kleur op basis van urgentie
  const isUrgent  = daysLeft <= 3;
  const isWarning = daysLeft <= 7 && daysLeft > 3;

  const bgColor = isUrgent
    ? 'bg-rose-500/10 border-rose-500/20'
    : isWarning
      ? 'bg-amber-500/10 border-amber-500/20'
      : 'bg-brand-500/10 border-brand-500/20';

  const textColor = isUrgent
    ? 'text-rose-300'
    : isWarning
      ? 'text-amber-300'
      : 'text-brand-300';

  const iconColor = isUrgent ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-brand-400';

  const message = daysLeft === 0
    ? 'Je trial verloopt vandaag'
    : daysLeft === 1
      ? 'Je trial verloopt morgen'
      : `Nog ${daysLeft} dagen in je gratis trial`;

  return (
    <div className={`mx-6 mt-4 flex items-center justify-between px-4 py-3 rounded-xl border ${bgColor}`}>
      <div className="flex items-center gap-3">
        <Clock className={`w-4 h-4 flex-shrink-0 ${iconColor}`} />
        <p className={`text-sm font-medium ${textColor}`}>
          {message} —{' '}
          <button
            onClick={() => router.push('/settings?tab=billing')}
            className={`underline font-semibold hover:no-underline ${textColor}`}
          >
            activeer je plan nu
          </button>
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
        <button
          onClick={() => router.push('/settings?tab=billing')}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
            isUrgent
              ? 'bg-rose-500 hover:bg-rose-600 text-white'
              : isWarning
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-brand-600 hover:bg-brand-700 text-white'
          }`}
        >
          <Zap className="w-3 h-3" fill="currentColor" />
          Upgrade
        </button>
        {!isUrgent && (
          <button
            onClick={() => setDismissed(true)}
            className="w-6 h-6 rounded-lg hover:bg-slate-700/50 flex items-center justify-center transition-colors"
          >
            <X className="w-3.5 h-3.5 text-slate-500" />
          </button>
        )}
      </div>
    </div>
  );
}
