import { useState, useRef, useEffect } from 'react';
import { useJobs } from '@/lib/useJobs';
import { Job } from '@/lib/data';
import { Trash2, Plus, LayoutGrid, Database, Eye, Upload, CheckCircle2, Edit2, X, Lock, LogOut, Sparkles, Loader2, ArrowRight, BarChart3, Users, TrendingUp, Clock, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/AuthContext';

interface AnalyticsData {
  totalVisitors: number;
  todayVisitors: number;
  yesterdayVisitors: number;
  activeUsers: number;
  pageViews: { page: string; count: number }[];
  topPosts: { postId: number; title: string; views: number }[];
}

const initialFormData: Partial<Job> = {
  type: 'job',
  department: '',
  shortInfo: '',
  vacancyDetails: [{ postName: '', totalPost: '', eligibility: '' }],
  importantDates: [{ label: 'Application Start', date: '' }, { label: 'Last Date', date: '' }],
  applicationFee: [{ category: 'General/OBC', fee: '' }, { category: 'SC/ST', fee: '' }],
  ageLimit: [{ category: 'General', minAge: '18', maxAge: '27' }],
  eligibilityDetails: '',
  selectionProcess: [''],
  physicalEligibility: [],
  links: [],
  featured: false,
  trending: false,
  rawJobContent: '',
  applyOnlineUrl: '',
  admitCardUrl: '',
  resultUrl: '',
  answerKeyUrl: '',
  notificationUrl: '',
  officialWebsiteUrl: '',
  importantDatesHtml: '',
  applicationFeeHtml: '',
  ageLimitHtml: '',
  vacancyDetailsHtml: '',
  physicalStandardHtml: '',
  physicalEfficiencyHtml: '',
  selectionProcessHtml: '',
  importantLinksHtml: ''
};

export default function Admin() {
  const { toast } = useToast();
  const { jobs, addJob, updateJob, deleteJob } = useJobs();
  const { isAdmin, loading: authLoading, refresh: refreshAuth } = useAuth();
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'preview' | 'ai' | 'analytics'>('analytics');
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Partial<Job>>(initialFormData);
  
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [aiRawText, setAiRawText] = useState('');
  const [aiParsing, setAiParsing] = useState(false);
  const [aiParsedData, setAiParsedData] = useState<Partial<Job> | null>(null);
  const [aiError, setAiError] = useState('');
  
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    refreshAuth();
  }, []);
  
  useEffect(() => {
    if (isAdmin && activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [isAdmin, activeTab]);
  
  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch('/api/analytics', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
        credentials: 'include',
      });
      if (res.ok) {
        await refreshAuth();
        toast({ title: "Login Successful", description: "Welcome to Admin Panel" });
      } else {
        setLoginError('Invalid username or password');
      }
    } catch {
      setLoginError('Login failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    await refreshAuth();
    toast({ title: "Logged Out", description: "You have been logged out." });
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-20 px-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
          <div className="bg-primary p-6 text-center">
            <Lock className="w-12 h-12 text-white mx-auto mb-2" />
            <h1 className="text-xl font-black text-white uppercase tracking-widest">Admin Login</h1>
          </div>
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            {loginError && (
              <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm font-bold text-center">
                {loginError}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Username</label>
              <input
                type="text"
                value={loginUsername}
                onChange={e => setLoginUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl outline-none focus:border-primary font-bold text-sm"
                placeholder="Enter username"
                required
                data-testid="input-login-username"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl outline-none focus:border-primary font-bold text-sm"
                placeholder="Enter password"
                required
                data-testid="input-login-password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-secondary transition-all shadow-lg"
              data-testid="button-login"
            >
              Login to Admin Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  const handleEdit = (job: Job) => {
    setEditingJobId(job.id);
    setFormData({
      ...job,
      ageLimit: job.ageLimit?.length ? job.ageLimit : [{ category: 'General', minAge: '18', maxAge: '27' }],
      selectionProcess: job.selectionProcess?.length ? job.selectionProcess : [''],
      physicalEligibility: job.physicalEligibility || [],
    });
    setActiveTab('add');
  };

  const handleRulesParse = async () => {
    if (!aiRawText.trim() || aiRawText.trim().length < 50) {
      setAiError('Please paste at least 50 characters of job notification text.');
      return;
    }

    setAiParsing(true);
    setAiError('');
    setAiParsedData(null);

    try {
      const res = await fetch('/api/parse-job-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: aiRawText }),
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        setAiError(data.error || 'Failed to parse job notification.');
        return;
      }

      toast({ title: "Rule-Based Parsing Complete", description: "Review the extracted data below and edit if needed." });
      setAiParsedData(data.parsedData);
    } catch (err) {
      setAiError('Failed to parse. Please try again.');
    } finally {
      setAiParsing(false);
    }
  };

  const handleAIParse = async () => {
    if (!aiRawText.trim() || aiRawText.trim().length < 50) {
      setAiError('Please paste at least 50 characters of job notification text.');
      return;
    }

    setAiParsing(true);
    setAiError('');
    setAiParsedData(null);

    try {
      const res = await fetch('/api/parse-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: aiRawText }),
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        setAiError(data.error || 'Failed to parse job notification.');
        return;
      }

      if (data.warning) {
        toast({ 
          title: "Parsing Complete with Warnings", 
          description: "Some fields may need manual correction.",
          variant: "destructive"
        });
      } else {
        toast({ title: "AI Parsing Complete", description: "Review the extracted data below and edit if needed." });
      }

      setAiParsedData(data.parsedData);
    } catch (err) {
      setAiError('Failed to connect to AI service. Please try again.');
    } finally {
      setAiParsing(false);
    }
  };

  const handleUseAIParsedData = () => {
    if (!aiParsedData) return;
    
    const lastDateEntry = aiParsedData.importantDates?.find(d => 
      d.label.toLowerCase().includes('last') || d.label.toLowerCase().includes('deadline')
    );
    
    setFormData({
      ...initialFormData,
      ...aiParsedData,
      rawJobContent: aiRawText,
      postDate: new Date().toLocaleDateString('en-GB'),
      lastDate: lastDateEntry?.date || '',
      ageLimit: aiParsedData.ageLimit?.length ? aiParsedData.ageLimit : [{ category: 'General', minAge: '18', maxAge: '27' }],
      selectionProcess: aiParsedData.selectionProcess?.length ? aiParsedData.selectionProcess : [''],
      physicalEligibility: aiParsedData.physicalEligibility || [],
      vacancyDetails: aiParsedData.vacancyDetails?.length ? aiParsedData.vacancyDetails : [{ postName: '', totalPost: '', eligibility: '' }],
      applicationFee: aiParsedData.applicationFee?.length ? aiParsedData.applicationFee : [{ category: 'General/OBC', fee: '' }],
      importantDates: aiParsedData.importantDates?.length ? aiParsedData.importantDates : [{ label: 'Application Start', date: '' }, { label: 'Last Date', date: '' }],
    });
    setEditingJobId(null);
    setActiveTab('add');
    setAiParsedData(null);
    setAiRawText('');
    toast({ 
      title: "Data Loaded", 
      description: "Review all fields and add required URLs before publishing." 
    });
  };

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split('\n').slice(1);
      
      let count = 0;
      rows.forEach(row => {
        const cols = row.split(',');
        if (cols.length >= 2) {
          const newJob: Job = {
            id: Math.random().toString(36).substr(2, 9),
            title: cols[0]?.trim() || "Untitled CSV Post",
            department: cols[1]?.trim() || "N/A",
            type: 'job',
            postDate: new Date().toLocaleDateString('en-GB'),
            lastDate: cols[2]?.trim() || "TBA",
            shortInfo: "Bulk uploaded via CSV.",
            vacancyDetails: [{ postName: "See Notification", totalPost: "N/A", eligibility: "As per rules" }],
            applicationFee: [{ category: "General", fee: "0" }],
            importantDates: [{ label: "Last Date", date: cols[2]?.trim() || "TBA" }],
            ageLimit: [],
            eligibilityDetails: '',
            selectionProcess: [],
            physicalEligibility: [],
            links: [{ label: "Apply Online", url: cols[3]?.trim() || "#" }, { label: "Official Notification", url: cols[4]?.trim() || "#" }],
            featured: false,
            trending: false
          };
          addJob(newJob);
          count++;
        }
      });
      toast({ title: "Bulk Upload Complete", description: `${count} jobs added to portal.` });
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const postType = formData.type || 'job';
    let primaryUrlValid = false;
    
    if (postType === 'job' && formData.applyOnlineUrl) primaryUrlValid = true;
    if (postType === 'admit-card' && formData.admitCardUrl) primaryUrlValid = true;
    if (postType === 'result' && formData.resultUrl) primaryUrlValid = true;
    if (postType === 'answer-key' && formData.answerKeyUrl) primaryUrlValid = true;

    if (!primaryUrlValid || !formData.notificationUrl) {
      toast({ 
        title: "Required Fields Missing", 
        description: "Primary action URL and Notification URL are mandatory.",
        variant: "destructive"
      });
      return;
    }

    const links: { label: string; url: string }[] = [];
    if (formData.notificationUrl) links.push({ label: 'Official Notification', url: formData.notificationUrl });
    if (formData.officialWebsiteUrl) links.push({ label: 'Official Website', url: formData.officialWebsiteUrl });
    if (postType === 'job' && formData.applyOnlineUrl) links.push({ label: 'Apply Online', url: formData.applyOnlineUrl });
    if (postType === 'admit-card' && formData.admitCardUrl) links.push({ label: 'Download Admit Card', url: formData.admitCardUrl });
    if (postType === 'result' && formData.resultUrl) links.push({ label: 'Download Result', url: formData.resultUrl });
    if (postType === 'answer-key' && formData.answerKeyUrl) links.push({ label: 'Download Answer Key', url: formData.answerKeyUrl });

    const lastDateEntry = formData.importantDates?.find(d => d.label.toLowerCase().includes('last'));

    if (editingJobId) {
      updateJob({
        ...formData as Job,
        id: editingJobId,
        links,
        lastDate: lastDateEntry?.date || formData.lastDate,
      });
      toast({ title: "Post Updated", description: "Changes have been saved successfully." });
    } else {
      const newJob: Job = {
        ...formData as Job,
        id: Math.random().toString(36).substr(2, 9),
        postDate: new Date().toLocaleDateString('en-GB'),
        links,
        lastDate: lastDateEntry?.date || '',
      };
      addJob(newJob);
      toast({ title: "Portal Updated", description: "The new post is now live globally." });
    }

    setFormData(initialFormData);
    setEditingJobId(null);
    setActiveTab('list');
  };

  const addImportantDate = () => {
    setFormData(prev => ({
      ...prev,
      importantDates: [...(prev.importantDates || []), { label: '', date: '' }]
    }));
  };

  const removeImportantDate = (index: number) => {
    setFormData(prev => ({
      ...prev,
      importantDates: prev.importantDates?.filter((_, i) => i !== index) || []
    }));
  };

  const addApplicationFee = () => {
    setFormData(prev => ({
      ...prev,
      applicationFee: [...(prev.applicationFee || []), { category: '', fee: '' }]
    }));
  };

  const removeApplicationFee = (index: number) => {
    setFormData(prev => ({
      ...prev,
      applicationFee: prev.applicationFee?.filter((_, i) => i !== index) || []
    }));
  };

  const addAgeLimit = () => {
    setFormData(prev => ({
      ...prev,
      ageLimit: [...(prev.ageLimit || []), { category: '', minAge: '', maxAge: '' }]
    }));
  };

  const removeAgeLimit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ageLimit: prev.ageLimit?.filter((_, i) => i !== index) || []
    }));
  };

  const addVacancy = () => {
    setFormData(prev => ({
      ...prev,
      vacancyDetails: [...(prev.vacancyDetails || []), { postName: '', totalPost: '', eligibility: '' }]
    }));
  };

  const removeVacancy = (index: number) => {
    setFormData(prev => ({
      ...prev,
      vacancyDetails: prev.vacancyDetails?.filter((_, i) => i !== index) || []
    }));
  };

  const addSelectionStep = () => {
    setFormData(prev => ({
      ...prev,
      selectionProcess: [...(prev.selectionProcess || []), '']
    }));
  };

  const removeSelectionStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      selectionProcess: prev.selectionProcess?.filter((_, i) => i !== index) || []
    }));
  };

  const addPhysicalEligibility = () => {
    setFormData(prev => ({
      ...prev,
      physicalEligibility: [...(prev.physicalEligibility || []), { criteria: '', male: '', female: '' }]
    }));
  };

  const removePhysicalEligibility = (index: number) => {
    setFormData(prev => ({
      ...prev,
      physicalEligibility: prev.physicalEligibility?.filter((_, i) => i !== index) || []
    }));
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Portal Console</h1>
            <p className="text-muted font-bold text-xs uppercase tracking-widest mt-1">Management Interface v3.0</p>
          </div>
        </div>
        
        <div className="flex bg-white border border-slate-200 p-1 shadow-sm rounded-xl overflow-hidden">
          <button 
            type="button"
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-6 py-3 font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'list' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <LayoutGrid className="w-4 h-4" /> Live Feed
          </button>
          <button 
            type="button"
            onClick={() => {
              setEditingJobId(null);
              setFormData(initialFormData);
              setActiveTab('add');
            }}
            className={`flex items-center gap-2 px-6 py-3 font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'add' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Plus className="w-4 h-4" /> New Post
          </button>
          <button 
            type="button"
            onClick={() => {
              setAiParsedData(null);
              setAiRawText('');
              setAiError('');
              setActiveTab('ai');
            }}
            className={`flex items-center gap-2 px-6 py-3 font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'ai' ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md' : 'text-violet-600 hover:bg-violet-50'}`}
            data-testid="button-ai-generator"
          >
            <Sparkles className="w-4 h-4" /> AI Generator
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleBulkUpload} 
            accept=".csv" 
            className="hidden" 
          />
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-6 py-3 font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-50"
          >
            <Upload className="w-4 h-4" /> Bulk CSV
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-6 py-3 font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'analytics' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md' : 'text-emerald-600 hover:bg-emerald-50'}`}
            data-testid="button-analytics"
          >
            <BarChart3 className="w-4 h-4" /> Analytics
          </button>
          <button 
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 font-black text-xs uppercase tracking-widest text-rose-500 hover:bg-rose-50"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-4">
          {activeTab === 'analytics' ? (
            <div className="space-y-8">
              <div className="portal-card bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-6 h-6" />
                      <h2 className="text-xl font-black uppercase tracking-tight">Analytics Dashboard</h2>
                    </div>
                    <button 
                      onClick={fetchAnalytics}
                      className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all"
                      data-testid="button-refresh-analytics"
                    >
                      Refresh Data
                    </button>
                  </div>
                  <p className="text-emerald-100 text-sm font-medium mt-1">Site visitor statistics and page performance</p>
                </div>
                
                {analyticsLoading ? (
                  <div className="p-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Loading Analytics...</p>
                  </div>
                ) : analytics ? (
                  <div className="p-8 space-y-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <Users className="w-5 h-5 text-blue-600" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Total Visitors</span>
                        </div>
                        <p className="text-3xl font-black text-blue-800">{analytics.totalVisitors.toLocaleString()}</p>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <TrendingUp className="w-5 h-5 text-emerald-600" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Today</span>
                        </div>
                        <p className="text-3xl font-black text-emerald-800">{analytics.todayVisitors.toLocaleString()}</p>
                      </div>
                      <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <Clock className="w-5 h-5 text-amber-600" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Yesterday</span>
                        </div>
                        <p className="text-3xl font-black text-amber-800">{analytics.yesterdayVisitors.toLocaleString()}</p>
                      </div>
                      <div className="bg-gradient-to-br from-violet-50 to-violet-100/50 border border-violet-200 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <Users className="w-5 h-5 text-violet-600" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-violet-600">Active (5 min)</span>
                        </div>
                        <p className="text-3xl font-black text-violet-800">{analytics.activeUsers.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-slate-100 px-5 py-4 border-b border-slate-200">
                          <h3 className="font-black text-slate-700 text-sm uppercase tracking-widest flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Page Views
                          </h3>
                        </div>
                        <div className="divide-y divide-slate-100">
                          {analytics.pageViews.length > 0 ? analytics.pageViews.slice(0, 8).map((pv, idx) => (
                            <div key={idx} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50">
                              <span className="font-bold text-slate-700 text-sm capitalize">{pv.page.replace('/', '') || 'Home'}</span>
                              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold">{pv.count.toLocaleString()} views</span>
                            </div>
                          )) : (
                            <div className="px-5 py-8 text-center text-slate-400 text-sm">No page views recorded yet</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-slate-100 px-5 py-4 border-b border-slate-200">
                          <h3 className="font-black text-slate-700 text-sm uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" /> Top 5 Posts
                          </h3>
                        </div>
                        <div className="divide-y divide-slate-100">
                          {analytics.topPosts.length > 0 ? analytics.topPosts.map((post, idx) => (
                            <div key={idx} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 gap-4">
                              <span className="font-bold text-slate-700 text-sm truncate flex-1">{post.title}</span>
                              <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold shrink-0">{post.views.toLocaleString()} views</span>
                            </div>
                          )) : (
                            <div className="px-5 py-8 text-center text-slate-400 text-sm">No post views recorded yet</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">No analytics data available</p>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'ai' ? (
            <div className="portal-card bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-6 h-6" />
                  <h2 className="text-xl font-black uppercase tracking-tight">AI Auto Job Generator</h2>
                </div>
                <p className="text-violet-100 text-sm font-medium">Paste raw job notification text and let AI extract all the details automatically</p>
              </div>
              
              <div className="p-8 space-y-8">
                {!aiParsedData ? (
                  <>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Paste Raw Job Notification Text</label>
                      <textarea
                        className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl outline-none focus:border-violet-500 font-medium text-sm min-h-[400px] font-mono"
                        value={aiRawText}
                        onChange={e => setAiRawText(e.target.value)}
                        placeholder={`Paste the complete job notification here...

Example:
SSC CGL 2026 Recruitment
Staff Selection Commission
Total Posts: 50000+
Last Date: 15/02/2026

Application Fee:
- General/OBC: Rs. 100
- SC/ST: Nil

Age Limit:
- 18-27 years for most posts
- Age relaxation as per rules

Important Dates:
- Application Start: 01/01/2026
- Last Date: 15/02/2026
- Exam Date: March 2026

How to Apply:
Visit https://ssc.nic.in and apply online...`}
                        data-testid="input-ai-raw-text"
                      />
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold">{aiRawText.length} characters</span>
                        <span className="text-slate-400 font-bold">Minimum 50 characters required</span>
                      </div>
                    </div>

                    {aiError && (
                      <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm font-bold">
                        {aiError}
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={handleRulesParse}
                        disabled={aiParsing || aiRawText.length < 50}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-5 font-black text-xs uppercase tracking-widest rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        data-testid="button-rules-parse"
                      >
                        {aiParsing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Parsing...
                          </>
                        ) : (
                          <>
                            <FileText className="w-5 h-5" />
                            Auto Parse (No AI)
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleAIParse}
                        disabled={aiParsing || aiRawText.length < 50}
                        className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-5 font-black text-xs uppercase tracking-widest rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        data-testid="button-ai-parse"
                      >
                        {aiParsing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Parsing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5" />
                            Parse with AI
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-center text-xs text-slate-400 font-medium">
                      <strong>Auto Parse:</strong> Fast, rule-based extraction (no external calls) | <strong>AI Parse:</strong> Uses AI for complex notifications
                    </p>
                  </>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                      <div className="flex items-center gap-2 text-green-700 font-black text-sm uppercase tracking-widest mb-2">
                        <CheckCircle2 className="w-5 h-5" />
                        AI Extraction Complete
                      </div>
                      <p className="text-green-600 text-sm">Review the extracted data below. Click "Use This Data" to load it into the form for final editing.</p>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-6 space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Title</span>
                          <p className="font-bold text-slate-800 mt-1">{aiParsedData.title || 'Not found'}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Department</span>
                          <p className="font-bold text-slate-800 mt-1">{aiParsedData.department || 'Not found'}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Type</span>
                          <p className="font-bold text-slate-800 mt-1 capitalize">{aiParsedData.type || 'job'}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">State</span>
                          <p className="font-bold text-slate-800 mt-1">{aiParsedData.state || 'All India'}</p>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Short Info</span>
                        <p className="font-medium text-slate-700 mt-1 text-sm">{aiParsedData.shortInfo || 'Not found'}</p>
                      </div>

                      {aiParsedData.importantDates && aiParsedData.importantDates.length > 0 && (
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Important Dates</span>
                          <div className="mt-2 space-y-1">
                            {aiParsedData.importantDates.map((d: any, i: number) => (
                              <div key={i} className="flex justify-between text-sm">
                                <span className="text-slate-600">{d.label}</span>
                                <span className="font-bold text-slate-800">{d.date}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {aiParsedData.vacancyDetails && aiParsedData.vacancyDetails.length > 0 && (
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vacancies Found</span>
                          <p className="font-bold text-primary mt-1">{aiParsedData.vacancyDetails.length} position(s) extracted</p>
                        </div>
                      )}

                      {aiParsedData.applicationFee && aiParsedData.applicationFee.length > 0 && (
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Application Fees</span>
                          <div className="mt-2 space-y-1">
                            {aiParsedData.applicationFee.map((f: any, i: number) => (
                              <div key={i} className="flex justify-between text-sm">
                                <span className="text-slate-600">{f.category}</span>
                                <span className="font-bold text-slate-800">{f.fee}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                      <p className="text-amber-700 text-sm font-medium">
                        <strong>Note:</strong> You'll still need to add the required URLs (Apply Online, Notification, etc.) in the form before publishing.
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setAiParsedData(null);
                        }}
                        className="flex-1 bg-slate-100 text-slate-700 py-4 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all"
                      >
                        Parse Again
                      </button>
                      <button
                        type="button"
                        onClick={handleUseAIParsedData}
                        className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white py-4 font-black text-xs uppercase tracking-widest rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center gap-2"
                        data-testid="button-use-ai-data"
                      >
                        Use This Data <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'list' ? (
            <div className="portal-card bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-black text-slate-700 uppercase text-xs tracking-widest">Active Listings</h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total: {jobs.length}</span>
              </div>
              <div className="divide-y divide-slate-100">
                {jobs.map(job => (
                  <div key={job.id} className="p-6 flex items-center justify-between group hover:bg-blue-50/30 transition-all">
                    <div className="flex gap-6 items-center">
                      <div className={`w-14 h-14 border flex items-center justify-center text-[10px] font-black uppercase tracking-widest rounded-xl ${job.type === 'job' ? 'border-blue-100 bg-blue-50 text-blue-700' : job.type === 'admit-card' ? 'border-amber-100 bg-amber-50 text-amber-700' : job.type === 'result' ? 'border-green-100 bg-green-50 text-green-700' : 'border-purple-100 bg-purple-50 text-purple-700'}`}>
                        {job.type}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-lg leading-tight group-hover:text-primary transition-colors">{job.title}</h3>
                        <div className="flex gap-4 mt-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{job.postDate}</span>
                          <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">{job.department}</span>
                          {job.featured && <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 rounded uppercase tracking-widest">Featured</span>}
                          {job.trending && <span className="text-[10px] font-black text-violet-600 bg-violet-50 px-2 rounded uppercase tracking-widest">Trending</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={() => handleEdit(job)}
                        className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all rounded-xl shadow-sm"
                        data-testid={`button-edit-${job.id}`}
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => deleteJob(job.id)}
                        className="p-3 bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white transition-all rounded-xl shadow-sm"
                        data-testid={`button-delete-${job.id}`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="portal-card bg-white p-8 space-y-10 border border-slate-200 rounded-2xl shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-100 pb-6">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  {editingJobId ? 'Edit Post' : 'Create New Post'}
                </h2>
                <div className="flex gap-3">
                  {editingJobId && (
                    <button 
                      type="button"
                      onClick={() => {
                        setEditingJobId(null);
                        setFormData(initialFormData);
                        setActiveTab('list');
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-rose-100 transition-all"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </div>

              {/* 1. BASIC INFORMATION */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-primary">
                  <CheckCircle2 className="w-4 h-4" />
                  <h4 className="text-[11px] font-black uppercase tracking-widest">1. Basic Information</h4>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Post Title *</label>
                    <input 
                      type="text" 
                      required
                      className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl outline-none focus:border-primary transition-all font-bold text-sm"
                      value={formData.title || ''}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g. SSC CGL 2026 Registration"
                      data-testid="input-title"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Department</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl outline-none focus:border-primary font-bold text-sm"
                      value={formData.department || ''}
                      onChange={e => setFormData({...formData, department: e.target.value})}
                      placeholder="e.g. Railway, UPSC, State Police"
                      data-testid="input-department"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Post Type *</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl outline-none focus:border-primary font-bold text-sm appearance-none"
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value as any})}
                      required
                      data-testid="select-post-type"
                    >
                      <option value="job">Job</option>
                      <option value="admit-card">Admit Card</option>
                      <option value="result">Result</option>
                      <option value="answer-key">Answer Key</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Qualification</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl outline-none focus:border-primary font-bold text-sm appearance-none"
                      value={formData.qualification || ''}
                      onChange={e => setFormData({...formData, qualification: e.target.value || undefined})}
                      data-testid="select-qualification"
                    >
                      <option value="">Select Qualification</option>
                      <option value="10th">10th</option>
                      <option value="12th">12th</option>
                      <option value="graduation">graduation</option>
                      <option value="postgraduate">postgraduate</option>
                    </select>
                  </div>
                  <div className="flex items-end gap-6 pb-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded-md border-slate-300 text-primary focus:ring-primary"
                        checked={formData.featured}
                        onChange={e => setFormData({...formData, featured: e.target.checked})}
                      />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-primary">Featured</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded-md border-slate-300 text-primary focus:ring-primary"
                        checked={formData.trending}
                        onChange={e => setFormData({...formData, trending: e.target.checked})}
                      />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-primary">Trending</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 2. SHORT INFORMATION */}
              <div className="space-y-6 pt-6 border-t border-slate-50">
                <div className="flex items-center gap-2 text-primary">
                  <CheckCircle2 className="w-4 h-4" />
                  <h4 className="text-[11px] font-black uppercase tracking-widest">2. Short Information</h4>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Brief Description *</label>
                  <textarea 
                    required
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl outline-none focus:border-primary font-medium text-sm min-h-[150px]"
                    value={formData.shortInfo || ''}
                    onChange={e => setFormData({...formData, shortInfo: e.target.value})}
                    placeholder="Brief description about this notification..."
                    data-testid="input-short-info"
                  />
                </div>
              </div>

              {/* FULL NOTIFICATION TEXT */}
              <div className="space-y-6 pt-6 border-t border-slate-50">
                <div className="flex items-center gap-2 text-primary">
                  <CheckCircle2 className="w-4 h-4" />
                  <h4 className="text-[11px] font-black uppercase tracking-widest">Full Notification Text (Optional)</h4>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Paste Complete Sarkari Result Style Content (HTML Supported)</label>
                  <textarea 
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl outline-none focus:border-primary font-medium text-sm min-h-[300px] font-mono"
                    value={formData.rawJobContent || ''}
                    onChange={e => setFormData({...formData, rawJobContent: e.target.value})}
                    placeholder="Paste full notification content here... Supports HTML tables, headings, lists etc."
                    data-testid="input-full-notification"
                  />
                </div>
              </div>

              {/* HTML PASTE SECTIONS - Sarkari Result Style */}
              <div className="space-y-6 pt-6 border-t-4 border-violet-200 bg-gradient-to-b from-violet-50/50 to-transparent -mx-8 px-8 pb-6">
                <div className="flex items-center gap-2 text-violet-600">
                  <Sparkles className="w-4 h-4" />
                  <h4 className="text-[11px] font-black uppercase tracking-widest">Section-Based Content (HTML Paste)</h4>
                </div>
                <p className="text-xs text-slate-500 font-medium bg-violet-100/50 p-3 rounded-lg">
                  Copy-paste content directly from official notifications or Sarkari Result. Tables, lists, and formatted text will render exactly as pasted. If you fill these fields, they will override the structured fields above.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Important Dates (HTML)</label>
                    <textarea 
                      className="w-full bg-white border border-slate-200 p-4 rounded-xl outline-none focus:border-violet-500 font-medium text-sm min-h-[180px] font-mono text-xs"
                      value={formData.importantDatesHtml || ''}
                      onChange={e => setFormData({...formData, importantDatesHtml: e.target.value})}
                      placeholder="Paste dates table or list here..."
                      data-testid="input-dates-html"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Application Fee (HTML)</label>
                    <textarea 
                      className="w-full bg-white border border-slate-200 p-4 rounded-xl outline-none focus:border-violet-500 font-medium text-sm min-h-[180px] font-mono text-xs"
                      value={formData.applicationFeeHtml || ''}
                      onChange={e => setFormData({...formData, applicationFeeHtml: e.target.value})}
                      placeholder="Paste fee details table here..."
                      data-testid="input-fee-html"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Age Limit (HTML)</label>
                    <textarea 
                      className="w-full bg-white border border-slate-200 p-4 rounded-xl outline-none focus:border-violet-500 font-medium text-sm min-h-[180px] font-mono text-xs"
                      value={formData.ageLimitHtml || ''}
                      onChange={e => setFormData({...formData, ageLimitHtml: e.target.value})}
                      placeholder="Paste age limit details table here..."
                      data-testid="input-age-html"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Vacancy Details (HTML)</label>
                    <textarea 
                      className="w-full bg-white border border-slate-200 p-4 rounded-xl outline-none focus:border-violet-500 font-medium text-sm min-h-[180px] font-mono text-xs"
                      value={formData.vacancyDetailsHtml || ''}
                      onChange={e => setFormData({...formData, vacancyDetailsHtml: e.target.value})}
                      placeholder="Paste vacancy table here..."
                      data-testid="input-vacancy-html"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Physical Standard Test (HTML)</label>
                    <textarea 
                      className="w-full bg-white border border-slate-200 p-4 rounded-xl outline-none focus:border-violet-500 font-medium text-sm min-h-[180px] font-mono text-xs"
                      value={formData.physicalStandardHtml || ''}
                      onChange={e => setFormData({...formData, physicalStandardHtml: e.target.value})}
                      placeholder="Paste PST details table here..."
                      data-testid="input-pst-html"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Physical Efficiency Test (HTML)</label>
                    <textarea 
                      className="w-full bg-white border border-slate-200 p-4 rounded-xl outline-none focus:border-violet-500 font-medium text-sm min-h-[180px] font-mono text-xs"
                      value={formData.physicalEfficiencyHtml || ''}
                      onChange={e => setFormData({...formData, physicalEfficiencyHtml: e.target.value})}
                      placeholder="Paste PET details table here..."
                      data-testid="input-pet-html"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Selection Process (HTML)</label>
                    <textarea 
                      className="w-full bg-white border border-slate-200 p-4 rounded-xl outline-none focus:border-violet-500 font-medium text-sm min-h-[180px] font-mono text-xs"
                      value={formData.selectionProcessHtml || ''}
                      onChange={e => setFormData({...formData, selectionProcessHtml: e.target.value})}
                      placeholder="Paste selection process here..."
                      data-testid="input-selection-html"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Important Links (HTML)</label>
                    <textarea 
                      className="w-full bg-white border border-slate-200 p-4 rounded-xl outline-none focus:border-violet-500 font-medium text-sm min-h-[180px] font-mono text-xs"
                      value={formData.importantLinksHtml || ''}
                      onChange={e => setFormData({...formData, importantLinksHtml: e.target.value})}
                      placeholder="Paste links table here..."
                      data-testid="input-links-html"
                    />
                  </div>
                </div>
              </div>

              {/* 3. IMPORTANT DATES */}
              <div className="space-y-6 pt-6 border-t border-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle2 className="w-4 h-4" />
                    <h4 className="text-[11px] font-black uppercase tracking-widest">3. Important Dates</h4>
                  </div>
                  <button type="button" onClick={addImportantDate} className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase">
                    <Plus className="w-3 h-3" /> Add Date
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.importantDates?.map((d, i) => (
                    <div key={i} className="grid grid-cols-12 gap-4 items-center">
                      <input 
                        type="text" 
                        className="col-span-5 bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-primary font-bold text-sm"
                        value={d.label}
                        onChange={e => {
                          const newDates = [...(formData.importantDates || [])];
                          newDates[i] = { ...d, label: e.target.value };
                          setFormData({...formData, importantDates: newDates});
                        }}
                        placeholder="Event Name"
                      />
                      <input 
                        type="text" 
                        className="col-span-5 bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-primary font-bold text-sm"
                        value={d.date}
                        onChange={e => {
                          const newDates = [...(formData.importantDates || [])];
                          newDates[i] = { ...d, date: e.target.value };
                          setFormData({...formData, importantDates: newDates});
                        }}
                        placeholder="Date (e.g. 31/12/2026)"
                      />
                      <button type="button" onClick={() => removeImportantDate(i)} className="col-span-2 p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100">
                        <X className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. APPLICATION FEE */}
              <div className="space-y-6 pt-6 border-t border-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle2 className="w-4 h-4" />
                    <h4 className="text-[11px] font-black uppercase tracking-widest">4. Application Fee</h4>
                  </div>
                  <button type="button" onClick={addApplicationFee} className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase">
                    <Plus className="w-3 h-3" /> Add Fee
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.applicationFee?.map((f, i) => (
                    <div key={i} className="grid grid-cols-12 gap-4 items-center">
                      <input 
                        type="text" 
                        className="col-span-6 bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-primary font-bold text-sm"
                        value={f.category}
                        onChange={e => {
                          const newFees = [...(formData.applicationFee || [])];
                          newFees[i] = { ...f, category: e.target.value };
                          setFormData({...formData, applicationFee: newFees});
                        }}
                        placeholder="Category (e.g. General/OBC)"
                      />
                      <input 
                        type="text" 
                        className="col-span-4 bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-primary font-bold text-sm"
                        value={f.fee}
                        onChange={e => {
                          const newFees = [...(formData.applicationFee || [])];
                          newFees[i] = { ...f, fee: e.target.value };
                          setFormData({...formData, applicationFee: newFees});
                        }}
                        placeholder="Amount (₹)"
                      />
                      <button type="button" onClick={() => removeApplicationFee(i)} className="col-span-2 p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100">
                        <X className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. AGE LIMIT */}
              <div className="space-y-6 pt-6 border-t border-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle2 className="w-4 h-4" />
                    <h4 className="text-[11px] font-black uppercase tracking-widest">5. Age Limit Details</h4>
                  </div>
                  <button type="button" onClick={addAgeLimit} className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase">
                    <Plus className="w-3 h-3" /> Add Age
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.ageLimit?.map((a, i) => (
                    <div key={i} className="grid grid-cols-12 gap-4 items-center">
                      <input 
                        type="text" 
                        className="col-span-4 bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-primary font-bold text-sm"
                        value={a.category}
                        onChange={e => {
                          const newAge = [...(formData.ageLimit || [])];
                          newAge[i] = { ...a, category: e.target.value };
                          setFormData({...formData, ageLimit: newAge});
                        }}
                        placeholder="Category"
                      />
                      <input 
                        type="text" 
                        className="col-span-3 bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-primary font-bold text-sm"
                        value={a.minAge}
                        onChange={e => {
                          const newAge = [...(formData.ageLimit || [])];
                          newAge[i] = { ...a, minAge: e.target.value };
                          setFormData({...formData, ageLimit: newAge});
                        }}
                        placeholder="Min Age"
                      />
                      <input 
                        type="text" 
                        className="col-span-3 bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-primary font-bold text-sm"
                        value={a.maxAge}
                        onChange={e => {
                          const newAge = [...(formData.ageLimit || [])];
                          newAge[i] = { ...a, maxAge: e.target.value };
                          setFormData({...formData, ageLimit: newAge});
                        }}
                        placeholder="Max Age"
                      />
                      <button type="button" onClick={() => removeAgeLimit(i)} className="col-span-2 p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100">
                        <X className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 6. VACANCY DETAILS */}
              <div className="space-y-6 pt-6 border-t border-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle2 className="w-4 h-4" />
                    <h4 className="text-[11px] font-black uppercase tracking-widest">6. Vacancy Details</h4>
                  </div>
                  <button type="button" onClick={addVacancy} className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase">
                    <Plus className="w-3 h-3" /> Add Vacancy
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.vacancyDetails?.map((v, i) => (
                    <div key={i} className="grid grid-cols-12 gap-4 items-center">
                      <input 
                        type="text" 
                        className="col-span-4 bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-primary font-bold text-sm"
                        value={v.postName}
                        onChange={e => {
                          const newVac = [...(formData.vacancyDetails || [])];
                          newVac[i] = { ...v, postName: e.target.value };
                          setFormData({...formData, vacancyDetails: newVac});
                        }}
                        placeholder="Post Name"
                      />
                      <input 
                        type="text" 
                        className="col-span-2 bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-primary font-bold text-sm"
                        value={v.totalPost}
                        onChange={e => {
                          const newVac = [...(formData.vacancyDetails || [])];
                          newVac[i] = { ...v, totalPost: e.target.value };
                          setFormData({...formData, vacancyDetails: newVac});
                        }}
                        placeholder="Total"
                      />
                      <input 
                        type="text" 
                        className="col-span-4 bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-primary font-bold text-sm"
                        value={v.eligibility}
                        onChange={e => {
                          const newVac = [...(formData.vacancyDetails || [])];
                          newVac[i] = { ...v, eligibility: e.target.value };
                          setFormData({...formData, vacancyDetails: newVac});
                        }}
                        placeholder="Eligibility"
                      />
                      <button type="button" onClick={() => removeVacancy(i)} className="col-span-2 p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100">
                        <X className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 7. ELIGIBILITY DETAILS */}
              <div className="space-y-6 pt-6 border-t border-slate-50">
                <div className="flex items-center gap-2 text-primary">
                  <CheckCircle2 className="w-4 h-4" />
                  <h4 className="text-[11px] font-black uppercase tracking-widest">7. Eligibility Details</h4>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Qualification & Requirements</label>
                  <textarea 
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl outline-none focus:border-primary font-medium text-sm min-h-[100px]"
                    value={formData.eligibilityDetails || ''}
                    onChange={e => setFormData({...formData, eligibilityDetails: e.target.value})}
                    placeholder="Enter eligibility requirements..."
                    data-testid="input-eligibility"
                  />
                </div>
              </div>

              {/* 8. SELECTION PROCESS */}
              <div className="space-y-6 pt-6 border-t border-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle2 className="w-4 h-4" />
                    <h4 className="text-[11px] font-black uppercase tracking-widest">8. Selection Process</h4>
                  </div>
                  <button type="button" onClick={addSelectionStep} className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase">
                    <Plus className="w-3 h-3" /> Add Step
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.selectionProcess?.map((step, i) => (
                    <div key={i} className="grid grid-cols-12 gap-4 items-center">
                      <span className="col-span-1 text-center font-black text-slate-400">{i + 1}.</span>
                      <input 
                        type="text" 
                        className="col-span-9 bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-primary font-bold text-sm"
                        value={step}
                        onChange={e => {
                          const newSteps = [...(formData.selectionProcess || [])];
                          newSteps[i] = e.target.value;
                          setFormData({...formData, selectionProcess: newSteps});
                        }}
                        placeholder="Selection step..."
                      />
                      <button type="button" onClick={() => removeSelectionStep(i)} className="col-span-2 p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100">
                        <X className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 9. PHYSICAL ELIGIBILITY (Optional) */}
              <div className="space-y-6 pt-6 border-t border-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle2 className="w-4 h-4" />
                    <h4 className="text-[11px] font-black uppercase tracking-widest">9. Physical Eligibility (Optional)</h4>
                  </div>
                  <button type="button" onClick={addPhysicalEligibility} className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase">
                    <Plus className="w-3 h-3" /> Add Criteria
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.physicalEligibility?.map((p, i) => (
                    <div key={i} className="grid grid-cols-12 gap-4 items-center">
                      <input 
                        type="text" 
                        className="col-span-4 bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-primary font-bold text-sm"
                        value={p.criteria}
                        onChange={e => {
                          const newPhys = [...(formData.physicalEligibility || [])];
                          newPhys[i] = { ...p, criteria: e.target.value };
                          setFormData({...formData, physicalEligibility: newPhys});
                        }}
                        placeholder="Criteria (e.g. Height)"
                      />
                      <input 
                        type="text" 
                        className="col-span-3 bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-primary font-bold text-sm"
                        value={p.male}
                        onChange={e => {
                          const newPhys = [...(formData.physicalEligibility || [])];
                          newPhys[i] = { ...p, male: e.target.value };
                          setFormData({...formData, physicalEligibility: newPhys});
                        }}
                        placeholder="Male"
                      />
                      <input 
                        type="text" 
                        className="col-span-3 bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-primary font-bold text-sm"
                        value={p.female}
                        onChange={e => {
                          const newPhys = [...(formData.physicalEligibility || [])];
                          newPhys[i] = { ...p, female: e.target.value };
                          setFormData({...formData, physicalEligibility: newPhys});
                        }}
                        placeholder="Female"
                      />
                      <button type="button" onClick={() => removePhysicalEligibility(i)} className="col-span-2 p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100">
                        <X className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 10. IMPORTANT LINKS */}
              <div className="space-y-6 pt-6 border-t border-slate-50">
                <div className="flex items-center gap-2 text-primary">
                  <CheckCircle2 className="w-4 h-4" />
                  <h4 className="text-[11px] font-black uppercase tracking-widest">10. Important Links (Based on Post Type)</h4>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {formData.type === 'job' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Apply Online URL *</label>
                      <input 
                        type="text" 
                        required
                        className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl outline-none focus:border-primary font-bold text-sm"
                        value={formData.applyOnlineUrl || ''}
                        onChange={e => setFormData({...formData, applyOnlineUrl: e.target.value})}
                        placeholder="https://apply.official-site.com/..."
                        data-testid="input-apply-url"
                      />
                    </div>
                  )}
                  {formData.type === 'admit-card' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Download Admit Card URL *</label>
                      <input 
                        type="text" 
                        required
                        className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl outline-none focus:border-primary font-bold text-sm"
                        value={formData.admitCardUrl || ''}
                        onChange={e => setFormData({...formData, admitCardUrl: e.target.value})}
                        placeholder="https://admit.official-site.com/..."
                        data-testid="input-admit-url"
                      />
                    </div>
                  )}
                  {formData.type === 'result' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Download Result URL *</label>
                      <input 
                        type="text" 
                        required
                        className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl outline-none focus:border-primary font-bold text-sm"
                        value={formData.resultUrl || ''}
                        onChange={e => setFormData({...formData, resultUrl: e.target.value})}
                        placeholder="https://result.official-site.com/..."
                        data-testid="input-result-url"
                      />
                    </div>
                  )}
                  {formData.type === 'answer-key' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Download Answer Key URL *</label>
                      <input 
                        type="text" 
                        required
                        className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl outline-none focus:border-primary font-bold text-sm"
                        value={formData.answerKeyUrl || ''}
                        onChange={e => setFormData({...formData, answerKeyUrl: e.target.value})}
                        placeholder="https://answer.official-site.com/..."
                        data-testid="input-answer-url"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Notification URL *</label>
                    <input 
                      type="text" 
                      required
                      className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl outline-none focus:border-primary font-bold text-sm"
                      value={formData.notificationUrl || ''}
                      onChange={e => setFormData({...formData, notificationUrl: e.target.value})}
                      placeholder="https://notification.official-site.com/..."
                      data-testid="input-notification-url"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Official Website URL</label>
                    <input 
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl outline-none focus:border-primary font-bold text-sm"
                      value={formData.officialWebsiteUrl || ''}
                      onChange={e => setFormData({...formData, officialWebsiteUrl: e.target.value})}
                      placeholder="https://official-site.com"
                      data-testid="input-official-url"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100">
                <button 
                  type="submit" 
                  className="w-full bg-primary text-white py-5 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-secondary transition-all shadow-lg active:scale-[0.99]"
                  data-testid="button-submit-post"
                >
                  {editingJobId ? 'Update Post' : 'Publish Post'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
