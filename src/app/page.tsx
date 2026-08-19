'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PostCard } from '@/components/PostCard';
import {
  Search,
  PlusCircle,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Star,
  MessageSquare,
} from 'lucide-react';

const SKILLS = [
  { name: 'ALL', label: 'All Services' },
  { name: 'Plumbing', label: 'Plumbing & Drains' },
  { name: 'Electrical', label: 'Electrical Work' },
  { name: 'Yard Work', label: 'Yard & Landscaping' },
  { name: 'Cleaning', label: 'Home Cleaning' },
  { name: 'General Handyman', label: 'General Handyman' },
];

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('ALL');
  const [selectedUrgency, setSelectedUrgency] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedLocation, setSelectedLocation] = useState('ALL');
  const [activeFeedTab, setActiveFeedTab] = useState<'recent' | 'top'>('recent');

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (selectedSkill !== 'ALL') params.set('skillCategory', selectedSkill);
      if (selectedUrgency !== 'ALL') params.set('urgency', selectedUrgency);
      if (selectedType !== 'ALL') params.set('postType', selectedType);
      if (selectedLocation !== 'ALL') params.set('locationNeighborhood', selectedLocation);

      const res = await fetch(`/api/posts?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedSkill, selectedUrgency, selectedType, selectedLocation]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff] font-body text-[#121c28]">
      <Navbar />

      <main className="flex-1 space-y-16 pb-20">
        
        {/* HERO SECTION - Light Theme Design System */}
        <section className="relative pt-12 pb-16 bg-gradient-to-b from-[#eef4ff] via-[#f8f9ff] to-[#f8f9ff] border-b border-[#dfe9fa]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column */}
              <div className="lg:col-span-7 space-y-8">
                
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#a8e7c5]/40 border border-[#2d6a4f]/30 text-xs font-bold text-[#0f5238]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0f5238] animate-pulse" />
                  Trust & Warmth • Verified Neighbor Network
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-[48px] font-extrabold tracking-tight text-[#121c28] leading-[56px] font-display">
                  Local skills, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0f5238] via-[#2d6a4f] to-[#1d4ed8]">
                    Instant solutions.
                  </span>
                </h1>

                <p className="text-base sm:text-[18px] text-slate-700 max-w-xl leading-[28px] font-body">
                  Connecting neighbors to solve everyday problems together. From gardening help to assembly, build a stronger community one task at a time.
                </p>

                {/* Status Legend */}
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 pt-1">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Blue = Active</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#0f5238]" /> Green = Scheduled</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Amber = Action Required</span>
                </div>

                {/* Dual CTAs */}
                <div className="flex flex-wra
                  p items-center gap-4 pt-2">
                  <Link
                    href="/posts/create?type=NEED_HELP"
                    className="flex items-center justify-center gap-2.5 px-8 h-12 rounded-lg text-sm font-bold bg-[#0f5238] hover:bg-[#2d6a4f] text-white shadow-level-1 transition-all"
                  >
                    I Need Help
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/posts/create?type=CAN_HELP"
                    className="flex items-center justify-center px-8 h-12 rounded-lg text-sm font-bold bg-white text-[#1d4ed8] border-2 border-[#1d4ed8] hover:bg-[#eef4ff] transition-all"
                  >
                    I Can Help
                  </Link>
                </div>

                {/* Integrated Search Bar */}
                <form onSubmit={handleSearchSubmit} className="pt-2 max-w-xl">
                  <div className="p-2 rounded-2xl bg-white border border-[#dfe9fa] shadow-level-2 flex flex-col sm:flex-row items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-2 flex-1 border-b sm:border-b-0 sm:border-r border-[#dfe9fa] w-full">
                      <Search className="w-4 h-4 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Plumbing, Lawn..."
                        className="w-full text-xs bg-transparent focus:outline-none text-[#121c28]"
                      />
                    </div>

                    <div className="flex items-center gap-2 px-3 py-2 flex-1 w-full">
                      <MapPin className="w-4 h-4 text-[#0f5238] shrink-0" />
                      <select
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="w-full text-xs bg-transparent focus:outline-none text-slate-700"
                      >
                        <option value="ALL">In your neighborhood</option>
                        <option value="Maplewood Park">Maplewood Park</option>
                        <option value="Oakridge Heights">Oakridge Heights</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full sm:w-auto px-6 h-10 rounded-lg text-xs font-bold bg-[#0f5238] hover:bg-[#2d6a4f] text-white shrink-0 transition-colors"
                    >
                      Find Solutions
                    </button>
                  </div>
                </form>

              </div>

              {/* Right Column Hero Card */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-3xl overflow-hidden shadow-level-2 border-4 border-white bg-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1592417817098-8f3d6eb1b7a5?w=800"
                    alt="Neighbors helping"
                    className="w-full h-80 sm:h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-[#dfe9fa] shadow-level-1 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#1d4ed8] text-white flex items-center justify-center font-bold">
                        ✓
                      </div>
                      <div>
                        <div className="font-bold text-[#121c28] font-display">Verified Neighbors</div>
                        <div className="text-[11px] text-slate-500">144+ tasks completed</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-amber-600">
                      <Star className="w-4 h-4 fill-amber-400" />
                      5.0 rating
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 2: HAPPENING NEAR YOU */}
        <section id="explore" className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-[32px] font-extrabold text-[#121c28] font-display leading-[40px]">Happening near you</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">Real-time local opportunities to lend a hand or get things done.</p>
            </div>

            <div className="flex items-center gap-2 bg-[#eef4ff] p-1.5 rounded-full text-xs font-bold">
              <button
                onClick={() => setActiveFeedTab('recent')}
                className={`px-4 py-1.5 rounded-full transition-colors ${
                  activeFeedTab === 'recent' ? 'bg-white text-[#121c28] shadow-level-1' : 'text-slate-600'
                }`}
              >
                Recent Needs
              </button>
              <button
                onClick={() => setActiveFeedTab('top')}
                className={`px-4 py-1.5 rounded-full transition-colors ${
                  activeFeedTab === 'top' ? 'bg-white text-[#121c28] shadow-level-1' : 'text-slate-600'
                }`}
              >
                Top Skills
              </button>
            </div>
          </div>

          {/* Skill Filter Pills */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
            {SKILLS.map((s) => (
              <button
                key={s.name}
                onClick={() => setSelectedSkill(s.name)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedSkill === s.name
                    ? 'bg-[#0f5238] text-white shadow-level-1'
                    : 'bg-white text-slate-700 border border-[#dfe9fa] hover:bg-[#eef4ff]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Posts Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-72 rounded-2xl bg-[#eef4ff] animate-pulse" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-3xl border border-[#dfe9fa] p-8 space-y-2">
              <h3 className="text-base font-bold text-[#121c28] font-display">No Posts Found</h3>
              <p className="text-xs text-slate-500">Try adjusting your search filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          <div className="text-center pt-2">
            <Link
              href="/posts/create"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0f5238] hover:underline"
            >
              View all local requests &gt;
            </Link>
          </div>

        </section>

        {/* SECTION 3: BUILDING A BETTER NEIGHBORHOOD */}
        <section id="community" className="bg-[#eef4ff]/70 py-16 border-y border-[#dfe9fa]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-3xl font-extrabold text-[#121c28] font-display">Building a better neighborhood</h2>
              <p className="text-xs text-slate-600">Simple steps to connect with neighbors and exchange value safely.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="p-8 rounded-2xl bg-white border border-[#dfe9fa] shadow-level-1 space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-[#a8e7c5]/50 text-[#0f5238] flex items-center justify-center mx-auto">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#121c28] font-display">1. Post</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-body">
                  Describe what you need or what you can offer. Set your fair price and preferred time.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-white border border-[#dfe9fa] shadow-level-1 space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-[#1d4ed8] flex items-center justify-center mx-auto">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#121c28] font-display">2. Connect</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-body">
                  Review profiles, chat with interested neighbors, and confirm details securely through the app.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-white border border-[#dfe9fa] shadow-level-1 space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-[#a8e7c5]/50 text-[#0f5238] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#121c28] font-display">3. Resolve</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-body">
                  Get the job done! Rate your experience and help build a trusted community network.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* SECTION 4: MEET OUR SUPER NEIGHBORS */}
        <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-[#0f5238] text-white shadow-level-2 relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-7 space-y-4">
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display">
                  Meet our <br />
                  <span className="text-[#a8e7c5]">Super Neighbors</span>
                </h2>
                <p className="text-xs sm:text-sm text-[#a8e7c5]/90 leading-relaxed max-w-lg font-body">
                  These community pillars have completed over 50+ tasks with 5-star ratings. Join our elite circle of helpers.
                </p>
                <Link
                  href="/register"
                  className="inline-block px-6 py-3 rounded-lg bg-white text-[#0f5238] text-xs font-bold hover:bg-[#a8e7c5] transition-colors shadow-level-1"
                >
                  Learn about Verification
                </Link>
              </div>

              <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#2d6a4f]/90 backdrop-blur-md border border-emerald-600/40 space-y-2">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"
                      alt="Maya R."
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-[#a8e7c5]"
                    />
                    <div>
                      <div className="text-xs font-bold font-display">Maya R.</div>
                      <div className="text-[10px] text-[#a8e7c5]">154 Tasks Completed</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 text-xs text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#2d6a4f]/90 backdrop-blur-md border border-emerald-600/40 space-y-2">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
                      alt="Alex R."
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-[#a8e7c5]"
                    />
                    <div>
                      <div className="text-xs font-bold font-display">Alex R.</div>
                      <div className="text-[10px] text-[#a8e7c5]">87 Tasks Completed</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 text-xs text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 5: READY TO HELP OR GET HELPED */}
        <section className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#121c28] font-display">Ready to help or get helped?</h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto font-body">
            Join 8,000+ neighbors already making local life easier and more connected.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="px-7 h-12 rounded-lg text-xs font-bold bg-[#0f5238] hover:bg-[#2d6a4f] text-white shadow-level-1 flex items-center justify-center"
            >
              Sign Up Now
            </Link>
            <Link
              href="/"
              className="px-7 h-12 rounded-lg text-xs font-bold bg-white text-[#1d4ed8] border-2 border-[#1d4ed8] hover:bg-[#eef4ff] flex items-center justify-center"
            >
              Browse Map
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
