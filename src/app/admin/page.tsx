'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldAlert,
  Users,
  FileText,
  CheckCircle2,
  Terminal,
  Activity,
  Trash2,
  Check,
  X,
  RefreshCw,
  Eye,
  Lock,
} from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'verifications' | 'users' | 'moderation' | 'cloudwatch'>('verifications');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      const [sRes, uRes, vRes, pRes, lRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/verifications'),
        fetch('/api/posts'),
        fetch('/api/admin/logs'),
      ]);

      if (sRes.ok) {
        const sData = await sRes.json();
        setStats(sData.stats);
      }

      if (uRes.ok) {
        const uData = await uRes.json();
        setUsers(uData.users || []);
      }

      if (vRes.ok) {
        const vData = await vRes.json();
        setVerifications(vData.requests || []);
      }

      if (pRes.ok) {
        const pData = await pRes.json();
        setPosts(pData.posts || []);
      }

      if (lRes.ok) {
        const lData = await lRes.json();
        setLogs(lData.logs || []);
        setMetrics(lData.metrics || {});
      }
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerificationDecision = async (userId: string, action: 'APPROVE' | 'REJECT') => {
    try {
      const res = await fetch(`/api/admin/verifications/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed decision:', err);
    }
  };

  const deletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8f9ff]">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <ShieldAlert className="w-12 h-12 text-[#ba1a1a] mb-2" />
          <h2 className="text-xl font-bold text-[#121c28] font-display">Creator / Super Admin Authorization Required</h2>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            You must be logged in as the Master Application Creator (Admin) to review verification proofs and moderate content.
          </p>
          <Link href="/login" className="px-5 py-2.5 bg-[#ba1a1a] text-white rounded-xl text-xs font-bold">
            Switch to Creator / Admin Account
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const pendingVerifications = verifications.filter((v) => v.verificationStatus === 'PENDING');

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff] font-body text-[#121c28]">
      <Navbar />

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Creator Admin Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-[#0f5238]" />
              <h1 className="text-2xl font-extrabold text-[#121c28] font-display">Application Creator Security Console</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Master control panel for Creator {user.name} to verify neighbors & oversee platform safety.
            </p>
          </div>

          <button
            onClick={fetchAdminData}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#eef4ff] text-[#0f5238] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Queue
          </button>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-[#dfe9fa] shadow-level-1 space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between font-display">
              Pending Verifications
              <Lock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-3xl font-extrabold text-[#121c28] font-display">{pendingVerifications.length}</div>
            <div className="text-[11px] text-slate-500">Awaiting Creator review</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#dfe9fa] shadow-level-1 space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between font-display">
              Total Users
              <Users className="w-4 h-4 text-[#0f5238]" />
            </div>
            <div className="text-3xl font-extrabold text-[#121c28] font-display">{stats?.totalUsers || 0}</div>
            <div className="text-[11px] text-slate-500">{stats?.providerCount || 0} Providers registered</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#dfe9fa] shadow-level-1 space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between font-display">
              Help Requests
              <FileText className="w-4 h-4 text-[#1d4ed8]" />
            </div>
            <div className="text-3xl font-extrabold text-[#121c28] font-display">{stats?.totalPosts || 0}</div>
            <div className="text-[11px] text-slate-500">Catalog active</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#a8e7c5]/40 border border-emerald-300 text-[#0f5238] shadow-level-1 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider flex items-center justify-between font-display">
              AWS CloudWatch
              <CheckCircle2 className="w-4 h-4 text-[#0f5238]" />
            </div>
            <div className="text-xl font-extrabold text-[#0f5238] font-display">Security Log Active</div>
            <div className="text-[11px] opacity-80">/neighborhelp/app-logs</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[#dfe9fa] pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('verifications')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'verifications' ? 'bg-[#0f5238] text-white shadow-level-1' : 'text-slate-600 hover:text-[#121c28]'
            }`}
          >
            Verification Approval Queue ({pendingVerifications.length})
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'users' ? 'bg-[#0f5238] text-white shadow-level-1' : 'text-slate-600 hover:text-[#121c28]'
            }`}
          >
            All Neighborhood Users ({users.length})
          </button>

          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'moderation' ? 'bg-[#0f5238] text-white shadow-level-1' : 'text-slate-600 hover:text-[#121c28]'
            }`}
          >
            Content Moderation ({posts.length})
          </button>

          <button
            onClick={() => setActiveTab('cloudwatch')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'cloudwatch' ? 'bg-[#0f5238] text-white shadow-level-1' : 'text-slate-600 hover:text-[#121c28]'
            }`}
          >
            CloudWatch Security Logs
          </button>
        </div>

        {/* TAB 1: Verification Queue */}
        {activeTab === 'verifications' && (
          <div className="space-y-4">
            {verifications.length === 0 ? (
              <div className="py-12 text-center bg-white rounded-3xl border border-[#dfe9fa] p-8 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#0f5238] mx-auto" />
                <h3 className="text-base font-bold font-display text-[#121c28]">No Verification Proofs Submitted</h3>
                <p className="text-xs text-slate-500">Neighbors will submit ID proof photos via their profile verification section.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {verifications.map((req) => (
                  <div key={req.id} className="p-6 rounded-3xl bg-white border border-[#dfe9fa] shadow-level-1 space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={req.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={req.name}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-[#0f5238]/20"
                        />
                        <div>
                          <div className="text-sm font-bold text-[#121c28] font-display flex items-center gap-1.5">
                            {req.name}
                            {req.isVerified && <CheckCircle2 className="w-4 h-4 text-[#1d4ed8]" />}
                          </div>
                          <div className="text-xs text-slate-500">
                            Role: <span className="font-semibold uppercase">{req.role}</span> • Neighborhood: {req.locationNeighborhood}
                          </div>
                        </div>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        req.verificationStatus === 'APPROVED'
                          ? 'bg-[#a8e7c5]/50 text-[#0f5238]'
                          : req.verificationStatus === 'PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-[#ba1a1a]'
                      }`}>
                        Status: {req.verificationStatus}
                      </span>
                    </div>

                    {/* Submitted Proof Section */}
                    {req.verificationProofUrl ? (
                      <div className="p-4 rounded-2xl bg-[#eef4ff] border border-[#dfe9fa] flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Eye className="w-5 h-5 text-[#0f5238]" />
                          <div>
                            <div className="text-xs font-bold text-[#121c28]">Identity / License Proof Document</div>
                            <div className="text-[11px] text-slate-500">Submitted for Super Admin inspection</div>
                          </div>
                        </div>

                        <button
                          onClick={() => setPreviewImage(req.verificationProofUrl)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#0f5238] text-white hover:bg-[#2d6a4f] transition-colors"
                        >
                          View Document Image
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 text-xs text-slate-400 bg-slate-50 rounded-xl">No document uploaded yet.</div>
                    )}

                    {/* Action Buttons for Creator */}
                    {req.verificationStatus === 'PENDING' && (
                      <div className="flex items-center gap-3 pt-2">
                        <button
                          onClick={() => handleVerificationDecision(req.id, 'APPROVE')}
                          className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#0f5238] hover:bg-[#2d6a4f] text-white flex items-center justify-center gap-1.5 shadow-level-1"
                        >
                          <Check className="w-4 h-4" />
                          Approve Verification & Issue Badge
                        </button>
                        <button
                          onClick={() => handleVerificationDecision(req.id, 'REJECT')}
                          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-50 text-[#ba1a1a] hover:bg-rose-100"
                        >
                          Reject Application
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: User List */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl border border-[#dfe9fa] overflow-hidden shadow-level-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#eef4ff] text-slate-600 font-bold uppercase tracking-wider border-b border-[#dfe9fa] font-display">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Neighborhood</th>
                    <th className="px-6 py-4">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dfe9fa]">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#eef4ff]/50">
                      <td className="px-6 py-4 font-bold text-[#121c28]">{u.name} ({u.email})</td>
                      <td className="px-6 py-4 uppercase font-semibold">{u.role}</td>
                      <td className="px-6 py-4 text-slate-600">{u.locationNeighborhood || 'N/A'}</td>
                      <td className="px-6 py-4">
                        {u.isVerified ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#1d4ed8] text-white">✓ Verified</span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">Unverified</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Moderation Queue */}
        {activeTab === 'moderation' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posts.map((p) => (
              <div key={p.id} className="p-5 rounded-2xl bg-white border border-[#dfe9fa] shadow-level-1 space-y-3">
                <h4 className="text-sm font-bold text-[#121c28] font-display line-clamp-1">{p.title}</h4>
                <p className="text-xs text-slate-600 line-clamp-2">{p.description}</p>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => deletePost(p.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-[#ba1a1a] hover:bg-rose-100 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Post
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: CloudWatch Terminal */}
        {activeTab === 'cloudwatch' && (
          <div className="rounded-3xl bg-[#121c28] border border-slate-800 p-6 font-mono text-xs text-slate-200 space-y-3 shadow-level-2">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3 text-slate-400">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#95d4b3]" />
                <span>AWS CloudWatch Security Logs /neighborhelp/app-logs</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-[#95d4b3]">● Live Audit</span>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
              {logs.map((log, idx) => (
                <div key={idx} className="p-2 rounded bg-slate-900 border border-slate-800 font-mono text-[11px]">
                  <span className="text-slate-500">[{log.timestamp}]</span>{' '}
                  <span className={`font-bold ${log.level === 'ERROR' ? 'text-rose-400' : 'text-[#95d4b3]'}`}>
                    [{log.level}]
                  </span>{' '}
                  <span className="text-amber-300">{log.action}</span> -{' '}
                  <span className="text-slate-400">{JSON.stringify(log.details)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Proof Document Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 border border-[#dfe9fa] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#dfe9fa] pb-3">
              <h3 className="text-base font-bold text-[#121c28] font-display">Verification Document Preview</h3>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-80 w-full rounded-2xl overflow-hidden bg-[#eef4ff] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewImage} alt="Proof" className="w-full h-full object-contain" />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setPreviewImage(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0f5238] text-white"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
