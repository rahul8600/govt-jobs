import { useState } from 'react';
import { useSEO } from '@/components/SEO';
import { Calculator, IndianRupee, TrendingUp, Info } from 'lucide-react';

const PAY_MATRIX = {
  '1': { basic: 18000, label: 'Level 1 – MTS, Peon, Group D' },
  '2': { basic: 19900, label: 'Level 2 – Group D' },
  '3': { basic: 21700, label: 'Level 3 – Constable, LDC' },
  '4': { basic: 25500, label: 'Level 4 – Clerk, Junior Assistant' },
  '5': { basic: 29200, label: 'Level 5 – Upper Division Clerk' },
  '6': { basic: 35400, label: 'Level 6 – Sub Inspector, Junior Engineer' },
  '7': { basic: 44900, label: 'Level 7 – Inspector, Section Officer' },
  '8': { basic: 47600, label: 'Level 8 – Sr. Section Officer' },
  '9': { basic: 53100, label: 'Level 9 – Under Secretary' },
  '10': { basic: 56100, label: 'Level 10 – ASP, DSP, CAPF Asst Commandant' },
  '11': { basic: 67700, label: 'Level 11 – SSP, Deputy Director' },
  '12': { basic: 78800, label: 'Level 12 – SP, Director' },
  '13': { basic: 118500, label: 'Level 13 – IAS/IPS Joint Secretary' },
  '14': { basic: 144200, label: 'Level 14 – Additional Secretary' },
};

const CITIES = {
  'X': { label: 'X City (Delhi, Mumbai, Chennai, Kolkata, Hyderabad, Bengaluru)', hra: 0.27 },
  'Y': { label: 'Y City (State Capitals, Big Cities)', hra: 0.18 },
  'Z': { label: 'Z City (Other Areas / Rural)', hra: 0.09 },
};

const DA_RATE = 0.50; // 50% DA as of 2026
const TA_AMOUNT = { '1-4': 1350, '5-8': 3600, '9-14': 7200 };

export default function SalaryCalculator() {
  const [level, setLevel] = useState('6');
  const [city, setCity] = useState('Y');
  const [showBreakdown, setShowBreakdown] = useState(false);

  useSEO({
    title: "7th Pay Commission Salary Calculator 2026 – Sarkari Naukri Salary",
    description: "Calculate your government job salary as per 7th Pay Commission. Basic Pay, DA, HRA, TA sabka calculation karein. Sarkari naukri mein kitni salary milegi jaanein.",
    keywords: "7th pay commission salary calculator, sarkari naukri salary, government job salary 2026, DA HRA TA calculator, basic pay calculator India",
    canonical: "https://sarkarijobseva.com/salary-calculator",
  });

  const pay = PAY_MATRIX[level as keyof typeof PAY_MATRIX];
  const basic = pay.basic;
  const da = Math.round(basic * DA_RATE);
  const hra = Math.round(basic * CITIES[city as keyof typeof CITIES].hra);
  const levelNum = parseInt(level);
  const ta = levelNum <= 4 ? TA_AMOUNT['1-4'] : levelNum <= 8 ? TA_AMOUNT['5-8'] : TA_AMOUNT['9-14'];
  const grossSalary = basic + da + hra + ta;

  // Deductions
  const nps = Math.round(basic * 0.10);
  const cghs = levelNum <= 4 ? 250 : levelNum <= 8 ? 450 : 650;
  const totalDeductions = nps + cghs;
  const inHandSalary = grossSalary - totalDeductions;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-1">
          <Calculator className="w-7 h-7" />
          <h1 className="text-xl font-black">Salary Calculator</h1>
        </div>
        <p className="text-blue-200 text-sm">7th Pay Commission – 2026 | सरकारी नौकरी सैलरी कैलकुलेटर</p>
      </div>

      {/* Inputs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div>
          <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2 block">Pay Level चुनें</label>
          <select
            value={level}
            onChange={e => setLevel(e.target.value)}
            className="w-full border-2 border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-blue-500 bg-white"
          >
            {Object.entries(PAY_MATRIX).map(([lvl, data]) => (
              <option key={lvl} value={lvl}>Level {lvl} – ₹{data.basic.toLocaleString('en-IN')} | {data.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2 block">City Category चुनें</label>
          <select
            value={city}
            onChange={e => setCity(e.target.value)}
            className="w-full border-2 border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-blue-500 bg-white"
          >
            {Object.entries(CITIES).map(([cat, data]) => (
              <option key={cat} value={cat}>{cat} – {data.label} (HRA {Math.round(data.hra * 100)}%)</option>
            ))}
          </select>
        </div>
      </div>

      {/* Result Card */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
        <p className="text-green-100 text-sm font-bold mb-1">💰 हाथ में मिलने वाली सैलरी (In-Hand)</p>
        <p className="text-4xl font-black">₹{inHandSalary.toLocaleString('en-IN')}</p>
        <p className="text-green-200 text-xs mt-1">प्रति माह / Per Month</p>
        <p className="text-green-100 text-sm mt-2 font-semibold">Gross Salary: ₹{grossSalary.toLocaleString('en-IN')}</p>
      </div>

      {/* Breakdown Toggle */}
      <button
        onClick={() => setShowBreakdown(!showBreakdown)}
        className="w-full bg-white border-2 border-blue-200 rounded-xl py-3 text-blue-700 font-black text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
      >
        <TrendingUp className="w-4 h-4" />
        {showBreakdown ? 'Breakdown छुपाएं' : 'पूरा Breakdown देखें'}
      </button>

      {showBreakdown && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
            <p className="font-black text-slate-700 text-sm uppercase tracking-wide">Salary Breakdown – Level {level}</p>
          </div>
          {/* Earnings */}
          <div className="p-5 space-y-3">
            <p className="text-xs font-black uppercase text-green-600 tracking-widest mb-2">✅ Earnings (आय)</p>
            {[
              { label: 'Basic Pay (मूल वेतन)', value: basic },
              { label: `DA – Dearness Allowance (${Math.round(DA_RATE * 100)}%)`, value: da },
              { label: `HRA – House Rent Allowance (${Math.round(CITIES[city as keyof typeof CITIES].hra * 100)}% – ${city} City)`, value: hra },
              { label: 'TA – Transport Allowance', value: ta },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <span className="text-sm text-slate-600 font-semibold">{item.label}</span>
                <span className="text-sm font-black text-slate-800">+ ₹{item.value.toLocaleString('en-IN')}</span>
              </div>
            ))}
            <div className="flex items-center justify-between py-2 bg-green-50 rounded-xl px-3 mt-2">
              <span className="text-sm font-black text-green-700">Gross Salary</span>
              <span className="text-sm font-black text-green-700">₹{grossSalary.toLocaleString('en-IN')}</span>
            </div>

            <p className="text-xs font-black uppercase text-red-500 tracking-widest mb-2 mt-4">❌ Deductions (कटौती)</p>
            {[
              { label: 'NPS – National Pension System (10%)', value: nps },
              { label: 'CGHS – Health Insurance', value: cghs },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <span className="text-sm text-slate-600 font-semibold">{item.label}</span>
                <span className="text-sm font-black text-red-500">– ₹{item.value.toLocaleString('en-IN')}</span>
              </div>
            ))}

            <div className="flex items-center justify-between py-3 bg-blue-700 rounded-xl px-3 mt-2">
              <span className="text-sm font-black text-white">🏆 Net In-Hand Salary</span>
              <span className="text-sm font-black text-white">₹{inHandSalary.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-2">
        <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 font-semibold">यह calculator approximate है। Actual salary posting, increment aur department ke rules par depend karti hai। DA rate sarkari order se update hoti rehti hai।</p>
      </div>
    </div>
  );
}
