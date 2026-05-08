import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useJobs } from "@/lib/useJobs";
import { useSEO, generateHomeMeta } from "@/components/SEO";
import { usePageTracker } from "@/lib/usePageTracker";
import { ChevronRight, Briefcase, FileText, CheckSquare, Key, GraduationCap } from "lucide-react";

const CATEGORIES = [
  { title: "Latest Jobs",  type: "job",        href: "/latest-jobs", color: "bg-blue-600",   light: "bg-blue-50  text-blue-700  border-blue-200",  dot: "bg-blue-500",   icon: Briefcase },
  { title: "Admit Cards",  type: "admit-card", href: "/admit-card",  color: "bg-green-600",  light: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500",  icon: FileText },
  { title: "Results",      type: "result",     href: "/results",     color: "bg-red-600",    light: "bg-red-50   text-red-700   border-red-200",   dot: "bg-red-500",    icon: CheckSquare },
  { title: "Answer Key",   type: "answer-key", href: "/answer-key",  color: "bg-purple-600", light: "bg-purple-50 text-purple-700 border-purple-200",dot:"bg-purple-500",icon: Key },
  { title: "Admission",    type: "admission",  href: "/admission",   color: "bg-orange-500", light: "bg-orange-50 text-orange-700 border-orange-200",dot:"bg-orange-500",icon: GraduationCap },
];

function CategoryCard({ cat, jobs }: { cat: typeof CATEGORIES[0]; jobs: any[] }) {
  const Icon = cat.icon;
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
      {/* Header */}
      <div className={`${cat.color} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-white" />
          <span className="text-white font-black text-sm uppercase tracking-wide">{cat.title}</span>
        </div>
        <Link href={cat.href}>
          <div className="flex items-center gap-0.5 text-white/80 hover:text-white text-xs font-bold cursor-pointer">
            All <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>

      {/* List */}
      <div className="divide-y divide-slate-100">
        {jobs.slice(0, 8).map(job => (
          <Link key={job.id} href={`/job/${job.slug || job.id}`}>
            <div className="flex items-start gap-2.5 px-3 py-2.5 hover:bg-slate-50 active:bg-slate-100 cursor-pointer transition-colors">
              <span className={`mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 ${cat.dot}`} />
              <span className="text-slate-700 text-sm font-medium leading-snug line-clamp-2">
                {job.title}
              </span>
            </div>
          </Link>
        ))}
        {jobs.length === 0 && (
          <div className="py-8 text-center text-slate-400 text-sm">
            No updates yet
          </div>
        )}
      </div>

      {/* Footer */}
      <Link href={cat.href}>
        <div className={`border-t border-slate-100 py-2.5 text-center cursor-pointer hover:bg-slate-50 transition-colors`}>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">View All {cat.title}</span>
        </div>
      </Link>
    </div>
  );
}

export default function Home() {
  const [, navigate] = useLocation();
  const [homeSearch, setHomeSearch] = useState("");
  const { jobs, loading } = useJobs();

  useSEO(generateHomeMeta());
  usePageTracker("home");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 font-bold text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(homeSearch.trim() ? `/search?q=${encodeURIComponent(homeSearch.trim())}` : "/search");
  };

  const jobsByType = (type: string) => jobs.filter(j => j.type === type);
  const trending = jobs.filter(j => j.trending || j.featured).slice(0, 6);

  return (
    <div className="space-y-5">

      {/* Hero Search */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl p-5 md:p-10 shadow-xl">
        <div className="text-center mb-5">
          <h1 className="text-white font-black text-2xl md:text-4xl tracking-tight">SarkariJobSeva</h1>
          <p className="text-blue-200 text-sm mt-1">सरकारी नौकरी, सुरक्षित भविष्य</p>
        </div>
        <form onSubmit={handleSearch} style={{width:'100%', maxWidth:'560px', margin:'0 auto'}}>
          <div style={{display:'flex', alignItems:'center', backgroundColor:'white', borderRadius:'14px', overflow:'hidden'}}>
            <input
              type="text"
              placeholder="Search Jobs, Admit Cards, Results..."
              style={{flex:1, minWidth:0, border:'none', outline:'none', fontSize:'15px', fontWeight:500, color:'#1e293b', backgroundColor:'white', padding:'14px 16px'}}
              value={homeSearch}
              onChange={e => setHomeSearch(e.target.value)}
            />
            <button type="submit" style={{backgroundColor:'#1d4ed8', color:'white', border:'none', padding:'14px 20px', fontWeight:700, fontSize:'14px', cursor:'pointer', flexShrink:0}}>
              Search
            </button>
          </div>
        </form>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2 mt-5">
          {CATEGORIES.slice(0, 4).map(cat => (
            <Link key={cat.type} href={cat.href}>
              <div className="bg-white/10 hover:bg-white/20 rounded-xl p-2 text-center cursor-pointer transition-colors">
                <div className="text-white font-black text-lg">{jobsByType(cat.type).length}</div>
                <div className="text-blue-200 text-[10px] font-bold leading-tight">{cat.title}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Trending Section */}
      {trending.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-blue-600 rounded-full" />
            <h2 className="font-black text-slate-800 text-base uppercase tracking-wide">🔥 Trending Now</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {trending.map(job => (
              <Link key={job.id} href={`/job/${job.slug || job.id}`}>
                <div className="bg-white border border-slate-200 rounded-xl p-3.5 hover:border-blue-400 hover:shadow-md active:scale-[0.99] transition-all cursor-pointer group">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-[10px] bg-yellow-100 text-yellow-700 font-bold px-2 py-0.5 rounded-full border border-yellow-200">
                          🔥 Hot
                        </span>
                        {job.lastDate && (
                          <span className="text-[10px] text-red-600 font-bold">
                            Last: {job.lastDate}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-slate-800 group-hover:text-blue-700 leading-snug transition-colors">
                        {job.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 font-medium">{job.department}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 flex-shrink-0 mt-1 transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Mobile: Quick Category Buttons */}
      <div className="md:hidden grid grid-cols-5 gap-2">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          return (
            <Link key={cat.type} href={cat.href}>
              <div className="flex flex-col items-center gap-1 cursor-pointer">
                <div className={`w-12 h-12 ${cat.color} rounded-2xl flex items-center justify-center shadow-sm`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-[10px] font-bold text-slate-600 text-center leading-tight">{cat.title}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main Grid — Mobile 1 col, Desktop 3 col */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CATEGORIES.slice(0, 3).map(cat => (
          <CategoryCard key={cat.type} cat={cat} jobs={jobsByType(cat.type)} />
        ))}
      </div>

      {/* Secondary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CATEGORIES.slice(3).map(cat => (
          <CategoryCard key={cat.type} cat={cat} jobs={jobsByType(cat.type)} />
        ))}
      </div>

    </div>
  );
}
