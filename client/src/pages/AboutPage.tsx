import { Link } from "wouter";
import { useEffect } from "react";
import { Users, Target, Shield, Award, Mail, Globe, MapPin } from "lucide-react";

export default function AboutPage() {
  useEffect(() => {
    document.title = "About Us | SarkariJobSeva - India's Trusted Government Job Portal";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', "SarkariJobSeva.com ek independent government job information portal hai. Yahan SSC, Railway, UPSC, Bank, Police aur State Government jobs ki latest updates milti hain.");
    }
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', "https://www.sarkarijobseva.com/about-us");
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">About SarkariJobSeva</h1>
          <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto">
            India's Trusted Independent Government Job Information Portal — Accurate, Timely, and Free
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Mission */}
        <div className="bg-blue-50 rounded-2xl p-8 mb-10 border border-blue-100">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-800">Our Mission</h2>
          </div>
          <p className="text-slate-700 leading-relaxed text-lg">
            SarkariJobSeva.com was founded with a singular mission: <strong>to bridge the information gap between government job aspirants and official recruitment notifications.</strong> Every year, millions of young Indians dream of securing a government job, but many miss out simply because they didn't get timely information. We exist to ensure that no deserving candidate ever misses an opportunity due to lack of awareness.
          </p>
        </div>

        {/* Who We Are */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-800">Who We Are</h2>
          </div>
          <div className="prose prose-lg text-slate-700 leading-relaxed">
            <p>
              SarkariJobSeva is a dedicated team of government job experts, educators, and tech professionals working together to bring you the most accurate and up-to-date job information. Our team monitors official government websites, employment news, and recruitment boards round the clock to ensure you get information as soon as it is published.
            </p>
            <p>
              We are <strong>NOT a government website</strong> — we are an independent informational platform that aggregates and presents job data in an easy-to-understand format. We do not process applications, conduct exams, or guarantee selections. Our role is purely informational.
            </p>
          </div>
        </div>

        {/* What Makes Us Different */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-800">What Makes Us Different</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "Verified Information", desc: "Every job notification is cross-checked with official government sources before publishing. We verify dates, eligibility, and application links." },
              { title: "Timely Updates", desc: "Our team works 24/7 to update new jobs, admit cards, results, and answer keys within hours of official release." },
              { title: "Detailed Analysis", desc: "Unlike other portals, we provide in-depth analysis including salary breakdown, career growth, exam pattern, and preparation strategy." },
              { title: "User-Friendly Format", desc: "Complex government notifications are simplified into easy-to-read tables, bullet points, and step-by-step guides." },
              { title: "Completely Free", desc: "All information on our portal is 100% free. We never charge for job alerts, admit cards, or results." },
              { title: "Mobile Optimized", desc: "Our website is fully responsive, ensuring a seamless experience on smartphones, tablets, and desktops." },
            ].map((item, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-5 border border-slate-200 hover:border-blue-300 transition-colors">
                <h3 className="font-bold text-slate-800 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Services */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-800">What We Provide</h2>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-sm font-bold text-slate-700">Service</th>
                  <th className="px-4 py-3 text-sm font-bold text-slate-700">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { service: "Latest Government Jobs", desc: "Daily updates on SSC, Railway, UPSC, Bank, Defence, Police, and State Government vacancies" },
                  { service: "Admit Cards", desc: "Instant alerts and download links for all major government exam admit cards" },
                  { service: "Exam Results", desc: "Quick result updates with direct links to official result pages" },
                  { service: "Answer Keys", desc: "Provisional and final answer keys for all competitive exams" },
                  { service: "Syllabus & Pattern", desc: "Detailed exam syllabus, pattern, and marking scheme for effective preparation" },
                  { service: "Preparation Guides", desc: "Expert-written articles on exam preparation, book recommendations, and strategy" },
                  { service: "Salary Calculator", desc: "7th Pay Commission based salary estimation tool for government posts" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-semibold text-blue-700">{row.service}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{row.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* How We Work */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Hum Kaise Kaam Karte Hain?</h2>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
              <p>
                Hamari team government recruitment ki official websites — jaise SSC, Railway Board, UPSC, IBPS, state PSC portals — ko regularly monitor karti hai. Jab bhi koi nayi notification release hoti hai, hum use carefully read karke user-friendly format mein present karte hain.
              </p>
              <p>
                Har job post mein important dates, application fee, age limit, vacancy details aur eligibility — sab official notification se directly liya jaata hai. Hum koi bhi information bina verify kiye publish nahi karte.
              </p>
              <p>
                Hamara goal simple hai: aapko sahi waqt par sahi information milni chahiye — bilkul free mein, bina kisi registration ke.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Signals */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 mb-10 border border-green-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Hum Par Bharosa Kyun Karein?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-bold text-slate-800 text-sm">Official Sources Only</p>
                <p className="text-slate-600 text-xs mt-1">Sab information official government websites se verify ki jaati hai</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🆓</span>
              <div>
                <p className="font-bold text-slate-800 text-sm">Bilkul Free</p>
                <p className="text-slate-600 text-xs mt-1">Koi registration nahi, koi fee nahi — sab jankari free mein</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <p className="font-bold text-slate-800 text-sm">Daily Updates</p>
                <p className="text-slate-600 text-xs mt-1">Nayi vacancies, results aur admit cards daily update kiye jaate hain</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Contact Information</h2>
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Email</p>
                  <p className="text-slate-600 text-sm">supportsarkarijobseva@gmail.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Website</p>
                  <p className="text-slate-600 text-sm">www.sarkarijobseva.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Location</p>
                  <p className="text-slate-600 text-sm">New Delhi, India</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h3 className="font-bold text-amber-800 mb-2">Important Disclaimer</h3>
          <p className="text-amber-700 text-sm leading-relaxed">
            SarkariJobSeva.com is a private informational portal and is NOT affiliated with any government department, ministry, or organization. All information is collected from publicly available official sources. We do not charge any fee for job information and do not process applications. Always verify details from official notifications before applying.
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
