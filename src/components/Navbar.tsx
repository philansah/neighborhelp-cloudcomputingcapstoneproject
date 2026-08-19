'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  HeartHandshake,
  LayoutDashboard,
  User as UserIcon,
  LogOut,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Search,
  Menu,
  X,
  Bell,
  PlusCircle,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { user, logout, switchDemoUser } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#dfe9fa] bg-white/95 backdrop-blur-md transition-colors font-sans">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#0f5238] flex items-center justify-center text-white shadow-level-1 group-hover:scale-105 transition-transform">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-[#121c28] font-display">
                Neighbor<span className="text-[#0f5238]">Help</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-semibold text-slate-700">
              <Link
                href="/"
                className={`transition-colors ${
                  pathname === '/' ? 'text-[#0f5238] font-bold' : 'hover:text-[#121c28]'
                }`}
              >
                Home
              </Link>
              <Link
                href="/#explore"
                className="hover:text-[#121c28] transition-colors"
              >
                Explore
              </Link>
              <Link
                href="/#community"
                className="hover:text-[#121c28] transition-colors"
              >
                Community
              </Link>
              {user && (
                <Link
                  href="/dashboard"
                  className={`transition-colors ${
                    pathname === '/dashboard' ? 'text-[#0f5238] font-bold' : 'hover:text-[#121c28]'
                  }`}
                >
                  My Dashboard
                </Link>
              )}
              {user?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="text-[#ba1a1a] font-bold hover:underline"
                >
                  Admin Panel
                </Link>
              )}
            </nav>
          </div>

          {/* Center Search Bar - Hidden on Mobile */}
          <div className="hidden lg:flex items-center flex-1 max-w-xs relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
            <input
              type="text"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#eef4ff] text-xs text-[#121c28] focus:outline-none focus:ring-2 focus:ring-[#0f5238]"
            />
          </div>

          {/* Right Actions Desktop */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Quick Demo Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-[#a8e7c5]/40 text-[#0f5238] border border-[#2d6a4f]/30 hover:bg-[#a8e7c5]/60 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#0f5238]" />
                <span>Switch Role</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showDemoMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-level-2 border border-[#dfe9fa] p-2 z-50 animate-in fade-in">
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Demo Accounts
                  </div>
                  <button
                    onClick={() => {
                      switchDemoUser('RESIDENT');
                      setShowDemoMenu(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left hover:bg-[#eef4ff]"
                  >
                    <div>
                      <div className="font-bold text-[#121c28]">Sarah Jenkins</div>
                      <div className="text-slate-500">Resident (Needs Help)</div>
                    </div>
                    {user?.email === 'sarah@example.com' && <CheckCircle2 className="w-4 h-4 text-[#0f5238]" />}
                  </button>

                  <button
                    onClick={() => {
                      switchDemoUser('PROVIDER');
                      setShowDemoMenu(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left hover:bg-[#eef4ff]"
                  >
                    <div>
                      <div className="font-bold text-[#121c28]">Alex Rivera</div>
                      <div className="text-[#1d4ed8] font-bold">Verified Provider</div>
                    </div>
                    {user?.email === 'alex@example.com' && <CheckCircle2 className="w-4 h-4 text-[#0f5238]" />}
                  </button>

                  <button
                    onClick={() => {
                      switchDemoUser('ADMIN');
                      setShowDemoMenu(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left hover:bg-[#eef4ff]"
                  >
                    <div>
                      <div className="font-bold text-[#ba1a1a]">Platform Admin</div>
                      <div className="text-slate-500">Moderator</div>
                    </div>
                    {user?.email === 'admin@neighborhelp.org' && <CheckCircle2 className="w-4 h-4 text-[#0f5238]" />}
                  </button>
                </div>
              )}
            </div>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-[#eef4ff] transition-colors"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-[#0f5238]/30"
                  />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-level-2 border border-[#dfe9fa] p-1.5 z-50">
                    <div className="px-3 py-2 border-b border-[#dfe9fa] mb-1">
                      <div className="text-xs font-bold text-[#121c28] flex items-center gap-1 font-display">
                        {user.name}
                        {user.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-[#1d4ed8]" />}
                      </div>
                      <div className="text-[11px] text-slate-500 capitalize">{user.role.toLowerCase()}</div>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-[#eef4ff]"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      View Profile
                    </Link>

                    <Link
                      href="/dashboard"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-[#eef4ff]"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-400" />
                      My Dashboard
                    </Link>

                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#ba1a1a] hover:bg-rose-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 rounded-lg text-xs font-bold bg-[#0f5238] hover:bg-[#2d6a4f] text-white shadow-level-1 h-12 flex items-center min-h-[48px]"
                >
                  Sign Up
                </Link>
              </div>
            )}

          </div>

          {/* Mobile Hamburger Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            {user && (
              <Link href="/posts/create" className="p-2 text-[#0f5238] hover:bg-[#eef4ff] rounded-full">
                <PlusCircle className="w-6 h-6" />
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-[#eef4ff] text-[#121c28] hover:bg-[#dfe9fa] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#dfe9fa] bg-white px-4 pt-4 pb-6 space-y-4 shadow-level-2 animate-in slide-in-from-top duration-200">
          
          <nav className="flex flex-col space-y-2 text-sm font-bold text-slate-700">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl hover:bg-[#eef4ff] transition-colors"
            >
              Home Feed
            </Link>
            <Link
              href="/#explore"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl hover:bg-[#eef4ff] transition-colors"
            >
              Explore Services
            </Link>
            {user && (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl hover:bg-[#eef4ff] transition-colors flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#0f5238]" />
                  My Dashboard
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl hover:bg-[#eef4ff] transition-colors flex items-center gap-2"
                >
                  <UserIcon className="w-4 h-4 text-[#0f5238]" />
                  My Profile & Verification
                </Link>
              </>
            )}
            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl bg-rose-50 text-[#ba1a1a] font-bold"
              >
                Admin Control Panel
              </Link>
            )}
          </nav>

          {/* Role Switcher in Mobile Drawer */}
          <div className="pt-2 border-t border-[#dfe9fa] space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
              Switch Demo Role:
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  switchDemoUser('RESIDENT');
                  setMobileMenuOpen(false);
                }}
                className="p-2 rounded-xl text-center bg-[#eef4ff] text-[11px] font-bold text-[#121c28]"
              >
                Resident
              </button>
              <button
                onClick={() => {
                  switchDemoUser('PROVIDER');
                  setMobileMenuOpen(false);
                }}
                className="p-2 rounded-xl text-center bg-[#eef4ff] text-[11px] font-bold text-[#1d4ed8]"
              >
                Provider
              </button>
              <button
                onClick={() => {
                  switchDemoUser('ADMIN');
                  setMobileMenuOpen(false);
                }}
                className="p-2 rounded-xl text-center bg-rose-50 text-[11px] font-bold text-[#ba1a1a]"
              >
                Admin
              </button>
            </div>
          </div>

          {user ? (
            <div className="pt-2 border-t border-[#dfe9fa]">
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-3 rounded-xl text-xs font-bold text-[#ba1a1a] bg-rose-50 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Log Out ({user.name})
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 text-center rounded-xl text-xs font-bold bg-[#eef4ff] text-[#121c28]"
              >
                Log In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 text-center rounded-xl text-xs font-bold bg-[#0f5238] text-white shadow-level-1"
              >
                Sign Up
              </Link>
            </div>
          )}

        </div>
      )}
    </header>
  );
}
