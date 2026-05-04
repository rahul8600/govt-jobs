import { Link } from "wouter";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Professional Header */}
      <header className="bg-white border-b border-slate-200 text-slate-800 shadow-sm z-50">
        <div className="container-portal py-5 md:py-6 flex flex-col md:flex-row justify-between items-center gap-5">
          <Link href="/">
            <span className="text-2xl md:text-[1.75rem] font-black tracking-tight cursor-pointer text-blue-700 hover:text-blue-800 transition-colors duration-200 uppercase">
              Govt Job Alert
            </span>
          </Link>
          <nav className="flex flex-wrap justify-center gap-1 md:gap-3 text-sm md:text-base font-extrabold uppercase tracking-wide">
            <Link href="/"><span className="nav-menu-item text-slate-700 hover:text-blue-700 cursor-pointer px-4 py-2.5 rounded-lg md:relative group">Home<span className="nav-underline hidden md:block"></span></span></Link>
            <Link href="/latest-jobs"><span className="nav-menu-item text-slate-700 hover:text-blue-700 cursor-pointer px-4 py-2.5 rounded-lg md:relative group">Latest Jobs<span className="nav-underline hidden md:block"></span></span></Link>
            <Link href="/admit-card"><span className="nav-menu-item text-slate-700 hover:text-blue-700 cursor-pointer px-4 py-2.5 rounded-lg md:relative group">Admit Card<span className="nav-underline hidden md:block"></span></span></Link>
            <Link href="/results"><span className="nav-menu-item text-slate-700 hover:text-blue-700 cursor-pointer px-4 py-2.5 rounded-lg md:relative group">Results<span className="nav-underline hidden md:block"></span></span></Link>
            <Link href="/answer-key"><span className="nav-menu-item text-slate-700 hover:text-blue-700 cursor-pointer px-4 py-2.5 rounded-lg md:relative group">Answer Key<span className="nav-underline hidden md:block"></span></span></Link>
            <Link href="/admission"><span className="nav-menu-item text-slate-700 hover:text-blue-700 cursor-pointer px-4 py-2.5 rounded-lg md:relative group">Admission<span className="nav-underline hidden md:block"></span></span></Link>
          </nav>
        </div>
      </header>

      {/* Live Scrolling Ticker */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-800 py-3 overflow-hidden whitespace-nowrap z-40">
        <div className="inline-flex animate-marquee text-xs font-bold uppercase tracking-wide text-white">
          <span className="mx-8 inline-flex items-center gap-2"><span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span> New: SSC GD Constable Result 2024 Declared</span>
          <span className="mx-8 inline-flex items-center gap-2"><span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span> Update: Railway RPF Admit Card 2025 Available Now</span>
          <span className="mx-8 inline-flex items-center gap-2"><span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span> Apply: IBPS PO Online Form 2025 Started</span>
          <span className="mx-8 inline-flex items-center gap-2"><span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span> New: UP Police Constable Exam City Released</span>
          <span className="mx-8 inline-flex items-center gap-2"><span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span> Alert: Navy SSR/MR 01/2025 Batch Result Out</span>
          <span className="mx-8 inline-flex items-center gap-2"><span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span> New: SSC GD Constable Result 2024 Declared</span>
          <span className="mx-8 inline-flex items-center gap-2"><span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span> Update: Railway RPF Admit Card 2025 Available Now</span>
          <span className="mx-8 inline-flex items-center gap-2"><span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span> Apply: IBPS PO Online Form 2025 Started</span>
          <span className="mx-8 inline-flex items-center gap-2"><span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span> New: UP Police Constable Exam City Released</span>
          <span className="mx-8 inline-flex items-center gap-2"><span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span> Alert: Navy SSR/MR 01/2025 Batch Result Out</span>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-grow py-10 bg-gradient-to-b from-[#f1f4f7] to-[#e8ecf1]">
        <div className="container-portal">
          {children}
        </div>
      </main>

      {/* Professional Footer */}
      <footer className="bg-white border-t border-slate-200 py-14">
        <div className="container-portal grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-14">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-blue-800 font-black text-2xl mb-5 uppercase tracking-tight">Govt Job Alert</h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-md mb-7">
              India's authoritative gateway for verified government job information. We bridge the gap between official gazettes and aspirants with 100% accuracy.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-4 py-2 rounded-lg border border-emerald-100 uppercase tracking-wide inline-flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Updated Daily
              </span>
              <span className="bg-blue-50 text-blue-700 text-[11px] font-bold px-4 py-2 rounded-lg border border-blue-100 uppercase tracking-wide">
                Official Sources Only
              </span>
              <span className="bg-slate-50 text-slate-700 text-[11px] font-bold px-4 py-2 rounded-lg border border-slate-200 uppercase tracking-wide">
                100% Free Information
              </span>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 mb-5 uppercase text-xs tracking-widest border-b-2 border-blue-100 pb-3">Navigation</h4>
            <ul className="space-y-3.5 text-sm text-slate-600 font-medium">
              <li><Link href="/"><span className="hover:text-blue-600 cursor-pointer transition-colors duration-200">Main Feed</span></Link></li>
              <li><Link href="/latest-jobs"><span className="hover:text-blue-600 cursor-pointer transition-colors duration-200">Job Listings</span></Link></li>
              <li><Link href="/results"><span className="hover:text-blue-600 cursor-pointer transition-colors duration-200">Exam Results</span></Link></li>
              <li><Link href="/admit-card"><span className="hover:text-blue-600 cursor-pointer transition-colors duration-200">Download Admit</span></Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 mb-5 uppercase text-xs tracking-widest border-b-2 border-blue-100 pb-3">Information</h4>
            <ul className="space-y-3.5 text-sm text-slate-600 font-medium">
              <li><Link href="/disclaimer"><span className="hover:text-blue-600 cursor-pointer transition-colors duration-200">Official Disclaimer</span></Link></li>
              <li><Link href="/terms-of-service"><span className="hover:text-blue-600 cursor-pointer transition-colors duration-200">Terms of Service</span></Link></li>
              <li><Link href="/privacy-policy"><span className="hover:text-blue-600 cursor-pointer transition-colors duration-200">Privacy Policy</span></Link></li>
              <li><Link href="/contact"><span className="hover:text-blue-600 cursor-pointer transition-colors duration-200">Contact Us</span></Link></li>
            </ul>
          </div>
        </div>
        <div className="container-portal border-t border-slate-100 mt-12 pt-8 text-center text-slate-400 text-xs font-medium tracking-wide">
          © 2026 Govt Job Alert - Verified Government Information Service
        </div>
      </footer>
    </div>
  );
}
