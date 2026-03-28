'use client';

// components/dashboard/AppLoader.tsx
// Splash screen dat getoond wordt bij initieel laden van het dashboard
// Verdwijnt zodra alle kritieke data binnen is

import { useState, useEffect, useRef } from 'react';
import { Zap } from 'lucide-react';
import { api } from '@/lib/api';

interface LoadStep {
  id:      string;
  label:   string;
  done:    boolean;
  error:   boolean;
}

interface AppLoaderProps {
  onReady: (data: {
    integrations: any[];
    overview:     any;
    topProducts:  any[];
    credits:      any;
  }) => void;
}

export function AppLoader({ onReady }: AppLoaderProps) {
  const [steps, setSteps]       = useState<LoadStep[]>([
    { id: 'auth',     label: 'Authenticatie',      done: false, error: false },
    { id: 'stores',   label: 'Winkels laden',       done: false, error: false },
    { id: 'stats',    label: 'Statistieken ophalen', done: false, error: false },
    { id: 'products', label: 'Producten ophalen',   done: false, error: false },
    { id: 'ai',       label: 'AI voorbereiden',     done: false, error: false },
  ]);
  const [progress, setProgress] = useState(0);
  const [visible,  setVisible]  = useState(true);
  const called = useRef(false);

  const markDone = (id: string, error = false) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, done: true, error } : s));
  };

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const load = async () => {
      const result = {
        integrations: [] as any[],
        overview:     null as any,
        topProducts:  [] as any[],
        credits:      null as any,
      };

      // Stap 1: auth — al ingelogd, direct done
      await new Promise(r => setTimeout(r, 300));
      markDone('auth');
      setProgress(20);

      // Stap 2: winkels
      try {
        const res = await api.get('/integrations');
        result.integrations = res.data ?? [];
        markDone('stores');
      } catch {
        markDone('stores', true);
      }
      setProgress(40);

      // Stap 3: statistieken (parallel met producten)
      const [ovRes, tpRes] = await Promise.allSettled([
        api.get('/analytics/overview?period=7d'),
        api.get('/analytics/top-products?limit=3&period=7d'),
      ]);

      if (ovRes.status === 'fulfilled') {
        result.overview = ovRes.value.data;
        markDone('stats');
      } else {
        markDone('stats', true);
      }
      setProgress(65);

      if (tpRes.status === 'fulfilled') {
        result.topProducts = tpRes.value.data.products ?? [];
        markDone('products');
      } else {
        markDone('products', true);
      }
      setProgress(85);

      // Stap 5: AI credits
      try {
        const res = await api.get('/ai/credits');
        result.credits = res.data;
        markDone('ai');
      } catch {
        markDone('ai', true);
      }
      setProgress(100);

      // Korte pauze zodat de 100% zichtbaar is
      await new Promise(r => setTimeout(r, 500));

      // Fade out
      setVisible(false);
      await new Promise(r => setTimeout(r, 400));

      onReady(result);
    };

    load();
  }, []);

  if (!visible) return null;

  const doneCount = steps.filter(s => s.done).length;

  return (
    <div className={`fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center transition-opacity duration-400 ${
      progress === 100 ? 'opacity-0 pointer-events-none' : 'opacity-100'
    }`}
    style={{ transition: 'opacity 0.4s ease' }}
    >
      {/* Achtergrond glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
      </div>

      {/* Logo */}
      <div className="relative mb-10 flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-2xl shadow-brand-600/30 mb-4">
          <Zap className="w-7 h-7 text-white" fill="white" />
        </div>
        <h1 className="font-display text-2xl font-800 text-white tracking-tight">MarketGrow</h1>
        <p className="text-slate-500 text-sm mt-1">Data ophalen...</p>
      </div>

      {/* Progress bar */}
      <div className="w-64 mb-8">
        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-slate-600">{doneCount}/{steps.length} stappen</span>
          <span className="text-xs text-slate-600">{progress}%</span>
        </div>
      </div>

      {/* Stappen */}
      <div className="space-y-2 w-56">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
              step.error ? 'bg-rose-500/20 border border-rose-500/40' :
              step.done  ? 'bg-emerald-500/20 border border-emerald-500/40' :
                           'bg-slate-800 border border-slate-700'
            }`}>
              {step.done && !step.error && (
                <svg className="w-2.5 h-2.5 text-emerald-400" fill="none" viewBox="0 0 12 12">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              {step.error && (
                <svg className="w-2.5 h-2.5 text-rose-400" fill="none" viewBox="0 0 12 12">
                  <path d="M4 4l4 4M8 4l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              )}
              {!step.done && (
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
              )}
            </div>
            <span className={`text-xs transition-colors duration-300 ${
              step.error ? 'text-rose-400' :
              step.done  ? 'text-slate-300' :
                           'text-slate-600'
            }`}>
              {step.label}
            </span>
            {!step.done && !step.error && (
              <div className="ml-auto">
                <div className="w-3 h-3 border border-slate-600 border-t-slate-400 rounded-full animate-spin" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
