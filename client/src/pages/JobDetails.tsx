import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { 
  Calendar, Clock, Building2, MapPin, GraduationCap, 
  FileText, CheckCircle, ExternalLink, AlertTriangle, 
  ChevronRight, Share2, Bookmark, Printer, ArrowLeft,
  User, Award, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// NEW: Import SEO components
import AuthorBio from "@/components/AuthorBio";
import JobSchema from "@/components/JobSchema";
import Breadcrumb from "@/components/Breadcrumb";
import { BreadcrumbSchema } from "@/components/JobSchema";

type Job = {
  id: number;
  slug: string;
  title: string;
  department: string;
  type: string;
  lastDate: string | null;
  postDate: string;
  shortInfo: string;
  qualification: string | null;
  state: string | null;
  category: string | null;
  vacancyDetails: any[];
  applicationFee: any[];
  importantDates: any[];
  ageLimit: any[];
  eligibilityDetails: string | null;
  selectionProcess: any[];
  physicalEligibility: any[];
  links: any[];
  featured: boolean;
  trending: boolean;
  rawJobContent: string | null;
  applyOnlineUrl: string | null;
  admitCardUrl: string | null;
  resultUrl: string | null;
  answerKeyUrl: string | null;
  notificationUrl: string | null;
  officialWebsiteUrl: string | null;
  importantDatesHtml: string | null;
  applicationFeeHtml: string | null;
  ageLimitHtml: string | null;
  vacancyDetailsHtml: string | null;
  physicalStandardHtml: string | null;
  physicalEfficiencyHtml: string | null;
  selectionProcessHtml: string | null;
  importantLinksHtml: string | null;
};

export default function JobDetails() {
  const { slug } = useParams();
  const { toast } = useToast();
  const [relatedJobs, setRelatedJobs] = useState<Job[]>([]);

  const { data: job, isLoading, error } = useQuery<Job>({
    queryKey: ["/api/posts", slug],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/posts/${slug}`);
      if (!res.ok) throw new Error("Job not found");
      return res.json();
    },
  });

  useEffect(() => {
    if (job) {
      document.title = `${job.title} ${job.department ? '- ' + job.department : ''} | SarkariJobSeva`;

      // NEW: Enhanced meta description
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', 
          `${job.title} - ${job.shortInfo} Apply Online before ${job.lastDate || 'last date'}. Eligibility, Salary, Selection Process, Exam Pattern and Complete Details on SarkariJobSeva.com.`
        );
      }

      // NEW: Canonical URL
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.setAttribute('href', `https://www.sarkarijobseva.com/job/${job.slug}`);
      }

      // NEW: OG tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', job.title);

      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', job.shortInfo);

      // Fetch related jobs
      fetchRelatedJobs(job);

      // Track page view
      apiRequest("POST", "/api/pageviews", { page: `/job/${slug}`, postId: job.id });
    }
  }, [job, slug]);

  const fetchRelatedJobs = async (currentJob: Job) => {
    try {
      const res = await apiRequest("GET", `/api/posts?limit=6&category=${currentJob.category || ''}&state=${currentJob.state || ''}`);
      if (res.ok) {
        const data = await res.json();
        const filtered = data.filter((j: Job) => j.id !== currentJob.id).slice(0, 5);
        setRelatedJobs(filtered);
      }
    } catch (e) {
      console.error("Failed to fetch related jobs", e);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: job?.title || "Sarkari Job",
          text: job?.shortInfo || "",
          url: window.location.href,
        });
      } catch (e) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied to clipboard!" });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-6 px-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Job Not Found</h1>
          <p className="text-slate-600 mb-6">The job you are looking for does not exist or has been removed.</p>
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const showDates = job.importantDatesHtml || (job.importantDates && job.importantDates.length > 0);
  const showFee = job.applicationFeeHtml || (job.applicationFee && job.applicationFee.length > 0);
  const showAgeLimit = job.ageLimitHtml || (job.ageLimit && job.ageLimit.length > 0);
  const showVacancy = job.vacancyDetailsHtml || (job.vacancyDetails && job.vacancyDetails.length > 0);
  const showSelection = job.selectionProcessHtml || (job.selectionProcess && job.selectionProcess.length > 0);
  const showPhysical = job.physicalStandardHtml || job.physicalEfficiencyHtml || (job.physicalEligibility && job.physicalEligibility.length > 0);

  // NEW: Breadcrumb items
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: job.department || "Latest Jobs", href: "/latest-jobs" },
    { label: job.title },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* NEW: JSON-LD Schema Markup */}
      <JobSchema
        title={job.title}
        description={job.shortInfo}
        department={job.department}
        lastDate={job.lastDate || undefined}
        postDate={job.postDate}
        qualification={job.qualification || undefined}
        state={job.state || undefined}
        category={job.category || undefined}
        url={`https://www.sarkarijobseva.com/job/${job.slug}`}
      />

      {/* NEW: Breadcrumb Schema */}
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://www.sarkarijobseva.com/" },
          { name: job.department || "Latest Jobs", url: "https://www.sarkarijobseva.com/latest-jobs" },
          { name: job.title, url: `https://www.sarkarijobseva.com/job/${job.slug}` },
        ]}
      />

      {/* NEW: Breadcrumb Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-semibold mb-4 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Back to All Jobs
        </Link>

        {/* Job Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold leading-tight">{job.title}</h1>
                {job.department && (
                  <p className="text-blue-100 mt-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {job.department}
                    {job.lastDate && (
                      <span className="text-blue-200">– Last Date: {job.lastDate}</span>
                    )}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleShare} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Printer className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Short Info */}
          <div className="p-6">
            <p className="text-slate-700 text-lg leading-relaxed">{job.shortInfo}</p>

            {/* Meta Tags */}
            <div className="flex flex-wrap gap-3 mt-4">
              {job.postDate && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Posted: {job.postDate}
                </Badge>
              )}
              {job.lastDate && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Last Date: {job.lastDate}
                </Badge>
              )}
              {job.qualification && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" />
                  {job.qualification}
                </Badge>
              )}
              {job.state && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {job.state}
                </Badge>
              )}
              {job.category && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {job.category}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {job.applyOnlineUrl && (
            <a href={job.applyOnlineUrl} target="_blank" rel="noopener noreferrer" className="no-underline">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6">
                <ExternalLink className="w-5 h-5 mr-2" />
                Apply Online
              </Button>
            </a>
          )}
          {job.notificationUrl && (
            <a href={job.notificationUrl} target="_blank" rel="noopener noreferrer" className="no-underline">
              <Button variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 font-bold py-6">
                <FileText className="w-5 h-5 mr-2" />
                Notification
              </Button>
            </a>
          )}
          {job.admitCardUrl && (
            <a href={job.admitCardUrl} target="_blank" rel="noopener noreferrer" className="no-underline">
              <Button variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-50 font-bold py-6">
                <CheckCircle className="w-5 h-5 mr-2" />
                Admit Card
              </Button>
            </a>
          )}
          {job.resultUrl && (
            <a href={job.resultUrl} target="_blank" rel="noopener noreferrer" className="no-underline">
              <Button variant="outline" className="w-full border-orange-300 text-orange-700 hover:bg-orange-50 font-bold py-6">
                <CheckCircle className="w-5 h-5 mr-2" />
                Result
              </Button>
            </a>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Important Dates */}
            {showDates && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Important Dates
                  </h2>
                </div>
                <div className="p-6">
                  {job.importantDatesHtml ? (
                    <div dangerouslySetInnerHTML={{ __html: job.importantDatesHtml }} />
                  ) : (
                    <div className="space-y-2">
                      {job.importantDates?.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                          <span className="text-slate-700 font-medium">{item.label}</span>
                          <span className="text-slate-900 font-semibold">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Application Fee */}
            {showFee && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-green-50 px-6 py-4 border-b border-green-100">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    Application Fee
                  </h2>
                </div>
                <div className="p-6">
                  {job.applicationFeeHtml ? (
                    <div dangerouslySetInnerHTML={{ __html: job.applicationFeeHtml }} />
                  ) : (
                    <div className="space-y-2">
                      {job.applicationFee?.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                          <span className="text-slate-700 font-medium">{item.category}</span>
                          <span className="text-slate-900 font-semibold">{item.fee}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Age Limit */}
            {showAgeLimit && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-purple-50 px-6 py-4 border-b border-purple-100">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <User className="w-5 h-5 text-purple-600" />
                    Age Limit
                  </h2>
                </div>
                <div className="p-6">
                  {job.ageLimitHtml ? (
                    <div dangerouslySetInnerHTML={{ __html: job.ageLimitHtml }} />
                  ) : (
                    <div className="space-y-2">
                      {job.ageLimit?.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                          <span className="text-slate-700 font-medium">{item.category}</span>
                          <span className="text-slate-900 font-semibold">{item.age}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Vacancy Details */}
            {showVacancy && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-orange-50 px-6 py-4 border-b border-orange-100">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-orange-600" />
                    Vacancy Details
                  </h2>
                </div>
                <div className="p-6">
                  {job.vacancyDetailsHtml ? (
                    <div dangerouslySetInnerHTML={{ __html: job.vacancyDetailsHtml }} />
                  ) : (
                    <div className="space-y-2">
                      {job.vacancyDetails?.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                          <span className="text-slate-700 font-medium">{item.post}</span>
                          <span className="text-slate-900 font-semibold">{item.vacancy}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Selection Process */}
            {showSelection && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-indigo-600" />
                    Selection Process
                  </h2>
                </div>
                <div className="p-6">
                  {job.selectionProcessHtml ? (
                    <div dangerouslySetInnerHTML={{ __html: job.selectionProcessHtml }} />
                  ) : (
                    <ol className="space-y-3">
                      {job.selectionProcess?.map((item: any, i: number) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                            {i + 1}
                          </span>
                          <span className="text-slate-700 pt-1">{item.step}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>
            )}

            {/* Physical Standards */}
            {showPhysical && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-teal-50 px-6 py-4 border-b border-teal-100">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Award className="w-5 h-5 text-teal-600" />
                    Physical Standards
                  </h2>
                </div>
                <div className="p-6">
                  {job.physicalStandardHtml && (
                    <div dangerouslySetInnerHTML={{ __html: job.physicalStandardHtml }} />
                  )}
                  {job.physicalEfficiencyHtml && (
                    <div dangerouslySetInnerHTML={{ __html: job.physicalEfficiencyHtml }} />
                  )}
                </div>
              </div>
            )}

            {/* Eligibility Details */}
            {job.eligibilityDetails && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-amber-50 px-6 py-4 border-b border-amber-100">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-amber-600" />
                    Eligibility Details
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-slate-700 leading-relaxed">{job.eligibilityDetails}</p>
                </div>
              </div>
            )}

            {/* Important Links */}
            {(job.links?.length > 0 || job.importantLinksHtml) && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-100 px-6 py-4 border-b border-slate-200">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <ExternalLink className="w-5 h-5 text-slate-600" />
                    Important Links
                  </h2>
                </div>
                <div className="p-6">
                  {job.importantLinksHtml ? (
                    <div dangerouslySetInnerHTML={{ __html: job.importantLinksHtml }} />
                  ) : (
                    <div className="grid gap-3">
                      {job.links?.map((link: any, i: number) => (
                        <a 
                          key={i} 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-blue-50 transition-colors group"
                        >
                          <span className="font-medium text-slate-700 group-hover:text-blue-700">{link.label}</span>
                          <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* How to Apply */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {job.type === 'admit-card' ? 'Admit Card Download कैसे करें?' : 
                   job.type === 'result' ? 'Result कैसे देखें?' : 
                   job.type === 'answer-key' ? 'Answer Key Download कैसे करें?' : 
                   'Apply Online कैसे करें?'}
                </h2>
              </div>
              <div className="p-6">
                {job.type === 'admit-card' ? (
                  <ol className="space-y-3">
                    {[
                      "ऊपर दिए 'Download Admit Card' button पर click करें",
                      "Official Website पर जाएं",
                      "Admit Card / Hall Ticket link पर click करें",
                      "Registration Number / Roll Number और Date of Birth डालें",
                      "Submit करें — Admit Card screen पर आ जाएगा",
                      "Download करें और Print निकालें — Color या Black & White दोनों चलते हैं",
                      "Exam वाले दिन Admit Card + Photo ID (Aadhar/Voter Card) साथ ले जाएं",
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0">{i + 1}</span>
                        <span className="text-slate-700 pt-1">{step}</span>
                      </li>
                    ))}
                  </ol>
                ) : job.type === 'result' ? (
                  <ol className="space-y-3">
                    {[
                      "ऊपर दिए 'Download Result' button पर click करें",
                      "Official Website पर जाएं",
                      "Result / Score Card link पर click करें",
                      "Roll Number / Registration Number डालें",
                      "Submit करें — Result screen पर दिखेगा",
                      "Score Card Download करें और Print कर लें",
                      "Cut-off check करें — अगर ऊपर हैं तो Next Round के लिए तैयार रहें",
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0">{i + 1}</span>
                        <span className="text-slate-700 pt-1">{step}</span>
                      </li>
                    ))}
                  </ol>
                ) : job.type === 'answer-key' ? (
                  <ol className="space-y-3">
                    {[
                      "ऊपर दिए 'Download Answer Key' button पर click करें",
                      "Official Website पर जाएं",
                      "Answer Key PDF Download करें",
                      "अपने Answers से मिलाएं और Marks Calculate करें",
                      "यदि कोई Answer गलत लगे — Objection Portal पर जाएं",
                      "Objection Form भरें, Reference दें और Fee Pay करें",
                      "Objection की Last Date से पहले Submit करें",
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0">{i + 1}</span>
                        <span className="text-slate-700 pt-1">{step}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <ol className="space-y-3">
                    {[
                      "पहले Official Notification ध्यान से पढ़ें — Eligibility check करें",
                      "ऊपर 'Apply Online' button पर click करें",
                      "Official Website पर New Registration करें — Email और Mobile डालें",
                      "Online Application Form भरें — सभी details सही भरें",
                      "Photo और Signature Upload करें (Size और Format Notification में बताया होगा)",
                      "Application Fee Online Pay करें (Net Banking / UPI / Debit Card)",
                      "Form Preview check करें और Final Submit करें",
                      "Application Confirmation / Acknowledgement Print कर लें — भविष्य के लिए रखें",
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0">{i + 1}</span>
                        <span className="text-slate-700 pt-1">{step}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>

            {/* NEW: Author Bio - AdSense E-E-A-T Signal */}
            <AuthorBio
              authorName="Rahul Sharma"
              authorRole="Government Job Expert & Editor"
              authorBio="Rahul Sharma is a former banking professional with 5+ years of experience in government exam preparation guidance. He specializes in SSC, Railway, Banking, and State PSC recruitment analysis. He has helped thousands of aspirants find their dream government job through accurate and timely information."
              publishedDate={job.postDate}
              updatedDate={job.lastDate || undefined}
              readTime="8 min read"
            />

            {/* Disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-amber-800 mb-2">Important Disclaimer</h3>
                  <p className="text-amber-700 text-sm leading-relaxed">
                    The recruitment information provided above is for immediate information to the candidates and does not constitute a legal document. While efforts have been made to make the information available as authentic as possible, please verify the details from the official website or notification before applying. SarkariJobSeva.com is NOT a government website and is not affiliated with any government department.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Related Jobs */}
            {relatedJobs.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-100 px-6 py-4 border-b border-slate-200">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <ChevronRight className="w-4 h-4" />
                    Similar Jobs
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  {relatedJobs.map((related) => (
                    <Link key={related.id} href={`/job/${related.slug}`} className="block p-3 bg-slate-50 rounded-lg hover:bg-blue-50 transition-colors group">
                      <h4 className="font-semibold text-slate-800 text-sm group-hover:text-blue-700 line-clamp-2">{related.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{related.department}</p>
                      {related.lastDate && (
                        <p className="text-xs text-red-500 mt-1">Last Date: {related.lastDate}</p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-100 px-6 py-4 border-b border-slate-200">
                <h3 className="font-bold text-slate-800">Quick Links</h3>
              </div>
              <div className="p-4 space-y-2">
                <Link href="/latest-jobs" className="block p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm">
                  🔔 Latest Jobs
                </Link>
                <Link href="/admit-card" className="block p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors font-medium text-sm">
                  🪪 Admit Card
                </Link>
                <Link href="/results" className="block p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium text-sm">
                  📊 Results
                </Link>
                <Link href="/answer-key" className="block p-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors font-medium text-sm">
                  🔑 Answer Key
                </Link>
                <Link href="/salary-calculator" className="block p-3 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors font-medium text-sm">
                  💰 Salary Calculator
                </Link>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-100 px-6 py-4 border-b border-slate-200">
                <h3 className="font-bold text-slate-800">Join Our Channels</h3>
              </div>
              <div className="p-4 space-y-2">
                <a href="https://t.me/sarkarijobse" target="_blank" rel="noopener noreferrer" className="block p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm text-center">
                  📱 Join Telegram Channel
                </a>
                <a href="#" className="block p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm text-center">
                  💬 Join WhatsApp Channel
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
