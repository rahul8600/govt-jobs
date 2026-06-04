import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="text-7xl font-black text-blue-100 mb-2">404</div>
        <h1 className="text-2xl font-black text-slate-800 mb-3">पेज नहीं मिला</h1>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
          यह पेज मौजूद नहीं है या हटा दिया गया है। नीचे दिए links से जरूरी जानकारी पाएं।
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { href: "/latest-jobs", label: "🗂 Latest Jobs" },
            { href: "/admit-card",  label: "🪪 Admit Card" },
            { href: "/results",     label: "📊 Results" },
            { href: "/answer-key",  label: "🔑 Answer Key" },
          ].map(({ href, label }) => (
            <Link key={href} href={href}>
              <div className="bg-blue-50 border border-blue-100 rounded-xl py-3 px-4 text-blue-700 font-bold text-sm hover:bg-blue-100 transition-colors cursor-pointer">
                {label}
              </div>
            </Link>
          ))}
        </div>

        <Link href="/">
          <div className="inline-block bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors cursor-pointer text-sm">
            🏠 Home पर वापस जाएं
          </div>
        </Link>
      </div>
    </div>
  );
}
