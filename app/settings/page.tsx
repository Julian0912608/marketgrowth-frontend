'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  invoices: {
    id: string;
    date: string;
    amount: number;
    currency: string;
    status: string;
    downloadUrl: string | null;
  }[];
}

const PLANS = [
  {
    slug: 'starter',
    name: 'Starter',
    price: 49,
    features: ['1 connected store', '500 AI credits / month', 'Sales dashboard', 'Weekly AI report', 'Email support'],
  },
  {
    slug: 'growth',
    name: 'Growth',
    price: 99,
    popular: true,
    features: ['3 connected stores', '5,000 AI credits / month', 'Everything in Starter', 'Daily AI insights', 'Smart alerts', 'Priority support'],
  },
  {
    slug: 'scale',
    name: 'Scale',
    price: 249,
    features: ['Unlimited stores', 'Unlimited AI credits', 'Everything in Growth', 'Custom AI reports', 'Dedicated support', 'API access'],
  },
];

const NAV_ITEMS = [
  { id: 'profile',       label: 'Profile',       icon: User },
  { id: 'billing',       label: 'Billing',        icon: CreditCard },
  { id: 'notifications', label: 'Notifications',  icon: Bell },
  { id: 'security',      label: 'Security',       icon: Shield },
];

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('billing');
  const [billing, setBilling] = useState<BillingOverview | null>(null);
  const [billingLoading, setBillingLoading] = useState(true);
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName]   = useState(user?.lastName ?? '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw]         = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => { fetchBilling(); }, []);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchBilling = async () => {
    setBillingLoading(true);
    try {
      const res = await api.get('/billing/overview');
      setBilling(res.data);
    } catch {}
    finally { setBillingLoading(false); }
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
        showToast('success', `Plan changed to ${planSlug.charAt(0).toUpperCase() + planSlug.slice(1)}!`);
      }
    } catch (e: any) {
      showToast('error', e.response?.data?.message ?? 'Something went wrong.');
    } finally { setUpgradeLoading(null); }
  };

  const handleCancel = async () => {
    setCancelLoading(true);
    try {
      await api.post('/billing/cancel');
      await fetchBilling();
      setShowCancelConfirm(false);
      showToast('success', 'Subscription cancelled. Access continues until end of billing period.');
    } catch (e: any) {
      showToast('error', e.response?.data?.message ?? 'Something went wrong.');
    } finally { setCancelLoading(false); }
  };

  const handleSaveProfile = async () => {
    setProfileLoading(true);
    try {
      await api.patch('/auth/profile', { firstName, lastName });
      showToast('success', 'Profile updated!');
    } catch (e: any) {
      showToast('error', e.response?.data?.message ?? 'Something went wrong.');
    } finally { setProfileLoading(false); }
  };

  const handleChangePassword = async () => {
    setPwLoading(true);
    try {
      await api.post('/auth/change-password', { currentPassword: currentPw, newPassword: newPw });
      setCurrentPw(''); setNewPw('');
      showToast('success', 'Password updated!');
    } catch (e: any) {
      showToast('error', e.response?.data?.message ?? 'Something went wrong.');
    } finally { setPwLoading(false); }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const formatAmount = (amount: number, currency: string) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(amount);

  const isTrialing = billing?.status === 'trialing';
  const isCancelled = billing?.cancelAtPeriodEnd;

  // Shared input class for dark theme
  const inputClass = "w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent";
  const cardClass = "bg-slate-800/60 rounded-2xl border border-slate-700/50 p-6";

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-800 text-white mb-1">Account Settings</h1>
          <p className="text-slate-400 text-sm">Manage your profile, billing, and preferences.</p>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 bg-slate-800/60 border border-slate-700/50 rounded-xl p-1 mb-8 w-fit">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        {/* ── Profile ── */}
        {activeTab === 'profile' && (
          <div className={cardClass}>
            <h2 className="font-display font-700 text-white mb-6">Personal Information</h2>
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-700">
              <div className="w-16 h-16 rounded-2xl bg-brand-600/20 border border-brand-600/30 flex items-center justify-center text-brand-400 font-display font-700 text-xl">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div>
                <div className="font-semibold text-white">{user?.firstName} {user?.lastName}</div>
                <div className="text-sm text-slate-400">{user?.email}</div>
                <div className="text-xs text-slate-500 capitalize mt-0.5">{user?.role}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">First name</label>
                <input value={firstName} onChange={e => setFirstName(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Last name</label>
                <input value={lastName} onChange={e => setLastName(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email address</label>
              <input value={user?.email ?? ''} disabled className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-500 cursor-not-allowed" />
              <p className="text-xs text-slate-500 mt-1">Email cannot be changed. Contact support if needed.</p>
            </div>
            <button onClick={handleSaveProfile} disabled={profileLoading}
              className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all flex items-center gap-2">
              {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Save changes
            </button>
          </div>
        )}

        {/* ── Billing ── */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            {billingLoading ? (
              <div className={`${cardClass} flex items-center justify-center h-32`}>
                <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
              </div>
            ) : billing ? (
              <div className={cardClass}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="font-display font-700 text-white">Current Plan</h2>
                    <p className="text-sm text-slate-400 mt-0.5">Manage your subscription</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    isTrialing ? 'bg-amber-500/20 text-amber-400' :
                    isCancelled ? 'bg-red-500/20 text-red-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {isTrialing ? '14-day trial' : isCancelled ? 'Cancels soon' : 'Active'}
                  </span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl mb-4 border border-slate-700/50">
                  <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-600/30 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-brand-400" fill="currentColor" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-white capitalize">{billing.planName} Plan</div>
                    <div className="text-sm text-slate-400">
                      {isTrialing ? `Trial ends ${formatDate(billing.currentPeriodEnd)}`
                        : isCancelled ? `Access until ${formatDate(billing.currentPeriodEnd)}`
                        : `Renews ${formatDate(billing.currentPeriodEnd)}`}
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
                      Your trial ends on <strong>{formatDate(billing.currentPeriodEnd)}</strong>. No charge until then. Cancel anytime before that date.
                    </p>
                  </div>
                )}
                {!isCancelled && (
                  <button onClick={() => setShowCancelConfirm(true)} className="text-sm text-slate-500 hover:text-red-400 transition-colors">
                    Cancel subscription
                  </button>
                )}
              </div>
            ) : (
              <div className={cardClass}>
                <p className="text-sm text-slate-400">No active subscription. Choose a plan below.</p>
              </div>
            )}

            {/* Plan picker */}
            <div className={cardClass}>
              <h2 className="font-display font-700 text-white mb-1">{billing ? 'Change Plan' : 'Choose a Plan'}</h2>
              <p className="text-sm text-slate-400 mb-6">
                {billing ? 'Upgrade or downgrade anytime.' : 'Start your 14-day free trial today.'}
              </p>
              <div className="grid gap-4">
                {PLANS.map(plan => {
                  const isCurrent = billing?.planSlug === plan.slug;
                  const isLoading = upgradeLoading === plan.slug;
                  return (
                    <div key={plan.slug} className={`relative rounded-xl border-2 p-5 transition-all ${
                      isCurrent ? 'border-brand-500/50 bg-brand-600/10' : 'border-slate-700/50 hover:border-slate-600'
                    }`}>
                      {plan.popular && !isCurrent && (
                        <span className="absolute -top-2.5 left-4 bg-amber-400 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
                          Most popular
                        </span>
                      )}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-display font-700 text-white">{plan.name}</span>
                            {isCurrent && (
                              <span className="bg-brand-500/20 text-brand-400 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Check className="w-3 h-3" /> Current
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
                              {!billing ? 'Start trial' : 'Switch'}
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
              <div className={cardClass}>
                <h2 className="font-display font-700 text-white mb-4">Invoice History</h2>
                <div className="space-y-2">
                  {billing.invoices.map(inv => (
                    <div key={inv.id} className="flex items-center justify-between py-3 border-b border-slate-700/50 last:border-0">
                      <div>
                        <div className="text-sm font-medium text-white">{formatDate(inv.date)}</div>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                          inv.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>{inv.status}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-white text-sm">{formatAmount(inv.amount, inv.currency)}</span>
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

        {/* ── Notifications ── */}
        {activeTab === 'notifications' && (
          <div className={cardClass}>
            <h2 className="font-display font-700 text-white mb-6">Notification Preferences</h2>
            <div className="space-y-1">
              {[
                { label: 'Weekly AI report',    desc: 'Performance summary every Monday',          defaultOn: true },
                { label: 'Smart alerts',         desc: 'Anomalies detected in your store data',     defaultOn: true },
                { label: 'New integrations',     desc: 'Updates about new platform integrations',   defaultOn: false },
                { label: 'Billing reminders',    desc: 'Reminders before trial ends or renewal',    defaultOn: true },
                { label: 'Product updates',      desc: 'Changelog and new feature announcements',   defaultOn: false },
              ].map(item => <NotificationToggle key={item.label} {...item} />)}
            </div>
          </div>
        )}

        {/* ── Security ── */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className={cardClass}>
              <h2 className="font-display font-700 text-white mb-6">Change Password</h2>
              <div className="space-y-4 max-w-sm">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Current password</label>
                  <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} className={inputClass} placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">New password</label>
                  <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} className={inputClass} placeholder="Min. 8 characters" />
                </div>
                <button onClick={handleChangePassword} disabled={pwLoading || !currentPw || !newPw}
                  className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all flex items-center gap-2">
                  {pwLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Update password
                </button>
              </div>
            </div>
            <div className={`${cardClass} border-red-500/20`}>
              <h2 className="font-display font-700 text-red-400 mb-2">Danger Zone</h2>
              <p className="text-sm text-slate-400 mb-4">Permanently delete your account and all associated data.</p>
              <button className="text-sm font-semibold text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 px-4 py-2 rounded-lg transition-all">
                Delete account
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cancel modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <button onClick={() => setShowCancelConfirm(false)} className="text-slate-500 hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <h3 className="font-display font-700 text-white mb-2">Cancel subscription?</h3>
            <p className="text-sm text-slate-400 mb-6">You'll keep access until the end of your billing period. You can resubscribe anytime.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowCancelConfirm(false)}
                className="flex-1 border border-slate-700 text-slate-300 text-sm font-semibold py-2.5 rounded-lg hover:bg-slate-800 transition-all">
                Keep subscription
              </button>
              <button onClick={handleCancel} disabled={cancelLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                {cancelLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Cancel plan
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
      <button onClick={() => setOn(!on)}
        className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${on ? 'bg-brand-600' : 'bg-slate-700'}`}>
        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}
