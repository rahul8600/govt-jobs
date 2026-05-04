import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useJobs } from "@/lib/useJobs";
import { useSEO, generateHomeMeta } from "@/components/SEO";
import { usePageTracker } from "@/lib/usePageTracker";

function CategoryBlock({ title, jobs, href, mobileVariant = false }: { title: string, jobs: any[], href: string, mobileVariant?: boolean }) {
  return (
    <div className={`h-full overflow-hidden border border-slate-300 ${mobileVariant ? '' : 'portal-card transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/10 hover:-translate-y-0.5 border-slate-200/80'}`}>
      <div className={`text-center text-white ${mobileVariant ? 'bg-[#800000] py-3 text-sm font-extrabold tracking-wide' : 'section-header bg-blue-700 py-4 text-sm font-black'}`}>
        {title}
      </div>
      <div className={`bg-white ${mobileVariant ? '' : 'min-h-[420px]'}`}>
        <ul className={`divide-y divide-slate-200 ${mobileVariant ? '' : 'divide-slate-100'}`}>
          {jobs.slice(0, mobileVariant ? 8 : 15).map(job => (
            <li key={job.id} className={`hover:bg-blue-50/50 ${mobileVariant ? 'px-2 py-2' : 'p-5 transition-all duration-200 flex items-center justify-between group'}`}>
              <Link href={`/job/${job.slug || job.id}`}>
                <span className={`text-blue-700 hover:text-blue-800 hover:underline cursor-pointer block ${mobileVariant ? 'text-xs font-semibold leading-normal' : 'font-bold text-[15px] leading-relaxed flex-grow pr-4'}`}>
                  {job.title}
                </span>
              </Link>
            </li>
          ))}
          {jobs.length === 0 && <li className={`text-center text-slate-400 ${mobileVariant ? 'p-2 text-xs' : 'p-6 text-sm'}`}>No updates available</li>}
        </ul>
      </div>
      <div className={`text-center bg-slate-100 border-t border-slate-300 ${mobileVariant ? 'py-2' : 'p-4 bg-slate-50 border-slate-200'}`}>
        <Link href={href}>
          <div className={`font-bold text-slate-600 hover:text-blue-700 uppercase cursor-pointer ${mobileVariant ? 'text-[10px]' : 'text-xs transition-colors duration-200'}`}>View All</div>
        </Link>
      </div>
    </div>
  );
}

export default function Home() {
  const [, navigate] = useLocation();
  const [homeSearch, setHomeSearch] = useState("");
  const { jobs, loading } = useJobs();
  
  useSEO(generateHomeMeta());
  usePageTracker('home');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Loading...</p>
        </div>
      </div>
    );
  }

  const handleHomeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (homeSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(homeSearch.trim())}`);
    } else {
      navigate('/search');
    }
  };

  // Filter jobs by type and ensure they are "published" (all jobs in our mock state are published)
  const featuredJobs = jobs.filter(j => j.featured).slice(0, 8);
  const latestJobs = jobs.filter(j => j.type === 'job').slice(0, 15);
  const admitCards = jobs.filter(j => j.type === 'admit-card').slice(0, 15);
  const results = jobs.filter(j => j.type === 'result').slice(0, 15);
  const answerKeys = jobs.filter(j => j.type === 'answer-key').slice(0, 10);
  const admission = jobs.filter(j => j.type === 'admission').slice(0, 10);

  return (
    <div className="space-y-4 md:space-y-12">
      {/* Search Bar Section */}
      <form onSubmit={handleHomeSearch} className="portal-card relative p-4 md:p-12 flex flex-col md:flex-row items-center gap-3 md:gap-6 overflow-hidden rounded-lg md:rounded-[14px] border md:border-2 border-[#3b82f6] shadow-sm md:shadow-[0_0_18px_rgba(59,130,246,0.35)]" style={{background: 'linear-gradient(135deg, #f0f7ff, #ffffff)'}}>
        {/* Animated Blobs - Desktop only */}
        <div className="hidden md:block hero-blob bg-blue-400 w-[400px] h-[400px] -top-20 -left-20"></div>
        <div className="hidden md:block hero-blob bg-purple-400 w-[300px] h-[300px] top-40 right-10 animation-delay-2000"></div>
        
        {/* Dotted Texture Overlay - Desktop only */}
        <div className="hidden md:block absolute inset-0 dot-pattern opacity-40 pointer-events-none"></div>

        <div className="flex-grow relative w-full z-10">
          <div className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 text-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search md:w-[22px] md:h-[22px]"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <input 
            type="text" 
            placeholder="Search jobs..."
            className="w-full pl-10 md:pl-16 pr-4 md:pr-6 py-3 md:py-5 bg-white border border-[#60a5fa] md:border-2 rounded-lg md:rounded-xl outline-none focus:border-[#1d4ed8] focus:shadow-[0_0_12px_rgba(29,78,216,0.45)] transition-all duration-200 text-sm md:text-base font-semibold text-[#0f172a] placeholder:text-[#2563eb] placeholder:font-medium"
            value={homeSearch}
            onChange={(e) => setHomeSearch(e.target.value)}
            data-testid="input-home-search"
          />
        </div>
        <button type="submit" className="w-full md:w-auto text-white px-6 md:px-12 py-3 md:py-5 font-bold uppercase text-xs md:text-sm tracking-widest rounded-lg md:rounded-xl transition-all duration-200 shadow-md md:shadow-[0_6px_18px_rgba(37,99,235,0.55)] hover:shadow-[0_8px_24px_rgba(37,99,235,0.65)] active:scale-[0.98] z-10" style={{background: 'linear-gradient(135deg, #2563eb, #1e40af)'}} data-testid="button-home-search">
          Search
        </button>
      </form>

      {/* Featured Jobs Section */}
      <div className="space-y-3 md:space-y-5">
        <h2 className="text-lg md:text-2xl font-black text-slate-800 pl-3 md:pl-4 border-l-4 border-blue-600">Featured Jobs</h2>
        
        {/* Mobile Featured Grid - 3 columns, simple bordered boxes */}
        <div className="md:hidden grid grid-cols-3 gap-1 border border-slate-300 bg-white">
          {featuredJobs.slice(0, 6).map((job) => (
            <Link key={job.id} href={`/job/${job.slug || job.id}`}>
              <div 
                className="border border-slate-200 p-2 h-full cursor-pointer bg-white hover:bg-blue-50"
                data-testid={`card-featured-mobile-${job.id}`}
              >
                <span className="text-blue-700 text-[10px] font-semibold leading-tight block hover:underline line-clamp-3">
                  {job.title}
                </span>
              </div>
            </Link>
          ))}
          {featuredJobs.length === 0 && <p className="col-span-3 text-center text-slate-400 py-4 text-xs">No featured jobs</p>}
        </div>

        {/* Desktop Featured Grid - Original styling */}
        <div className="hidden md:grid md:grid-cols-4 gap-5 p-8 rounded-[16px] border-2 border-[#3b82f6] shadow-[0_10px_28px_rgba(59,130,246,0.25)]" style={{background: 'linear-gradient(180deg, #f8fbff, #eef5ff)'}}>
          {featuredJobs.map((job) => (
            <Link key={job.id} href={`/job/${job.slug || job.id}`}>
              <div 
                className="featured-job-card bg-white border-l-[6px] border-l-[#1e3a5f] border-y border-r border-slate-200/80 rounded-xl p-5 h-full cursor-pointer shadow-[0_8px_22px_rgba(0,0,0,0.08)] flex flex-col justify-between group"
                data-testid={`card-featured-${job.id}`}
              >
                <div>
                  <div className="flex mb-3">
                    <span 
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${job.trending ? 'bg-[#fde68a] text-[#1e293b] border border-amber-300' : 'bg-[#dbeafe] text-[#1e3a5f] border border-blue-300'}`}
                    >
                      {job.trending ? 'Trending' : 'New'}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base leading-snug text-[#1e3a5f] group-hover:text-[#1d4ed8] transition-colors duration-300">
                    {job.title}
                  </h3>
                </div>
                <div className="mt-4 flex items-center text-xs text-slate-500 font-semibold group-hover:text-blue-700 transition-colors duration-300">
                  <span>View Details</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-1.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </div>
              </div>
            </Link>
          ))}
          {featuredJobs.length === 0 && <p className="col-span-full text-center text-slate-400 py-12 text-sm">No featured jobs currently available.</p>}
        </div>
      </div>

      {/* Mobile: 2-column grid for Latest Jobs + Admit Card */}
      <div className="md:hidden grid grid-cols-2 gap-1">
        <CategoryBlock title="Latest Jobs" jobs={latestJobs} href="/latest-jobs" mobileVariant={true} />
        <CategoryBlock title="Admit Card" jobs={admitCards} href="/admit-card" mobileVariant={true} />
      </div>

      {/* Mobile: 2-column grid for Results + Answer Key */}
      <div className="md:hidden grid grid-cols-2 gap-1">
        <CategoryBlock title="Results" jobs={results} href="/results" mobileVariant={true} />
        <CategoryBlock title="Answer Key" jobs={answerKeys} href="/answer-key" mobileVariant={true} />
      </div>

      {/* Mobile: Admission section - full width */}
      <div className="md:hidden">
        <CategoryBlock title="Admission" jobs={admission} href="/admission" mobileVariant={true} />
      </div>

      {/* Desktop: Main 3 Column Grid */}
      <div className="hidden md:grid md:grid-cols-3 gap-7 relative z-10">
        <CategoryBlock title="Latest Jobs" jobs={latestJobs} href="/latest-jobs" />
        <CategoryBlock title="Admit Cards" jobs={admitCards} href="/admit-card" />
        <CategoryBlock title="Results" jobs={results} href="/results" />
      </div>

      {/* Desktop: Secondary Blocks Row */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-7">
        <CategoryBlock title="Answer Key" jobs={answerKeys} href="/answer-key" />
        <CategoryBlock title="Admission" jobs={admission} href="/admission" />
        <div className="portal-card bg-gradient-to-br from-slate-50 to-blue-50/30 p-8 flex flex-col justify-center text-center space-y-5">
          <h3 className="font-black text-blue-800 uppercase text-base tracking-widest border-b-2 border-blue-100 pb-3">Information Portal</h3>
          <p className="text-sm text-slate-600 font-medium leading-relaxed">
            Get 100% verified updates on all government exams and results. India's trusted informational source.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/syllabus">
              <span className="block bg-blue-700 text-white text-xs font-bold py-3.5 rounded-lg uppercase hover:bg-blue-800 transition-colors duration-200 cursor-pointer shadow-md hover:shadow-lg">
                Syllabus
              </span>
            </Link>
            <Link href="/contact">
              <span className="block bg-slate-700 text-white text-xs font-bold py-3.5 rounded-lg uppercase hover:bg-slate-800 transition-colors duration-200 cursor-pointer shadow-md hover:shadow-lg">
                Contact
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
