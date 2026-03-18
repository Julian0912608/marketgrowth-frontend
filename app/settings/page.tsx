'use client';

import { useState, useEffect } from 'react';
import {
  User, CreditCard, Bell, Shield,
  Check, Loader2, ArrowUpRight,
  Download, X, CheckCircle, Zap,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

interface BillingOverview {
  planSlug:          string;
  planName:          string;
  status:            string;
  currentPeriodEnd:  string;
  cancelAtPeriodEnd: boolean;
  invoices: {
    id:          string;
    date:        string;
    amount:      number;
    currency:    string;
    status:      string;
    downloadUrl: string | null;
  }[];
}

const PLANS = [
  {
    slug: 'starter', name: 'Starter', price: 49,
    features: ['1 webshop', '500 AI credits / maand', 'Sales dashboard', 'Wekelijks AI rapport', 'E-mail support'],
  },
  {
    slug: 'growth', name: 'Growth', price: 99, popular: true,
    features: ['3 webshops', '5.000 AI credits / maand', 'Alles van Starter', 'Dagelijkse AI inzichten', 'Slimme alerts', 'Prioriteit support'],
  },
  {
    slug: 'scale', name: 'Scale', price: 249,
    features: ['Onbeperkte webshops', 'Onbeperkte AI credits', 'Alles van Growth', 'Maatwerk AI rapporten', 'Dedicated support', 'API toegang'],
  },
];

const TABS = [
  { id: 'profile',  label: 'Profiel',       icon: User },
  { id: 'billing',  label: 'Abonnement',    icon: CreditCard },
  { id: 'security', label: 'Beveiliging',   icon: Shield },
  { id: 'notifications', label: 'Notificaties', icon: Bell },
];

const card  = 'bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6';
const input = 'w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors';

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [billing, setBilling]     = useState<BillingOverview | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading]   = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Profile state
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Security state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw,     setNewPw]     = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  // Notifications state
  const [notifWeekly,  setNotifWeekly]  = useState(true);
  const [notifAlerts,  setNotifAlerts]  = useState(true);
  const [notifProduct, setNotifProduct] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? '');
      setLastName(user.lastName   ?? '');
    }
  }, [user]);

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
    } catch { /* nog geen abonnement */ }
    finally { setBillingLoading(false); }
  };

  const handleSaveProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) return;
    setProfileLoading(true);
    try {
      const res = await api.patch('/auth/profile', { firstName, lastName });
      updateUser({ firstName: res.data.firstName, lastName: res.data.lastName });
      showToast('success', 'Profiel opgeslagen!');
    } catch (e: any) {
      showToast('error', e.response?.data?.message ?? 'Er ging iets mis.');
    } finally { setProfileLoading(false); }
  };

  const handleChangePassword = async () => {
    if (newPw.length < 8) { showToast('error', 'Nieuw wachtwoord moet minimaal 8 tekens zijn.'); return; }
    if (newPw !== confirmPw) { showToast('error', 'Wachtwoorden komen niet overeen.'); return; }
    setPwLoading(true);
    try {
      await api.post('/auth/change-password', { currentPassword: currentPw, newPassword: newPw });
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
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

  const currentPlan = billing?.planSlug ?? user?.planSlug ?? 'starter';
  const isTrialing  = billing?.status === 'trialing';
  const isCancelled = billing?.cancelAtPeriodEnd;

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
          toast.type === 'success'
            ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
            : 'bg-rose-500/20 border border-rose-500/30 text-rose-300'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <div className="mb-8">
        <h1 className="font-display text-2xl font-800 text-white mb-1">Instellingen</h1>
        <p className="text-slate-400 text-sm">Beheer je account en abonnement</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-slate-800/50 rounded-xl p-1 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── PROFIEL ── */}
      {activeTab === 'profile' && (
        <div className={card}>
          <h2 className="font-display font-700 text-white mb-6">Persoonlijke gegevens</h2>

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center font-display font-700 text-white text-lg">
              {firstName?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <div className="font-semibold text-white">{firstName} {lastName}</div>
              <div className="text-sm text-slate-400">{user?.email}</div>
              <div className="text-xs text-slate-500 capitalize mt-0.5 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {currentPlan} plan
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Voornaam</label>
              <input
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className={input}
                placeholder="Voornaam"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Achternaam</label>
              <input
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className={input}
                placeholder="Achternaam"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">E-mailadres</label>
            <input
              value={user?.email ?? ''}
              disabled
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-slate-500 cursor-not-allowed"
            />
            <p className="text-xs text-slate-600 mt-1">E-mailadres kan niet worden gewijzigd.</p>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={profileLoading || !firstName.trim() || !lastName.trim()}
            className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2"
          >
            {profileLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {profileLoading ? 'Opslaan...' : 'Opslaan'}
          </button>
        </div>
      )}

      {/* ── ABONNEMENT ── */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          {billingLoading ? (
            <div className={`${card} flex items-center justify-center h-32`}>
              <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
            </div>
          ) : billing ? (
            <div className={card}>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="font-display font-700 text-white">Huidig abonnement</h2>
                  <p className="text-sm text-slate-400 mt-0.5">
                    {billing.planName} — €{PLANS.find(p => p.slug === billing.planSlug)?.price ?? '?'}/maand
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  isTrialing  ? 'bg-amber-500/20 text-amber-400'   :
                  isCancelled ? 'bg-rose-500/20 text-rose-400'     :
                                'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {isTrialing ? 'Proefperiode' : isCancelled ? 'Opgezegd' : 'Actief'}
                </span>
              </div>

              {billing.currentPeriodEnd && (
                <p className="text-xs text-slate-500 mb-4">
                  {isCancelled ? 'Toegang tot' : 'Volgende facturatie op'}{' '}
                  {new Date(billing.currentPeriodEnd).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}

              {!isCancelled && !isTrialing && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="text-xs text-slate-500 hover:text-rose-400 transition-colors"
                >
                  Abonnement opzeggen
                </button>
              )}

              {showCancelConfirm && (
                <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                  <p className="text-sm text-rose-300 mb-3">Weet je zeker dat je wilt opzeggen? Je behoudt toegang tot het einde van je betaalperiode.</p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      disabled={cancelLoading}
                      className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1"
                    >
                      {cancelLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                      Ja, opzeggen
                    </button>
                    <button
                      onClick={() => setShowCancelConfirm(false)}
                      className="text-slate-400 hover:text-white text-xs px-3 py-1.5"
                    >
                      Annuleren
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Plan keuze */}
          <div>
            <h2 className="font-display font-700 text-white mb-4">
              {billing ? 'Pakket wijzigen' : 'Kies een pakket'}
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {PLANS.map(plan => {
                const isCurrent = currentPlan === plan.slug;
                return (
                  <div key={plan.slug} className={`${card} relative ${plan.popular ? 'border-brand-500/50' : ''}`}>
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Meest gekozen
                      </div>
                    )}
                    <div className="mb-4">
                      <div className="font-display font-700 text-white text-lg">{plan.name}</div>
                      <div className="text-2xl font-display font-800 text-white mt-1">
                        €{plan.price}<span className="text-sm font-normal text-slate-400">/maand</span>
                      </div>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-center gap-2 text-xs text-slate-300">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => !isCurrent && handleUpgrade(plan.slug)}
                      disabled={isCurrent || upgradeLoading !== null}
                      className={`w-full py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                        isCurrent
                          ? 'bg-slate-700 text-slate-400 cursor-default'
                          : 'bg-brand-600 hover:bg-brand-700 text-white'
                      }`}
                    >
                      {upgradeLoading === plan.slug && <Loader2 className="w-4 h-4 animate-spin" />}
                      {isCurrent ? 'Huidig pakket' : 'Kiezen'}
                      {!isCurrent && <ArrowUpRight className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Facturen */}
          {billing?.invoices && billing.invoices.length > 0 && (
            <div className={card}>
              <h2 className="font-display font-700 text-white mb-4">Factuurhistorie</h2>
              <div className="space-y-2">
                {billing.invoices.map(inv => (
                  <div key={inv.id} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                    <div>
                      <div className="text-sm text-white">
                        {new Date(inv.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                      <div className="text-xs text-slate-500">
                        €{(inv.amount / 100).toFixed(2)} — {inv.status}
                      </div>
                    </div>
                    {inv.downloadUrl && (
                      
                        href={inv.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        PDF
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── BEVEILIGING ── */}
      {activeTab === 'security' && (
        <div className={card}>
          <h2 className="font-display font-700 text-white mb-6">Wachtwoord wijzigen</h2>
          <div className="space-y-4 max-w-sm">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Huidig wachtwoord</label>
              <input
                type="password"
                value={currentPw}
                onChange={e => setCurrentPw(e.target.value)}
                className={input}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Nieuw wachtwoord</label>
              <input
                type="password"
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                className={input}
                placeholder="Minimaal 8 tekens"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Bevestig nieuw wachtwoord</label>
              <input
                type="password"
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                className={input}
                placeholder="••••••••"
              />
            </div>
            {newPw && confirmPw && newPw !== confirmPw && (
              <p className="text-xs text-rose-400">Wachtwoorden komen niet overeen.</p>
            )}
            <button
              onClick={handleChangePassword}
              disabled={pwLoading || !currentPw || !newPw || !confirmPw || newPw !== confirmPw}
              className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2"
            >
              {pwLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {pwLoading ? 'Wijzigen...' : 'Wachtwoord wijzigen'}
            </button>
          </div>
        </div>
      )}

      {/* ── NOTIFICATIES ── */}
      {activeTab === 'notifications' && (
        <div className={card}>
          <h2 className="font-display font-700 text-white mb-6">E-mailnotificaties</h2>
          <div className="space-y-4">
            {[
              { key: 'weekly',  label: 'Wekelijks AI rapport',     desc: 'Elke maandag een samenvatting van je prestaties', value: notifWeekly,  set: setNotifWeekly },
              { key: 'alerts',  label: 'Slimme alerts',            desc: 'Meldingen bij ongewone veranderingen in je data',  value: notifAlerts,  set: setNotifAlerts },
              { key: 'product', label: 'Productupdates',           desc: 'Nieuws over nieuwe functies en verbeteringen',     value: notifProduct, set: setNotifProduct },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between py-3 border-b border-slate-700/50 last:border-0">
                <div>
                  <div className="text-sm font-medium text-white">{item.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                </div>
                <button
                  onClick={() => item.set(!item.value)}
                  className={`relative w-10 h-5.5 rounded-full transition-colors ${item.value ? 'bg-brand-600' : 'bg-slate-700'}`}
                  style={{ height: '22px' }}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${item.value ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => showToast('success', 'Notificatie-instellingen opgeslagen!')}
            className="mt-6 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
          >
            Opslaan
          </button>
        </div>
      )}
    </div>
  );
}
