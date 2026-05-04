import { useState, useEffect } from "react";
import { Link, useRoute, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Filter, MapPin, Calendar, Search } from "lucide-react";
import { useSEO, generateListMeta } from "@/components/SEO";
import { usePageTracker } from "@/lib/usePageTracker";
import type { Post } from "@shared/schema";

export default function JobList() {
  const searchParams = useSearch();
  const urlQuery = new URLSearchParams(searchParams).get('q') || '';
  const [searchTerm, setSearchTerm] = useState(urlQuery);
  
  useEffect(() => {
    setSearchTerm(urlQuery);
  }, [urlQuery]);

  const [matchSearch] = useRoute("/search");
  const [matchLatest] = useRoute("/latest-jobs");
  const [matchAdmit] = useRoute("/admit-card");
  const [matchResults] = useRoute("/results");
  const [matchAnswer] = useRoute("/answer-key");
  const [matchAdmission] = useRoute("/admission");

  const [activeFilters, setActiveFilters] = useState({
    qualification: "All",
    state: "All"
  });

  const getPageConfig = () => {
    if (matchSearch) return { title: "Search Results", type: "all" };
    if (matchLatest) return { title: "Latest Jobs", type: "job" };
    if (matchAdmit) return { title: "Admit Cards", type: "admit-card" };
    if (matchResults) return { title: "Exam Results", type: "result" };
    if (matchAnswer) return { title: "Answer Keys", type: "answer-key" };
    if (matchAdmission) return { title: "Admissions", type: "admission" };
    return { title: "Job Listings", type: "job" };
  };

  const config = getPageConfig();
  
  useSEO(generateListMeta(config.type, urlQuery || undefined));
  usePageTracker(config.type === 'all' ? 'search' : config.type);

  const buildApiUrl = () => {
    const params = new URLSearchParams();
    
    if (config.type !== "all") {
      params.set("type", config.type);
    }
    
    if (activeFilters.qualification !== "All") {
      params.set("qualification", activeFilters.qualification);
    }
    
    if (activeFilters.state !== "All") {
      params.set("state", activeFilters.state);
    }
    
    const queryString = params.toString();
    return queryString ? `/api/posts?${queryString}` : "/api/posts";
  };

  const apiUrl = buildApiUrl();

  const { data: jobs = [], isLoading } = useQuery<Post[]>({
    queryKey: ['posts', config.type, activeFilters.qualification, activeFilters.state],
    queryFn: async () => {
      const res = await fetch(apiUrl, {
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
      });
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    staleTime: 0,
    gcTime: 0,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Loading...</p>
        </div>
      </div>
    );
  }

  const filteredJobs = searchTerm 
    ? jobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        job.department.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : jobs;

  return (
    <div className="flex flex-col md:grid md:grid-cols-4 gap-8">
      {/* Sidebar - Filter Jobs */}
      <aside className="order-1 md:order-1 md:col-span-1 md:row-span-2 space-y-4 md:space-y-6 w-full">
        <div className="portal-card p-4 md:p-7 bg-white shadow-lg border-slate-200/80">
          <h3 className="font-extrabold text-blue-800 text-sm md:text-sm uppercase tracking-wide md:tracking-widest mb-4 md:mb-8 border-b-2 border-blue-100 pb-2 md:pb-3 flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filter Jobs
          </h3>
          
          <div className="space-y-4 md:space-y-6">
            <div className="space-y-2 md:space-y-4">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-wide block">Qualification</label>
              <div className="grid grid-cols-2 md:grid-cols-1 gap-2 md:space-y-3 md:block">
                {["All", "10th Pass", "12th Pass", "Graduation", "Post Graduate"].map(q => (
                  <label key={q} className="flex items-center gap-2 md:gap-3 text-xs md:text-sm font-medium text-slate-600 cursor-pointer hover:text-blue-700 group transition-colors duration-200">
                    <input 
                      type="radio" 
                      name="qualification" 
                      checked={activeFilters.qualification === q} 
                      onChange={() => setActiveFilters({...activeFilters, qualification: q})} 
                      className="w-4 h-4 md:w-5 md:h-5 text-blue-700 accent-blue-600" 
                    />
                    <span>{q}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2 md:space-y-4">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-wide block">Select State</label>
              <div className="grid grid-cols-2 md:grid-cols-1 gap-2 md:space-y-3 md:block">
                {["All", "Uttar Pradesh", "Bihar", "Rajasthan", "Haryana", "Delhi", "All India"].map(s => (
                  <label key={s} className="flex items-center gap-2 md:gap-3 text-xs md:text-sm font-medium text-slate-600 cursor-pointer hover:text-blue-700 group transition-colors duration-200">
                    <input 
                      type="radio" 
                      name="state" 
                      checked={activeFilters.state === s} 
                      onChange={() => setActiveFilters({...activeFilters, state: s})} 
                      className="w-4 h-4 md:w-5 md:h-5 text-blue-700 accent-blue-600" 
                    />
                    <span>{s}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Search Box - order 2 on mobile */}
      <div className="order-2 md:order-2 md:col-span-3 w-full">
        <div className="portal-card p-3 md:p-6 bg-white shadow-md">
          <div className="relative">
            <Search className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 text-blue-500 w-4 h-4 md:w-5 md:h-5" />
            <input 
              type="text" 
              placeholder={`Search in ${config.title}...`}
              className="w-full pl-10 md:pl-14 pr-4 md:pr-5 py-3 md:py-4 bg-slate-50 border border-slate-200 md:border-2 rounded-lg md:rounded-xl focus:border-blue-500 focus:bg-white outline-none font-medium text-sm md:text-base transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Jobs List - order 3 on mobile */}
      <div className="order-3 md:order-3 md:col-span-3 md:col-start-2 w-full">
        <div className="portal-card bg-white shadow-md overflow-hidden border border-slate-200">
          <div className="bg-[#800000] md:bg-blue-700 text-white p-3 md:p-5">
            <h2 className="font-extrabold uppercase text-sm md:text-sm tracking-wide md:tracking-widest text-center md:text-left">{config.title} Updates</h2>
          </div>

          <div className="divide-y divide-slate-200">
            {filteredJobs.map(job => (
              <div key={job.id} className="p-3 md:p-7 hover:bg-blue-50/30 transition-all duration-200 group flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-6">
                <div className="space-y-1.5 md:space-y-3 flex-grow">
                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                    <span className="bg-blue-50 text-blue-700 text-[9px] md:text-[10px] font-bold px-2 md:px-3 py-1 md:py-1.5 rounded uppercase border border-blue-100">{job.qualification || "Graduation"}</span>
                    <span className="bg-emerald-50 text-emerald-700 text-[9px] md:text-[10px] font-bold px-2 md:px-3 py-1 md:py-1.5 rounded uppercase border border-emerald-100">{job.state || "All India"}</span>
                  </div>
                  <Link href={`/job/${job.slug || job.id}`}>
                    <h3 className="font-bold text-slate-800 text-base md:text-lg group-hover:text-blue-700 transition-colors duration-200 leading-normal cursor-pointer">
                      {job.title}
                    </h3>
                  </Link>
                  <div className="flex flex-wrap gap-3 md:gap-5 text-[10px] md:text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3 md:w-4 md:h-4" /> {job.department}</span>
                    {job.lastDate && <span className="flex items-center gap-1 text-rose-600 font-semibold"><Calendar className="w-3 h-3 md:w-4 md:h-4" /> Last: {job.lastDate}</span>}
                  </div>
                </div>
                <div className="shrink-0 mt-2 md:mt-0">
                  <Link href={`/job/${job.slug || job.id}`}>
                    <button className="w-full md:w-auto bg-blue-600 text-white px-4 md:px-7 py-2.5 md:py-3.5 font-bold text-xs uppercase tracking-wide md:tracking-widest rounded-lg hover:bg-blue-700 transition-all duration-200 active:scale-[0.98] shadow-md md:shadow-lg shadow-blue-600/20 hover:shadow-xl">
                      View Details
                    </button>
                  </Link>
                </div>
              </div>
            ))}
            {filteredJobs.length === 0 && (
              <div className="p-10 md:p-20 text-center">
                <p className="text-slate-400 font-medium text-sm">No results found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
