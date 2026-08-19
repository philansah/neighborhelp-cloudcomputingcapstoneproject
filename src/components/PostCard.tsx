import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Star, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { UrgencyBadge } from './UrgencyBadge';

export interface PostCardProps {
  post: {
    id: string;
    title: string;
    description: string;
    skillCategory: string;
    locationNeighborhood: string;
    urgency: string;
    postType: string;
    status: string;
    createdAt: string | Date;
    author: {
      id: string;
      name: string;
      avatarUrl?: string | null;
      locationNeighborhood?: string | null;
      isVerified?: boolean;
    };
    photos?: { id: string; s3Url: string }[];
  };
}

export function PostCard({ post }: PostCardProps) {
  const photo = post.photos && post.photos.length > 0 ? post.photos[0].s3Url : null;
  const isNeedHelp = post.postType === 'NEED_HELP';

  const rateMap: Record<string, string> = {
    Plumbing: '$35/hr',
    Electrical: '$40/hr',
    'Yard Work': '$20/hr',
    Cleaning: '$18/hr',
    'General Handyman': '$25/hr',
    Drainage: '$30/hr',
  };
  const rate = rateMap[post.skillCategory] || '$25/hr';

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-[#dfe9fa] shadow-level-1 hover:shadow-level-2 transition-all duration-300 overflow-hidden font-body">
      
      {/* Image Thumbnail Header */}
      <div className="relative h-44 w-full bg-[#eef4ff] overflow-hidden">
        {photo ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={photo}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-gradient-to-br from-[#eef4ff] to-[#dfe9fa]">
            <ImageIcon className="w-8 h-8 opacity-40 mb-1" />
            <span className="text-[11px] font-medium">No Image</span>
          </div>
        )}

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span
            className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
              isNeedHelp
                ? 'bg-[#0f5238] text-white shadow-sm'
                : 'bg-[#1d4ed8] text-white shadow-sm'
            }`}
          >
            {isNeedHelp ? 'Need Help' : 'Offering Help'}
          </span>

          {/* Verified Badge (Trust Blue) */}
          {post.author?.isVerified ? (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#1d4ed8] text-white shadow-md">
              <CheckCircle2 className="w-3.5 h-3.5 fill-white text-[#1d4ed8]" />
              Verified
            </span>
          ) : (
            <UrgencyBadge urgency={post.urgency} />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 space-y-3">
        
        <div className="flex items-center justify-between gap-2">
          <span className="px-3 py-1 rounded-md text-xs font-semibold bg-[#eef4ff] text-[#0f5238]">
            {post.skillCategory}
          </span>
          <span className="text-xs font-extrabold text-[#0f5238]">
            {rate}
          </span>
        </div>

        <div>
          <h3 className="text-base font-bold text-[#121c28] font-display line-clamp-1 group-hover:text-[#0f5238] transition-colors">
            {post.title}
          </h3>
          <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed font-body">
            {post.description}
          </p>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#dfe9fa] flex items-center justify-between text-xs mt-auto">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.author?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={post.author?.name}
              className="w-7 h-7 rounded-full object-cover"
            />
            <div>
              <div className="font-bold text-[#121c28] flex items-center gap-1 text-[11px]">
                {post.author?.name}
              </div>
              <div className="text-[10px] text-slate-500">{post.locationNeighborhood}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-600">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              4.9
            </span>

            <Link
              href={`/posts/${post.id}`}
              className="p-2 rounded-lg bg-[#eef4ff] text-[#0f5238] hover:bg-[#0f5238] hover:text-white transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
