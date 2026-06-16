import { useState, useEffect } from "react";
import { Link } from "wouter";

const STORAGE_KEY = "sjs_cookie_consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      if (!existing) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ status: "accepted", ts: Date.now() }));
    } catch {}
    setVisible(false);
  };

  const decline = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ status: "declined", ts: Date.now() }));
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t-2 border-blue-700 shadow-[0_-4px_12px_rgba(0,0,0,0.12)] px-4 py-4 sm:px-6"
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <p className="text-xs sm:text-sm text-slate-700 flex-1 leading-relaxed">
          Hum aapko behtar experience dene ke liye cookies ka use karte hain, jisme personalized ads
          dikhane ke liye Google AdSense bhi shamil hai. Site use karna jari rakhkar aap hamari{" "}
          <Link href="/privacy-policy">
            <span className="text-blue-600 underline cursor-pointer">Privacy Policy</span>
          </Link>{" "}
          se sehmat hote hain.
        </p>
        <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
          <button
            onClick={decline}
            className="flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
