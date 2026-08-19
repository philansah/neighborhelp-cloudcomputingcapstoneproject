'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ReviewModal } from '@/components/ReviewModal';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Star,
  MapPin,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'applications' | 'completed'>('requests');

  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const fetchDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [bRes, pRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch(`/api/posts?authorId=${user.id}`),
      ]);

      if (bRes.ok) {
        const bData = await bRes.json();
        setBookings(bData.bookings || []);
      }

      if (pRes.ok) {
        const pData = await pRes.json();
        setMyPosts(pData.posts || []);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8f9ff]">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-xl font-bold text-[#121c28]">Please Log In</h2>
          <p className="text-xs text-slate-500 mt-1 mb-4">You need an active session to access your dashboard.</p>
          <Link href="/login" className="px-5 py-2.5 bg-[#0f5238] text-white rounded-xl text-xs font-bold">
            Log In Now
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const pendingBookings = bookings.filter((b) => b.status === 'PENDING');
  const acceptedBookings = bookings.filter((b) => b.status === 'ACCEPTED');
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');

  const handleMarkComplete = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });
      if (res.ok) {
        setReviewBookingId(bookingId);
        setShowReviewModal(true);
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Failed to complete booking:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff] font-body text-[#121c28]">
      <Navbar />

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Banner Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-[#0f5238] text-white shadow-level-2">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover ring-4 ring-white/20"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold font-display">{user.name}</h1>
                {user.isVerified && <CheckCircle2 className="w-5 h-5 text-[#a8e7c5]" />}
              </div>
              <p className="text-xs text-[#a8e7c5] flex items-center gap-2 mt-0.5 font-body">
                <span className="uppercase font-bold tracking-wider">{user.role}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{user.locationNeighborhood || 'Maplewood Park'}</span>
              </p>
            </div>
          </div>

          <Link
            href="/posts/create"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-[#0f5238] text-xs font-bold hover:bg-[#a8e7c5] transition-colors shadow-level-1"
          >
            <Sparkles className="w-4 h-4 text-[#0f5238]" />
            + New Post / Request
          </Link>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-[#dfe9fa] pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'requests'
                ? 'bg-[#0f5238] text-white shadow-level-1'
                : 'text-slate-600 hover:bg-[#eef4ff]'
            }`}
          >
            My Active Posts ({myPosts.length})
          </button>

          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'applications'
                ? 'bg-[#0f5238] text-white shadow-level-1'
                : 'text-slate-600 hover:bg-[#eef4ff]'
            }`}
          >
            Active & Pending Bookings ({pendingBookings.length + acceptedBookings.length})
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'completed'
                ? 'bg-[#0f5238] text-white shadow-level-1'
                : 'text-slate-600 hover:bg-[#eef4ff]'
            }`}
          >
            Completed Jobs & Reviews ({completedBookings.length})
          </button>
        </div>

        {activeTab === 'requests' && (
          <div className="space-y-4">
            {myPosts.length === 0 ? (
              <div className="py-12 text-center bg-white rounded-3xl border border-[#dfe9fa] p-8 space-y-3">
                <LayoutDashboard className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold font-display">No Active Posts Yet</h3>
                <p className="text-xs text-slate-500">Create a help request or offer a service skill in your neighborhood.</p>
                <Link href="/posts/create" className="inline-block px-4 py-2 bg-[#0f5238] text-white rounded-xl text-xs font-bold">
                  Create First Post
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myPosts.map((post) => (
                  <div key={post.id} className="p-5 rounded-2xl bg-white border border-[#dfe9fa] shadow-level-1 flex items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#a8e7c5]/40 text-[#0f5238]">
                          {post.postType.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">● {post.status}</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#121c28] font-display line-clamp-1">{post.title}</h4>
                      <p className="text-xs text-slate-500">{post.skillCategory} • {post.locationNeighborhood}</p>
                    </div>

                    <Link
                      href={`/posts/${post.id}`}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#eef4ff] text-[#0f5238] hover:bg-[#0f5238] hover:text-white transition-colors shrink-0"
                    >
                      Manage
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="space-y-4">
            {pendingBookings.length === 0 && acceptedBookings.length === 0 ? (
              <div className="py-12 text-center bg-white rounded-3xl border border-[#dfe9fa] p-8">
                <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h3 className="text-base font-bold font-display">No Active or Pending Bookings</h3>
                <p className="text-xs text-slate-500">Apply for help requests or wait for resident applications.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {[...acceptedBookings, ...pendingBookings].map((b) => (
                  <div key={b.id} className="p-6 rounded-3xl bg-white border border-[#dfe9fa] shadow-level-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                          b.status === 'ACCEPTED' ? 'bg-[#a8e7c5]/50 text-[#0f5238]' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {b.status}
                        </span>
                        <h3 className="text-lg font-bold text-[#121c28] font-display mt-2">{b.post?.title}</h3>
                      </div>
                      <Link href={`/posts/${b.postId}`} className="text-xs font-semibold text-[#0f5238] flex items-center gap-1">
                        View Post <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                      <div className="p-3 rounded-2xl bg-[#eef4ff]">
                        <strong className="text-slate-500 block mb-1">Provider:</strong>
                        <div className="font-bold">{b.provider?.name}</div>
                        <div className="text-slate-500">{b.provider?.phone || 'Contact via platform'}</div>
                      </div>
                      <div className="p-3 rounded-2xl bg-[#eef4ff]">
                        <strong className="text-slate-500 block mb-1">Resident:</strong>
                        <div className="font-bold">{b.resident?.name}</div>
                        <div className="text-slate-500">{b.proposedTime}</div>
                      </div>
                    </div>

                    {b.status === 'ACCEPTED' && (
                      <button
                        onClick={() => handleMarkComplete(b.id)}
                        className="w-full py-3 rounded-2xl text-xs font-bold bg-[#1d4ed8] hover:bg-blue-700 text-white flex items-center justify-center gap-2 shadow-level-1"
                      >
                        <Sparkles className="w-4 h-4" />
                        Mark Job Completed & Leave Review
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'completed' && (
          <div className="space-y-4">
            {completedBookings.length === 0 ? (
              <div className="py-12 text-center bg-white rounded-3xl border border-[#dfe9fa] p-8">
                <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h3 className="text-base font-bold font-display">No Completed Jobs Yet</h3>
              </div>
            ) : (
              <div className="space-y-4">
                {completedBookings.map((b) => (
                  <div key={b.id} className="p-6 rounded-3xl bg-white border border-[#dfe9fa] shadow-level-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-[#121c28] font-display">{b.post?.title}</h4>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#a8e7c5]/50 text-[#0f5238]">
                        COMPLETED
                      </span>
                    </div>

                    {b.review ? (
                      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-1">
                        <div className="flex items-center gap-1 font-bold text-amber-700">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          {b.review.rating} / 5 Stars
                        </div>
                        <p className="text-slate-700 italic">"{b.review.comment}"</p>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setReviewBookingId(b.id);
                          setShowReviewModal(true);
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white"
                      >
                        Submit Review
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {reviewBookingId && (
        <ReviewModal
          bookingId={reviewBookingId}
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => fetchDashboardData()}
        />
      )}

      <Footer />
    </div>
  );
}
