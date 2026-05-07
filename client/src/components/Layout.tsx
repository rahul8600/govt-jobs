import { Link, useLocation } from "wouter";
import { Home, Briefcase, FileText, CheckSquare, GraduationCap, Search, ArrowUp, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setShowTopBtn(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Debounce search query
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(searchQuery), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Focus input when modal opens
  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 100);
    else { setSearchQuery(""); setDebouncedQ(""); }
  }, [searchOpen]);

  // Close modal on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSearchOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Search API
  const { data: searchResults, isFetching } = useQuery<any>({
    queryKey: ["header-search", debouncedQ],
    queryFn: async () => {
      if (debouncedQ.trim().length < 2) return { data: [] };
      const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQ)}&page=1&limit=8`, { cache: "no-store" });
      if (!res.ok) return { data: [] };
      return res.json();
    },
    staleTime: 0,
  });

  const results = searchResults?.data || [];

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  // Bottom nav — NO Search tab
  const bottomNav = [
    { href: "/",            label: "Home",    icon: Home },
    { href: "/latest-jobs", label: "Jobs",    icon: Briefcase },
    { href: "/admit-card",  label: "Admit",   icon: FileText },
    { href: "/results",     label: "Results", icon: CheckSquare },
    { href: "/answer-key",  label: "Answer",  icon: GraduationCap },
  ];

  const TYPE_LABELS: Record<string, string> = {
    "job": "Job",
    "admit-card": "Admit Card",
    "result": "Result",
    "answer-key": "Answer Key",
    "admission": "Admission",
  };

  const TYPE_COLORS: Record<string, string> = {
    "job": "bg-blue-100 text-blue-700",
    "admit-card": "bg-green-100 text-green-700",
    "result": "bg-red-100 text-red-700",
    "answer-key": "bg-purple-100 text-purple-700",
    "admission": "bg-orange-100 text-orange-700",
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">

      {/* ===== HEADER ===== */}
      <header className="bg-blue-700 text-white shadow-lg z-50 sticky top-0">
        <div className="px-4 py-3 flex items-center justify-between max-w-6xl mx-auto">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-blue-700 font-black text-sm">GJ</span>
              </div>
              <span className="text-white font-black text-lg tracking-tight">Govt Job Alert</span>
            </div>
          </Link>
          {/* Search icon — opens modal */}
          <button
            onClick={() => setSearchOpen(true)}
            className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center cursor-pointer hover:bg-blue-500 transition-colors"
            aria-label="Open search"
          >
            <Search className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:block border-t border-blue-600">
          <nav className="max-w-6xl mx-auto px-4 flex gap-1 py-1">
            {[
              { href: "/",            label: "Home" },
              { href: "/latest-jobs", label: "Jobs" },
              { href: "/admit-card",  label: "Admit Cards" },
              { href: "/results",     label: "Results" },
              { href: "/answer-key",  label: "Answer Key" },
              { href: "/admission",   label: "Admission" },
            ].map(({ href, label }) => (
              <Link key={href} href={href}>
                <span className={`px-4 py-2 rounded-lg text-sm font-bold cursor-pointer transition-all duration-200 ${
                  isActive(href) ? "bg-white text-blue-700" : "text-blue-100 hover:bg-blue-600 hover:text-white"
                }`}>
                  {label}
                </span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile Category Scroll */}
        <div className="md:hidden border-t border-blue-600 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 px-3 py-2 w-max">
            {[
              { href: "/latest-jobs", label: "🗂 Jobs" },
              { href: "/admit-card",  label: "🪪 Admit Card" },
              { href: "/results",     label: "📊 Results" },
              { href: "/answer-key",  label: "🔑 Answer Key" },
              { href: "/admission",   label: "🎓 Admission" },
            ].map(({ href, label }) => (
              <Link key={href} href={href}>
                <span className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all ${
                  isActive(href) ? "bg-white text-blue-700" : "bg-blue-600 text-white"
                }`}>
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* ===== SEARCH MODAL ===== */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col" onClick={() => setSearchOpen(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <div
            className="relative z-10 bg-white w-full max-w-2xl mx-auto mt-16 mx-4 rounded-2xl shadow-2xl overflow-hidden"
            style={{ margin: "4rem 1rem 0" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
              <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search jobs, admit cards, results..."
                className="flex-1 text-base font-medium text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    setSearchOpen(false);
                    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                  }
                }}
              />
              <button onClick={() => setSearchOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {debouncedQ.trim().length < 2 ? (
                <div className="px-4 py-8 text-center text-slate-400 text-sm">
                  Type at least 2 characters to search...
                </div>
              ) : isFetching ? (
                <div className="px-4 py-8 text-center text-slate-400 text-sm">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Searching...
                </div>
              ) : results.length === 0 ? (
                <div className="px-4 py-8 text-center text-slate-400 text-sm">
                  No results found for "<strong>{debouncedQ}</strong>"
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {results.map((job: any) => (
                    <div
                      key={job.id}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => {
                        setSearchOpen(false);
                        navigate(`/job/${job.slug || job.id}`);
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 leading-snug line-clamp-2">{job.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5 font-medium">{job.department}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${TYPE_COLORS[job.type] || "bg-slate-100 text-slate-600"}`}>
                        {TYPE_LABELS[job.type] || job.type}
                      </span>
                    </div>
                  ))}
                  {/* View all */}
                  <div
                    className="px-4 py-3 text-center cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => {
                      setSearchOpen(false);
                      navigate(`/search?q=${encodeURIComponent(debouncedQ)}`);
                    }}
                  >
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                      View all results for "{debouncedQ}" →
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== MAIN ===== */}
      <main className="flex-grow pb-20 md:pb-0 pt-4">
        <div className="max-w-6xl mx-auto px-3 md:px-6">
          {children}
        </div>
      </main>

      {/* ===== MOBILE BOTTOM NAV — 5 items, NO Search ===== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 shadow-2xl">
        <div className="grid grid-cols-5 h-16">
          {bottomNav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <div className={`flex flex-col items-center justify-center h-full gap-0.5 cursor-pointer transition-colors ${
                isActive(href) ? "text-blue-700" : "text-slate-400"
              }`}>
                <Icon className={`w-5 h-5 ${isActive(href) ? "text-blue-700" : "text-slate-400"}`} />
                <span className={`text-[10px] font-bold ${isActive(href) ? "text-blue-700" : "text-slate-400"}`}>
                  {label}
                </span>
                {isActive(href) && (
                  <div className="absolute bottom-0 w-8 h-0.5 bg-blue-700 rounded-full" />
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ===== FOOTER (Desktop only) ===== */}
      <footer className="hidden md:block bg-white border-t border-slate-200 py-10 mt-6">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-4 gap-10">
          <div className="col-span-2">
            <h3 className="text-blue-700 font-black text-xl mb-3 uppercase">Govt Job Alert</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">
              India's trusted gateway for verified government job information. 100% accurate, updated daily.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-green-100">✅ Updated Daily</span>
              <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-blue-100">🔒 Official Sources</span>
              <span className="bg-slate-50 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200">🆓 100% Free</span>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 mb-4 text-xs uppercase tracking-widest">Quick Links</h4>
            <ul className="space-y-2.5 text-sm text-slate-500">
              {[
                { href: "/latest-jobs", label: "Latest Jobs" },
                { href: "/admit-card",  label: "Admit Card" },
                { href: "/results",     label: "Results" },
                { href: "/answer-key",  label: "Answer Key" },
                { href: "/admission",   label: "Admission" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href}>
                    <span className="hover:text-blue-600 cursor-pointer transition-colors font-medium">→ {label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 mb-4 text-xs uppercase tracking-widest">Legal</h4>
            <ul className="space-y-2.5 text-sm text-slate-500">
              {[
                { href: "/disclaimer",      label: "Disclaimer" },
                { href: "/privacy-policy",  label: "Privacy Policy" },
                { href: "/terms-of-service",label: "Terms of Service" },
                { href: "/contact",         label: "Contact Us" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href}>
                    <span className="hover:text-blue-600 cursor-pointer transition-colors font-medium">→ {label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 border-t border-slate-100 mt-8 pt-6 text-center text-slate-400 text-xs">
          © 2026 Govt Job Alert — All rights reserved
        </div>
      </footer>

      {/* Mobile Footer */}
      <div className="md:hidden bg-white border-t border-slate-100 py-4 pb-20 text-center text-xs text-slate-400">
        © 2026 Govt Job Alert |{" "}
        <Link href="/disclaimer"><span className="text-blue-500 cursor-pointer">Disclaimer</span></Link>
        {" | "}
        <Link href="/contact"><span className="text-blue-500 cursor-pointer">Contact</span></Link>
      </div>

      {/* Back to Top */}
      {showTopBtn && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 md:bottom-8 right-4 z-50 bg-blue-700 hover:bg-blue-800 text-white w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

    </div>
  );
}
