'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import {
  CheckCircle2,
  Star,
  Save,
  ShieldCheck,
  UploadCloud,
  Clock,
  AlertCircle,
  FileText,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [locationNeighborhood, setLocationNeighborhood] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');

  // Verification Submission Form State
  const [proofUrl, setProofUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [uploadingProof, setUploadingProof] = useState(false);
  const [submittingProof, setSubmittingProof] = useState(false);
  const [proofError, setProofError] = useState<string | null>(null);
  const [proofSuccess, setProofSuccess] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/users/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setProfileData(data.user);
        setName(data.user.name || '');
        setPhone(data.user.phone || '');
        setLocationNeighborhood(data.user.locationNeighborhood || '');
        setBio(data.user.bio || '');
        setSkills(data.user.skills || '');
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          locationNeighborhood,
          bio,
          skills,
        }),
      });

      if (res.ok) {
        setMessage('Profile updated successfully!');
        refreshUser();
        fetchProfile();
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingProof(true);
    setProofError(null);

    try {
      const file = files[0];
      
      const urlRes = await fetch('/api/media/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      const urlData = await urlRes.json();

      let uploadedUrl = '';
      if (urlData.presignedUrl && !urlData.presignedUrl.includes('MOCK_CREDENTIALS')) {
        // Direct S3 upload from browser
        const uploadRes = await fetch(urlData.presignedUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type,
          },
          body: file,
        });
        if (!uploadRes.ok) {
          throw new Error('S3 upload failed');
        }
        uploadedUrl = urlData.publicUrl;
      } else {
        // Fallback to local upload
        const formData = new FormData();
        formData.append('file', file);

        const uploadRes = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await uploadRes.json();
        if (data.url) {
          uploadedUrl = data.url;
        }
      }

      if (uploadedUrl) {
        setProofUrl(uploadedUrl);
      }
    } catch (err: any) {
      console.error(err);
      setProofError('Failed to upload proof document.');
    } finally {
      setUploadingProof(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofUrl) {
      setProofError('Please upload proof of identity / trade certification document photo.');
      return;
    }

    setSubmittingProof(true);
    setProofError(null);

    try {
      const res = await fetch('/api/verification/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proofUrl,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit verification');

      setProofSuccess('Verification proof submitted! The Master Creator Admin will review your document.');
      refreshUser();
      fetchProfile();
    } catch (err: any) {
      setProofError(err.message || 'Error submitting verification proof.');
    } finally {
      setSubmittingProof(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8f9ff]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <p className="text-xs text-slate-500">Please log in to manage profile.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const vStatus = profileData?.verificationStatus || 'UNSUBMITTED';

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff] font-body text-[#121c28]">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Profile Card Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#dfe9fa] shadow-level-1 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-[#0f5238]/20"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-[#121c28] font-display">{user.name}</h1>
                {user.isVerified && <CheckCircle2 className="w-5 h-5 text-[#1d4ed8]" />}
              </div>
              <p className="text-xs text-slate-500 capitalize">{user.role.toLowerCase()} • {user.locationNeighborhood || 'Maplewood Park'}</p>

              {profileData?.averageRating && (
                <div className="flex items-center gap-1 text-xs font-bold text-amber-600 mt-1 font-body">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {profileData.averageRating} / 5.0 ({profileData.reviewsCount} reviews)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECURITY & VERIFICATION SUBMISSION CARD */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#dfe9fa] shadow-level-1 space-y-6">
          <div className="flex items-center gap-2 border-b border-[#dfe9fa] pb-3">
            <ShieldCheck className="w-6 h-6 text-[#1d4ed8]" />
            <h2 className="text-base font-bold text-[#121c28] font-display">
              Neighborhood Security & Identity Verification
            </h2>
          </div>

          {vStatus === 'APPROVED' && (
            <div className="p-4 rounded-2xl bg-[#a8e7c5]/40 border border-emerald-300 text-[#0f5238] text-xs font-bold flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-[#1d4ed8]" />
              <div>
                <div className="text-sm font-bold text-[#121c28]">✓ Master Creator Verified Provider</div>
                <div className="text-[11px] opacity-80">Your identity and skilled trade proof have been verified by the Application Creator.</div>
              </div>
            </div>
          )}

          {vStatus === 'PENDING' && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-900">
                <Clock className="w-5 h-5 text-amber-600" />
                Verification Under Review by Creator Admin
              </div>
              <p className="text-[11px] leading-relaxed">
                Your proof of identity / trade certification document is currently in the Master Creator Admin Queue. You will receive verified badge status once reviewed.
              </p>
            </div>
          )}

          {(vStatus === 'UNSUBMITTED' || vStatus === 'REJECTED') && (
            <form onSubmit={handleVerificationSubmit} className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed font-body">
                To prevent fraud and maintain safety in Maplewood & Oakridge, neighbors offering services must submit proof of identity or skilled trade certification for verification by the Master Application Creator.
              </p>

              {proofError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-[#ba1a1a] text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {proofError}
                </div>
              )}

              {proofSuccess && (
                <div className="p-3 rounded-xl bg-[#a8e7c5]/40 border border-emerald-300 text-[#0f5238] text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0f5238]" />
                  {proofSuccess}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-display">
                  Upload ID / Skilled Trade Document Photo
                </label>

                <div className="relative border-2 border-dashed border-[#dfe9fa] hover:border-[#0f5238] rounded-2xl p-6 text-center transition-colors bg-[#eef4ff]/50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProofUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                    <UploadCloud className="w-8 h-8 text-[#0f5238]" />
                    <div className="text-xs font-bold text-[#121c28]">
                      {uploadingProof ? 'Uploading Document...' : proofUrl ? '✓ Document Attached' : 'Click or Drag ID / Certificate Document Photo'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Drivers License, Electrician/Plumbing License, or Utility Bill Proof.
                    </div>
                  </div>
                </div>

                {proofUrl && (
                  <div className="flex items-center gap-2 text-xs text-[#0f5238] font-bold">
                    <FileText className="w-4 h-4" />
                    Document photo attached ready for submission.
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 font-display">
                  Additional License or Business Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Master Plumber License #89201"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#eef4ff] border border-[#dfe9fa] focus:outline-none focus:ring-2 focus:ring-[#0f5238] text-[#121c28]"
                />
              </div>

              <button
                type="submit"
                disabled={submittingProof || uploadingProof}
                className="w-full py-3 rounded-xl text-xs font-bold bg-[#0f5238] hover:bg-[#2d6a4f] text-white shadow-level-1 transition-all disabled:opacity-50"
              >
                {submittingProof ? 'Submitting for Verification...' : 'Submit Proof to Creator Admin'}
              </button>
            </form>
          )}
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#dfe9fa] shadow-level-1 space-y-6">
          <h2 className="text-base font-bold text-[#121c28] font-display border-b border-[#dfe9fa] pb-3">
            Edit Profile & Skill Catalog
          </h2>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-display">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-xs bg-[#eef4ff] border border-[#dfe9fa] focus:outline-none focus:ring-2 focus:ring-[#0f5238] text-[#121c28]"
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
                  className="w-full px-4 py-2.5 rounded-xl text-xs bg-[#eef4ff] border border-[#dfe9fa] focus:outline-none focus:ring-2 focus:ring-[#0f5238] text-[#121c28]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-display">
                  Neighborhood
                </label>
                <input
                  type="text"
                  value={locationNeighborhood}
                  onChange={(e) => setLocationNeighborhood(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-xs bg-[#eef4ff] border border-[#dfe9fa] focus:outline-none focus:ring-2 focus:ring-[#0f5238] text-[#121c28]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-display">
                  Skills (Comma Separated)
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. Plumbing,Electrical,Yard Work"
                  className="w-full px-4 py-2.5 rounded-xl text-xs bg-[#eef4ff] border border-[#dfe9fa] focus:outline-none focus:ring-2 focus:ring-[#0f5238] text-[#121c28]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-display">
                Bio & Experience
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-3 rounded-xl text-xs bg-[#eef4ff] border border-[#dfe9fa] focus:outline-none focus:ring-2 focus:ring-[#0f5238] text-[#121c28]"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#0f5238] hover:bg-[#2d6a4f] text-white shadow-level-1 transition-colors"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

      </main>

      <Footer />
    </div>
  );
}
