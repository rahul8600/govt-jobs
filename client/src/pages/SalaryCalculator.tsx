import { useState } from 'react';
import { useSEO } from '@/components/SEO';
import { Calculator, TrendingUp, Info, ExternalLink } from 'lucide-react';

// 7th CPC Pay Matrix as per official gazette notification
// Source: 7th Central Pay Commission Report, Ministry of Finance
const PAY_MATRIX: Record<string, { basic: number; label: string; examples: string }> = {
  '1':  { basic: 18000,  label: 'Level 1',  examples: 'MTS, Peon, Helper, Group D' },
  '2':  { basic: 19900,  label: 'Level 2',  examples: 'Group D (skilled)' },
  '3':  { basic: 21700,  label: 'Level 3',  examples: 'Constable (GD), LDC' },
  '4':  { basic: 25500,  label: 'Level 4',  examples: 'Constable (Technical), Clerk' },
  '5':  { basic: 29200,  label: 'Level 5',  examples: 'Upper Division Clerk, Junior Clerk' },
  '6':  { basic: 35400,  label: 'Level 6',  examples: 'ASI, Sub Inspector, Junior Engineer, Head Constable' },
  '7':  { basic: 44900,  label: 'Level 7',  examples: 'Inspector, Section Officer, Junior Accountant' },
  '8':  { basic: 47600,  label: 'Level 8',  examples: 'Sr. Section Officer, Accountant' },
  '9':  { basic: 53100,  label: 'Level 9',  examples: 'Under Secretary, Sr. Inspector' },
  '10': { basic: 56100,  label: 'Level 10', examples: 'DSP, Asst. Commandant, Group A Entry' },
  '11': { basic: 67700,  label: 'Level 11', examples: 'Deputy Director, SSP' },
  '12': { basic: 78800,  label: 'Level 12', examples: 'Director, SP, DIG' },
  '13': { basic: 118500, label: 'Level 13', examples: 'Joint Secretary, IG' },
  '14': { basic: 144200, label: 'Level 14', examples: 'Additional Secretary' },
};

// HRA rates as per 7th CPC (revised June 2024)
const CITY_HRA: Record<string, { label: string; rate: number }> = {
  'X': { label: 'X (Delhi, Mumbai, Chennai, Kolkata, Hyderabad, Bengaluru)', rate: 0.27 },
  'Y': { label: 'Y (State Capitals, Cities >50 lakh population)', rate: 0.18 },
  'Z': { label: 'Z (Other towns & rural areas)', rate: 0.09 },
};

// DA as per Jan 2025 order (50% of basic)
// Source: Ministry of Finance Office Memorandum dated Jan 2025
const DA_RATE = 0.50;

// TA as per 7th CPC (revised)
const getTA = (level: number) => {
  if (level <= 2) return 1350;
  if (level <= 8) return 3600;
  return 7200;
};

// NPS contribution - 10% of (Basic + DA) for central govt employees
// CGHS subscription as per circular
const getCGHS = (level: number) => {
  if (level <= 2) return 250;
  if (level <= 5) return 450;
  if (level <= 9) return 650;
  if (level <= 12) return 1000;
  return 1300;
};

export default function SalaryCalculator() {
  const [level, setLevel] = useState('6');
  const [city, setCity] = useState('Y');
  const [showBreakdown, setShowBreakdown] = useState(false);

  useSEO({
    title: "7th Pay Commission Salary Calculator 2026 – Sarkari Naukri In-Hand Salary",
    description: "7th Pay Commission ke anusar apni sarkari naukri ki salary calculate karein. Basic Pay, DA 50%, HRA, TA sab milakaar in-hand salary jaanein. Level 1 se Level 14 tak.",
    keywords: "7th pay commission salary calculator 2026, sarkari naukri salary, government job salary calculator, DA 50% salary, HRA TA calculator, in hand salary government employee",
    canonical: "https://sarkarijobseva.com/salary-calculator",
  });

  const lvl = parseInt(level);
  const pay = PAY_MATRIX[level];
  const basic = pay.basic;
  const da = Math.round(basic * DA_RATE);
  const hra = Math.round(basic * CITY_HRA[city].rate);
  const ta = getTA(lvl);
  const gross = basic + da + hra + ta;

  // Deductions
  const nps = Math.round((basic + da) * 0.10); // NPS on basic+DA
  const cghs = getCGHS(lvl);
  const totalDed = nps + cghs;
  const inHand = gross - totalDed;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl p-5 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-1">
          <Calculator className="w-6 h-6" />
          <h1 className="text-lg font-black">7th Pay Commission Salary Calculator</h1>
        </div>
        <p className="text-blue-200 text-xs">सरकारी नौकरी में कितनी सैलरी मिलेगी – जानें यहाँ</p>
        <p className="text-blue-300 text-xs mt-1">DA: 50% (Jan 2025) | Based on official 7th CPC Pay Matrix</p>
      </div>

      {/* Inputs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div>
          <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2 block">Pay Level चुनें *</label>
          <select value={level} onChange={e => setLevel(e.target.value)}
            className="w-full border-2 border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-blue-500 bg-white">
            {Object.entries(PAY_MATRIX).map(([lvl, d]) => (
              <option key={lvl} value={lvl}>
                Level {lvl} – Basic ₹{d.basic.toLocaleString('en-IN')} | {d.examples}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2 block">City Category चुनें *</label>
          <select value={city} onChange={e => setCity(e.target.value)}
            className="w-full border-2 border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-blue-500 bg-white">
            {Object.entries(CITY_HRA).map(([cat, d]) => (
              <option key={cat} value={cat}>{cat} City – {d.label} (HRA {Math.round(d.rate * 100)}%)</option>
            ))}
          </select>
        </div>
      </div>

      {/* Result */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 text-white shadow-xl">
        <p className="text-green-100 text-sm font-bold mb-1">💰 अनुमानित In-Hand Salary</p>
        <p className="text-4xl font-black">₹{inHand.toLocaleString('en-IN')}</p>
        <p className="text-green-200 text-xs mt-1">प्रति माह (Per Month) – approximate</p>
        <p className="text-green-100 text-sm mt-2 font-semibold">Gross: ₹{gross.toLocaleString('en-IN')} | Deductions: ₹{totalDed.toLocaleString('en-IN')}</p>
      </div>

      {/* Breakdown */}
      <button onClick={() => setShowBreakdown(!showBreakdown)}
        className="w-full bg-white border-2 border-blue-200 rounded-xl py-3 text-blue-700 font-black text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
        <TrendingUp className="w-4 h-4" />
        {showBreakdown ? 'Breakdown छुपाएं' : 'पूरा Breakdown देखें'}
      </button>

      {showBreakdown && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-sm">
          <div className="bg-slate-50 px-4 py-3 border-b">
            <p className="font-black text-slate-700">Level {level} – {pay.label} | {pay.examples}</p>
          </div>
          <div className="p-4 space-y-2">
            <p className="text-xs font-black text-green-600 uppercase tracking-wide mb-2">✅ आय (Earnings)</p>
            {[
              { l: `Basic Pay (मूल वेतन)`, v: basic, note: '' },
              { l: `Dearness Allowance – DA (${Math.round(DA_RATE*100)}% of Basic)`, v: da, note: 'Jan 2025 rate' },
              { l: `HRA – ${city} City (${Math.round(CITY_HRA[city].rate*100)}% of Basic)`, v: hra, note: '7th CPC rate' },
              { l: `Transport Allowance – TA`, v: ta, note: 'Level based' },
            ].map(item => (
              <div key={item.l} className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">{item.l} <span className="text-xs text-slate-400">{item.note}</span></span>
                <span className="font-black text-slate-800">+ ₹{item.v.toLocaleString('en-IN')}</span>
              </div>
            ))}
            <div className="flex justify-between py-2 bg-green-50 rounded-lg px-3 mt-1">
              <span className="font-black text-green-700">Gross Salary</span>
              <span className="font-black text-green-700">₹{gross.toLocaleString('en-IN')}</span>
            </div>

            <p className="text-xs font-black text-red-500 uppercase tracking-wide mt-3 mb-2">❌ कटौती (Deductions)</p>
            {[
              { l: `NPS – National Pension (10% of Basic+DA)`, v: nps },
              { l: `CGHS – Health Subscription`, v: cghs },
            ].map(item => (
              <div key={item.l} className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">{item.l}</span>
                <span className="font-black text-red-500">– ₹{item.v.toLocaleString('en-IN')}</span>
              </div>
            ))}
            <div className="flex justify-between py-2 bg-blue-700 rounded-lg px-3 mt-1 text-white">
              <span className="font-black">🏆 Net In-Hand Salary</span>
              <span className="font-black">₹{inHand.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      )}

      {/* IMPORTANT DISCLAIMER - Legal protection */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 space-y-2">
        <div className="flex gap-2 items-start">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-black text-amber-800 mb-1">⚠️ महत्वपूर्ण सूचना (Important Disclaimer)</p>
            <ul className="text-xs text-amber-700 space-y-1 font-medium list-disc list-inside">
              <li>यह calculator केवल <strong>अनुमानित (approximate)</strong> जानकारी के लिए है।</li>
              <li>Actual salary posting location, department, increment aur allowances par depend karti hai।</li>
              <li>DA rate government order se samay-samay par badlti rehti hai।</li>
              <li>Income Tax, Professional Tax aur other deductions is calculation mein shamil NAHIN hain।</li>
              <li>Final salary ke liye apna appointment letter ya department se confirm karein।</li>
              <li>SarkariJobSeva.com kisi bhi galti ke liye zimmedar NAHIN hai।</li>
            </ul>
          </div>
        </div>
        <a href="https://doe.gov.in/pay-commission" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-blue-600 font-bold hover:underline">
          <ExternalLink className="w-3 h-3" /> Official 7th Pay Commission – Department of Expenditure
        </a>
      </div>
    </div>
  );
}
