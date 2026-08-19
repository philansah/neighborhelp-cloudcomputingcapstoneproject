'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { UrgencyBadge } from '@/components/UrgencyBadge';
import { ApplyModal } from '@/components/ApplyModal';
import { ReviewModal } from '@/components/ReviewModal';
import { useAuth } from '@/context/AuthContext';
import {
  MapPin,
  CheckCircle2,
  Phone,
  ArrowLeft,
  Wrench,
  Check,
  Sparkles,
  Trash2,
} from 'lucide-react';

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/posts/${id}`);
      if (res.ok) {
        const data = await res.json();
        setPost(data.post);
      }
    } catch (err) {
      console.error('Failed to fetch post details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  const handleBookingAction = async (bookingId: string, status: 'ACCEPTED' | 'REJECTED' | 'COMPLETED') => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        if (status === 'COMPLETED') {
          setReviewBookingId(bookingId);
          setShowReviewModal(true);
        }
        fetchPost();
      }
    } catch (err) {
      console.error('Failed to update booking:', err);
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/');
      }
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8f9ff]">
        <Navbar />
        <main className="flex-1 max-w-[1280px] w-full mx-auto p-8 animate-pulse space-y-6">
          <div className="h-8 bg-[#eef4ff] rounded-xl w-1/3" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-96 bg-[#eef4ff] rounded-3xl" />
            <div className="h-96 bg-[#eef4ff] rounded-3xl" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8f9ff]">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-2xl font-bold text-[#121c28]">Post Not Found</h2>
          <p className="text-xs text-slate-500 mt-2">The request or offer may have been removed.</p>
          <Link href="/" className="mt-4 px-4 py-2 bg-[#0f5238] text-white text-xs font-bold rounded-xl">
            Return to Feed
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const isOwner = user?.id === post.authorId;
  const isAdmin = user?.role === 'ADMIN';
  const photos = post.photos || [];
  const currentPhoto = photos.length > 0 ? photos[selectedPhotoIndex]?.s3Url : null;
  const existingApplication = post.bookings?.find((b: any) => b.providerId === user?.id);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff] font-body text-[#121c28]">
      <Navbar />

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#121c28] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Feed
          </button>

          {(isOwner || isAdmin) && (
            <button
              onClick={handleDeletePost}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#ba1a1a] hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Post
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white rounded-3xl p-4 border border-[#dfe9fa] shadow-level-1 space-y-3">
              <div className="relative h-80 sm:h-96 w-full rounded-2xl bg-[#eef4ff] overflow-hidden">
                {currentPhoto ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={currentPhoto}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <Wrench className="w-12 h-12 mb-2 opacity-40" />
                    <span className="text-xs font-medium">No photo uploaded</span>
                  </div>
                )}

                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#0f5238] text-white shadow-md">
                    {post.postType === 'NEED_HELP' ? 'Need Help' : 'Offering Help'}
                  </span>
                  <UrgencyBadge urgency={post.urgency} />
                </div>
              </div>

              {photos.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {photos.map((p: any, idx: number) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPhotoIndex(idx)}
                      className={`h-16 w-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                        selectedPhotoIndex === idx
                          ? 'border-[#0f5238] scale-105'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.s3Url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#dfe9fa] shadow-level-1 space-y-6">
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#eef4ff] text-[#0f5238]">
                    Category: {post.skillCategory}
                  </span>
                  <span className="text-xs text-slate-400">
                    Posted {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#121c28] font-display leading-tight">
                  {post.title}
                </h1>
              </div>

              <div className="pt-4 border-t border-[#dfe9fa]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Problem & Request Details
                </h3>
                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed font-body">
                  {post.description}
                </p>
              </div>

              <div className="pt-6 border-t border-[#dfe9fa]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Author & Resident Info
                </h3>
                <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-[#eef4ff] border border-[#dfe9fa]">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.author?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={post.author?.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-[#0f5238]/30"
                    />
                    <div>
                      <div className="text-sm font-bold text-[#121c28] flex items-center gap-1.5 font-display">
                        {post.author?.name}
                        {post.author?.isVerified && (
                          <CheckCircle2 className="w-4 h-4 text-[#1d4ed8]" />
                        )}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#0f5238]" />
                        {post.locationNeighborhood}
                      </div>
                    </div>
                  </div>

                  {post.author?.phone && (
                    <a
                      href={`tel:${post.author.phone}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-[#dfe9fa] text-[#121c28] hover:text-[#0f5238] transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#0f5238]" />
                      {post.author.phone}
                    </a>
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* Action Box */}
          <div className="space-y-6">
            
            <div className="bg-white rounded-3xl p-6 border border-[#dfe9fa] shadow-level-2 space-y-6">
              
              <div className="flex items-center justify-between border-b border-[#dfe9fa] pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Post Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  post.status === 'OPEN'
                    ? 'bg-blue-100 text-blue-800'
                    : post.status === 'IN_PROGRESS'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-[#a8e7c5]/50 text-[#0f5238]'
                }`}>
                  {post.status.replace('_', ' ')}
                </span>
              </div>

              {!isOwner && user && (
                <div className="space-y-4">
                  {existingApplication ? (
                    <div className="p-4 rounded-2xl bg-[#a8e7c5]/40 border border-emerald-300 text-[#0f5238] text-xs space-y-2">
                      <div className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#0f5238]" />
                        Application Submitted
                      </div>
                      <p>Status: <span className="font-semibold uppercase">{existingApplication.status}</span></p>
                      <p className="text-[11px] opacity-80">Proposed: {existingApplication.proposedTime}</p>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-sm font-bold text-[#121c28] font-display mb-2">Can you help with this request?</h4>
                      <p className="text-xs text-slate-500 mb-4">Submit an application with your proposed schedule and note to assist this resident.</p>
                      <button
                        onClick={() => setShowApplyModal(true)}
                        className="w-full py-3.5 rounded-xl text-xs font-bold bg-[#0f5238] hover:bg-[#2d6a4f] text-white shadow-level-1 transition-all flex items-center justify-center gap-2"
                      >
                        <Wrench className="w-4 h-4" />
                        Apply for this Job
                      </button>
                    </div>
                  )}
                </div>
              )}

              {!user && (
                <div className="text-center py-4 space-y-3">
                  <h4 className="text-sm font-bold text-[#121c28] font-display">Log in to Apply or Contact</h4>
                  <p className="text-xs text-slate-500">Sign in to submit job applications, propose schedules, or contact neighbors.</p>
                  <Link href="/login" className="block w-full py-3 rounded-xl text-xs font-bold bg-[#0f5238] text-white">
                    Log In / Register
                  </Link>
                </div>
              )}

              {isOwner && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-[#121c28] font-display">
                    Incoming Applications ({post.bookings?.length || 0})
                  </h4>

                  {post.bookings?.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400 bg-[#eef4ff] rounded-2xl">
                      No applications received yet. Providers in your neighborhood will apply soon!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {post.bookings.map((booking: any) => (
                        <div key={booking.id} className="p-4 rounded-2xl bg-[#eef4ff] border border-[#dfe9fa] space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={booking.provider?.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
                                alt={booking.provider?.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <div>
                                <div className="text-xs font-bold text-[#121c28] flex items-center gap-1 font-display">
                                  {booking.provider?.name}
                                  {booking.provider?.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-[#1d4ed8]" />}
                                </div>
                                <div className="text-[11px] text-slate-500">Skills: {booking.provider?.skills || 'Handyman'}</div>
                              </div>
                            </div>

                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              booking.status === 'ACCEPTED' ? 'bg-[#a8e7c5] text-[#0f5238]' : booking.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {booking.status}
                            </span>
                          </div>

                          <div className="text-xs text-slate-700 space-y-1 font-body">
                            <div><strong className="text-slate-500">Proposed:</strong> {booking.proposedTime}</div>
                            {booking.message && <p className="italic bg-white p-2 rounded-xl border border-[#dfe9fa] text-[11px]">{booking.message}</p>}
                          </div>

                          {booking.status === 'PENDING' && (
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                onClick={() => handleBookingAction(booking.id, 'ACCEPTED')}
                                className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#0f5238] hover:bg-[#2d6a4f] text-white flex items-center justify-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Accept Provider
                              </button>
                              <button
                                onClick={() => handleBookingAction(booking.id, 'REJECTED')}
                                className="px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-100"
                              >
                                Reject
                              </button>
                            </div>
                          )}

                          {booking.status === 'ACCEPTED' && (
                            <button
                              onClick={() => handleBookingAction(booking.id, 'COMPLETED')}
                              className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#1d4ed8] hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 shadow-level-1"
                            >
                              <Sparkles className="w-4 h-4" />
                              Mark Job Completed & Review
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>

        </div>

      </main>

      <ApplyModal
        postId={post.id}
        postTitle={post.title}
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        onSuccess={() => fetchPost()}
      />

      {reviewBookingId && (
        <ReviewModal
          bookingId={reviewBookingId}
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => fetchPost()}
        />
      )}

      <Footer />
    </div>
  );
}
