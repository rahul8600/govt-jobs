import { useEffect } from "react";
import { Link } from "wouter";
import { Map, Briefcase, FileText, CheckSquare, Key, GraduationCap, Calculator, BookOpen, Info, Phone, Shield, FileQuestion } from "lucide-react";

export default function SitemapPage() {
  useEffect(() => {
    document.title = "Sitemap | SarkariJobSeva - Complete Website Navigation";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', "Complete sitemap of SarkariJobSeva.com. Find all pages including Latest Jobs, Admit Card, Results, Answer Key, Blog, Salary Calculator, and more.");
    }
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', "https://www.sarkarijobseva.com/sitemap");
    }
  }, []);

  const sections = [
    {
      title: "Main Pages",
      icon: <Map className="w-5 h-5" />,
      links: [
        { label: "Home", href: "/", desc: "Latest government job updates" },
        { label: "Latest Jobs", href: "/latest-jobs", desc: "All latest government job notifications" },
        { label: "Admit Card", href: "/admit-card", desc: "Download admit cards for all exams" },
        { label: "Results", href: "/results", desc: "Check latest exam results" },
        { label: "Answer Key", href: "/answer-key", desc: "Download answer keys" },
        { label: "Admission", href: "/admission", desc: "College and course admissions" },
      ]
    },
    {
      title: "Job Categories",
      icon: <Briefcase className="w-5 h-5" />,
      links: [
        { label: "10th Pass Jobs", href: "/category/10th-pass", desc: "Government jobs for 10th pass candidates" },
        { label: "12th Pass Jobs", href: "/category/12th-pass", desc: "Government jobs for 12th pass candidates" },
        { label: "Graduation Jobs", href: "/category/graduation", desc: "Jobs for graduate candidates" },
        { label: "Engineering Jobs", href: "/category/engineering", desc: "Engineering and technical jobs" },
        { label: "Teaching Jobs", href: "/category/teaching", desc: "Teacher and professor vacancies" },
        { label: "Police Jobs", href: "/category/police", desc: "Police constable and SI jobs" },
        { label: "SSC Jobs", href: "/category/ssc", desc: "SSC CGL, CHSL, MTS, GD vacancies" },
        { label: "Railway Jobs", href: "/category/railway", desc: "Railway RRB, NTPC, Group D jobs" },
        { label: "Bank Jobs", href: "/category/bank", desc: "IBPS, SBI, RBI bank jobs" },
        { label: "Defence Jobs", href: "/category/defence", desc: "Army, Navy, Air Force, NDA, CDS" },
      ]
    },
    {
      title: "State Wise Jobs",
      icon: <Map className="w-5 h-5" />,
      links: [
        { label: "Uttar Pradesh Jobs", href: "/state/uttar-pradesh", desc: "UPSSSC, UPPSC, UP Police jobs" },
        { label: "Bihar Jobs", href: "/state/bihar", desc: "BPSC, BSSC, Bihar Police jobs" },
        { label: "Rajasthan Jobs", href: "/state/rajasthan", desc: "RPSC, RSSB, Rajasthan Police jobs" },
        { label: "Madhya Pradesh Jobs", href: "/state/madhya-pradesh", desc: "MPPSC, MPESB, MP Police jobs" },
        { label: "Delhi Jobs", href: "/state/delhi", desc: "DSSSB, Delhi Police, DDA jobs" },
        { label: "Haryana Jobs", href: "/state/haryana", desc: "HSSC, Haryana Police, HPSC jobs" },
        { label: "Jharkhand Jobs", href: "/state/jharkhand", desc: "JPSC, JSSC, Jharkhand Police jobs" },
        { label: "Uttarakhand Jobs", href: "/state/uttarakhand", desc: "UKPSC, UKSSSC, UK Police jobs" },
      ]
    },
    {
      title: "Tools & Resources",
      icon: <Calculator className="w-5 h-5" />,
      links: [
        { label: "Salary Calculator", href: "/salary-calculator", desc: "Calculate government job salary" },
        { label: "Blog", href: "/blog", desc: "Exam preparation tips and guides" },
        { label: "Syllabus", href: "/syllabus", desc: "Detailed exam syllabus information" },
      ]
    },
    {
      title: "Information Pages",
      icon: <Info className="w-5 h-5" />,
      links: [
        { label: "About Us", href: "/about-us", desc: "Learn about SarkariJobSeva mission and team" },
        { label: "Contact Us", href: "/contact", desc: "Get in touch with our team" },
        { label: "Privacy Policy", href: "/privacy-policy", desc: "How we protect your data" },
        { label: "Terms of Service", href: "/terms", desc: "Terms and conditions of use" },
        { label: "Disclaimer", href: "/disclaimer", desc: "Important legal disclaimers" },
        { label: "Sitemap", href: "/sitemap", desc: "Complete website navigation" },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Sitemap</h1>
          <p className="text-blue-100">Complete navigation guide for SarkariJobSeva.com</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-blue-50 rounded-xl p-6 mb-10 border border-blue-100">
          <p className="text-slate-700">
            Welcome to our complete sitemap. This page lists all important sections and pages of SarkariJobSeva.com to help you navigate easily. Use the links below to find exactly what you are looking for.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {sections.map((section, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center gap-2">
                <div className="text-blue-600">{section.icon}</div>
                <h2 className="font-bold text-slate-800">{section.title}</h2>
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      <Link href={link.href} className="block p-2 rounded-lg hover:bg-blue-50 transition-colors group">
                        <span className="font-semibold text-blue-600 group-hover:text-blue-700 text-sm">{link.label}</span>
                        <span className="text-slate-500 text-xs block mt-0.5">{link.desc}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-10 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <h2 className="font-bold text-slate-800 mb-4">Website Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">10,000+</div>
              <div className="text-xs text-slate-600">Job Posts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">50+</div>
              <div className="text-xs text-slate-600">Categories</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">28</div>
              <div className="text-xs text-slate-600">States Covered</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">Daily</div>
              <div className="text-xs text-slate-600">Updates</div>
            </div>
          </div>
        </div>

        <div className="text-center mt-10">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
