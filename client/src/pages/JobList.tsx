import { useState, useEffect, useCallback } from "react";
import { Link, useRoute, useSearch, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Filter, MapPin, Calendar, Search, ChevronRight, ChevronLeft } from "lucide-react";
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

// Check if last date is expiring soon (within 7 days)
function isExpiringSoon(lastDate: string | null): boolean {
  if (!lastDate) return false;
  try {
    const parts = lastDate.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
    if (!parts) return false;
    const date = new Date(`${parts[3]}-${parts[2].padStart(2,'0')}-${parts[1].padStart(2,'0')}`);
    const diff = (date.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  } catch { return false; }
}

const PAGE_COLORS: Record<string, { header: string; badge: string; border: string }> = {
  "job":        { header: "bg-blue-700",   badge: "bg-blue-100 text-blue-700",    border: "border-blue-600" },
  "admit-card": { header: "bg-green-700",  badge: "bg-green-100 text-green-700",  border: "border-green-600" },
  "result":     { header: "bg-red-700",    badge: "bg-red-100 text-red-700",      border: "border-red-600" },
  "answer-key": { header: "bg-purple-700", badge: "bg-purple-100 text-purple-700",border: "border-purple-600" },
  "admission":  { header: "bg-orange-600", badge: "bg-orange-100 text-orange-700",border: "border-orange-600" },
  "all":        { header: "bg-slate-700",  badge: "bg-slate-100 text-slate-700",  border: "border-slate-600" },
};

const ITEMS_PER_PAGE = 20;

export default function JobList() {
  const searchParams = useSearch();
  const [, navigate] = useLocation();
  const urlQuery = new URLSearchParams(searchParams).get("q") || "";
  const urlPage = parseInt(new URLSearchParams(searchParams).get("page") || "1");

  const [inputValue, setInputValue]     = useState(urlQuery);
  const [debouncedSearch, setDebounced] = useState(urlQuery);
  const [page, setPage]                 = useState(urlPage);

  // Debounce search input — 350ms
  useEffect(() => {
    const t = setTimeout(() => setDebounced(inputValue), 350);
    return () => clearTimeout(t);
  }, [inputValue]);

  useEffect(() => { setInputValue(urlQuery); setDebounced(urlQuery); setPage(1); }, [urlQuery]);

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

  // Use dedicated search API if search term exists, else use type filter
  const isSearchMode = matchSearch && debouncedSearch.trim().length >= 2;
  // On /search page with no query — show empty, not all posts
  const noSearchQuery = matchSearch && debouncedSearch.trim().length < 2;

  const apiUrl = isSearchMode
    ? `/api/search?q=${encodeURIComponent(debouncedSearch)}&page=${page}&limit=${ITEMS_PER_PAGE}`
    : config.type !== "all"
      ? `/api/posts?type=${config.type}&page=${page}&limit=${ITEMS_PER_PAGE}`
      : `/api/posts?page=${page}&limit=${ITEMS_PER_PAGE}`;

  const { data: response, isLoading } = useQuery<any>({
    queryKey: ["posts", config.type, debouncedSearch, page],
    queryFn: async () => {
      if (noSearchQuery) return { data: [], total: 0, totalPages: 0 };
      const res = await fetch(apiUrl, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    staleTime: 0,
  });

  // Handle both array (old) and paginated (new) response
  const jobs: Post[] = noSearchQuery ? [] : (Array.isArray(response) ? response : (response?.data || []));
  const totalPages = response?.totalPages || Math.ceil(jobs.length / ITEMS_PER_PAGE) || 1;

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !debouncedSearch || isSearchMode ||
      job.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      job.department.toLowerCase().includes(debouncedSearch.toLowerCase());
    return matchesSearch && matchesState(job, state) && matchesQualification(job, qualification);
  });

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) navigate(`/search?q=${encodeURIComponent(inputValue.trim())}`);
  }, [inputValue, navigate]);

  const goToPage = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
              {/* Search with debounce */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Search</label>
                <form onSubmit={handleSearchSubmit}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 bg-slate-50"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                    />
                  </div>
                </form>
              </div>

              {/* Qualification Filter */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Qualification</label>
                <div className="space-y-2">
                  {["All", "10th Pass", "12th Pass", "Graduation", "Post Graduate"].map(q => (
                    <label key={q} className="flex items-center gap-2.5 cursor-pointer group">
                      <input type="radio" name="qualification" checked={qualification === q} onChange={() => setQualification(q)} className="w-4 h-4 accent-blue-600" />
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
                      <input type="radio" name="state" checked={state === s} onChange={() => setState(s)} className="w-4 h-4 accent-blue-600" />
                      <span className={`text-sm font-medium transition-colors ${state === s ? "text-blue-700 font-bold" : "text-slate-600 group-hover:text-blue-600"}`}>{s}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Reset */}
              {(qualification !== "All" || state !== "All" || inputValue) && (
                <button
                  onClick={() => { setQualification("All"); setState("All"); setInputValue(""); setDebounced(""); }}
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
              {noSearchQuery ? (
                <p className="text-slate-400 font-medium">Type something to search...</p>
              ) : (
                <>
                  <p className="text-slate-400 font-medium">No results found. Try different filters.</p>
                  <button
                    onClick={() => { setQualification("All"); setState("All"); setInputValue(""); setDebounced(""); }}
                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-700"
                  >
                    Clear Filters
                  </button>
                </>
              )}
            </div>
          ) : (
            filteredJobs.map(job => {
              const expiringSoon = isExpiringSoon(job.lastDate);
              return (
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
                            🔥 Trending
                          </span>
                        )}
                        {job.featured && (
                          <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200 uppercase">
                            ⭐ Featured
                          </span>
                        )}
                        {expiringSoon && (
                          <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-200 uppercase animate-pulse">
                            ⚠️ Closing Soon!
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
                          <span className={`flex items-center gap-1 font-bold ${expiringSoon ? 'text-red-600' : 'text-orange-600'}`}>
                            <Calendar className="w-3.5 h-3.5" /> Last Date: {job.lastDate}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Desktop Button */}
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
              );
            })
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4 pb-2">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p = i + 1;
                if (totalPages > 5) {
                  if (page <= 3) p = i + 1;
                  else if (page >= totalPages - 2) p = totalPages - 4 + i;
                  else p = page - 2 + i;
                }
                return (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${
                      p === page
                        ? `${colors.header} text-white shadow-sm`
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SEO Content Block — intro + coverage + FAQ — only on category pages */}
      {!matchSearch && config.type !== "all" && (
        <PageSEOBlock type={config.type} />
      )}

    </div>
  );
}

// ─── Per-page SEO Content Blocks ─────────────────────────────────────────────

const PAGE_CONTENT: Record<string, {
  intro: string;
  points: string[];
  faqs: { q: string; a: string }[];
}> = {
  job: {
    intro: "SarkariJobSeva.com पर आपका स्वागत है — भारत का सबसे तेज़ और भरोसेमंद सरकारी नौकरी पोर्टल। यहां SSC, Railway, UPSC, Bank, Police, Army, Anganwadi, Teacher Bharti समेत केंद्र और राज्य सरकार की सभी नई भर्तियां रोज़ अपडेट होती हैं। 10वीं, 12वीं, Graduation और Post Graduate — हर योग्यता के लिए jobs यहां मिलेंगी।",
    points: [
      "SSC CGL, CHSL, MTS, GD — Staff Selection Commission की सभी भर्तियां",
      "Railway RRB ALP, Group D, NTPC, JE — Indian Railways की latest vacancies",
      "UPSC Civil Services, NDA, CDS, CAPF — Union Public Service Commission",
      "IBPS PO, Clerk, SO, RRB — Bank jobs की सम्पूर्ण जानकारी",
      "UP Police, Bihar Police, Rajasthan Police — State Police Bharti",
      "Army, Navy, Airforce — Defense Sector Recruitment",
      "Teacher Bharti — CTET, STET, UP TET, Bihar TET, KVS, NVS",
      "Anganwadi, ASHA Worker, Home Guard, Peon — Non-Technical Posts",
    ],
    faqs: [
      { q: "नई सरकारी नौकरी कैसे ढूंढें?", a: "ऊपर दिए Search Box में Job Title या Department का नाम डालें। या Qualification और State Filter use करें। हर job card पर click करके पूरी जानकारी — Vacancy Details, Important Dates, Apply Link — सब मिलेगा।" },
      { q: "Apply Online कैसे करें?", a: "किसी भी Job पर click करें। Important Links section में Apply Online का Direct Official Link मिलेगा। Official Website पर जाकर Registration करें, Form भरें, Fee Pay करें और Submit करें। Confirmation Print कर लें।" },
      { q: "10वीं पास के लिए कौन सी Jobs हैं?", a: "Railway Group D, SSC GD, SSC MTS, Army GD, Navy MR/SSR, UP Police Constable, Home Guard, Anganwadi Worker, Peon, Sweeper, Fire Fighter। Filter में '10th Pass' select करें।" },
      { q: "Qualification Filter कैसे काम करता है?", a: "Left sidebar में Qualification section से 10th Pass, 12th Pass, Graduation या Post Graduate select करें। Jobs automatically filter हो जाएंगी। State भी select कर सकते हैं — अपने State की Jobs अलग देखें।" },
      { q: "Last Date निकल जाए तो क्या करें?", a: "जिस job की Last Date निकल गई हो उसमें Apply नहीं हो सकता। लेकिन उसी Department की अगली Bharti के लिए तैयार रहें। हमारी site Bookmark करें — नई vacancy आते ही यहां दिखेगी।" },
    ],
  },
  "admit-card": {
    intro: "SarkariJobSeva.com पर सभी सरकारी परीक्षाओं के Admit Card / Hall Ticket का Direct Download Link मिलता है। SSC, Railway, UPSC, Bank, Police, Army, Teacher Exam — सभी के Admit Card यहां समय पर अपडेट होते हैं। Exam से पहले Admit Card ज़रूर Download करें।",
    points: [
      "SSC CGL, CHSL, MTS, GD, CPO — Tier 1, Tier 2 सभी Admit Card",
      "Railway RRB ALP, Group D, NTPC, JE, RPF — Hall Ticket",
      "UPSC Civil Services Prelims, Mains, NDA, CDS — Call Letter",
      "IBPS PO, Clerk, SO, RRB PO, Clerk — Bank Exam Admit Card",
      "UP Police, Bihar Police, BPSC, UPPSC — State Exam Hall Ticket",
      "CTET, UP TET, Bihar TET, HTET — Teacher Exam Admit Card",
      "KVS, NVS, Army, Navy, Airforce Admit Card",
    ],
    faqs: [
      { q: "Admit Card Download कैसे करें?", a: "इस page पर अपनी परीक्षा ढूंढें। Post पर click करें — Important Links में Admit Card Download का Direct Link मिलेगा। Official Website पर जाकर Registration Number और Date of Birth डालें और Download करें।" },
      { q: "Admit Card में क्या-क्या होता है?", a: "Candidate का नाम, Registration Number, Roll Number, Exam Date, Exam Time, Exam Center का नाम और पता, Photo, Signature और Exam के Instructions। सब details ध्यान से check करें।" },
      { q: "Admit Card में गलती हो तो क्या करें?", a: "तुरंत Official Website पर जाएं और Helpdesk / Contact section में complaint करें। Exam से कम से कम 2-3 दिन पहले करें। अपने Documents साथ रखें।" },
      { q: "Admit Card Exam में कब तक ज़रूरी है?", a: "Admit Card Exam के दिन अनिवार्य है — इसके बिना Exam Hall में Entry नहीं मिलती। साथ में एक Photo ID (Aadhar, Voter Card, PAN) भी लेकर जाएं।" },
      { q: "Admit Card Print नहीं हो रहा तो क्या करें?", a: "Browser में PDF Download करें और Print करें। या किसी Cyber Cafe पर जाकर Print करवाएं। Black & White Print भी accepted होती है। Color Photo ज़रूरी है तो Notification check करें।" },
    ],
  },
  result: {
    intro: "SarkariJobSeva.com पर सभी सरकारी परीक्षाओं के Results, Merit List और Cut-off Marks सबसे पहले Update होते हैं। SSC, Railway, UPSC, Bank, Police, Army — सभी के Exam Results का Direct Official Link यहां मिलता है। Result देखने के बाद Next Step की जानकारी भी यहां पाएं।",
    points: [
      "SSC CGL, CHSL, MTS, GD, CPO — Tier 1, Tier 2, Final Result",
      "Railway RRB Group D, ALP, NTPC, RPF — Selection List",
      "UPSC Civil Services Prelims, Mains, Final — IAS Result",
      "IBPS PO, Clerk, SO — Score Card और Final Merit List",
      "UP Police, Bihar Police, BPSC, UPPSC — State Exam Result",
      "CTET, UP TET, Bihar TET — Teacher Eligibility Result",
      "KVS, NVS, Army, Navy, Airforce — Final Selection List",
    ],
    faqs: [
      { q: "Sarkari Result कैसे देखें?", a: "इस page पर अपनी परीक्षा ढूंढें। Post पर click करें — Important Links में Result Check का Direct Official Link मिलेगा। Official Website पर Roll Number या Registration Number डालकर Result देख सकते हैं।" },
      { q: "Cut-off Marks क्या होती है?", a: "Cut-off वह Minimum Score है जो Selected होने के लिए ज़रूरी है। Category-wise (General, OBC, SC, ST, EWS) अलग-अलग Cut-off होती है। Merit List में वही Candidates होते हैं जो Cut-off से ऊपर Marks लाते हैं।" },
      { q: "Result के बाद Document Verification कब होगा?", a: "Merit List जारी होने के बाद Official Website पर Document Verification / DV की Date और Schedule दी जाती है। हमारी site पर भी यह Update होती है। अपने सभी Original Documents तैयार रखें।" },
      { q: "Score Card Download कैसे करें?", a: "Result के साथ Official Website पर Score Card भी Available होता है। इसे Download करके Print कर लें — Future Reference के लिए ज़रूरी होता है। Score Card पर Marks, Percentile और Cut-off लिखी होती है।" },
      { q: "Result में नाम नहीं है तो क्या करें?", a: "पहले पूरी Merit List ध्यान से check करें। यदि फिर भी नाम नहीं है तो Official Website पर Grievance Portal में complaint करें। Waiting List भी check करें — कभी-कभी बाद में जारी होती है।" },
    ],
  },
  "answer-key": {
    intro: "SarkariJobSeva.com पर सभी सरकारी परीक्षाओं की Official Answer Key सबसे पहले Upload होती है। Answer Key से परीक्षा में अपने Marks का अनुमान लगाएं। यदि कोई Answer गलत लगे तो Official Objection भी यहां से कर सकते हैं।",
    points: [
      "SSC CGL, CHSL, MTS, GD, CPO — Tier 1, Tier 2 Answer Key",
      "Railway RRB Group D, ALP, NTPC — Official Answer Key",
      "UPSC NDA, CDS, CAPF — Answer Key PDF",
      "IBPS PO, Clerk, SO, RRB — Bank Exam Answer Key",
      "UP Police, Bihar Police — State Exam Answer Key",
      "CTET, UP TET, Bihar TET — Teacher Exam Answer Key",
    ],
    faqs: [
      { q: "Answer Key क्या होती है?", a: "Answer Key वह Official Document है जिसमें परीक्षा के सभी सवालों के सही जवाब दिए होते हैं। इससे आप परीक्षा देने के बाद अपने Marks calculate कर सकते हैं।" },
      { q: "Answer Key से Marks कैसे Calculate करें?", a: "Answer Key से अपने सही जवाबों की संख्या गिनें। Positive Marking: सही जवाब × marks। Negative Marking हो तो: गलत जवाब × penalty। फिर जोड़ें — यही आपका अनुमानित Score है।" },
      { q: "Answer Key पर Objection कैसे करें?", a: "यदि कोई Answer गलत लगे तो Official Website के Objection Portal पर जाएं। Roll Number और Password से Login करें। सवाल select करें, अपना जवाब और Reference (Book, Notification) दें। Fee Pay करें और Submit करें।" },
      { q: "Objection की Last Date क्या होती है?", a: "आमतौर पर Answer Key जारी होने के 2-5 दिन बाद Objection की Last Date होती है। इसे Official Notification में check करें। Last Date निकलने के बाद Objection Accept नहीं होता।" },
      { q: "Objection सही निकला तो क्या होता है?", a: "यदि आपका Objection सही पाया जाता है तो Revised Answer Key जारी होती है और उस सवाल के Marks सभी Candidates को मिलते हैं या उसे Deleted किया जाता है।" },
    ],
  },
  admission: {
    intro: "SarkariJobSeva.com पर सरकारी College और University Admissions की सम्पूर्ण जानकारी मिलती है। B.Ed, D.El.Ed, ITI, Polytechnic, University UG/PG Admission — सभी के Form Date, Eligibility और Direct Apply Link यहां Update होते हैं।",
    points: [
      "B.Ed Admission — UP B.Ed, Bihar B.Ed, Rajasthan B.Ed JET",
      "D.El.Ed / BTC — Primary Teacher Training Admission",
      "ITI Admission — Industrial Training Institute Admission Form",
      "Polytechnic — UP Polytechnic JEECUP, Bihar Polytechnic BCECE",
      "University UG Admission — BA, BSc, BCom Admission Form",
      "University PG Admission — MA, MSc, MCom, MBA Admission",
      "Medical Admission — NEET, AIIMS — Government Medical College",
      "Law Admission — CLAT, State Law College Admission",
    ],
    faqs: [
      { q: "Government College में Admission कैसे होता है?", a: "ज़्यादातर Government Colleges में Merit-based या Entrance Exam based Admission होता है। Form भरें, Exam दें (अगर हो), Merit List check करें और Documents Verification कराएं। Fees सरकारी colleges में बहुत कम होती है।" },
      { q: "B.Ed Admission के लिए Eligibility क्या है?", a: "B.Ed के लिए Graduation (किसी भी stream में) 50% Marks के साथ ज़रूरी है। SC/ST/OBC को relaxation मिलती है। State-wise अलग-अलग Entrance Exam होता है — UP B.Ed JEE, Bihar B.Ed CET।" },
      { q: "ITI Admission के लिए क्या चाहिए?", a: "ITI Admission के लिए 8वीं या 10वीं Pass ज़रूरी है (Trade के अनुसार)। Merit-based Admission होता है। ITI करने के बाद Government Job के बहुत मौके मिलते हैं — Railway, PWD, CPWD।" },
      { q: "Admission Form की Last Date कैसे पता करें?", a: "इस page पर अपना Course ढूंढें। Post में Important Dates section में Form Date, Last Date और Exam Date दी होती है। समय पर Form भरें — Last Date Extension हमेशा नहीं होती।" },
      { q: "Documents Verification में क्या लाना होता है?", a: "10वीं और 12वीं की Marksheet और Certificate, Graduation Marksheet (अगर ज़रूरी हो), Caste Certificate (SC/ST/OBC), Income Certificate (EWS), Domicile Certificate, Aadhar Card, Photo और Admission Form की Copy।" },
    ],
  },
};

export function PageSEOBlock({ type }: { type: string }) {
  const content = PAGE_CONTENT[type];
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  if (!content) return null;

  return (
    <div className="space-y-4 mt-6">
      {/* Intro */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
        <p className="text-slate-700 text-sm leading-relaxed">{content.intro}</p>
      </div>

      {/* Coverage Points */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="font-black text-slate-800 text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-blue-600 rounded-full" /> हम यहां Cover करते हैं:
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
          {content.points.map((pt, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
              <span className="text-blue-500 mt-0.5 flex-shrink-0">✓</span> {pt}
            </li>
          ))}
        </ul>
      </div>

      {/* FAQ */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="font-black text-slate-800 text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-blue-600 rounded-full" /> अक्सर पूछे जाने वाले सवाल
        </h2>
        <div className="space-y-2">
          {content.faqs.map((faq, i) => (
            <div key={i} className="border border-slate-100 rounded-lg overflow-hidden">
              <button
                className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="text-sm font-bold text-slate-800">{faq.q}</span>
                <span className="text-slate-400 flex-shrink-0 text-lg">{openFaq === i ? "−" : "+"}</span>
              </button>
              {openFaq === i && (
                <div className="px-4 pb-3 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-2.5">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
