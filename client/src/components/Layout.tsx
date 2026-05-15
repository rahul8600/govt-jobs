import { Link, useLocation } from "wouter";
import { useLang } from "@/lib/LanguageContext";
import { Home, Briefcase, FileText, CheckSquare, GraduationCap, Search } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { lang, toggleLang } = useLang();

  const navItems = [
    { href: "/",            label: "Home",       icon: Home },
    { href: "/latest-jobs", label: "Jobs",        icon: Briefcase },
    { href: "/admit-card",  label: "Admit",       icon: FileText },
    { href: "/results",     label: "Results",     icon: CheckSquare },
    { href: "/answer-key",  label: "Answer Key",  icon: GraduationCap },
    { href: "/search",      label: "Search",      icon: Search },
    { href: "/salary-calculator", label: "💰 Salary", icon: Search },
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
              <img src="/logo.png" alt="Sarkari Jobs" className="w-10 h-10 object-contain" />
              <span className="text-white font-black text-lg tracking-tight">SarkariJobSeva</span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            {/* Hindi/English Toggle */}
            <button onClick={toggleLang}
              className="h-9 px-3 bg-orange-100 text-orange-700 rounded-xl font-black text-xs hover:bg-orange-200 transition-colors"
              title="भाषा बदलें">
              {lang === "hi" ? "EN" : "हि"}
            </button>
            {/* WhatsApp */}
            <a href="https://whatsapp.com/channel/0029Vb7dt842ER6rNwc6eB47" target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center cursor-pointer hover:bg-green-400 transition-colors"
              title="Join WhatsApp Channel">
              <svg className="w-5 h-5 text-white fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
            {/* Telegram */}
            <a href="https://t.me/sarkarijobse" target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 bg-sky-500 rounded-xl flex items-center justify-center cursor-pointer hover:bg-sky-400 transition-colors"
              title="Join Telegram Channel">
              <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </a>
            <Link href="/search">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center cursor-pointer hover:bg-blue-500 transition-colors">
                <Search className="w-5 h-5 text-white" />
              </div>
            </Link>
          </div>
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
            { href: "/admission",   label: "Admission", icon: GraduationCap },
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
            <h3 className="text-blue-700 font-black text-xl mb-3 uppercase">SarkariJobSeva</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">
              भारत का सबसे भरोसेमंद सरकारी नौकरी पोर्टल। रोज़ अपडेट, बिल्कुल सटीक जानकारी।
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
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
            <div className="flex gap-3 mt-1">
              <a href="https://whatsapp.com/channel/0029Vb7dt842ER6rNwc6eB47" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors">
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </a>
              <a href="https://t.me/sarkarijobse" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors">
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                Telegram
              </a>
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
          © 2026 SarkariJobSeva — All rights reserved
        </div>
      </footer>

      {/* Mobile Footer (minimal) */}
      <div className="md:hidden bg-white border-t border-slate-100 py-3 pb-20 text-center text-xs text-slate-400">
        <div className="flex justify-center gap-3 mb-2">
          <a href="https://whatsapp.com/channel/0029Vb7dt842ER6rNwc6eB47" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 bg-green-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs">
            <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp
          </a>
          <a href="https://t.me/sarkarijobse" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 bg-sky-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs">
            <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
            Telegram
          </a>
        </div>
        © 2026 SarkariJobSeva |{" "}
        <Link href="/disclaimer"><span className="text-blue-500 cursor-pointer">Disclaimer</span></Link>
        {" | "}
        <Link href="/contact"><span className="text-blue-500 cursor-pointer">Contact</span></Link>
      </div>

    </div>
  );
}
