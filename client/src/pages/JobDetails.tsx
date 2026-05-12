import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useJobs } from "@/lib/useJobs";
import { Calendar, ExternalLink, ShieldCheck, MapPin, ChevronDown, ChevronUp, Share2 } from "lucide-react";
import { useSEO, generateJobMeta } from "@/components/SEO";
import { usePageTracker } from "@/lib/usePageTracker";

const hasText = (val: string | null | undefined): boolean => {
  return typeof val === 'string' && val.trim().length > 0;
};

const hasArrayContent = <T,>(arr: T[] | null | undefined, validator?: (item: T) => boolean): boolean => {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return false;
  if (validator) return arr.some(validator);
  return true;
};

const hasImportantDates = (dates: { label: string; date: string }[] | null | undefined): boolean => {
  return hasArrayContent(dates, d => hasText(d.label) || hasText(d.date));
};

const hasApplicationFee = (fees: { category: string; fee: string }[] | null | undefined): boolean => {
  return hasArrayContent(fees, f => hasText(f.category) || hasText(f.fee));
};

const hasAgeLimit = (ages: { category: string; minAge: string; maxAge: string }[] | null | undefined): boolean => {
  return hasArrayContent(ages, a => hasText(a.category) || hasText(a.minAge) || hasText(a.maxAge));
};

const hasVacancyDetails = (vacancies: { postName: string; totalPost: string; eligibility: string }[] | null | undefined): boolean => {
  return hasArrayContent(vacancies, v => hasText(v.postName) || hasText(v.totalPost) || hasText(v.eligibility));
};

const hasSelectionProcess = (steps: string[] | null | undefined): boolean => {
  return hasArrayContent(steps, s => hasText(s));
};

const hasPhysicalEligibility = (physical: { criteria: string; male: string; female: string }[] | null | undefined): boolean => {
  return hasArrayContent(physical, p => hasText(p.criteria) || hasText(p.male) || hasText(p.female));
};

const hasLinks = (links: { label: string; url: string }[] | null | undefined): boolean => {
  return hasArrayContent(links, l => hasText(l.label) && hasText(l.url));
};

// Check if job last date has passed
function isJobExpired(lastDate: string | null | undefined): boolean {
  if (!lastDate) return false;
  try {
    const months: Record<string, number> = {
      january:0,february:1,march:2,april:3,may:4,june:5,
      july:6,august:7,september:8,october:9,november:10,december:11
    };
    const wordMatch = lastDate.toLowerCase().match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
    if (wordMatch && months[wordMatch[2]] !== undefined) {
      const d = new Date(parseInt(wordMatch[3]), months[wordMatch[2]], parseInt(wordMatch[1]));
      d.setDate(d.getDate() + 1);
      return d < new Date();
    }
    const slashMatch = lastDate.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (slashMatch) {
      const d = new Date(parseInt(slashMatch[3]), parseInt(slashMatch[2])-1, parseInt(slashMatch[1]));
      d.setDate(d.getDate() + 1);
      return d < new Date();
    }
  } catch {}
  return false;
}

export default function JobDetails() {
  const [match, params] = useRoute("/job/:id");
  const { jobs, loading } = useJobs();
  const [showFullNotification, setShowFullNotification] = useState(false);

  const job = jobs.find(j => j.id === params?.id || j.slug === params?.id);
  
  const seoProps = job ? generateJobMeta(job) : { title: 'Loading...', description: '' };
  useSEO(seoProps);
  usePageTracker('job-detail', job ? parseInt(job.id) : undefined);

  if (loading) return <div className="p-10 text-center font-bold">Loading...</div>;
  if (!match) return null;
  if (!job) return <div className="p-10 text-center font-bold">Job Not Found</div>;

  const notifyLink = job.notificationUrl || job.links.find(l => l.label.toLowerCase().includes('notification'))?.url || "#";
  
  const getPrimaryActionButton = () => {
    switch (job.type) {
      case 'job':
        const applyUrl = job.applyOnlineUrl || job.links.find(l => l.label.toLowerCase().includes('apply'))?.url || "#";
        return { label: 'Apply Online', url: applyUrl };
      case 'admit-card':
        const admitUrl = job.admitCardUrl || job.links.find(l => l.label.toLowerCase().includes('admit'))?.url || "#";
        return { label: 'Download Admit Card', url: admitUrl };
      case 'result':
        const resultUrl = job.resultUrl || job.links.find(l => l.label.toLowerCase().includes('result'))?.url || "#";
        return { label: 'Download Result', url: resultUrl };
      case 'answer-key':
        const answerUrl = job.answerKeyUrl || job.links.find(l => l.label.toLowerCase().includes('answer'))?.url || "#";
        return { label: 'Download Answer Key', url: answerUrl };
      default:
        return { label: 'Apply Online', url: '#' };
    }
  };
  
  const primaryAction = getPrimaryActionButton();
  const expired = isJobExpired(job.lastDate);

  // Related jobs — same type, excluding current
  const relatedJobs = jobs
    .filter(j => j.type === job.type && j.id !== job.id)
    .slice(0, 5);

  const showDatesHtml = hasText(job.importantDatesHtml);
  const showDatesStructured = !showDatesHtml && hasImportantDates(job.importantDates);
  const showDates = showDatesHtml || showDatesStructured;

  const showFeeHtml = hasText(job.applicationFeeHtml);
  const showFeeStructured = !showFeeHtml && hasApplicationFee(job.applicationFee);
  const showFee = showFeeHtml || showFeeStructured;

  const showAgeLimitHtml = hasText(job.ageLimitHtml);
  const showAgeLimitStructured = !showAgeLimitHtml && hasAgeLimit(job.ageLimit);
  const showAgeLimit = showAgeLimitHtml || showAgeLimitStructured;

  const showVacancyHtml = hasText(job.vacancyDetailsHtml);
  const showVacancyStructured = !showVacancyHtml && hasVacancyDetails(job.vacancyDetails);
  const showVacancy = showVacancyHtml || showVacancyStructured;

  const showSelectionHtml = hasText(job.selectionProcessHtml);
  const showSelectionStructured = !showSelectionHtml && hasSelectionProcess(job.selectionProcess);
  const showSelection = showSelectionHtml || showSelectionStructured;

  const showPstHtml = hasText(job.physicalStandardHtml);
  const showPetHtml = hasText(job.physicalEfficiencyHtml);
  const showPhysicalStructured = !showPstHtml && !showPetHtml && hasPhysicalEligibility(job.physicalEligibility);

  const showLinksHtml = hasText(job.importantLinksHtml);
  const showLinksStructured = !showLinksHtml && hasLinks(job.links);
  const showLinks = showLinksHtml || showLinksStructured;

  const showEligibility = hasText(job.eligibilityDetails);

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">

      {/* Expired Banner */}
      {expired && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <p className="text-red-700 font-black text-sm uppercase tracking-wide">Application Closed!</p>
            <p className="text-red-600 text-xs mt-0.5">Last date ({job.lastDate}) has passed. Check latest jobs for new notifications.</p>
          </div>
          <Link href="/latest-jobs">
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer hover:bg-red-700 flex-shrink-0">New Jobs</span>
          </Link>
        </div>
      )}

      {/* 1. Header Card */}
      <div className="bg-white p-10 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/50 space-y-6">
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-snug text-center job-details-title" data-testid="text-job-title">
          {job.title}
        </h1>
        <div className="flex flex-wrap justify-center gap-3 text-xs font-bold text-slate-500">
          <span className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg"><MapPin className="w-4 h-4" /> {job.department}</span>
          <span className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg border border-blue-100"><Calendar className="w-4 h-4" /> Posted: {job.postDate}</span>
          {job.lastDate && <span className="flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-2 rounded-lg border border-rose-100"><Calendar className="w-4 h-4" /> Last Date: {job.lastDate}</span>}
        </div>
        
        {hasText(job.shortInfo) && (
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 p-7 rounded-xl border border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 job-details-short-heading">Short Information</h3>
            <p className="text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-line job-details-short-text" data-testid="text-short-info">{job.shortInfo}</p>
          </div>
        )}

        <div className="flex flex-col md:flex-row flex-wrap justify-center gap-4 pt-4">
          <a href={primaryAction.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-blue-600 text-white w-full md:w-auto px-9 py-5 md:py-4 rounded-xl font-bold text-sm md:text-xs uppercase tracking-widest hover:bg-blue-700 transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-xl active:scale-[0.98]" data-testid="button-primary-action">
            <ExternalLink className="w-5 h-5 md:w-4 md:h-4" /> {primaryAction.label}
          </a>
          <a href={notifyLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-slate-700 text-white w-full md:w-auto px-9 py-5 md:py-4 rounded-xl font-bold text-sm md:text-xs uppercase tracking-widest hover:bg-slate-800 transition-all duration-200 shadow-lg shadow-slate-700/25 hover:shadow-xl active:scale-[0.98]" data-testid="button-notification">
            Notification
          </a>
          {/* WhatsApp Share */}
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`🔔 ${job.title}\n📅 Last Date: ${job.lastDate || 'N/A'}\n🔗 ${window.location.href}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-green-500 text-white w-full md:w-auto px-9 py-5 md:py-4 rounded-xl font-bold text-sm md:text-xs uppercase tracking-widest hover:bg-green-600 transition-all duration-200 shadow-lg active:scale-[0.98]"
          >
            <Share2 className="w-5 h-5 md:w-4 md:h-4" /> WhatsApp Share
          </a>
          {/* Telegram Channel */}
          <a
            href="https://t.me/sarkarijobse"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-sky-500 text-white w-full md:w-auto px-9 py-5 md:py-4 rounded-xl font-bold text-sm md:text-xs uppercase tracking-widest hover:bg-sky-600 transition-all duration-200 shadow-lg active:scale-[0.98]"
          >
            <svg className="w-5 h-5 md:w-4 md:h-4 fill-white" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
            Join Telegram
          </a>
          {/* WhatsApp Channel */}
          <a
            href="https://whatsapp.com/channel/0029Vb7dt842ER6rNwc6eB47"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-emerald-500 text-white w-full md:w-auto px-9 py-5 md:py-4 rounded-xl font-bold text-sm md:text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all duration-200 shadow-lg active:scale-[0.98]"
          >
            <svg className="w-5 h-5 md:w-4 md:h-4 fill-white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WA Channel
          </a>
          {hasText(job.rawJobContent) && (
            <button 
              onClick={() => setShowFullNotification(!showFullNotification)}
              className="flex items-center gap-2 bg-emerald-600 text-white px-9 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all duration-200 shadow-lg shadow-emerald-600/25 active:scale-[0.98]"
              data-testid="button-view-full-notification"
            >
              {showFullNotification ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showFullNotification ? 'Hide Full Notification' : 'View Full Notification'}
            </button>
          )}
        </div>
      </div>

      {/* Full Notification Content */}
      {hasText(job.rawJobContent) && showFullNotification && (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-lg">
          <h2 className="bg-emerald-600 text-white p-5 text-sm font-bold uppercase tracking-widest">Full Notification Details</h2>
          <div className="p-8 max-h-[600px] overflow-y-auto">
            <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: job.rawJobContent! }} />
          </div>
        </div>
      )}

      {/* Dates & Fees Grid */}
      {(showDates || showFee) && (
        <div className="grid md:grid-cols-2 gap-7 job-details-grid">
          {showDates && (
            <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-md">
              <h2 className="bg-[#800000] text-white p-4 text-sm font-bold uppercase tracking-widest">Important Dates</h2>
              {showDatesHtml ? (
                <div className="p-5 sarkari-content" dangerouslySetInnerHTML={{ __html: job.importantDatesHtml! }} />
              ) : (
                <table className="w-full border-collapse job-details-table">
                  <tbody className="divide-y divide-slate-100">
                    {job.importantDates?.filter(d => hasText(d.label) || hasText(d.date)).map((d, i) => (
                      <tr key={i} className="hover:bg-blue-50/30 transition-colors duration-200">
                        <td className="p-5 text-xs font-bold uppercase text-slate-500 w-1/2 border-r border-slate-100">{d.label}</td>
                        <td className="p-5 text-sm font-semibold text-slate-800">{d.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
          {showFee && (
            <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-md">
              <h2 className="bg-[#006400] text-white p-4 text-sm font-bold uppercase tracking-widest">Application Fee</h2>
              {showFeeHtml ? (
                <div className="p-5 sarkari-content" dangerouslySetInnerHTML={{ __html: job.applicationFeeHtml! }} />
              ) : (
                <table className="w-full border-collapse job-details-table">
                  <tbody className="divide-y divide-slate-100">
                    {job.applicationFee?.filter(f => hasText(f.category) || hasText(f.fee)).map((f, i) => (
                      <tr key={i} className="hover:bg-blue-50/30 transition-colors duration-200">
                        <td className="p-5 text-xs font-bold uppercase text-slate-500 w-1/2 border-r border-slate-100">{f.category}</td>
                        <td className="p-5 text-sm font-semibold text-blue-700">₹{f.fee}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}

      {/* Age Limit */}
      {showAgeLimit && (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-md">
          <h2 className="bg-[#800000] text-white p-4 text-sm font-bold uppercase tracking-widest">Age Limit Details</h2>
          {showAgeLimitHtml ? (
            <div className="p-5 sarkari-content" dangerouslySetInnerHTML={{ __html: job.ageLimitHtml! }} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse job-details-table">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-5 text-xs font-bold uppercase text-slate-500 text-left">Category</th>
                    <th className="p-5 text-xs font-bold uppercase text-slate-500 text-center">Min Age</th>
                    <th className="p-5 text-xs font-bold uppercase text-slate-500 text-center">Max Age</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {job.ageLimit?.filter(a => hasText(a.category) || hasText(a.minAge) || hasText(a.maxAge)).map((a, i) => (
                    <tr key={i} className="hover:bg-blue-50/30 transition-colors duration-200">
                      <td className="p-5 text-sm font-semibold text-slate-700">{a.category}</td>
                      <td className="p-5 text-sm font-bold text-center text-blue-700">{a.minAge} Years</td>
                      <td className="p-5 text-sm font-bold text-center text-blue-700">{a.maxAge} Years</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Vacancy Details */}
      {showVacancy && (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-md">
          <h2 className="bg-[#006400] text-white p-4 text-sm font-bold uppercase tracking-widest text-center">Vacancy Details</h2>
          {showVacancyHtml ? (
            <div className="p-5 sarkari-content" dangerouslySetInnerHTML={{ __html: job.vacancyDetailsHtml! }} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse job-details-table">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-5 text-xs font-bold uppercase text-slate-500 text-left">Post Name</th>
                    <th className="p-5 text-xs font-bold uppercase text-slate-500 text-center">Total Posts</th>
                    <th className="p-5 text-xs font-bold uppercase text-slate-500 text-left">Eligibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {job.vacancyDetails?.filter(v => hasText(v.postName) || hasText(v.totalPost) || hasText(v.eligibility)).map((v, i) => (
                    <tr key={i} className="hover:bg-blue-50/30 transition-colors duration-200">
                      <td className="p-5 text-sm font-semibold text-slate-700">{v.postName}</td>
                      <td className="p-5 text-sm font-bold text-center text-blue-700">{v.totalPost}</td>
                      <td className="p-5 text-sm font-medium text-slate-600 leading-relaxed">{v.eligibility}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Eligibility Details */}
      {showEligibility && (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-md">
          <h2 className="bg-blue-700 text-white p-5 text-sm font-bold uppercase tracking-widest">Eligibility Details</h2>
          <div className="p-7">
            <p className="text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-line">{job.eligibilityDetails}</p>
          </div>
        </div>
      )}

      {/* Selection Process */}
      {showSelection && (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-md">
          <h2 className="bg-[#800000] text-white p-4 text-sm font-bold uppercase tracking-widest">Selection Process</h2>
          {showSelectionHtml ? (
            <div className="p-5 sarkari-content" dangerouslySetInnerHTML={{ __html: job.selectionProcessHtml! }} />
          ) : (
            <div className="p-7">
              <ul className="space-y-4">
                {job.selectionProcess?.filter(s => hasText(s)).map((step, i) => (
                  <li key={i} className="flex gap-4 items-center text-sm font-medium text-slate-600">
                    <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</div>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {showPstHtml && (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-md">
          <h2 className="bg-[#006400] text-white p-4 text-sm font-bold uppercase tracking-widest text-center">Physical Standard Test (PST)</h2>
          <div className="p-5 sarkari-content" dangerouslySetInnerHTML={{ __html: job.physicalStandardHtml! }} />
        </div>
      )}

      {showPetHtml && (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-md">
          <h2 className="bg-[#006400] text-white p-4 text-sm font-bold uppercase tracking-widest text-center">Physical Efficiency Test (PET)</h2>
          <div className="p-5 sarkari-content" dangerouslySetInnerHTML={{ __html: job.physicalEfficiencyHtml! }} />
        </div>
      )}

      {showPhysicalStructured && (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-md">
          <h2 className="bg-[#006400] text-white p-4 text-sm font-bold uppercase tracking-widest text-center">Physical Eligibility Details</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse job-details-table">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-5 text-xs font-bold uppercase text-slate-500 text-left">Criteria</th>
                  <th className="p-5 text-xs font-bold uppercase text-slate-500 text-center">Male</th>
                  <th className="p-5 text-xs font-bold uppercase text-slate-500 text-center">Female</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {job.physicalEligibility?.filter(p => hasText(p.criteria) || hasText(p.male) || hasText(p.female)).map((p, i) => (
                  <tr key={i} className="hover:bg-blue-50/30 transition-colors duration-200">
                    <td className="p-5 text-sm font-semibold text-slate-700">{p.criteria}</td>
                    <td className="p-5 text-sm font-bold text-center text-slate-800">{p.male}</td>
                    <td className="p-5 text-sm font-bold text-center text-slate-800">{p.female}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Important Links */}
      {showLinks && (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-md">
          <h2 className="bg-[#800000] text-white p-4 text-sm font-bold uppercase tracking-widest text-center">Important Links</h2>
          {showLinksHtml ? (
            <div className="p-5 sarkari-content" dangerouslySetInnerHTML={{ __html: job.importantLinksHtml! }} />
          ) : (
            <div className="divide-y divide-slate-100">
              {job.links?.filter(l => hasText(l.label) && hasText(l.url)).map((l, i) => (
                <div key={i} className="grid grid-cols-2 items-center p-6 hover:bg-rose-50/30 transition-all duration-200">
                  <div className="font-bold text-slate-700 text-sm">{l.label}</div>
                  <div className="text-right">
                    <a href={l.url} target="_blank" rel="noopener noreferrer" className="inline-block bg-rose-600 text-white px-8 py-3.5 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-rose-700 transition-all duration-200 shadow-lg shadow-rose-600/20 hover:shadow-xl">
                      Click Here
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Related Jobs */}
      {relatedJobs.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-md">
          <h2 className="bg-blue-700 text-white p-4 text-sm font-bold uppercase tracking-widest text-center">Similar Jobs</h2>
          <div className="divide-y divide-slate-100">
            {relatedJobs.map(related => (
              <Link key={related.id} href={`/job/${(related as any).slug || related.id}`}>
                <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-700 leading-snug line-clamp-1">{related.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{related.department}</p>
                  </div>
                  {(related as any).lastDate && (
                    <span className="text-xs text-orange-600 font-bold flex-shrink-0">{(related as any).lastDate}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* More Jobs */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-md">
        <h2 className="bg-blue-700 text-white p-4 text-sm font-bold uppercase tracking-widest text-center">More Government Jobs</h2>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/latest-jobs">
              <div className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg text-center transition-colors cursor-pointer border border-blue-100">
                <span className="text-blue-700 font-bold text-sm">Latest Government Jobs</span>
              </div>
            </Link>
            <Link href="/latest-jobs?qualification=10th">
              <div className="bg-emerald-50 hover:bg-emerald-100 p-4 rounded-lg text-center transition-colors cursor-pointer border border-emerald-100">
                <span className="text-emerald-700 font-bold text-sm">10th Pass Jobs</span>
              </div>
            </Link>
            <Link href="/search?q=police">
              <div className="bg-slate-100 hover:bg-slate-200 p-4 rounded-lg text-center transition-colors cursor-pointer border border-slate-200">
                <span className="text-slate-700 font-bold text-sm">Police Jobs</span>
              </div>
            </Link>
            <Link href="/search?q=ssc">
              <div className="bg-amber-50 hover:bg-amber-100 p-4 rounded-lg text-center transition-colors cursor-pointer border border-amber-100">
                <span className="text-amber-700 font-bold text-sm">SSC Jobs</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 p-8 rounded-xl border border-amber-200">
        <h4 className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-3 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" /> Important Disclaimer
        </h4>
        <p className="text-sm font-medium text-amber-800/80 leading-relaxed">
          The recruitment information provided above is for immediate information to the candidates and does not constitute a legal document. While efforts have been made to make the information available as authentic as possible, please verify the details from the official website or notification before applying.
        </p>
      </div>
    </div>
  );
}
