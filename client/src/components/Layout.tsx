import { Link, useLocation } from "wouter";
import { Home, Briefcase, FileText, CheckSquare, GraduationCap, Search } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/",            label: "Home",       icon: Home },
    { href: "/latest-jobs", label: "Jobs",        icon: Briefcase },
    { href: "/admit-card",  label: "Admit",       icon: FileText },
    { href: "/results",     label: "Results",     icon: CheckSquare },
    { href: "/answer-key",  label: "Answer Key",  icon: GraduationCap },
    { href: "/search",      label: "Search",      icon: Search },
  ];

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">

      {/* ===== HEADER ===== */}
      <header className="bg-blue-700 text-white shadow-lg z-50 sticky top-0">
        {/* Top bar */}
        <div className="px-4 py-3 flex items-center justify-between max-w-6xl mx-auto">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-blue-700 font-black text-sm">GJ</span>
              </div>
              <span className="text-white font-black text-lg tracking-tight">Govt Job Alert</span>
            </div>
          </Link>
          <Link href="/search">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center cursor-pointer hover:bg-blue-500 transition-colors">
              <Search className="w-5 h-5 text-white" />
            </div>
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:block border-t border-blue-600">
          <nav className="max-w-6xl mx-auto px-4 flex gap-1 py-1">
            {navItems.map(({ href, label }) => (
              <Link key={href} href={href}>
                <span className={`px-4 py-2 rounded-lg text-sm font-bold cursor-pointer transition-all duration-200 ${
                  isActive(href)
                    ? "bg-white text-blue-700"
                    : "text-blue-100 hover:bg-blue-600 hover:text-white"
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
                  isActive(href)
                    ? "bg-white text-blue-700"
                    : "bg-blue-600 text-white"
                }`}>
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* ===== MAIN ===== */}
      <main className="flex-grow pb-20 md:pb-0 pt-4">
        <div className="max-w-6xl mx-auto px-3 md:px-6">
          {children}
        </div>
      </main>

      {/* ===== MOBILE BOTTOM NAV ===== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 shadow-2xl">
        <div className="grid grid-cols-5 h-16">
          {[
            { href: "/",            label: "Home",    icon: Home },
            { href: "/latest-jobs", label: "Jobs",    icon: Briefcase },
            { href: "/admit-card",  label: "Admit",   icon: FileText },
            { href: "/results",     label: "Results", icon: CheckSquare },
            { href: "/search",      label: "Search",  icon: Search },
          ].map(({ href, label, icon: Icon }) => (
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
              <span className="bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-green-100">
                ✅ Updated Daily
              </span>
              <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-blue-100">
                🔒 Official Sources
              </span>
              <span className="bg-slate-50 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200">
                🆓 100% Free
              </span>
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
                { href: "/disclaimer",     label: "Disclaimer" },
                { href: "/privacy-policy", label: "Privacy Policy" },
                { href: "/terms-of-service",label: "Terms of Service" },
                { href: "/contact",        label: "Contact Us" },
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

      {/* Mobile Footer (minimal) */}
      <div className="md:hidden bg-white border-t border-slate-100 py-4 pb-20 text-center text-xs text-slate-400">
        © 2026 Govt Job Alert |{" "}
        <Link href="/disclaimer"><span className="text-blue-500 cursor-pointer">Disclaimer</span></Link>
        {" | "}
        <Link href="/contact"><span className="text-blue-500 cursor-pointer">Contact</span></Link>
      </div>

    </div>
  );
}
