import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useJobs } from "@/lib/useJobs";
import { useSEO, generateHomeMeta } from "@/components/SEO";
import { usePageTracker } from "@/lib/usePageTracker";

const categoryColors: Record<string, { header: string; badge: string; dot: string }> = {
  "Latest Jobs":  { header: "bg-blue-700",  badge: "bg-blue-100 text-blue-700",  dot: "bg-blue-500" },
  "Admit Cards":  { header: "bg-green-700", badge: "bg-green-100 text-green-700", dot: "bg-green-500" },
  "Results":      { header: "bg-red-700",   badge: "bg-red-100 text-red-700",     dot: "bg-red-500" },
  "Answer Key":   { header: "bg-purple-700",badge: "bg-purple-100 text-purple-700",dot: "bg-purple-500" },
  "Admission":    { header: "bg-orange-600",badge: "bg-orange-100 text-orange-700",dot: "bg-orange-500" },
};

function CategoryBlock({ title, jobs, href }: { title: string; jobs: any[]; href: string }) {
  const colors = categoryColors[title] || { header: "bg-blue-700", badge: "bg-blue-100 text-blue-700", dot: "bg-blue-500" };

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 bg-white">
      {/* Header */}
      <div className={`${colors.header} px-4 py-3 flex items-center justify-between`}>
        <span className="text-white font-bold text-sm tracking-wide uppercase">{title}</span>
        <Link href={href}>
          <span className="text-white/80 hover:text-white text-xs font-semibold cursor-pointer underline underline-offset-2">
            View All
          </span>
        </Link>
      </div>

      {/* Job List */}
      <div className="flex-1 divide-y divide-slate-100">
        {jobs.slice(0, 10).map((job) => (
          <Link key={job.id} href={`/job/${job.slug || job.id}`}>
            <div className="flex items-start gap-2 px-3 py-2.5 hover:bg-slate-50 cursor-pointer group transition-colors duration-150">
              <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${colors.dot}`}></span>
              <span className="text-slate-700 group-hover:text-blue-700 text-sm font-medium leading-snug line-clamp-2 transition-colors duration-150">
                {job.title}
              </span>
            </div>
          </Link>
        ))}
        {jobs.length === 0 && (
          <div className="flex items-center justify-center py-10 text-slate-400 text-sm">
            No updates available
          </div>
        )}
      </div>

      {/* Footer */}
      <Link href={href}>
        <div className="border-t border-slate-200 bg-slate-50 hover:bg-slate-100 px-4 py-2.5 text-center cursor-pointer transition-colors duration-150">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">View All {title}</span>
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
      navigate("/search");
    }
  };

  const latestJobs  = jobs.filter((j) => j.type === "job").slice(0, 10);
  const admitCards  = jobs.filter((j) => j.type === "admit-card").slice(0, 10);
  const results     = jobs.filter((j) => j.type === "result").slice(0, 10);
  const answerKeys  = jobs.filter((j) => j.type === "answer-key").slice(0, 10);
  const admission   = jobs.filter((j) => j.type === "admission").slice(0, 10);
  const featuredJobs = jobs.filter((j) => j.featured || j.trending).slice(0, 6);

  return (
    <div className="space-y-6">

      {/* Search Bar */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-xl p-6 md:p-10 shadow-lg">
        <h1 className="text-white text-center font-black text-xl md:text-3xl mb-2 tracking-tight">
          Sarkari Job Portal
        </h1>
        <p className="text-blue-200 text-center text-sm mb-6">Latest Govt Jobs, Results, Admit Cards & More</p>
        <form onSubmit={handleHomeSearch} className="flex gap-3 max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Search jobs, results, admit cards..."
            className="flex-1 px-4 py-3 rounded-lg border-2 border-blue-400 focus:border-white outline-none text-sm font-semibold text-slate-800 placeholder:text-slate-400"
            value={homeSearch}
            onChange={(e) => setHomeSearch(e.target.value)}
          />
          <button
            type="submit"
            className="bg-white text-blue-800 px-6 py-3 rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors duration-200 shadow-md"
          >
            Search
          </button>
        </form>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Latest Jobs",  count: jobs.filter(j => j.type === "job").length,        color: "bg-blue-50 border-blue-200 text-blue-700" },
          { label: "Admit Cards",  count: jobs.filter(j => j.type === "admit-card").length,  color: "bg-green-50 border-green-200 text-green-700" },
          { label: "Results",      count: jobs.filter(j => j.type === "result").length,       color: "bg-red-50 border-red-200 text-red-700" },
          { label: "Answer Keys",  count: jobs.filter(j => j.type === "answer-key").length,  color: "bg-purple-50 border-purple-200 text-purple-700" },
        ].map((stat) => (
          <div key={stat.label} className={`border rounded-xl p-4 text-center ${stat.color}`}>
            <div className="text-2xl font-black">{stat.count}+</div>
            <div className="text-xs font-bold uppercase tracking-wide mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Featured / Trending */}
      {featuredJobs.length > 0 && (
        <div>
          <h2 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-600 rounded-full inline-block"></span>
            Featured & Trending
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {featuredJobs.map((job) => (
              <Link key={job.id} href={`/job/${job.slug || job.id}`}>
                <div className="border border-slate-200 rounded-xl p-4 bg-white hover:border-blue-400 hover:shadow-md transition-all duration-200 cursor-pointer group">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${job.trending ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>
                        {job.trending ? "Trending" : "Featured"}
                      </span>
                      <p className="text-sm font-bold text-slate-700 group-hover:text-blue-700 mt-1 leading-snug transition-colors duration-150">
                        {job.title}
                      </p>
                      {job.lastDate && (
                        <p className="text-xs text-red-600 font-semibold mt-1">Last Date: {job.lastDate}</p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Main 3 Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CategoryBlock title="Latest Jobs" jobs={latestJobs} href="/latest-jobs" />
        <CategoryBlock title="Admit Cards" jobs={admitCards} href="/admit-card" />
        <CategoryBlock title="Results"     jobs={results}    href="/results" />
      </div>

      {/* Secondary 2 Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CategoryBlock title="Answer Key" jobs={answerKeys} href="/answer-key" />
        <CategoryBlock title="Admission"  jobs={admission}  href="/admission" />
      </div>

    </div>
  );
}
