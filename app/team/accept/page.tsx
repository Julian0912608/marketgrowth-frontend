'use client';

// app/team/accept/page.tsx
// Team invite acceptatie — gebruikt fetch() direct, geen axios interceptor
// (de gebruiker heeft nog geen sessie op dit moment)

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Zap, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

function AcceptForm() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const token        = searchParams.get('token') ?? '';

  const [firstName,  setFirstName]  = useState('');
  const [lastName,   setLastName]   = useState('');
  const [password,   setPassword]   = useState('');
  const [showPass,   setShowPass]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [inviteInfo, setInviteInfo] = useState<{ email: string; tenantName: string } | null>(null);
  const [loadingInvite, setLoadingInvite] = useState(true);

  const API = process.env.NEXT_PUBLIC_API_URL;

  // Haal invite info op zonder auth — direct via fetch
  useEffect(() => {
    if (!token) {
      setError('Ongeldige uitnodigingslink.');
      setLoadingInvite(false);
      return;
    }

    fetch(`${API}/api/team/invite/${token}`)
      .then(res => {
        if (!res.ok) throw new Error('Uitnodiging niet gevonden of verlopen.');
        return res.json();
      })
      .then(data => {
        setInviteInfo({ email: data.email, tenantName: data.tenantName });
        setLoadingInvite(false);
      })
      .catch(err => {
        setError(err.message);
        setLoadingInvite(false);
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !password || !token) return;

    setLoading(true);
    setError('');

    try {
      // Gebruik fetch direct — geen axios interceptor die 401 loop kan veroorzaken
      const res = await fetch(`${API}/api/team/accept`, {
        method:      'POST',
        credentials: 'include', // voor cookie
        headers:     { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, firstName, lastName, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Er is iets misgegaan. Probeer het opnieuw.');
        setLoading(false);
        return;
      }

      // Sla access token op en redirect naar dashboard
      if (data.accessToken) {
        sessionStorage.setItem('access_token', data.accessToken);
      }

      router.push('/dashboard');
    } catch {
      setError('Verbindingsfout. Probeer het opnieuw.');
      setLoading(false);
    }
  };

  if (loadingInvite) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
      </div>
    );
  }

  if (error && !inviteInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 px-4">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-rose-400" />
          </div>
          <h2 className="text-white font-semibold text-lg mb-2">Uitnodiging ongeldig</h2>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-600/30">
            <Zap className="w-6 h-6 text-white" fill="white" />
          </div>
          <h1 className="font-display text-2xl font-800 text-white">Join your team</h1>
          <p className="text-slate-400 text-sm mt-1">
            {inviteInfo
              ? `Je bent uitgenodigd voor ${inviteInfo.tenantName}`
              : 'Create your account to get started.'
            }
          </p>
          {inviteInfo?.email && (
            <p className="text-xs text-slate-500 mt-1">{inviteInfo.email}</p>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          {error && (
            <div className="mb-4 px-4 py-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Voornaam</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Jan"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Achternaam</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="de Vries"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Wachtwoord</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 tekens"
                  minLength={8}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 pr-10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !firstName || !lastName || password.length < 8}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Account aanmaken...</>
                : <><CheckCircle className="w-4 h-4" /> Account aanmaken & team joinen</>
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function TeamAcceptPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
      </div>
    }>
      <AcceptForm />
    </Suspense>
  );
}
