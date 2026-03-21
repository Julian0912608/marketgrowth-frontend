'use client';

// app/forgot-password/page.tsx

import { useState } from 'react';
import Link from 'next/link';
import { Zap, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email,     setEmail]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error,     setError]     = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/password/reset-request', { email });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center gap-2 font-bold text-lg text-slate-900 mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          MarketGrow
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">

          {submitted ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <h1 className="text-lg font-bold text-slate-900 mb-2">Check your email</h1>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                If <span className="font-medium text-slate-700">{email}</span> is linked to an account,
                you'll receive a password reset link within a few minutes.
              </p>
              <Link
                href="/login"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-lg font-bold text-slate-900 mb-1">Forgot your password?</h1>
              <p className="text-slate-500 text-sm mb-6">
                Enter your email and we'll send you a reset link.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send reset link'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/login" className="text-sm text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
