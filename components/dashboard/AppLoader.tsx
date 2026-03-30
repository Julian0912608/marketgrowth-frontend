'use client';

// components/dashboard/AppLoader.tsx

import { useState, useEffect, useRef } from 'react';
import { Zap } from 'lucide-react';
import { api } from '@/lib/api';

interface LoadStep {
  id:    string;
  label: string;
  done:  boolean;
  error: boolean;
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
  const [steps, setSteps] = useState<LoadStep[]>([
    { id: 'auth',     label: 'Authenticating',    done: false, error: false },
    { id: 'stores',   label: 'Loading stores',    done: false, error: false },
    { id: 'stats',    label: 'Fetching stats',    done: false, error: false },
    { id: 'products', label: 'Loading products',  done: false, error: false },
    { id: 'ai',       label: 'Preparing AI',      done: false, error: false },
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

      await new Promise(r => setTimeout(r, 300));
      markDone('auth');
      setProgress(20);

      try {
        const res = await api.get('/integrations');
        result.integrations = res.data ?? [];
        markDone('stores');
      } catch {
        markDone('stores', true);
      }
      setProgress(40);

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

      try {
        const credRes = await api.get('/ai/credits');
        result.credits = credRes.data;
        markDone('ai');
      } catch {
        markDone('ai', true);
      }
      setProgress(100);

      await new Promise(r => setTimeout(r, 400));
      setVisible(false);
      setTimeout(() => onReady(result), 300);
    };

    load();
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50">
      <div className="w-full max-w-sm px-6">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" fill="white" />
          </div>
          <span className="text-white font-bold text-xl">MarketGrow</span>
        </div>

        <div className="h-1 bg-slate-800 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="space-y-2">
          {steps.map(step => (
            <div key={step.id} className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full flex-shrink-0 transition-all ${
                step.error ? 'bg-rose-500' : step.done ? 'bg-emerald-500' : 'bg-slate-700'
              }`} />
              <span className={`text-sm transition-colors ${
                step.done ? 'text-slate-400' : step.error ? 'text-rose-400' : 'text-slate-500'
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
