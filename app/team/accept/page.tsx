'use client';

// app/team/accept/page.tsx
// Pagina waar uitgenodigde teamleden hun account aanmaken

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Zap, Loader2, Eye, EyeOff } from 'lucide-react';
import { api } from '@/lib/api';

function AcceptInviteForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const token        = searchParams.get('token') ?? '';

  const [firstName,    setFirstName]    = useState('');
  const [lastName,     setLastName]     = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [done,         setDone]         = useState(false);

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-rose-400 text-sm">Invalid invitation link.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post(`/team/accept/${token}`, { firstName, lastName, password });
      setDone(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
          <Zap className="w-6 h-6 text-emerald-400" />
        </div>
        <h2 className="text-white font-semibold mb-2">Account created!</h2>
        <p className="text-slate-400 text-sm">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">First name</label>
          <input
            type="text"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            required
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Last name</label>
          <input
            type="text"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            required
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            required
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 pr-10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      {error && <p className="text-rose-400 text-xs">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        Create account & join team
      </button>
    </form>
  );
}

export default function AcceptInvitePage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-600/30">
            <Zap className="w-5 h-5 text-white" fill="white" />
          </div>
          <h1 className="text-xl font-bold text-white mb-1">Join your team</h1>
          <p className="text-slate-400 text-sm">Create your account to get started.</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <Suspense fallback={<div className="text-center text-slate-400 text-sm">Loading...</div>}>
            <AcceptInviteForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
