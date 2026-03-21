'use client';

// ============================================================
// components/dashboard/ExportButton.tsx
// Voeg toe aan app/dashboard/analytics/page.tsx
// ============================================================

import { useState } from 'react';
import { Download, ChevronDown, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface ExportButtonProps {
  period:    string;
  platform?: string;
}

type ExportType   = 'orders' | 'products' | 'ads';
type ExportFormat = 'csv' | 'json';

export function ExportButton({ period, platform }: ExportButtonProps) {
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);

  const doExport = async (type: ExportType, format: ExportFormat) => {
    setOpen(false);
    setLoading(true);
    try {
      const params = new URLSearchParams({ period, type, format });
      if (platform) params.set('platform', platform);

      // Gebruik fetch direct voor blob download
      const token = typeof window !== 'undefined'
        ? sessionStorage.getItem('access_token')
        : null;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/export?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) {
        // 403 = feature not available — api interceptor handelt dit af
        if (res.status === 403) {
          const data = await res.json();
          window.dispatchEvent(new CustomEvent('upgrade-required', {
            detail: {
              feature:      'report-export',
              requiredPlan: 'growth',
              message:      data.message,
            },
          }));
          return;
        }
        throw new Error('Export mislukt');
      }

      const blob        = await res.blob();
      const disposition = res.headers.get('Content-Disposition') ?? '';
      const match       = disposition.match(/filename="(.+?)"/);
      const filename    = match?.[1] ?? `export-${type}.${format}`;

      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a');
      a.href     = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setLoading(false);
    }
  };

  const options: { label: string; type: ExportType; format: ExportFormat }[] = [
    { label: 'Orders als CSV',    type: 'orders',   format: 'csv' },
    { label: 'Producten als CSV', type: 'products', format: 'csv' },
    { label: 'Advertenties als CSV', type: 'ads',   format: 'csv' },
    { label: 'Orders als JSON',   type: 'orders',   format: 'json' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-xl transition-colors disabled:opacity-50"
      >
        {loading
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <Download className="w-4 h-4" />
        }
        Exporteren
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden min-w-48">
            {options.map(opt => (
              <button
                key={`${opt.type}-${opt.format}`}
                onClick={() => doExport(opt.type, opt.format)}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
