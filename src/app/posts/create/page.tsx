'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import {
  PlusCircle,
  UploadCloud,
  X,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Wrench,
} from 'lucide-react';

function CreatePostForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type') === 'CAN_HELP' ? 'CAN_HELP' : 'NEED_HELP';

  const { user } = useAuth();
  const [postType, setPostType] = useState<'NEED_HELP' | 'CAN_HELP'>(initialType);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillCategory, setSkillCategory] = useState('Plumbing');
  const [locationNeighborhood, setLocationNeighborhood] = useState(user?.locationNeighborhood || 'Maplewood Park');
  const [urgency, setUrgency] = useState('MEDIUM');
  
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

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
          setPhotos((prev) => [...prev, uploadedUrl]);
        }
      }
    } catch (e) {
      console.error(e);
      setError('Failed to upload photos. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to create a post.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postType,
          title,
          description,
          skillCategory,
          locationNeighborhood,
          urgency,
          photos,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create post');
      }

      router.push(`/posts/${data.post.id}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 font-body">
      
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#121c28] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Feed
        </button>
        <span className="text-xs font-bold text-[#0f5238] uppercase tracking-wider font-display">
          NeighborHelp Post Creator
        </span>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#dfe9fa] shadow-level-1 space-y-6">
        
        <div>
          <h1 className="text-2xl font-extrabold text-[#121c28] font-display">
            {postType === 'NEED_HELP' ? 'Request Assistance from Neighbors' : 'Offer Service & Skills'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Fill in the details below to share your request or availability with local residents.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3 font-semibold">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 font-display">
              Post Type
            </label>
            <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-[#eef4ff]">
              <button
                type="button"
                onClick={() => setPostType('NEED_HELP')}
                className={`py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  postType === 'NEED_HELP'
                    ? 'bg-[#0f5238] text-white shadow-level-1'
                    : 'text-slate-600 hover:text-[#121c28]'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                I Need Help (Request)
              </button>
              <button
                type="button"
                onClick={() => setPostType('CAN_HELP')}
                className={`py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  postType === 'CAN_HELP'
                    ? 'bg-[#1d4ed8] text-white shadow-level-1'
                    : 'text-slate-600 hover:text-[#121c28]'
                }`}
              >
                <Wrench className="w-4 h-4" />
                I Can Help (Offer Skills)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-display">
              Title / Summary Header *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Blocked Kitchen Sink & Leaking Drain Pipe"
              className="w-full px-4 py-3 rounded-xl text-sm bg-[#eef4ff] border border-[#dfe9fa] focus:outline-none focus:ring-2 focus:ring-[#0f5238] text-[#121c28]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-display">
                Skill Category *
              </label>
              <select
                value={skillCategory}
                onChange={(e) => setSkillCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-xs bg-[#eef4ff] border border-[#dfe9fa] focus:outline-none focus:ring-2 focus:ring-[#0f5238] text-[#121c28]"
              >
                <option value="Plumbing">Plumbing & Drains</option>
                <option value="Electrical">Electrical Repairs</option>
                <option value="Yard Work">Yard Work & Landscaping</option>
                <option value="Drainage">Drainage & Gutter Clearance</option>
                <option value="Cleaning">Home Cleaning</option>
                <option value="General Handyman">General Handyman</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-display">
                Urgency Level
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-xs bg-[#eef4ff] border border-[#dfe9fa] focus:outline-none focus:ring-2 focus:ring-[#0f5238] text-[#121c28]"
              >
                <option value="LOW">Low Urgency (Within a week)</option>
                <option value="MEDIUM">Medium Urgency (Next 2-3 days)</option>
                <option value="HIGH">High Urgency (Today or Tomorrow)</option>
                <option value="EMERGENCY">🚨 EMERGENCY (Immediate Action Needed)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-display">
              Neighborhood Location *
            </label>
            <input
              type="text"
              required
              value={locationNeighborhood}
              onChange={(e) => setLocationNeighborhood(e.target.value)}
              placeholder="e.g. Maplewood Park"
              className="w-full px-4 py-3 rounded-xl text-sm bg-[#eef4ff] border border-[#dfe9fa] focus:outline-none focus:ring-2 focus:ring-[#0f5238] text-[#121c28]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-display">
              Detailed Description *
            </label>
            <textarea
              rows={5}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue or service in detail. Include dimensions, tools needed, or access instructions..."
              className="w-full p-4 rounded-xl text-sm bg-[#eef4ff] border border-[#dfe9fa] focus:outline-none focus:ring-2 focus:ring-[#0f5238] text-[#121c28] leading-relaxed"
            />
          </div>

          {/* Amazon S3 Multi-photo Dropzone */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-display">
              Photos & Proof Upload (Multi-Photo Dropzone)
            </label>

            <div className="relative border-2 border-dashed border-[#dfe9fa] hover:border-[#0f5238] rounded-2xl p-6 text-center transition-colors bg-[#eef4ff]/50">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                <UploadCloud className="w-10 h-10 text-[#0f5238]" />
                <div className="text-xs font-bold text-[#121c28]">
                  {uploading ? 'Uploading Proof...' : 'Drag & drop photos here or click to browse'}
                </div>
                <div className="text-[11px] text-slate-500">
                  Supports PNG, JPG, WEBP.
                </div>
              </div>
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {photos.map((photoUrl, idx) => (
                  <div key={idx} className="relative group h-24 rounded-xl overflow-hidden border border-[#dfe9fa]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photoUrl} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 p-1 bg-black/70 rounded-full text-white hover:bg-rose-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#dfe9fa] flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-3 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploading}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-xs font-bold bg-[#0f5238] hover:bg-[#2d6a4f] text-white shadow-level-1 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Publishing Post...' : 'Publish Post'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

export default function CreatePostPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff] font-body text-[#121c28]">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading form...</div>}>
          <CreatePostForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
