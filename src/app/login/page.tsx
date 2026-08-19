'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { HeartHandshake, Sparkles, Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, switchDemoUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await login(email, password);
    if (res.success) {
      router.push('/dashboard');
    } else {
      setError(res.error || 'Login failed');
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'RESIDENT' | 'PROVIDER' | 'ADMIN') => {
    setLoading(true);
    await switchDemoUser(role);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff] font-body text-[#121c28]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#0f5238] text-white flex items-center justify-center mx-auto shadow-level-1">
              <HeartHandshake className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#121c28] font-display">Welcome Back</h1>
            <p className="text-xs text-slate-500">Log in to NeighborHelp to access requests, job applications & profile.</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#a8e7c5]/40 border border-emerald-300 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0f5238]">
              <Sparkles className="w-4 h-4 text-[#0f5238]" />
              1-Click Demo Account Quick Login:
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleDemoLogin('RESIDENT')}
                className="p-2 rounded-xl text-left bg-white border border-emerald-300 hover:border-[#0f5238] transition-all shadow-sm"
              >
                <div className="text-[11px] font-bold text-[#121c28]">Sarah</div>
                <div className="text-[9px] text-slate-500">Resident</div>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('PROVIDER')}
                className="p-2 rounded-xl text-left bg-white border border-emerald-300 hover:border-[#0f5238] transition-all shadow-sm"
              >
                <div className="text-[11px] font-bold text-[#121c28]">Alex</div>
                <div className="text-[9px] text-[#1d4ed8] font-bold">Verified Provider</div>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('ADMIN')}
                className="p-2 rounded-xl text-left bg-white border border-rose-300 hover:border-[#ba1a1a] transition-all shadow-sm"
              >
                <div className="text-[11px] font-bold text-[#ba1a1a]">Admin</div>
                <div className="text-[9px] text-slate-500">Moderator</div>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-[#ba1a1a] text-xs text-center font-semibold">
              {error}
            </div>
          )}

          <div className="bg-white rounded-3xl p-6 border border-[#dfe9fa] shadow-level-1 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-display">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sarah@example.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl text-xs bg-[#eef4ff] border border-[#dfe9fa] focus:outline-none focus:ring-2 focus:ring-[#0f5238] text-[#121c28]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-display">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl text-xs bg-[#eef4ff] border border-[#dfe9fa] focus:outline-none focus:ring-2 focus:ring-[#0f5238] text-[#121c28]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-xs font-bold bg-[#0f5238] hover:bg-[#2d6a4f] text-white shadow-level-1 transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Logging in...' : 'Log In'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link href="/register" className="font-bold text-[#0f5238] hover:underline">
              Sign Up
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
