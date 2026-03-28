'use client';

// app/dashboard/team/page.tsx
// Team accounts beheer — alleen beschikbaar op Scale plan

import { useState, useEffect } from 'react';
import {
  Users, UserPlus, Trash2, Shield, Mail,
  Loader2, CheckCircle, AlertCircle, Crown,
} from 'lucide-react';
import { api } from '@/lib/api';
import { usePermissions } from '@/lib/usePermissions';
import Link from 'next/link';

interface Member {
  id:          string;
  email:       string;
  firstName:   string;
  lastName:    string;
  role:        string;
  status:      string;
  joinedAt:    string;
  lastLoginAt: string | null;
}

interface PendingInvite {
  id:         string;
  email:      string;
  role:       string;
  created_at: string;
  expires_at: string;
}

const ROLE_LABELS: Record<string, string> = {
  owner:  'Owner',
  admin:  'Admin',
  member: 'Member',
  viewer: 'Viewer',
};

const ROLE_COLORS: Record<string, string> = {
  owner:  'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  admin:  'bg-brand-500/20 text-brand-400 border border-brand-500/30',
  member: 'bg-slate-700 text-slate-300 border border-slate-600',
  viewer: 'bg-slate-800 text-slate-400 border border-slate-700',
};

export default function TeamPage() {
  const { can, planSlug } = usePermissions();
  const [members,  setMembers]  = useState<Member[]>([]);
  const [invites,  setInvites]  = useState<PendingInvite[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [invEmail, setInvEmail] = useState('');
  const [invRole,  setInvRole]  = useState<'admin' | 'member' | 'viewer'>('member');
  const [sending,  setSending]  = useState(false);
  const [toast,    setToast]    = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/team/members');
      setMembers(res.data.members ?? []);
      setInvites(res.data.pendingInvites ?? []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleInvite = async () => {
    if (!invEmail) return;
    setSending(true);
    try {
      await api.post('/team/invite', { email: invEmail, role: invRole });
      setInvEmail('');
      showToast('success', `Invitation sent to ${invEmail}`);
      load();
    } catch (e: any) {
      showToast('error', e.response?.data?.error ?? 'Failed to send invite.');
    } finally {
      setSending(false);
    }
  };

  const handleRemove = async (id: string, name: string) => {
    if (!confirm(`Remove ${name} from the team?`)) return;
    try {
      await api.delete(`/team/members/${id}`);
      showToast('success', `${name} has been removed.`);
      load();
    } catch {
      showToast('error', 'Failed to remove member.');
    }
  };

  const handleRevokeInvite = async (id: string) => {
    try {
      await api.delete(`/team/invites/${id}`);
      showToast('success', 'Invitation revoked.');
      load();
    } catch {
      showToast('error', 'Failed to revoke invite.');
    }
  };

  // Feature gate — toon upgrade prompt voor niet-Scale plannen
  if (!can('team-accounts')) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7 text-amber-400" />
          </div>
          <h2 className="font-display text-xl font-700 text-white mb-2">Team Accounts</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
            Invite your team and collaborate together. Available on the Scale plan.
          </p>
          <Link
            href="/settings?tab=billing"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
          >
            <Crown className="w-4 h-4" />
            Upgrade to Scale
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-lg ${
          toast.type === 'success' ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300' : 'bg-rose-500/20 border border-rose-500/30 text-rose-300'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-800 text-white mb-1">Team</h1>
        <p className="text-slate-400 text-sm">Manage who has access to your MarketGrow workspace.</p>
      </div>

      {/* Invite form */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-brand-400" />
          Invite someone
        </h2>
        <div className="flex gap-3 flex-wrap">
          <input
            type="email"
            value={invEmail}
            onChange={e => setInvEmail(e.target.value)}
            placeholder="colleague@company.com"
            className="flex-1 min-w-48 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <select
            value={invRole}
            onChange={e => setInvRole(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="admin">Admin</option>
            <option value="member">Member</option>
            <option value="viewer">Viewer</option>
          </select>
          <button
            onClick={handleInvite}
            disabled={sending || !invEmail}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            Send invite
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          <strong className="text-slate-400">Admin</strong> — full access except billing.{' '}
          <strong className="text-slate-400">Member</strong> — view and edit data.{' '}
          <strong className="text-slate-400">Viewer</strong> — read-only.
        </p>
      </div>

      {/* Members list */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-slate-700/50">
          <h2 className="text-sm font-semibold text-white">{members.length} member{members.length !== 1 ? 's' : ''}</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-5 h-5 animate-spin text-slate-500 mx-auto" />
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {members.map(m => (
              <div key={m.id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-9 h-9 rounded-full bg-brand-600/20 border border-brand-600/30 flex items-center justify-center text-sm font-bold text-brand-400 flex-shrink-0">
                  {m.firstName?.[0]?.toUpperCase()}{m.lastName?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {m.firstName} {m.lastName}
                  </div>
                  <div className="text-xs text-slate-500 truncate">{m.email}</div>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[m.role] ?? ROLE_COLORS.member}`}>
                  {ROLE_LABELS[m.role] ?? m.role}
                </span>
                {m.role !== 'owner' && (
                  <button
                    onClick={() => handleRemove(m.id, `${m.firstName} ${m.lastName}`)}
                    className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-rose-600/20 flex items-center justify-center text-slate-400 hover:text-rose-400 transition-colors"
                    title="Remove member"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending invites */}
      {invites.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700/50">
            <h2 className="text-sm font-semibold text-white">{invites.length} pending invite{invites.length !== 1 ? 's' : ''}</h2>
          </div>
          <div className="divide-y divide-slate-700/50">
            {invites.map(inv => (
              <div key={inv.id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-9 h-9 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{inv.email}</div>
                  <div className="text-xs text-slate-500">
                    Invited · expires {new Date(inv.expires_at).toLocaleDateString()}
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[inv.role] ?? ROLE_COLORS.member}`}>
                  {ROLE_LABELS[inv.role] ?? inv.role}
                </span>
                <button
                  onClick={() => handleRevokeInvite(inv.id)}
                  className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-rose-600/20 flex items-center justify-center text-slate-400 hover:text-rose-400 transition-colors"
                  title="Revoke invite"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
