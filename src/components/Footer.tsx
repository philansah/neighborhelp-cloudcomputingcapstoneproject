import React from 'react';
import Link from 'next/link';
import { HeartHandshake, Shield, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-white border-t border-[#dfe9fa] py-12 mt-auto font-body">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0f5238] flex items-center justify-center text-white font-bold">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-[#121c28] font-display">NeighborHelp</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Connecting residents with skilled local neighbors for home repairs, yard care, and emergency assistance.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#121c28] font-display mb-3">
              Categories
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><Link href="/?skillCategory=Plumbing" className="hover:text-[#0f5238] transition-colors">Plumbing & Drains</Link></li>
              <li><Link href="/?skillCategory=Electrical" className="hover:text-[#0f5238] transition-colors">Electrical Repairs</Link></li>
              <li><Link href="/?skillCategory=Yard Work" className="hover:text-[#0f5238] transition-colors">Yard Work & Clearing</Link></li>
              <li><Link href="/?skillCategory=General Handyman" className="hover:text-[#0f5238] transition-colors">General Handyman</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#121c28] font-display mb-3">
              Neighborhoods
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><span className="text-slate-500">Maplewood Park</span></li>
              <li><span className="text-slate-500">Oakridge Heights</span></li>
              <li><span className="text-slate-500">Downtown Central</span></li>
              <li><span className="text-[#0f5238] font-bold">+ Add Your Neighborhood</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#121c28] font-display mb-3">
              Safety & Verification
            </h4>
            <div className="p-3.5 rounded-xl bg-[#eef4ff] border border-[#dfe9fa] space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1d4ed8]">
                <Shield className="w-4 h-4 text-[#1d4ed8]" />
                Verified Provider Badges
              </div>
              <p className="text-[11px] text-slate-600">
                Look for the blue checkmark badge on provider profiles for verified local specialists.
              </p>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-[#dfe9fa] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © 2026 NeighborHelp Capstone MVP. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-[#0f5238] font-bold">
              <Sparkles className="w-3.5 h-3.5" /> AWS CloudWatch Monitored
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
