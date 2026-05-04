import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useJobs } from "@/lib/useJobs";
import { Calendar, ExternalLink, ShieldCheck, MapPin, ChevronDown, ChevronUp } from "lucide-react";
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

      {/* Full Notification Content - Expandable */}
      {hasText(job.rawJobContent) && showFullNotification && (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-lg">
          <h2 className="bg-emerald-600 text-white p-5 text-sm font-bold uppercase tracking-widest">Full Notification Details</h2>
          <div className="p-8 max-h-[600px] overflow-y-auto">
            <div 
              className="prose prose-sm max-w-none text-slate-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: job.rawJobContent! }}
            />
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

      {/* Physical Standard Test (HTML only) */}
      {showPstHtml && (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-md">
          <h2 className="bg-[#006400] text-white p-4 text-sm font-bold uppercase tracking-widest text-center">Physical Standard Test (PST)</h2>
          <div className="p-5 sarkari-content" dangerouslySetInnerHTML={{ __html: job.physicalStandardHtml! }} />
        </div>
      )}

      {/* Physical Efficiency Test (HTML only) */}
      {showPetHtml && (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-md">
          <h2 className="bg-[#006400] text-white p-4 text-sm font-bold uppercase tracking-widest text-center">Physical Efficiency Test (PET)</h2>
          <div className="p-5 sarkari-content" dangerouslySetInnerHTML={{ __html: job.physicalEfficiencyHtml! }} />
        </div>
      )}

      {/* Physical Eligibility (structured - only if no PST/PET HTML) */}
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
                    <a href={l.url} target="_blank" rel="noopener noreferrer" className="inline-block bg-rose-600 text-white px-8 py-3.5 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-rose-700 transition-all duration-200 shadow-lg shadow-rose-600/20 hover:shadow-xl" data-testid={`link-${l.label.toLowerCase().replace(/\s+/g, '-')}`}>
                      Click Here
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Internal Links for SEO */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-md">
        <h2 className="bg-blue-700 text-white p-4 text-sm font-bold uppercase tracking-widest text-center">More Government Jobs</h2>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/latest-jobs" data-testid="link-latest-govt-jobs">
              <div className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg text-center transition-colors cursor-pointer border border-blue-100">
                <span className="text-blue-700 font-bold text-sm">Latest Government Jobs</span>
              </div>
            </Link>
            <Link href="/latest-jobs?qualification=10th" data-testid="link-10th-pass-jobs">
              <div className="bg-emerald-50 hover:bg-emerald-100 p-4 rounded-lg text-center transition-colors cursor-pointer border border-emerald-100">
                <span className="text-emerald-700 font-bold text-sm">10th Pass Jobs</span>
              </div>
            </Link>
            <Link href="/search?q=police" data-testid="link-police-jobs">
              <div className="bg-slate-100 hover:bg-slate-200 p-4 rounded-lg text-center transition-colors cursor-pointer border border-slate-200">
                <span className="text-slate-700 font-bold text-sm">Police Jobs</span>
              </div>
            </Link>
            <Link href="/search?q=ssc" data-testid="link-ssc-jobs">
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
