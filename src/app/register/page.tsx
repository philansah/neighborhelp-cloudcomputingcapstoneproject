'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { HeartHandshake, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [role, setRole] = useState<'RESIDENT' | 'PROVIDER'>('RESIDENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [locationNeighborhood, setLocationNeighborhood] = useState('Maplewood Park');
  const [skills, setSkills] = useState('');
  const [bio, setBio] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await register({
      role,
      name,
      email,
      password,
      phone,
      locationNeighborhood,
      skills,
      bio,
    });

    if (res.success) {
      router.push('/dashboard');
    } else {
      setError(res.error || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff] font-body text-[#121c28]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#0f5238] text-white flex items-center justify-center mx-auto shadow-level-1">
              <HeartHandshake className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#121c28] font-display">Create Your Account</h1>
            <p className="text-xs text-slate-500">Join your local neighborhood skill & service exchange platform.</p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-[#ba1a1a] text-xs text-center font-semibold">
              {error}
            </div>
          )}

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#dfe9fa] shadow-level-1 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 font-display">
                  Select Role
                </label>
                <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-[#eef4ff]">
                  <button
                    type="button"
                    onClick={() => setRole('RESIDENT')}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                      role === 'RESIDENT'
                        ? 'bg-[#0f5238] text-white shadow-level-1'
                        : 'text-slate-600'
                    }`}
                  >
                    Resident (Need Help)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('PROVIDER')}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                      role === 'PROVIDER'
                        ? 'bg-[#0f5238] text-white shadow-level-1'
                        : 'text-slate-600'
                    }`}
                  >
                    Service Provider
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-display">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#eef4ff] border border-[#dfe9fa] focus:outline-none focus:ring-2 focus:ring-[#0f5238] text-[#121c28]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-display">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#eef4ff] border border-[#dfe9fa] focus:outline-none focus:ring-2 focus:ring-[#0f5238] text-[#121c28]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-display">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#eef4ff] border border-[#dfe9fa] focus:outline-none focus:ring-2 focus:ring-[#0f5238] text-[#121c28]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-display">
                    Neighborhood Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={locationNeighborhood}
                    onChange={(e) => setLocationNeighborhood(e.target.value)}
                    placeholder="Maplewood Park"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#eef4ff] border border-[#dfe9fa] focus:outline-none focus:ring-2 focus:ring-[#0f5238] text-[#121c28]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-display">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#eef4ff] border border-[#dfe9fa] focus:outline-none focus:ring-2 focus:ring-[#0f5238] text-[#121c28]"
                  />
                </div>
              </div>

              {role === 'PROVIDER' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-display">
                    Skills (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g. Plumbing,Electrical,General Handyman"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#eef4ff] border border-[#dfe9fa] focus:outline-none focus:ring-2 focus:ring-[#0f5238] text-[#121c28]"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-xs font-bold bg-[#0f5238] hover:bg-[#2d6a4f] text-white shadow-level-1 transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loading ? 'Creating Account...' : 'Complete Sign Up'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-[#0f5238] hover:underline">
              Log In
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
