'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User, CreditCard, Bell, Shield, LogOut, Zap,
  Check, ChevronRight, Loader2, AlertTriangle,
  TrendingUp, ShoppingCart, BarChart3, Settings,
  ArrowUpRight, Download, X, CheckCircle
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

// ── Types ─────────────────────────────────────────────────────
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
  { id: 'profile',   label: 'Profile',      icon: User },
  { id: 'billing',   label: 'Billing',      icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security',  label: 'Security',     icon: Shield },
];

// ── Main Page ─────────────────────────────────────────────────
export default function SettingsPage() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState('billing');
  const [billing, setBilling] = useState<BillingOverview | null>(null);
  const [billingLoading, setBillingLoading] = useState(true);
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Profile state
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName]   = useState(user?.lastName ?? '');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw]         = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    fetchBilling();
  }, []);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchBilling = async () => {
    setBillingLoading(true);
    try {
      const res = await api.get('/billing/overview');
      setBilling(res.data);
    } catch {
      // No subscription yet — show plan picker
    } finally {
      setBillingLoading(false);
    }
  };

  const handleUpgrade = async (planSlug: string) => {
    setUpgradeLoading(planSlug);
    try {
      if (!billing) {
        // No subscription yet — go to Stripe checkout
        const res = await api.post('/billing/checkout', { planSlug });
        window.location.href = res.data.url;
      } else {
        // Has subscription — change plan directly
        await api.post('/billing/change-plan', { planSlug });
        await fetchBilling();
        showToast('success', `Plan changed to ${planSlug.charAt(0).toUpperCase() + planSlug.slice(1)}!`);
      }
    } catch (e: any) {
      showToast('error', e.response?.data?.message ?? 'Something went wrong.');
    } finally {
      setUpgradeLoading(null);
    }
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
    } finally {
      setCancelLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setProfileLoading(true);
    try {
      await api.patch('/auth/profile', { firstName, lastName });
      showToast('success', 'Profile updated!');
    } catch (e: any) {
      showToast('error', e.response?.data?.message ?? 'Something went wrong.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setPwLoading(true);
    try {
      await api.post('/auth/change-password', { currentPassword: currentPw, newPassword: newPw });
      setCurrentPw('');
      setNewPw('');
      showToast('success', 'Password updated!');
    } catch (e: any) {
      showToast('error', e.response?.data?.message ?? 'Something went wrong.');
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    clearAuth();
    router.push('/login');
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const formatAmount = (amount: number, currency: string) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(amount);

  const isTrialing = billing?.status === 'trialing';
  const isCancelled = billing?.cancelAtPeriodEnd;

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-slate-100 flex flex-col p-4 fixed h-full z-10">
        <div
          className="flex items-center gap-2 font-display font-700 text-base text-slate-900 mb-8 px-2 cursor-pointer"
          onClick={() => router.push('/dashboard')}
        >
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" fill="white" />
          </div>
          MarketGrowth
        </div>

        <nav className="flex-1 space-y-1">
          {[
            { label: 'Dashboard',   icon: BarChart3,    href: '/dashboard' },
            { label: 'Sales',       icon: TrendingUp,   href: '/dashboard' },
            { label: 'Orders',      icon: ShoppingCart, href: '/dashboard' },
            { label: 'AI Insights', icon: Zap,          href: '/dashboard' },
            { label: 'Settings',    icon: Settings,     href: '/settings', active: true },
          ].map(item => (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                item.active
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-slate-100 pt-4">
          <div className="px-2 mb-3">
            <div className="text-xs font-medium text-slate-900">{user?.firstName} {user?.lastName}</div>
            <div className="text-xs text-slate-400 capitalize">{user?.planSlug ?? 'starter'} plan</div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-56 p-8">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-2xl font-800 text-slate-900 mb-1">Account Settings</h1>
            <p className="text-slate-500 text-sm">Manage your profile, billing, and preferences.</p>
          </div>

          {/* Tab nav */}
          <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-8 w-fit">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>

          {/* ── Profile Tab ─────────────────────────────────── */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-display font-700 text-slate-900 mb-6">Personal Information</h2>

                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                  <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center text-white font-display font-700 text-xl">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{user?.firstName} {user?.lastName}</div>
                    <div className="text-sm text-slate-400">{user?.email}</div>
                    <div className="text-xs text-slate-400 capitalize mt-0.5">{user?.role}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">First name</label>
                    <input
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Last name</label>
                    <input
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Email address</label>
                  <input
                    value={user?.email ?? ''}
                    disabled
                    className="w-full border border-slate-100 rounded-lg px-3 py-2.5 text-sm bg-slate-50 text-slate-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-400 mt-1">Email cannot be changed. Contact support if needed.</p>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={profileLoading}
                  className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all flex items-center gap-2"
                >
                  {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Save changes
                </button>
              </div>
            </div>
          )}

          {/* ── Billing Tab ─────────────────────────────────── */}
          {activeTab === 'billing' && (
            <div className="space-y-6">

              {/* Current plan status */}
              {billingLoading ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-center h-32">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                </div>
              ) : billing ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="font-display font-700 text-slate-900">Current Plan</h2>
                      <p className="text-sm text-slate-500 mt-0.5">Manage your subscription</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      isTrialing ? 'bg-amber-100 text-amber-700' :
                      isCancelled ? 'bg-red-100 text-red-600' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {isTrialing ? '14-day trial' : isCancelled ? 'Cancels soon' : 'Active'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl mb-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" fill="white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 capitalize">{billing.planName} Plan</div>
                      <div className="text-sm text-slate-500">
                        {isTrialing
                          ? `Trial ends ${formatDate(billing.currentPeriodEnd)}`
                          : isCancelled
                          ? `Access until ${formatDate(billing.currentPeriodEnd)}`
                          : `Renews ${formatDate(billing.currentPeriodEnd)}`
                        }
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display font-700 text-slate-900">
                        €{PLANS.find(p => p.slug === billing.planSlug)?.price ?? '—'}<span className="text-slate-400 font-normal text-sm">/mo</span>
                      </div>
                    </div>
                  </div>

                  {isTrialing && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-700">
                        Your trial ends on <strong>{formatDate(billing.currentPeriodEnd)}</strong>. You won't be charged until then. Cancel anytime before that date.
                      </p>
                    </div>
                  )}

                  {!isCancelled && (
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      className="text-sm text-slate-400 hover:text-red-600 transition-colors"
                    >
                      Cancel subscription
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <p className="text-sm text-slate-500">No active subscription found. Choose a plan below to get started.</p>
                </div>
              )}

              {/* Plan picker */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-display font-700 text-slate-900 mb-1">
                  {billing ? 'Change Plan' : 'Choose a Plan'}
                </h2>
                <p className="text-sm text-slate-500 mb-6">
                  {billing ? 'Upgrade or downgrade anytime. Changes take effect immediately.' : 'Start your 14-day free trial today.'}
                </p>

                <div className="grid gap-4">
                  {PLANS.map(plan => {
                    const isCurrent = billing?.planSlug === plan.slug;
                    const isLoading = upgradeLoading === plan.slug;

                    return (
                      <div
                        key={plan.slug}
                        className={`relative rounded-xl border-2 p-5 transition-all ${
                          isCurrent
                            ? 'border-brand-600 bg-brand-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {plan.popular && !isCurrent && (
                          <span className="absolute -top-2.5 left-4 bg-amber-400 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
                            Most popular
                          </span>
                        )}

                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-display font-700 text-slate-900">{plan.name}</span>
                              {isCurrent && (
                                <span className="bg-brand-100 text-brand-700 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Current plan
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2">
                              {plan.features.map(f => (
                                <span key={f} className="text-xs text-slate-500 flex items-center gap-1">
                                  <Check className="w-3 h-3 text-emerald-500" /> {f}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <div className="font-display font-700 text-slate-900 text-lg">
                              €{plan.price}<span className="text-slate-400 font-normal text-sm">/mo</span>
                            </div>
                            {!isCurrent && (
                              <button
                                onClick={() => handleUpgrade(plan.slug)}
                                disabled={!!upgradeLoading}
                                className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 disabled:opacity-50 transition-colors"
                              >
                                {isLoading ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                )}
                                {!billing ? 'Start trial' : billing.planSlug === 'scale' || (plan.slug === 'starter' && billing.planSlug !== 'starter') ? 'Downgrade' : 'Upgrade'}
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
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h2 className="font-display font-700 text-slate-900 mb-4">Invoice History</h2>
                  <div className="space-y-2">
                    {billing.invoices.map(inv => (
                      <div key={inv.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                        <div>
                          <div className="text-sm font-medium text-slate-900">{formatDate(inv.date)}</div>
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                            inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {inv.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-slate-900 text-sm">{formatAmount(inv.amount, inv.currency)}</span>
                          {inv.downloadUrl && (
                            <a
                              href={inv.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-400 hover:text-brand-600 transition-colors"
                            >
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

          {/* ── Notifications Tab ───────────────────────────── */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-display font-700 text-slate-900 mb-6">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { label: 'Weekly AI report',        desc: 'Receive your weekly performance summary every Monday',  defaultOn: true },
                  { label: 'Smart alerts',            desc: 'Get notified when anomalies are detected in your data', defaultOn: true },
                  { label: 'New integrations',        desc: 'Be the first to know about new platform integrations',  defaultOn: false },
                  { label: 'Billing reminders',       desc: 'Reminders before your trial ends or renewal date',      defaultOn: true },
                  { label: 'Product updates',         desc: 'Changelog and new feature announcements',               defaultOn: false },
                ].map(item => (
                  <NotificationToggle key={item.label} {...item} />
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs text-slate-400">Notification preferences are saved automatically.</p>
              </div>
            </div>
          )}

          {/* ── Security Tab ────────────────────────────────── */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-display font-700 text-slate-900 mb-6">Change Password</h2>
                <div className="space-y-4 max-w-sm">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Current password</label>
                    <input
                      type="password"
                      value={currentPw}
                      onChange={e => setCurrentPw(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">New password</label>
                    <input
                      type="password"
                      value={newPw}
                      onChange={e => setNewPw(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      placeholder="Min. 8 characters"
                    />
                  </div>
                  <button
                    onClick={handleChangePassword}
                    disabled={pwLoading || !currentPw || !newPw}
                    className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all flex items-center gap-2"
                  >
                    {pwLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Update password
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-display font-700 text-slate-900 mb-2">Active Sessions</h2>
                <p className="text-sm text-slate-500 mb-4">You're currently signed in on this device.</p>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <div className="text-sm font-medium text-slate-900">Current session</div>
                    <div className="text-xs text-slate-400">Browser — just now</div>
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">Active</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-red-100 p-6">
                <h2 className="font-display font-700 text-red-600 mb-2">Danger Zone</h2>
                <p className="text-sm text-slate-500 mb-4">Permanently delete your account and all associated data.</p>
                <button className="text-sm font-semibold text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 px-4 py-2 rounded-lg transition-all">
                  Delete account
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Cancel confirmation modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <button onClick={() => setShowCancelConfirm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <h3 className="font-display font-700 text-slate-900 mb-2">Cancel subscription?</h3>
            <p className="text-sm text-slate-500 mb-6">
              You'll keep access until the end of your current billing period. You can resubscribe anytime.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 border border-slate-200 text-slate-700 text-sm font-semibold py-2.5 rounded-lg hover:bg-slate-50 transition-all"
              >
                Keep subscription
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {cancelLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Cancel plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium z-50 transition-all ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ── Notification Toggle ───────────────────────────────────────
function NotificationToggle({ label, desc, defaultOn }: { label: string; desc: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
      <div>
        <div className="text-sm font-medium text-slate-900">{label}</div>
        <div className="text-xs text-slate-400 mt-0.5">{desc}</div>
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${on ? 'bg-brand-600' : 'bg-slate-200'}`}
      >
        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}
