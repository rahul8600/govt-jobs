import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useJobs } from "@/lib/useJobs";
import { useQuery } from "@tanstack/react-query";
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
      <div className="divide-y divide-slate-100">
        {jobs.slice(0, 8).map(job => (
          <Link key={job.id} href={`/job/${job.slug || job.id}`}>
            <div className="flex items-start gap-2.5 px-3 py-2.5 hover:bg-slate-50 active:bg-slate-100 cursor-pointer transition-colors">
              <span className={`mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 ${cat.dot}`} />
              <span className="text-slate-700 text-sm font-medium leading-snug line-clamp-2">{job.title}</span>
            </div>
          </Link>
        ))}
        {jobs.length === 0 && (
          <div className="py-8 text-center text-slate-400 text-sm">No updates yet</div>
        )}
      </div>
      <Link href={cat.href}>
        <div className="border-t border-slate-100 py-2.5 text-center cursor-pointer hover:bg-slate-50 transition-colors">
          <span className={`text-xs font-bold uppercase tracking-wide ${cat.light.split(' ')[1]}`}>VIEW ALL {cat.title} →</span>
        </div>
      </Link>
    </div>
  );
}

function LatestBlogs() {
  const { data: blogs = [] } = useQuery({
    queryKey: ["blogs-home"],
    queryFn: async () => {
      const res = await fetch("/api/blogs");
      if (!res.ok) return [];
      return res.json();
    },
  });

  if (blogs.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-black text-slate-800 text-base flex items-center gap-2">
          <span className="w-1 h-5 bg-blue-600 rounded-full" />
          📝 Latest Blog Posts
        </h2>
        <a href="/blog" className="text-blue-600 text-xs font-bold hover:underline">View All →</a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {blogs.slice(0, 3).map((blog: any) => (
          <a key={blog.id} href={`/blog/${blog.slug}`}>
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group">
              <div className="w-full h-40 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center overflow-hidden">
                {blog.image_url ? (
                  <img src={blog.image_url} alt={blog.title} className="w-full h-40 object-cover" width="400" height="160" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                ) : (
                  <span className="text-4xl">📋</span>
                )}
              </div>
              <div className="p-3">
                <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase">{blog.category}</span>
                <p className="font-bold text-slate-800 text-sm mt-1.5 line-clamp-2 group-hover:text-blue-700 transition-colors">{blog.title}</p>
                <p className="text-xs text-slate-400 mt-1">{new Date(blog.created_at).toLocaleDateString("en-IN")}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

// ── About Section ─────────────────────────────────────────────────────────────
function AboutSection() {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
      <div className="flex items-center gap-2 mb-5">
        <span className="w-1 h-5 bg-blue-600 rounded-full" />
        <h2 className="font-black text-slate-800 text-base uppercase tracking-wide">🏛️ SarkariJobSeva के बारे में</h2>
      </div>

      <p className="text-slate-600 text-sm leading-relaxed mb-4">
        <strong>SarkariJobSeva.com</strong> भारत का एक विश्वसनीय और निःशुल्क सरकारी नौकरी सूचना पोर्टल है। हम देश के कोने-कोने में बैठे युवाओं तक सरकारी भर्तियों की सटीक, समय पर और सम्पूर्ण जानकारी पहुंचाते हैं — बिल्कुल मुफ्त। हमारी टीम हर दिन नई Vacancy, Admit Card, Result और Answer Key अपडेट करती है ताकि आप कोई भी अवसर न चूकें।
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Latest Jobs Box */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <h3 className="font-bold text-blue-800 text-sm mb-2 flex items-center gap-1.5">
            <Briefcase className="w-4 h-4" /> Latest Sarkari Jobs
          </h3>
          <p className="text-blue-700 text-xs leading-relaxed">
            SSC, Railway, UPSC, Bank, Police, Army, Anganwadi, Teacher Bharti और तमाम Central व State Government की नई भर्तियां रोज़ अपडेट होती हैं। 10वीं, 12वीं, Graduation और Post Graduate — सभी योग्यता के लिए jobs मिलेंगी यहां।
          </p>
          <Link href="/latest-jobs">
            <span className="inline-block mt-2 text-xs font-bold text-blue-600 hover:underline cursor-pointer">देखें Latest Jobs →</span>
          </Link>
        </div>

        {/* Admit Card Box */}
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <h3 className="font-bold text-green-800 text-sm mb-2 flex items-center gap-1.5">
            <FileText className="w-4 h-4" /> Admit Card
          </h3>
          <p className="text-green-700 text-xs leading-relaxed">
            SSC CGL, CHSL, MTS, Railway RRB ALP, Group D, UPSC, IBPS, SBI PO/Clerk, UP Police, Rajasthan Police, Bihar Police समेत सभी सरकारी परीक्षाओं के Admit Card का Direct Download Link यहां मिलेगा।
          </p>
          <Link href="/admit-card">
            <span className="inline-block mt-2 text-xs font-bold text-green-600 hover:underline cursor-pointer">Download Admit Card →</span>
          </Link>
        </div>

        {/* Results Box */}
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <h3 className="font-bold text-red-800 text-sm mb-2 flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4" /> Sarkari Result
          </h3>
          <p className="text-red-700 text-xs leading-relaxed">
            सरकारी परीक्षाओं के Result, Merit List और Cut-off Marks की जानकारी सबसे पहले यहां मिलती है। SSC, Railway, UPSC, Bank, State PSC सभी के Results एक जगह।
          </p>
          <Link href="/results">
            <span className="inline-block mt-2 text-xs font-bold text-red-600 hover:underline cursor-pointer">Check Results →</span>
          </Link>
        </div>

        {/* Answer Key Box */}
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
          <h3 className="font-bold text-purple-800 text-sm mb-2 flex items-center gap-1.5">
            <Key className="w-4 h-4" /> Answer Key
          </h3>
          <p className="text-purple-700 text-xs leading-relaxed">
            सरकारी परीक्षाओं की Official Answer Key और Objection Form की जानकारी। परीक्षा देने के बाद अपने Marks का अनुमान लगाएं और जरूरत पड़े तो Objection भी डालें।
          </p>
          <Link href="/answer-key">
            <span className="inline-block mt-2 text-xs font-bold text-purple-600 hover:underline cursor-pointer">Download Answer Key →</span>
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
        {[
          { num: "500+", label: "Active Job Posts" },
          { num: "Daily", label: "Updates" },
          { num: "100%", label: "Free Service" },
        ].map(({ num, label }) => (
          <div key={label} className="text-center">
            <p className="text-xl font-black text-blue-700">{num}</p>
            <p className="text-xs text-slate-500 font-medium">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── FAQ Section ───────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "SarkariJobSeva क्या है?",
    a: "SarkariJobSeva.com एक निःशुल्क सरकारी नौकरी सूचना पोर्टल है। हम SSC, Railway, UPSC, Bank, Police, Army, Teacher Bharti समेत तमाम केंद्र और राज्य सरकार की भर्तियों की जानकारी एकत्रित करके आप तक पहुंचाते हैं। यह किसी सरकारी विभाग की Official Website नहीं है।",
  },
  {
    q: "Sarkari Job के लिए Apply कैसे करें?",
    a: "किसी भी Job Post पर click करें। वहां Important Links section में Apply Online का Direct Link मिलेगा। हमेशा Official Website से ही Apply करें। Application Fee भरने से पहले Notification ध्यान से पढ़ें।",
  },
  {
    q: "Admit Card कैसे Download करें?",
    a: "Admit Card section में जाएं, अपनी परीक्षा ढूंढें और Direct Link पर click करें। Official Website पर जाकर Registration Number और Date of Birth डालकर Admit Card Download करें। Exam से कम से कम 3-4 दिन पहले Download कर लें।",
  },
  {
    q: "क्या यहां Free Job Alert मिलती है?",
    a: "हां, Push Notification Allow करें — नई vacancy आने पर तुरंत notification मिलेगी। आप हमारी site को Bookmark भी कर सकते हैं और रोज़ check कर सकते हैं। सभी updates बिल्कुल मुफ्त हैं।",
  },
  {
    q: "10वीं / 12वीं Pass के लिए कौन सी Sarkari Jobs हैं?",
    a: "Railway Group D, SSC GD, SSC MTS, Army GD, UP Police Constable, Anganwadi Worker, Home Guard, Peon/Chowkidar, Sweeper, Fire Fighter जैसी jobs 10वीं पास के लिए होती हैं। 12वीं पास के लिए SSC CHSL, Railway ALP/Technician, Bank Clerk, Army Clerk जैसी बहुत सी jobs हैं।",
  },
  {
    q: "Result या Merit List कहां देखें?",
    a: "Results section में जाएं और अपनी परीक्षा ढूंढें। हम Official Result का Direct Link provide करते हैं। Cut-off Marks और Merit List की जानकारी भी वहां मिलती है।",
  },
  {
    q: "Answer Key में Objection कैसे करें?",
    a: "Answer Key section से अपनी परीक्षा की Answer Key Download करें। यदि कोई Answer गलत लगे तो Official Website पर Objection Form भरें। Objection की Last Date Notification में दी होती है — उससे पहले ही करें।",
  },
  {
    q: "क्या SarkariJobSeva कोई Fee लेती है?",
    a: "नहीं। SarkariJobSeva.com की सभी सेवाएं पूरी तरह निःशुल्क हैं। हम Job Application Fee नहीं लेते। यदि कोई हमारे नाम पर पैसे मांगे तो वह Fraud है — तुरंत Report करें।",
  },
];

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
      <div className="flex items-center gap-2 mb-5">
        <span className="w-1 h-5 bg-blue-600 rounded-full" />
        <h2 className="font-black text-slate-800 text-base uppercase tracking-wide">❓ अक्सर पूछे जाने वाले सवाल (FAQ)</h2>
      </div>
      <div className="space-y-2">
        {FAQS.map((faq, i) => (
          <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              className="w-full text-left px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span className="text-sm font-bold text-slate-800">{faq.q}</span>
              <span className="text-slate-400 text-lg flex-shrink-0">{open === i ? "−" : "+"}</span>
            </button>
            {open === i && (
              <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
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
          <div style={{display:'flex', alignItems:'center', backgroundColor:'white', borderRadius:'50px', padding:'12px 20px', gap:'10px'}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search Jobs, Admit Cards, Results..."
              style={{flex:1, minWidth:0, border:'none', outline:'none', fontSize:'15px', fontWeight:500, color:'#1e293b', backgroundColor:'transparent'}}
              value={homeSearch}
              onChange={e => setHomeSearch(e.target.value)}
            />
          </div>
        </form>
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
                        <span className="text-[10px] bg-yellow-100 text-yellow-700 font-bold px-2 py-0.5 rounded-full border border-yellow-200">🔥 Hot</span>
                        {job.lastDate && <span className="text-[10px] text-red-600 font-bold">Last: {job.lastDate}</span>}
                      </div>
                      <p className="text-sm font-bold text-slate-800 group-hover:text-blue-700 leading-snug transition-colors">{job.title}</p>
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

      {/* Main Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CATEGORIES.slice(0, 3).map(cat => (
          <CategoryCard key={cat.type} cat={cat} jobs={jobsByType(cat.type)} />
        ))}
      </div>

      {/* About SarkariJobSeva — SEO content block */}
      <AboutSection />

      {/* Latest Blogs */}
      <LatestBlogs />

      {/* Secondary Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CATEGORIES.slice(3).map(cat => (
          <CategoryCard key={cat.type} cat={cat} jobs={jobsByType(cat.type)} />
        ))}
      </div>

      {/* FAQ Section — SEO + AdSense content */}
      <FAQSection />


      {/* State Wise Jobs Section */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-1 h-5 bg-blue-600 rounded-full" />
          <h2 className="font-black text-slate-800 text-base uppercase tracking-wide">🗺️ State Wise Sarkari Jobs 2026</h2>
        </div>
        <p className="text-slate-600 text-sm leading-relaxed mb-4">
          भारत के हर राज्य में सरकारी नौकरियां निकलती हैं। SarkariJobSeva पर आपको Uttar Pradesh, Bihar, Rajasthan, Madhya Pradesh, Delhi, Jharkhand, Haryana, Punjab समेत सभी राज्यों की latest vacancy की जानकारी मिलती है। चाहे UP Police हो, BPSC हो, RPSC हो या MPESB — सभी राज्यों की भर्तियां एक ही जगह।
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { state: "Uttar Pradesh", exams: "UPSSSC, UPPSC, UP Police, UP TET", color: "bg-blue-50 border-blue-200 text-blue-800" },
            { state: "Bihar", exams: "BPSC, BSSC, CSBC, Bihar Police", color: "bg-green-50 border-green-200 text-green-800" },
            { state: "Rajasthan", exams: "RPSC, RSSB, Rajasthan Police", color: "bg-orange-50 border-orange-200 text-orange-800" },
            { state: "Madhya Pradesh", exams: "MPPSC, MPESB, MP Police", color: "bg-purple-50 border-purple-200 text-purple-800" },
            { state: "Delhi", exams: "DSSSB, Delhi Police, DDA", color: "bg-red-50 border-red-200 text-red-800" },
            { state: "Jharkhand", exams: "JPSC, JSSC, Jharkhand Police", color: "bg-yellow-50 border-yellow-200 text-yellow-800" },
            { state: "Haryana", exams: "HSSC, Haryana Police, HPSC", color: "bg-teal-50 border-teal-200 text-teal-800" },
            { state: "Uttarakhand", exams: "UKPSC, UKSSSC, UK Police", color: "bg-indigo-50 border-indigo-200 text-indigo-800" },
          ].map(({ state, exams, color }) => (
            <div key={state} className={`border rounded-xl p-3 ${color}`}>
              <p className="font-bold text-sm">{state}</p>
              <p className="text-xs mt-1 opacity-80">{exams}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Category Wise Jobs */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-1 h-5 bg-blue-600 rounded-full" />
          <h2 className="font-black text-slate-800 text-base uppercase tracking-wide">📋 Category Wise Sarkari Naukri 2026</h2>
        </div>
        <p className="text-slate-600 text-sm leading-relaxed mb-4">
          अपनी योग्यता के अनुसार सरकारी नौकरी ढूंढें। 10वीं पास से लेकर Post Graduate तक — हर category के लिए government jobs available हैं।
        </p>
        <div className="space-y-3">
          {[
            { cat: "10वीं Pass Jobs", desc: "Railway Group D, SSC GD, SSC MTS, Army Soldier GD, UP Police Constable, Bihar Police Constable, Anganwadi Worker, Home Guard, Peon, Chowkidar, Fire Fighter — इन सभी posts के लिए 10th pass काफी है।", icon: "🎓" },
            { cat: "12वीं Pass Jobs", desc: "SSC CHSL, Railway ALP, Railway Technician, Bank Clerk, Army Clerk, NDA, Police Sub Inspector SI, SSC Stenographer, Postal Assistant — 12वीं पास candidates के लिए बेहतरीन अवसर।", icon: "📚" },
            { cat: "Graduation Jobs", desc: "SSC CGL, UPSC Civil Services IAS IPS IFS, IBPS PO, SBI PO, UPSSSC Lower PCS, State PSC, Defence Officer NDA CDS AFCAT, SSC CPO SI, Bank PO — Graduate candidates के लिए premium government jobs।", icon: "🏛️" },
            { cat: "Engineering Jobs", desc: "GATE के through PSU jobs — ONGC, BHEL, NTPC, GAIL, IOCL। Railway JE, SSC JE, UPSC ESE, State PSC Engineering Services, CPWD JE — Engineering graduates के लिए शानदार career।", icon: "⚙️" },
            { cat: "Teaching Jobs", desc: "CTET, State TET, BPSC TRE, KVS TGT PGT PRT, NVS Teacher, UP TGT PGT, REET, HTET, JHTET — Teaching career में stability और respect दोनों मिलते हैं।", icon: "👨‍🏫" },
          ].map(({ cat, desc, icon }) => (
            <div key={cat} className="flex gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-2xl flex-shrink-0">{icon}</span>
              <div>
                <p className="font-bold text-slate-800 text-sm">{cat}</p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Government Jobs */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl p-6 md:p-8 text-white">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-1 h-5 bg-white rounded-full" />
          <h2 className="font-black text-white text-base uppercase tracking-wide">🏆 Sarkari Naukri क्यों करें?</h2>
        </div>
        <p className="text-blue-100 text-sm leading-relaxed mb-5">
          भारत में सरकारी नौकरी सिर्फ एक job नहीं — यह एक सुरक्षित और सम्मानजनक जीवन की guarantee है। जानिए क्यों लाखों युवा सरकारी नौकरी को पहली priority देते हैं।
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Job Security", desc: "एक बार permanent government employee बनने के बाद retirement तक job guaranteed। Recession में भी कोई layoff नहीं।", icon: "🔒" },
            { title: "Attractive Salary", desc: "7th Pay Commission के बाद सरकारी salary काफी बढ़ गई है। DA, HRA, TA के साथ in-hand salary private से कम नहीं।", icon: "💰" },
            { title: "Pension & Benefits", desc: "Medical, LTC, Children Education Allowance, Government Quarter, Canteen, Pension — Private sector में यह सब कहां मिलता है?", icon: "🏥" },
            { title: "Work-Life Balance", desc: "Fixed working hours — 9 to 5। Saturday-Sunday off। त्योहारों पर छुट्टी। Overtime pressure नहीं।", icon: "⚖️" },
            { title: "Social Respect", desc: "Government officer या employee को समाज में अलग सम्मान मिलता है। IAS, IPS, Teacher, Doctor — सभी respected careers।", icon: "🎖️" },
            { title: "Career Growth", desc: "Promotions के through Constable से Inspector, Teacher से Principal, JE से AE — career में आगे बढ़ने के अवसर हैं।", icon: "📈" },
          ].map(({ title, desc, icon }) => (
            <div key={title} className="bg-white/10 backdrop-blur rounded-xl p-4">
              <p className="text-xl mb-2">{icon}</p>
              <p className="font-bold text-white text-sm">{title}</p>
              <p className="text-blue-100 text-xs mt-1 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Important Exams Guide */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-1 h-5 bg-blue-600 rounded-full" />
          <h2 className="font-black text-slate-800 text-base uppercase tracking-wide">📝 Important Sarkari Exams 2026</h2>
        </div>
        <p className="text-slate-600 text-sm leading-relaxed mb-4">
          भारत में हर साल सैकड़ों सरकारी परीक्षाएं होती हैं। इनमें से कुछ सबसे महत्वपूर्ण exams की जानकारी नीचे दी गई है। इन exams की preparation करके आप अपना government job का सपना पूरा कर सकते हैं।
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { exam: "UPSC Civil Services IAS IPS IFS", detail: "भारत की सबसे prestigious exam। Pre, Mains और Interview — तीन stages। 1000+ posts annually। Graduation required। Age 21-32 years।" },
            { exam: "SSC CGL", detail: "Central Government Group-B और Group-C posts। Income Tax Inspector, ASO, Auditor, Accountant। Graduation required। Annual exam।" },
            { exam: "IBPS PO & Clerk", detail: "Public Sector Banks में PO और Clerk की भर्ती। Pre, Mains और Interview। Graduation required। Salary ₹40,000 से ₹75,000।" },
            { exam: "Railway RRB Group D & NTPC", detail: "Indian Railways में technical और non-technical posts। 10th से Graduation — सभी के लिए। लाखों vacancies annually।" },
            { exam: "SSC GD Constable", detail: "BSF, CRPF, CISF, SSB, ITBP में Constable। 10th pass eligible। Physical test compulsory। Salary ₹22,000 से ₹30,000।" },
            { exam: "NDA & CDS", detail: "Indian Army, Navy, Air Force में Officer। NDA के लिए 12th, CDS के लिए Graduation। SSB Interview compulsory।" },
          ].map(({ exam, detail }) => (
            <div key={exam} className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <p className="font-bold text-slate-800 text-sm">{exam}</p>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How to Apply Guide */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-1 h-5 bg-blue-600 rounded-full" />
          <h2 className="font-black text-slate-800 text-base uppercase tracking-wide">✅ Sarkari Job Apply कैसे करें?</h2>
        </div>
        <p className="text-slate-600 text-sm leading-relaxed mb-4">
          सरकारी नौकरी के लिए Apply करना अब बहुत आसान है। Online application process को step by step समझें और कोई भी गलती न करें।
        </p>
        <div className="space-y-3">
          {[
            { step: "1", title: "Official Notification पढ़ें", desc: "पहले Official Notification download करें और ध्यान से पढ़ें। Eligibility, Age Limit, Application Fee, Important Dates — सब check करें।" },
            { step: "2", title: "Documents तैयार रखें", desc: "10th, 12th, Graduation certificate, Photo, Signature, Aadhaar Card, Caste Certificate — सब scan करके ready रखें।" },
            { step: "3", title: "Online Registration करें", desc: "Official Website पर New Registration करें। Valid Email और Mobile Number डालें। Password याद रखें।" },
            { step: "4", title: "Application Form भरें", desc: "सभी details सही-सही भरें। Photo और Signature upload करें। Preview check करें।" },
            { step: "5", title: "Application Fee Pay करें", desc: "Net Banking, UPI, Debit Card से fee pay करें। Fee receipt save करें।" },
            { step: "6", title: "Confirmation Print करें", desc: "Final Submit के बाद Confirmation Page का Print निकाल लें। Application Number note करें।" },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-4 items-start">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-black text-sm">{step}</span>
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">{title}</p>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
        <p className="text-xs text-amber-800 font-medium">
          ⚠️ <strong>Important Notice:</strong> SarkariJobSeva.com एक निजी सूचना पोर्टल है। यह किसी सरकारी विभाग से संबद्ध नहीं है।
          Apply करने से पहले हमेशा Official Website पर जाकर Notification ध्यान से पढ़ें।
        </p>
      </div>

    </div>
  );
}
