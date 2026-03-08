'use client';

import { useState, useEffect } from 'react';
import {
  User, CreditCard, Bell, Shield, Zap,
  Check, Loader2, AlertTriangle, ArrowUpRight,
  Download, X, CheckCircle
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

interface BillingOverview {
  planSlug: string;
  planName: string;
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  invoices: { id: string; date: string; amount: number; currency: string; status: string; downloadUrl: string | null; }[];
}

const PLANS = [
  { slug: 'starter', name: 'Starter', price: 49,  features: ['1 connected store', '500 AI credits / month', 'Sales dashboard', 'Weekly AI report', 'Email support'] },
  { slug: 'growth',  name: 'Growth',  price: 99,  popular: true, features: ['3 connected stores', '5,000 AI credits / month', 'Everything in Starter', 'Daily AI insights', 'Smart alerts', 'Priority support'] },
  { slug: 'scale',   name: 'Scale',   price: 249, features: ['Unlimited stores', 'Unlimited AI credits', 'Everything in Growth', 'Custom AI reports', 'Dedicated support', 'API access'] },
];

const TABS = [
  { id: 'profile',       label: 'Profile',      icon: User },
  { id: 'billing',       label: 'Billing',       icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security',      label: 'Security',      icon: Shield },
];

export default function SettingsPage() {
  const { user, setAuth, accessToken } = useAuthStore();
  const [activeTab, setActiveTab]   = useState('profile');
  const [billing, setBilling]       = useState<BillingOverview | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading]   = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Profile
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Security
  const [currentPw, setCurrentPw] = useState('');
  const [newPw,     setNewPw]     = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  // Sync user data from store when loaded
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? '');
      setLastName(user.lastName ?? '');
    }
  }, [user]);

  // Fetch billing when tab opens
  useEffect(() => {
    if (activeTab === 'billing' && !billing) fetchBilling();
  }, [activeTab]);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchBilling = async () => {
    setBillingLoading(true);
    try {
      const res = await api.get('/billing/overview');
      setBilling(res.data);
    } catch { /* no subscription yet is fine */ }
    finally { setBillingLoading(false); }
  };

  const handleSaveProfile = async () => {
    setProfileLoading(true);
    try {
      const res = await api.patch('/auth/profile', { firstName, lastName });
      // Gebruik response data (bevestigd door backend) om store bij te werken
      const saved = res.data;
      if (user && accessToken) {
        setAuth({
          ...user,
          firstName: saved.firstName ?? firstName,
          lastName:  saved.lastName  ?? lastName,
        }, accessToken);
      }
      // Sync lokale state met opgeslagen waarden
      setFirstName(saved.firstName ?? firstName);
      setLastName(saved.lastName   ?? lastName);
      showToast('success', 'Profiel opgeslagen!');
    } catch (e: any) {
      showToast('error', e.response?.data?.message ?? 'Er ging iets mis. Controleer de verbinding.');
    } finally { setProfileLoading(false); }
  };

  const handleChangePassword = async () => {
    if (newPw.length < 8) { showToast('error', 'Nieuw wachtwoord moet minimaal 8 tekens zijn.'); return; }
    setPwLoading(true);
    try {
      await api.post('/auth/change-password', { currentPassword: currentPw, newPassword: newPw });
      setCurrentPw(''); setNewPw('');
      showToast('success', 'Wachtwoord succesvol gewijzigd!');
    } catch (e: any) {
      showToast('error', e.response?.data?.message ?? 'Er ging iets mis.');
    } finally { setPwLoading(false); }
  };

  const handleUpgrade = async (planSlug: string) => {
    setUpgradeLoading(planSlug);
    try {
      if (!billing) {
        const res = await api.post('/billing/checkout', { planSlug });
        window.location.href = res.data.url;
      } else {
        await api.post('/billing/change-plan', { planSlug });
        await fetchBilling();
        showToast('success', `Plan gewijzigd naar ${planSlug}!`);
      }
    } catch (e: any) {
      showToast('error', e.response?.data?.message ?? 'Er ging iets mis.');
    } finally { setUpgradeLoading(null); }
  };

  const handleCancel = async () => {
    setCancelLoading(true);
    try {
      await api.post('/billing/cancel');
      await fetchBilling();
      setShowCancelConfirm(false);
      showToast('success', 'Abonnement opgezegd. Toegang loopt door tot einde periode.');
    } catch (e: any) {
      showToast('error', e.response?.data?.message ?? 'Er ging iets mis.');
    } finally { setCancelLoading(false); }
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });
  const fmtMoney = (a: number, c: string) => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: c }).format(a);

  const isTrialing  = billing?.status === 'trialing';
  const isCancelled = billing?.cancelAtPeriodEnd;

  const input = "w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent";
  const card  = "bg-slate-800/60 rounded-2xl border border-slate-700/50 p-6";

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">

        <div className="mb-8">
          <h1 className="font-display text-2xl font-800 text-white mb-1">Account Settings</h1>
          <p className="text-slate-400 text-sm">Beheer je profiel, facturering en voorkeuren.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-800/60 border border-slate-700/50 rounded-xl p-1 mb-8 w-fit">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === t.id ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}>
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* ── PROFILE ── */}
        {activeTab === 'profile' && (
          <div className={card}>
            <h2 className="font-display font-700 text-white mb-6">Persoonlijke gegevens</h2>
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-700">
              <div className="w-16 h-16 rounded-2xl bg-brand-600/20 border border-brand-600/30 flex items-center justify-center text-brand-400 font-display font-700 text-xl">
                {firstName?.[0]?.toUpperCase()}{lastName?.[0]?.toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-white">{firstName} {lastName}</div>
                <div className="text-sm text-slate-400">{user?.email}</div>
                <div className="text-xs text-slate-500 capitalize mt-0.5">{user?.role}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Voornaam</label>
                <input value={firstName} onChange={e => setFirstName(e.target.value)} className={input} placeholder="Voornaam" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Achternaam</label>
                <input value={lastName} onChange={e => setLastName(e.target.value)} className={input} placeholder="Achternaam" />
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">E-mailadres</label>
              <input value={user?.email ?? ''} disabled className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-500 cursor-not-allowed" />
              <p className="text-xs text-slate-600 mt-1">E-mailadres kan niet worden gewijzigd.</p>
            </div>
            <button onClick={handleSaveProfile} disabled={profileLoading || !firstName || !lastName}
              className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all flex items-center gap-2">
              {profileLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Opslaan
            </button>
          </div>
        )}

        {/* ── BILLING ── */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            {billingLoading ? (
              <div className={`${card} flex items-center justify-center h-32`}>
                <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
              </div>
            ) : billing ? (
              <div className={card}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="font-display font-700 text-white">Huidig abonnement</h2>
                    <p className="text-sm text-slate-400 mt-0.5">Beheer je abonnement</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    isTrialing ? 'bg-amber-500/20 text-amber-400' :
                    isCancelled ? 'bg-red-500/20 text-red-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {isTrialing ? '14-daagse proef' : isCancelled ? 'Loopt af' : 'Actief'}
                  </span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl mb-4 border border-slate-700/50">
                  <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-600/30 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-brand-400" fill="currentColor" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-white capitalize">{billing.planName} Plan</div>
                    <div className="text-sm text-slate-400">
                      {isTrialing ? `Proef loopt af op ${fmt(billing.currentPeriodEnd)}`
                        : isCancelled ? `Toegang tot ${fmt(billing.currentPeriodEnd)}`
                        : `Verlengt op ${fmt(billing.currentPeriodEnd)}`}
                    </div>
                  </div>
                  <div className="font-display font-700 text-white">
                    €{PLANS.find(p => p.slug === billing.planSlug)?.price ?? '—'}<span className="text-slate-500 font-normal text-sm">/mo</span>
                  </div>
                </div>
                {isTrialing && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-4 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-300">
                      Je proefperiode eindigt op <strong>{fmt(billing.currentPeriodEnd)}</strong>. Geen kosten tot die datum. Annuleer altijd voor die datum.
                    </p>
                  </div>
                )}
                {!isCancelled && (
                  <button onClick={() => setShowCancelConfirm(true)} className="text-sm text-slate-500 hover:text-red-400 transition-colors">
                    Abonnement opzeggen
                  </button>
                )}
              </div>
            ) : (
              <div className={card}>
                <p className="text-sm text-slate-400 mb-1">Geen actief abonnement gevonden.</p>
                <p className="text-xs text-slate-500">Kies een plan hieronder om te beginnen.</p>
              </div>
            )}

            {/* Plan picker */}
            <div className={card}>
              <h2 className="font-display font-700 text-white mb-1">{billing ? 'Plan wijzigen' : 'Kies een plan'}</h2>
              <p className="text-sm text-slate-400 mb-6">{billing ? 'Upgrade of downgrade op elk moment.' : 'Start je 14-daagse gratis proefperiode.'}</p>
              <div className="grid gap-4">
                {PLANS.map(plan => {
                  const isCurrent = billing?.planSlug === plan.slug;
                  const isLoading = upgradeLoading === plan.slug;
                  return (
                    <div key={plan.slug} className={`relative rounded-xl border-2 p-5 transition-all ${
                      isCurrent ? 'border-brand-500/50 bg-brand-600/10' : 'border-slate-700/50 hover:border-slate-600'
                    }`}>
                      {plan.popular && !isCurrent && (
                        <span className="absolute -top-2.5 left-4 bg-amber-400 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full">Meest gekozen</span>
                      )}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-display font-700 text-white">{plan.name}</span>
                            {isCurrent && (
                              <span className="bg-brand-500/20 text-brand-400 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Check className="w-3 h-3" /> Huidig
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1">
                            {plan.features.map(f => (
                              <span key={f} className="text-xs text-slate-400 flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-500" /> {f}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-display font-700 text-white text-lg">
                            €{plan.price}<span className="text-slate-500 font-normal text-sm">/mo</span>
                          </div>
                          {!isCurrent && (
                            <button onClick={() => handleUpgrade(plan.slug)} disabled={!!upgradeLoading}
                              className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300 disabled:opacity-50 transition-colors">
                              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                              {!billing ? 'Proef starten' : 'Overstappen'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Invoices */}
            {billing && billing.invoices.length > 0 && (
              <div className={card}>
                <h2 className="font-display font-700 text-white mb-4">Factuurhistorie</h2>
                <div className="space-y-2">
                  {billing.invoices.map(inv => (
                    <div key={inv.id} className="flex items-center justify-between py-3 border-b border-slate-700/50 last:border-0">
                      <div>
                        <div className="text-sm font-medium text-white">{fmt(inv.date)}</div>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${inv.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          {inv.status === 'paid' ? 'Betaald' : inv.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-white text-sm">{fmtMoney(inv.amount, inv.currency)}</span>
                        {inv.downloadUrl && (
                          <a href={inv.downloadUrl} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-brand-400 transition-colors">
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── NOTIFICATIONS ── */}
        {activeTab === 'notifications' && (
          <div className={card}>
            <h2 className="font-display font-700 text-white mb-6">Notificatievoorkeuren</h2>
            <div className="space-y-1">
              {[
                { label: 'Wekelijks AI-rapport',   desc: 'Prestatiesamenvatting elke maandag',         defaultOn: true },
                { label: 'Slimme waarschuwingen',   desc: 'Afwijkingen in je winkeldata',              defaultOn: true },
                { label: 'Nieuwe integraties',      desc: 'Updates over nieuwe platformkoppelingen',   defaultOn: false },
                { label: 'Factureringsherinneringen',desc: 'Herinnering voor einde proef of verlenging',defaultOn: true },
                { label: 'Productupdates',          desc: 'Changelog en nieuwe functies',              defaultOn: false },
              ].map(item => <NotificationToggle key={item.label} {...item} />)}
            </div>
          </div>
        )}

        {/* ── SECURITY ── */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className={card}>
              <h2 className="font-display font-700 text-white mb-6">Wachtwoord wijzigen</h2>
              <div className="space-y-4 max-w-sm">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Huidig wachtwoord</label>
                  <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)}
                    className={input} placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Nieuw wachtwoord</label>
                  <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
                    className={input} placeholder="Minimaal 8 tekens" />
                </div>
                <button onClick={handleChangePassword} disabled={pwLoading || !currentPw || newPw.length < 8}
                  className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all flex items-center gap-2">
                  {pwLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Wachtwoord bijwerken
                </button>
              </div>
            </div>
            <div className={`${card} border-red-900/30`}>
              <h2 className="font-display font-700 text-red-400 mb-2">Gevarenzone</h2>
              <p className="text-sm text-slate-400 mb-4">Verwijder je account en alle bijbehorende data permanent.</p>
              <button className="text-sm font-semibold text-red-400 hover:text-red-300 border border-red-900/50 hover:border-red-700/50 px-4 py-2 rounded-lg transition-all">
                Account verwijderen
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cancel modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <button onClick={() => setShowCancelConfirm(false)} className="text-slate-500 hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <h3 className="font-display font-700 text-white mb-2">Abonnement opzeggen?</h3>
            <p className="text-sm text-slate-400 mb-6">Je behoudt toegang tot het einde van je factuurperiode. Je kunt je op elk moment opnieuw abonneren.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowCancelConfirm(false)}
                className="flex-1 border border-slate-700 text-slate-300 text-sm font-semibold py-2.5 rounded-lg hover:bg-slate-800 transition-all">
                Behouden
              </button>
              <button onClick={handleCancel} disabled={cancelLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                {cancelLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Opzeggen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium z-50 ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function NotificationToggle({ label, desc, defaultOn }: { label: string; desc: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-slate-700/50 last:border-0">
      <div>
        <div className="text-sm font-medium text-white">{label}</div>
        <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
      </div>
      <button onClick={() => setOn(!on)} className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${on ? 'bg-brand-600' : 'bg-slate-700'}`}>
        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}
