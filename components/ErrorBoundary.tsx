'use client';

// components/ErrorBoundary.tsx
//
// Reusable React Error Boundary die een nette fallback toont
// als een dashboard pagina crasht. Voorkomt witte pagina's bij
// API timeouts, parseerfouten of andere runtime errors.
//
// Gebruik:
//   <ErrorBoundary>
//     <SomeDashboardPage />
//   </ErrorBoundary>
//
// Of met custom fallback:
//   <ErrorBoundary fallback={<p>Custom error</p>}>

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children:  React.ReactNode;
  fallback?: React.ReactNode;
  // Optionele label voor betere error context in logs
  label?:    string;
}

interface State {
  hasError:   boolean;
  errorMsg:   string;
  errorStack: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMsg: '', errorStack: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError:   true,
      errorMsg:   error?.message ?? 'Unknown error',
      errorStack: error?.stack ?? '',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log naar console zodat het zichtbaar is in Railway logs
    console.error('[ErrorBoundary]', this.props.label ?? 'unknown', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMsg: '', errorStack: '' });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex items-center justify-center min-h-[300px] p-6">
          <div className="bg-slate-800/50 border border-rose-500/20 rounded-2xl p-8 max-w-md w-full text-center">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-rose-400" />
            </div>
            <h3 className="font-display font-700 text-white text-lg mb-2">
              Something went wrong
            </h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              This section couldn't load. This is usually a temporary issue.
            </p>
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try again
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-left">
                <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-400">
                  Error details
                </summary>
                <pre className="mt-2 text-xs text-rose-400 bg-slate-900 rounded-lg p-3 overflow-auto max-h-40 whitespace-pre-wrap">
                  {this.state.errorMsg}
                  {'\n'}
                  {this.state.errorStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ── Convenience wrapper voor pagina-niveau ────────────────────
// Gebruik dit als top-level wrapper op dashboard pages.
export function PageErrorBoundary({
  children,
  label,
}: {
  children: React.ReactNode;
  label?:   string;
}) {
  return (
    <ErrorBoundary label={label}>
      {children}
    </ErrorBoundary>
  );
}

// ── Kleine inline variant voor widgets/cards ──────────────────
export function CardErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="bg-slate-800/30 border border-rose-500/10 rounded-2xl p-6 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <p className="text-slate-400 text-sm">This card couldn't load. Refresh the page to retry.</p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
