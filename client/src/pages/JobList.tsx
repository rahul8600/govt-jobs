import { useState, useEffect } from "react";
import { Link, useRoute, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Filter, MapPin, Calendar, Search, ChevronRight } from "lucide-react";
import { useSEO, generateListMeta } from "@/components/SEO";
import { usePageTracker } from "@/lib/usePageTracker";
import type { Post } from "@shared/schema";

const STATE_KEYWORDS: Record<string, string[]> = {
  "Uttar Pradesh": ["uttar pradesh", "up ", "upsssc", "uppsc", "uptet", "upssc", "uppolice", "jeecup", "allahabad", "lucknow", "varanasi"],
  "Bihar":         ["bihar", "bpsc", "btsc", "bseb", "bpssc", "patna", "ofss"],
  "Rajasthan":     ["rajasthan", "rssb", "rsmssb", "rpsc", "jaipur"],
  "Haryana":       ["haryana", "hpsc", "hssc", "rohtak", "gurugram", "faridabad"],
  "Delhi":         ["delhi", "dsssb", "dmrc", "delhipolice"],
  "Madhya Pradesh":["madhya pradesh", "mp ", "mpesb", "mppsc", "bhopal", "mptet"],
  "Maharashtra":   ["maharashtra", "msbshse", "mpsc", "pune", "mumbai", "nagpur"],
  "All India":     ["central", "india", "national", "rrb", "ssc", "upsc", "crpf", "bsf", "cisf", "army", "navy", "airforce", "indian", "nta", "rbi", "ibps", "railway", "ntpc", "iit", "nit", "ncl", "ib ", "union bank"],
};

function matchesState(job: Post, state: string): boolean {
  if (state === "All") return true;
  const keywords = STATE_KEYWORDS[state] || [];
  const haystack = `${job.title} ${job.department} ${job.state || ""}`.toLowerCase();
  return keywords.some(kw => haystack.includes(kw));
}

function matchesQualification(job: Post, qual: string): boolean {
  if (qual === "All") return true;
  const q = (job.qualification || "").toLowerCase();
  if (qual === "10th Pass") return q.includes("10th") || q.includes("matriculation");
  if (qual === "12th Pass") return q.includes("12th") || q.includes("intermediate") || q.includes("hs");
  if (qual === "Graduation") return q.includes("graduation") || q.includes("graduate") || q.includes("degree") || q.includes("bachelor");
  if (qual === "Post Graduate") return q.includes("post") || q.includes("master") || q.includes("pg");
  return true;
}

const PAGE_COLORS: Record<string, { header: string; badge: string; border: string }> = {
  "job":       { header: "bg-blue-700",   badge: "bg-blue-100 text-blue-700",   border: "border-blue-600" },
  "admit-card":{ header: "bg-green-700",  badge: "bg-green-100 text-green-700", border: "border-green-600" },
  "result":    { header: "bg-red-700",    badge: "bg-red-100 text-red-700",     border: "border-red-600" },
  "answer-key":{ header: "bg-purple-700", badge: "bg-purple-100 text-purple-700",border: "border-purple-600" },
  "admission": { header: "bg-orange-600", badge: "bg-orange-100 text-orange-700",border: "border-orange-600" },
  "all":       { header: "bg-slate-700",  badge: "bg-slate-100 text-slate-700", border: "border-slate-600" },
};

export default function JobList() {
  const searchParams = useSearch();
  const urlQuery = new URLSearchParams(searchParams).get("q") || "";
  const [searchTerm, setSearchTerm] = useState(urlQuery);

  useEffect(() => { setSearchTerm(urlQuery); }, [urlQuery]);

  const [matchSearch]    = useRoute("/search");
  const [matchLatest]    = useRoute("/latest-jobs");
  const [matchAdmit]     = useRoute("/admit-card");
  const [matchResults]   = useRoute("/results");
  const [matchAnswer]    = useRoute("/answer-key");
  const [matchAdmission] = useRoute("/admission");

  const [qualification, setQualification] = useState("All");
  const [state, setState]                 = useState("All");
  const [showFilter, setShowFilter]       = useState(false);

  const getPageConfig = () => {
    if (matchSearch)    return { title: "Search Results", type: "all" };
    if (matchLatest)    return { title: "Latest Jobs",    type: "job" };
    if (matchAdmit)     return { title: "Admit Cards",    type: "admit-card" };
    if (matchResults)   return { title: "Exam Results",   type: "result" };
    if (matchAnswer)    return { title: "Answer Keys",    type: "answer-key" };
    if (matchAdmission) return { title: "Admissions",     type: "admission" };
    return { title: "Job Listings", type: "job" };
  };

  const config = getPageConfig();
  const colors = PAGE_COLORS[config.type] || PAGE_COLORS["all"];

  useSEO(generateListMeta(config.type, urlQuery || undefined));
  usePageTracker(config.type === "all" ? "search" : config.type);

  const apiUrl = config.type !== "all" ? `/api/posts?type=${config.type}` : "/api/posts";

  const { data: jobs = [], isLoading } = useQuery<Post[]>({
    queryKey: ["posts", config.type],
    queryFn: async () => {
      const res = await fetch(apiUrl, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    staleTime: 0,
  });

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchTerm ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && matchesState(job, state) && matchesQualification(job, qualification);
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Page Header */}
      <div className={`${colors.header} rounded-xl px-5 py-4 flex items-center justify-between`}>
        <div>
          <h1 className="text-white font-black text-lg uppercase tracking-wide">{config.title}</h1>
          <p className="text-white/70 text-xs mt-0.5">{filteredJobs.length} results found</p>
        </div>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="md:hidden bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <Filter className="w-3.5 h-3.5" /> Filter
        </button>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-4 gap-4">

        {/* Sidebar Filter */}
        <aside className={`md:block ${showFilter ? "block" : "hidden"} md:col-span-1`}>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-800 px-4 py-3 flex items-center gap-2">
              <Filter className="w-4 h-4 text-white" />
              <span className="text-white font-bold text-sm uppercase tracking-wide">Filter</span>
            </div>

            <div className="p-4 space-y-5">
              {/* Search */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 bg-slate-50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Qualification Filter */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Qualification</label>
                <div className="space-y-2">
                  {["All", "10th Pass", "12th Pass", "Graduation", "Post Graduate"].map(q => (
                    <label key={q} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="radio"
                        name="qualification"
                        checked={qualification === q}
                        onChange={() => setQualification(q)}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span className={`text-sm font-medium transition-colors ${qualification === q ? "text-blue-700 font-bold" : "text-slate-600 group-hover:text-blue-600"}`}>{q}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* State Filter */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">State</label>
                <div className="space-y-2">
                  {["All", "All India", "Uttar Pradesh", "Bihar", "Rajasthan", "Haryana", "Delhi", "Madhya Pradesh", "Maharashtra"].map(s => (
                    <label key={s} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="radio"
                        name="state"
                        checked={state === s}
                        onChange={() => setState(s)}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span className={`text-sm font-medium transition-colors ${state === s ? "text-blue-700 font-bold" : "text-slate-600 group-hover:text-blue-600"}`}>{s}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Reset */}
              {(qualification !== "All" || state !== "All" || searchTerm) && (
                <button
                  onClick={() => { setQualification("All"); setState("All"); setSearchTerm(""); }}
                  className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs py-2 rounded-lg transition-colors uppercase tracking-wide"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Job List */}
        <div className="md:col-span-3 space-y-3">
          {filteredJobs.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-16 text-center">
              <p className="text-slate-400 font-medium">No results found. Try different filters.</p>
              <button
                onClick={() => { setQualification("All"); setState("All"); setSearchTerm(""); }}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-700"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            filteredJobs.map(job => (
              <div key={job.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200 group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    {/* Badges */}
                    <div className="flex flex-wrap gap-1.5">
                      {job.qualification && (
                        <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-100 uppercase">
                          {job.qualification}
                        </span>
                      )}
                      {job.trending && (
                        <span className="bg-yellow-50 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-yellow-200 uppercase">
                          Trending
                        </span>
                      )}
                      {job.featured && (
                        <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200 uppercase">
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <Link href={`/job/${job.slug || job.id}`}>
                      <h3 className="font-bold text-slate-800 text-base group-hover:text-blue-700 transition-colors cursor-pointer leading-snug">
                        {job.title}
                      </h3>
                    </Link>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {job.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Posted: {job.postDate}
                      </span>
                      {job.lastDate && (
                        <span className="flex items-center gap-1 text-red-600 font-bold">
                          <Calendar className="w-3.5 h-3.5" /> Last Date: {job.lastDate}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Button */}
                  <Link href={`/job/${job.slug || job.id}`}>
                    <button className={`hidden md:flex items-center gap-1.5 ${colors.header} text-white px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide hover:opacity-90 transition-opacity shadow-sm flex-shrink-0`}>
                      View <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                </div>

                {/* Mobile View Button */}
                <Link href={`/job/${job.slug || job.id}`}>
                  <button className={`md:hidden mt-3 w-full ${colors.header} text-white py-2 rounded-lg text-xs font-bold uppercase tracking-wide hover:opacity-90 transition-opacity`}>
                    View Details
                  </button>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
