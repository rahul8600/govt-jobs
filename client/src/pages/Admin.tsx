import { useState, useEffect, useRef } from 'react';
import { useJobs } from '@/lib/useJobs';
import { Job } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/AuthContext';
import {
  BarChart3, Users, TrendingUp, Clock, FileText, Lock, LogOut,
  Plus, Trash2, Edit2, Upload, Eye, ChevronDown, ChevronUp,
  Sparkles, Loader2, CheckCircle2, X, LayoutGrid
} from 'lucide-react';

interface AnalyticsData {
  totalVisitors: number;
  todayVisitors: number;
  yesterdayVisitors: number;
  activeUsers: number;
  pageViews: { page: string; count: number }[];
  topPosts: { postId: number; title: string; views: number }[];
}

const emptyForm: Partial<Job> = {
  type: 'job', title: '', department: '', shortInfo: '',
  qualification: '', lastDate: '', applyOnlineUrl: '', notificationUrl: '', officialWebsiteUrl: '',
  featured: false, trending: false,
  importantDates: [{ label: 'Application Start', date: '' }, { label: 'Last Date', date: '' }],
  applicationFee: [{ category: 'General/OBC/EWS', fee: '' }, { category: 'SC/ST', fee: '0' }],
  ageLimit: [{ category: 'General', minAge: '18', maxAge: '27' }],
  vacancyDetails: [{ postName: '', totalPost: '', eligibility: '' }],
  selectionProcess: [''],
  physicalEligibility: [],
  eligibilityDetails: '',
  importantDatesHtml: '', applicationFeeHtml: '', ageLimitHtml: '',
  vacancyDetailsHtml: '', physicalStandardHtml: '', selectionProcessHtml: '', importantLinksHtml: '',
};

type Tab = 'dashboard' | 'jobs' | 'add' | 'paste';

export default function Admin() {
  const { toast } = useToast();
  const { jobs, addJob, updateJob, deleteJob } = useJobs();
  const { isAdmin, loading: authLoading, refresh: refreshAuth } = useAuth();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [form, setForm] = useState<Partial<Job>>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [loginU, setLoginU] = useState('');
  const [loginP, setLoginP] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [openSection, setOpenSection] = useState<string>('basic');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { refreshAuth(); }, []);
  useEffect(() => { if (isAdmin && tab === 'dashboard') fetchAnalytics(); }, [isAdmin, tab]);

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch('/api/analytics', { credentials: 'include' });
      if (res.ok) setAnalytics(await res.json());
    } catch {}
    setAnalyticsLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErr('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginU, password: loginP }),
        credentials: 'include',
      });
      if (res.ok) { await refreshAuth(); toast({ title: 'Login Successful' }); }
      else setLoginErr('Invalid username or password');
    } catch { setLoginErr('Login failed. Try again.'); }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    await refreshAuth();
  };

  const handlePaste = async () => {
    if (!pasteText.trim() || pasteText.trim().length < 50) {
      toast({ title: 'Error', description: 'Please paste at least 50 characters', variant: 'destructive' });
      return;
    }
    setParsing(true);
    try {
      const res = await fetch('/api/parse-job-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: pasteText }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.parsedData) {
        const pd = data.parsedData;
        const lastDate = pd.importantDates?.find((d: any) =>
          d.label.toLowerCase().includes('last') || d.label.toLowerCase().includes('deadline')
        )?.date || '';
        setForm({
          ...emptyForm, ...pd,
          lastDate,
          postDate: new Date().toLocaleDateString('en-GB'),
          ageLimit: pd.ageLimit?.length ? pd.ageLimit : emptyForm.ageLimit,
          selectionProcess: pd.selectionProcess?.length ? pd.selectionProcess : [''],
          physicalEligibility: pd.physicalEligibility || [],
          vacancyDetails: pd.vacancyDetails?.length ? pd.vacancyDetails : emptyForm.vacancyDetails,
          applicationFee: pd.applicationFee?.length ? pd.applicationFee : emptyForm.applicationFee,
          importantDates: pd.importantDates?.length ? pd.importantDates : emptyForm.importantDates,
        });
        setEditId(null);
        setTab('add');
        toast({ title: '✅ Auto-Fill Complete!', description: 'Check all fields and add URLs before publishing.' });
      } else {
        toast({ title: 'Parse failed', description: 'Try with more text', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Please try again', variant: 'destructive' });
    }
    setParsing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim() || !form.department?.trim() || !form.shortInfo?.trim()) {
      toast({ title: 'Error', description: 'Title, Department and Description are required', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const jobData: Job = {
        ...emptyForm as Job,
        ...form as Job,
        id: editId || Math.random().toString(36).substr(2, 9),
        postDate: form.postDate || new Date().toLocaleDateString('en-GB'),
        links: [
          ...(form.applyOnlineUrl ? [{ label: 'Apply Online', url: form.applyOnlineUrl }] : []),
          ...(form.notificationUrl ? [{ label: 'Official Notification', url: form.notificationUrl }] : []),
          ...(form.officialWebsiteUrl ? [{ label: 'Official Website', url: form.officialWebsiteUrl }] : []),
        ],
      };
      let success = false;
      if (editId) success = await updateJob(editId, jobData);
      else success = await addJob(jobData);

      if (success) {
        toast({ title: editId ? '✅ Job Updated!' : '✅ Job Published!' });
        setForm(emptyForm);
        setEditId(null);
        setTab('jobs');
      } else {
        toast({ title: 'Failed', description: 'Please try again', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    }
    setSubmitting(false);
  };

  const handleEdit = (job: Job) => {
    setForm({
      ...job,
      ageLimit: job.ageLimit?.length ? job.ageLimit : emptyForm.ageLimit,
      selectionProcess: job.selectionProcess?.length ? job.selectionProcess : [''],
      physicalEligibility: job.physicalEligibility || [],
    });
    setEditId(job.id);
    setTab('add');
    setOpenSection('basic');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this job?')) return;
    const success = await deleteJob(id);
    if (success) toast({ title: 'Deleted' });
  };

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target?.result as string;
      const rows = text.split('\n').slice(1);
      let count = 0;
      for (const row of rows) {
        const cols = row.split(',');
        if (cols.length >= 2 && cols[0]?.trim()) {
          const job: Job = {
            ...emptyForm as Job,
            id: Math.random().toString(36).substr(2, 9),
            title: cols[0]?.trim(),
            department: cols[1]?.trim() || 'N/A',
            type: 'job',
            postDate: new Date().toLocaleDateString('en-GB'),
            lastDate: cols[2]?.trim() || '',
            shortInfo: 'Check official notification for complete details.',
            applyOnlineUrl: cols[3]?.trim() || '',
            notificationUrl: cols[4]?.trim() || '',
            links: [
              ...(cols[3]?.trim() ? [{ label: 'Apply Online', url: cols[3].trim() }] : []),
              ...(cols[4]?.trim() ? [{ label: 'Notification', url: cols[4].trim() }] : []),
            ],
          };
          const ok = await addJob(job);
          if (ok) count++;
        }
      }
      toast({ title: `✅ ${count} jobs uploaded!` });
    };
    reader.readAsText(file);
  };

  const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button type="button" onClick={() => setOpenSection(openSection === id ? '' : id)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors">
        <span className="font-bold text-slate-700 text-sm uppercase tracking-wide">{title}</span>
        {openSection === id ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </button>
      {openSection === id && <div className="p-4 space-y-3 bg-white">{children}</div>}
    </div>
  );

  const Input = ({ label, value, onChange, placeholder, type = 'text', required = false }: any) => (
    <div>
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">{label}{required && ' *'}</label>
      <input type={type} value={value || ''} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} required={required}
        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium outline-none focus:border-blue-400 bg-slate-50 focus:bg-white transition-colors" />
    </div>
  );

  if (authLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!isAdmin) return (
    <div className="max-w-sm mx-auto py-16 px-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
        <div className="bg-blue-700 p-6 text-center">
          <Lock className="w-10 h-10 text-white mx-auto mb-2" />
          <h1 className="text-lg font-black text-white">Admin Login</h1>
        </div>
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          {loginErr && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold text-center">{loginErr}</div>}
          <Input label="Username" value={loginU} onChange={setLoginU} placeholder="admin" required />
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Password *</label>
            <input type="password" value={loginP} onChange={e => setLoginP(e.target.value)} placeholder="••••••••" required
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium outline-none focus:border-blue-400 bg-slate-50" />
          </div>
          <button type="submit" className="w-full bg-blue-700 text-white py-3 rounded-xl font-black text-sm uppercase tracking-wide hover:bg-blue-800 transition-colors shadow-md">
            Login
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-blue-700 rounded-xl px-5 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-white font-black text-lg">Admin Panel</h1>
          <p className="text-blue-200 text-xs">{jobs.length} total posts</p>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { id: 'dashboard', label: '📊 Dashboard', icon: BarChart3 },
          { id: 'jobs',      label: '📋 All Jobs',  icon: LayoutGrid },
          { id: 'add',       label: editId ? '✏️ Edit Job' : '➕ Add Job', icon: Plus },
          { id: 'paste',     label: '🪄 Smart Paste', icon: Sparkles },
        ].map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id as Tab)}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${tab === id ? 'bg-blue-700 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ===== DASHBOARD ===== */}
      {tab === 'dashboard' && (
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total Jobs',   val: jobs.filter(j => j.type === 'job').length,        color: 'bg-blue-50 border-blue-200 text-blue-700' },
              { label: 'Admit Cards',  val: jobs.filter(j => j.type === 'admit-card').length,  color: 'bg-green-50 border-green-200 text-green-700' },
              { label: 'Results',      val: jobs.filter(j => j.type === 'result').length,       color: 'bg-red-50 border-red-200 text-red-700' },
              { label: 'Answer Keys',  val: jobs.filter(j => j.type === 'answer-key').length,  color: 'bg-purple-50 border-purple-200 text-purple-700' },
            ].map(s => (
              <div key={s.label} className={`border rounded-xl p-4 ${s.color}`}>
                <div className="text-2xl font-black">{s.val}</div>
                <div className="text-xs font-bold uppercase tracking-wide mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Analytics */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-800 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-white" />
                <span className="text-white font-bold text-sm">Analytics — Real Visitor Data</span>
              </div>
              <button onClick={fetchAnalytics} className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-lg font-bold transition-colors">
                Refresh
              </button>
            </div>

            {analyticsLoading ? (
              <div className="p-10 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-medium">Loading analytics...</p>
              </div>
            ) : analytics ? (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Total Visitors', val: analytics.totalVisitors, icon: Users,       color: 'text-blue-600 bg-blue-50' },
                    { label: 'Today',          val: analytics.todayVisitors, icon: TrendingUp,   color: 'text-green-600 bg-green-50' },
                    { label: 'Yesterday',      val: analytics.yesterdayVisitors, icon: Clock,    color: 'text-amber-600 bg-amber-50' },
                    { label: 'Active (5 min)', val: analytics.activeUsers, icon: Users,          color: 'text-purple-600 bg-purple-50' },
                  ].map(({ label, val, icon: Icon, color }) => (
                    <div key={label} className="border border-slate-200 rounded-xl p-4">
                      <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mb-2`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="text-2xl font-black text-slate-800">{val.toLocaleString()}</div>
                      <div className="text-xs text-slate-500 font-bold uppercase tracking-wide mt-1">{label}</div>
                    </div>
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
                      <span className="font-bold text-slate-700 text-xs uppercase tracking-wide flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" /> Page Views
                      </span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {analytics.pageViews.length > 0 ? analytics.pageViews.slice(0, 8).map((pv, i) => (
                        <div key={i} className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50">
                          <span className="text-sm font-medium text-slate-700 capitalize">{pv.page.replace('/', '') || 'Home'}</span>
                          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">{pv.count.toLocaleString()}</span>
                        </div>
                      )) : (
                        <div className="py-8 text-center text-slate-400 text-sm">No data yet — visitors will appear here</div>
                      )}
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
                      <span className="font-bold text-slate-700 text-xs uppercase tracking-wide flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" /> Top Posts
                      </span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {analytics.topPosts.length > 0 ? analytics.topPosts.map((p, i) => (
                        <div key={i} className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 gap-3">
                          <span className="text-sm font-medium text-slate-700 truncate flex-1">{p.title}</span>
                          <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full shrink-0">{p.views}</span>
                        </div>
                      )) : (
                        <div className="py-8 text-center text-slate-400 text-sm">No post views yet</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-10 text-center text-slate-400">
                <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">Click Refresh to load analytics</p>
              </div>
            )}
          </div>

          {/* CSV Upload */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="font-bold text-slate-700 text-sm mb-2 uppercase tracking-wide">📤 Bulk CSV Upload</h3>
            <p className="text-xs text-slate-500 mb-3">Format: Title, Department, Last Date, Apply URL, Notification URL</p>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSV} />
            <button onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
              <Upload className="w-4 h-4" /> Upload CSV File
            </button>
          </div>
        </div>
      )}

      {/* ===== ALL JOBS ===== */}
      {tab === 'jobs' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-800 px-4 py-3 flex items-center justify-between">
            <span className="text-white font-bold text-sm">All Posts ({jobs.length})</span>
            <button onClick={() => { setForm(emptyForm); setEditId(null); setTab('add'); }}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add New
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {jobs.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <p className="text-sm font-medium">No jobs yet. Add your first job!</p>
              </div>
            ) : jobs.map(job => (
              <div key={job.id} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      job.type === 'job' ? 'bg-blue-100 text-blue-700' :
                      job.type === 'admit-card' ? 'bg-green-100 text-green-700' :
                      job.type === 'result' ? 'bg-red-100 text-red-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>{job.type}</span>
                    {job.trending && <span className="text-[10px] font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Trending</span>}
                  </div>
                  <p className="text-sm font-bold text-slate-800 truncate">{job.title}</p>
                  <p className="text-xs text-slate-400 font-medium">{job.department} {job.lastDate ? `• Last: ${job.lastDate}` : ''}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <a href={`/job/${job.slug || job.id}`} target="_blank" rel="noopener noreferrer">
                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </a>
                  <button onClick={() => handleEdit(job)} className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(job.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== ADD / EDIT JOB ===== */}
      {tab === 'add' && (
        <form onSubmit={handleSubmit} className="space-y-3">
          {editId && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-amber-700 font-bold text-sm">✏️ Editing: {form.title?.slice(0, 50)}...</span>
              <button type="button" onClick={() => { setForm(emptyForm); setEditId(null); }} className="text-amber-600 hover:text-amber-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Basic Info */}
          <Section id="basic" title="📝 Basic Information (Required)">
            <Input label="Post Title" value={form.title} onChange={(v: string) => setForm({...form, title: v})} placeholder="e.g. SSC CGL 2026 (50000 Posts)" required />
            <Input label="Department / Organization" value={form.department} onChange={(v: string) => setForm({...form, department: v})} placeholder="e.g. Staff Selection Commission" required />
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Post Type *</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value as any})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium outline-none focus:border-blue-400 bg-slate-50">
                <option value="job">Job</option>
                <option value="admit-card">Admit Card</option>
                <option value="result">Result</option>
                <option value="answer-key">Answer Key</option>
                <option value="admission">Admission</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Qualification</label>
              <select value={form.qualification} onChange={e => setForm({...form, qualification: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium outline-none focus:border-blue-400 bg-slate-50">
                <option value="">Select Qualification</option>
                <option value="10th">10th Pass</option>
                <option value="12th">12th Pass</option>
                <option value="graduation">Graduation</option>
                <option value="postgraduate">Post Graduate</option>
              </select>
            </div>
            <Input label="Last Date to Apply" value={form.lastDate} onChange={(v: string) => setForm({...form, lastDate: v})} placeholder="e.g. 31 May 2026" />
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Brief Description *</label>
              <textarea value={form.shortInfo || ''} onChange={e => setForm({...form, shortInfo: e.target.value})} required
                placeholder="Short description about this post..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium outline-none focus:border-blue-400 bg-slate-50 min-h-[80px]" />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.featured || false} onChange={e => setForm({...form, featured: e.target.checked})} className="w-4 h-4 accent-blue-600" />
                <span className="text-sm font-bold text-slate-700">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.trending || false} onChange={e => setForm({...form, trending: e.target.checked})} className="w-4 h-4 accent-yellow-500" />
                <span className="text-sm font-bold text-slate-700">Trending 🔥</span>
              </label>
            </div>
          </Section>

          {/* Links */}
          <Section id="links" title="🔗 Important Links">
            <Input label="Apply Online URL" value={form.applyOnlineUrl} onChange={(v: string) => setForm({...form, applyOnlineUrl: v})} placeholder="https://..." />
            <Input label="Official Notification URL" value={form.notificationUrl} onChange={(v: string) => setForm({...form, notificationUrl: v})} placeholder="https://...pdf" />
            <Input label="Official Website URL" value={form.officialWebsiteUrl} onChange={(v: string) => setForm({...form, officialWebsiteUrl: v})} placeholder="https://..." />
            {form.type === 'admit-card' && <Input label="Admit Card URL" value={form.admitCardUrl} onChange={(v: string) => setForm({...form, admitCardUrl: v})} placeholder="https://..." />}
            {form.type === 'result' && <Input label="Result URL" value={form.resultUrl} onChange={(v: string) => setForm({...form, resultUrl: v})} placeholder="https://..." />}
            {form.type === 'answer-key' && <Input label="Answer Key URL" value={form.answerKeyUrl} onChange={(v: string) => setForm({...form, answerKeyUrl: v})} placeholder="https://..." />}
          </Section>

          {/* Important Dates */}
          <Section id="dates" title="📅 Important Dates">
            {(form.importantDates || []).map((d, i) => (
              <div key={i} className="flex gap-2 items-start">
                <input value={d.label} onChange={e => { const arr = [...(form.importantDates||[])]; arr[i] = {...d, label: e.target.value}; setForm({...form, importantDates: arr}); }}
                  placeholder="Label (e.g. Last Date)" className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-blue-400 bg-slate-50" />
                <input value={d.date} onChange={e => { const arr = [...(form.importantDates||[])]; arr[i] = {...d, date: e.target.value}; setForm({...form, importantDates: arr}); }}
                  placeholder="Date (e.g. 31 May 2026)" className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-blue-400 bg-slate-50" />
                <button type="button" onClick={() => setForm({...form, importantDates: (form.importantDates||[]).filter((_, j) => j !== i)})}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><X className="w-4 h-4" /></button>
              </div>
            ))}
            <button type="button" onClick={() => setForm({...form, importantDates: [...(form.importantDates||[]), {label:'', date:''}]})}
              className="flex items-center gap-1.5 text-blue-600 text-sm font-bold hover:text-blue-800">
              <Plus className="w-4 h-4" /> Add Date
            </button>
          </Section>

          {/* Application Fee */}
          <Section id="fee" title="💰 Application Fee">
            {(form.applicationFee || []).map((f, i) => (
              <div key={i} className="flex gap-2 items-start">
                <input value={f.category} onChange={e => { const arr = [...(form.applicationFee||[])]; arr[i] = {...f, category: e.target.value}; setForm({...form, applicationFee: arr}); }}
                  placeholder="Category (e.g. General/OBC)" className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-blue-400 bg-slate-50" />
                <input value={f.fee} onChange={e => { const arr = [...(form.applicationFee||[])]; arr[i] = {...f, fee: e.target.value}; setForm({...form, applicationFee: arr}); }}
                  placeholder="Fee (e.g. ₹500/-)" className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-blue-400 bg-slate-50" />
                <button type="button" onClick={() => setForm({...form, applicationFee: (form.applicationFee||[]).filter((_, j) => j !== i)})}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><X className="w-4 h-4" /></button>
              </div>
            ))}
            <button type="button" onClick={() => setForm({...form, applicationFee: [...(form.applicationFee||[]), {category:'', fee:''}]})}
              className="flex items-center gap-1.5 text-blue-600 text-sm font-bold hover:text-blue-800">
              <Plus className="w-4 h-4" /> Add Fee Category
            </button>
          </Section>

          {/* Age Limit */}
          <Section id="age" title="🎂 Age Limit">
            {(form.ageLimit || []).map((a, i) => (
              <div key={i} className="flex gap-2 items-start">
                <input value={a.category} onChange={e => { const arr = [...(form.ageLimit||[])]; arr[i] = {...a, category: e.target.value}; setForm({...form, ageLimit: arr}); }}
                  placeholder="Category" className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-blue-400 bg-slate-50" />
                <input value={a.minAge} onChange={e => { const arr = [...(form.ageLimit||[])]; arr[i] = {...a, minAge: e.target.value}; setForm({...form, ageLimit: arr}); }}
                  placeholder="Min Age" className="w-24 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-blue-400 bg-slate-50" />
                <input value={a.maxAge} onChange={e => { const arr = [...(form.ageLimit||[])]; arr[i] = {...a, maxAge: e.target.value}; setForm({...form, ageLimit: arr}); }}
                  placeholder="Max Age" className="w-24 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-blue-400 bg-slate-50" />
                <button type="button" onClick={() => setForm({...form, ageLimit: (form.ageLimit||[]).filter((_, j) => j !== i)})}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><X className="w-4 h-4" /></button>
              </div>
            ))}
            <button type="button" onClick={() => setForm({...form, ageLimit: [...(form.ageLimit||[]), {category:'', minAge:'18', maxAge:'35'}]})}
              className="flex items-center gap-1.5 text-blue-600 text-sm font-bold hover:text-blue-800">
              <Plus className="w-4 h-4" /> Add Age Category
            </button>
          </Section>

          {/* Vacancy */}
          <Section id="vacancy" title="📊 Vacancy Details">
            {(form.vacancyDetails || []).map((v, i) => (
              <div key={i} className="border border-slate-100 rounded-lg p-3 space-y-2 bg-slate-50">
                <div className="flex gap-2">
                  <input value={v.postName} onChange={e => { const arr = [...(form.vacancyDetails||[])]; arr[i] = {...v, postName: e.target.value}; setForm({...form, vacancyDetails: arr}); }}
                    placeholder="Post Name" className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-blue-400 bg-white" />
                  <input value={v.totalPost} onChange={e => { const arr = [...(form.vacancyDetails||[])]; arr[i] = {...v, totalPost: e.target.value}; setForm({...form, vacancyDetails: arr}); }}
                    placeholder="Total Posts" className="w-28 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-blue-400 bg-white" />
                  <button type="button" onClick={() => setForm({...form, vacancyDetails: (form.vacancyDetails||[]).filter((_, j) => j !== i)})}
                    className="p-2 text-red-400 hover:text-red-600 rounded-lg"><X className="w-4 h-4" /></button>
                </div>
                <input value={v.eligibility} onChange={e => { const arr = [...(form.vacancyDetails||[])]; arr[i] = {...v, eligibility: e.target.value}; setForm({...form, vacancyDetails: arr}); }}
                  placeholder="Eligibility (e.g. 10th Pass + ITI)" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-blue-400 bg-white" />
              </div>
            ))}
            <button type="button" onClick={() => setForm({...form, vacancyDetails: [...(form.vacancyDetails||[]), {postName:'', totalPost:'', eligibility:''}]})}
              className="flex items-center gap-1.5 text-blue-600 text-sm font-bold hover:text-blue-800">
              <Plus className="w-4 h-4" /> Add Vacancy
            </button>
          </Section>

          {/* Physical Eligibility */}
          <Section id="physical" title="🏃 Physical Eligibility (Height/Chest etc.)">
            {(form.physicalEligibility || []).map((p, i) => (
              <div key={i} className="flex gap-2 items-start">
                <input value={p.criteria} onChange={e => { const arr = [...(form.physicalEligibility||[])]; arr[i] = {...p, criteria: e.target.value}; setForm({...form, physicalEligibility: arr}); }}
                  placeholder="Criteria (e.g. Height, Chest)" className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-blue-400 bg-slate-50" />
                <input value={p.male} onChange={e => { const arr = [...(form.physicalEligibility||[])]; arr[i] = {...p, male: e.target.value}; setForm({...form, physicalEligibility: arr}); }}
                  placeholder="Male (e.g. 170 cm)" className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-blue-400 bg-slate-50" />
                <input value={p.female} onChange={e => { const arr = [...(form.physicalEligibility||[])]; arr[i] = {...p, female: e.target.value}; setForm({...form, physicalEligibility: arr}); }}
                  placeholder="Female (e.g. 157 cm)" className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-blue-400 bg-slate-50" />
                <button type="button" onClick={() => setForm({...form, physicalEligibility: (form.physicalEligibility||[]).filter((_, j) => j !== i)})}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><X className="w-4 h-4" /></button>
              </div>
            ))}
            <button type="button" onClick={() => setForm({...form, physicalEligibility: [...(form.physicalEligibility||[]), {criteria:'', male:'', female:''}]})}
              className="flex items-center gap-1.5 text-blue-600 text-sm font-bold hover:text-blue-800">
              <Plus className="w-4 h-4" /> Add Physical Criteria
            </button>
          </Section>

          {/* Selection Process */}
          <Section id="selection" title="📋 Selection Process">
            {(form.selectionProcess || []).map((s, i) => (
              <div key={i} className="flex gap-2 items-center">
                <span className="text-xs font-black text-slate-400 w-6 text-right">{i+1}.</span>
                <input value={s} onChange={e => { const arr = [...(form.selectionProcess||[])]; arr[i] = e.target.value; setForm({...form, selectionProcess: arr}); }}
                  placeholder={`Step ${i+1} (e.g. Written Exam)`} className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-blue-400 bg-slate-50" />
                <button type="button" onClick={() => setForm({...form, selectionProcess: (form.selectionProcess||[]).filter((_, j) => j !== i)})}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><X className="w-4 h-4" /></button>
              </div>
            ))}
            <button type="button" onClick={() => setForm({...form, selectionProcess: [...(form.selectionProcess||[]), '']})}
              className="flex items-center gap-1.5 text-blue-600 text-sm font-bold hover:text-blue-800">
              <Plus className="w-4 h-4" /> Add Step
            </button>
          </Section>

          {/* HTML Sections */}
          <Section id="html" title="📄 HTML Content (Copy-Paste from Official Site)">
            {[
              { key: 'importantDatesHtml', label: 'Important Dates (HTML Table)' },
              { key: 'applicationFeeHtml', label: 'Application Fee (HTML Table)' },
              { key: 'ageLimitHtml',       label: 'Age Limit (HTML Table)' },
              { key: 'vacancyDetailsHtml', label: 'Vacancy Details (HTML Table)' },
              { key: 'physicalStandardHtml', label: 'Physical Standard (HTML Table)' },
              { key: 'selectionProcessHtml', label: 'Selection Process (HTML)' },
              { key: 'importantLinksHtml', label: 'Important Links (HTML)' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">{label}</label>
                <textarea value={(form as any)[key] || ''} onChange={e => setForm({...form, [key]: e.target.value})}
                  placeholder={`Paste HTML for ${label} here...`}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-blue-400 bg-slate-50 min-h-[80px]" />
              </div>
            ))}
          </Section>

          {/* Submit */}
          <div className="flex gap-3">
            <button type="submit" disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white py-4 rounded-xl font-black text-sm uppercase tracking-wide transition-colors shadow-lg">
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              {submitting ? 'Publishing...' : editId ? 'Update Job' : 'Publish Job'}
            </button>
            <button type="button" onClick={() => { setForm(emptyForm); setEditId(null); setTab('jobs'); }}
              className="px-6 py-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ===== SMART PASTE ===== */}
      {tab === 'paste' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-4">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-white" />
              <h2 className="text-white font-black text-base">🪄 Smart Paste — Auto Fill Form</h2>
            </div>
            <p className="text-purple-100 text-xs">Kisi bhi job ka text paste karo — sab automatically fill ho jayega!</p>
          </div>

          <div className="p-4 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-blue-800 font-bold text-sm mb-2">📋 Kaise use kare:</p>
              <ol className="text-blue-700 text-xs space-y-1 list-decimal list-inside font-medium">
                <li>Sarkari Result ya kisi bhi site se job ka poora text copy karo</li>
                <li>Neeche box mein paste karo</li>
                <li>"Auto Fill Karo" button dabao</li>
                <li>Form automatically fill ho jayega — bas URLs check karo</li>
                <li>Publish karo!</li>
              </ol>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Job Notification Text Paste Karo</label>
              <textarea
                value={pasteText}
                onChange={e => setPasteText(e.target.value)}
                placeholder={`Yahaan paste karo... Example:

CRPF Constable Tradesman Online Form 2026
Total Posts: 9195
Apply Online Start: 20 April 2026
Last Date: 19 May 2026

Application Fee:
General/OBC: Rs 100
SC/ST: Nil

Age Limit: 18-27 years

Height: Male 170 cm, Female 157 cm
...`}
                className="w-full border-2 border-slate-200 focus:border-purple-400 rounded-xl px-4 py-3 text-sm font-medium outline-none bg-slate-50 min-h-[350px] font-mono transition-colors"
              />
              <p className="text-xs text-slate-400 mt-1">{pasteText.length} characters</p>
            </div>

            <button
              onClick={handlePaste}
              disabled={parsing || pasteText.trim().length < 50}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white py-4 rounded-xl font-black text-sm uppercase tracking-wide transition-all shadow-lg"
            >
              {parsing ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Parsing...</>
              ) : (
                <><Sparkles className="w-5 h-5" /> Auto Fill Karo 🪄</>
              )}
            </button>

            {pasteText.trim().length < 50 && pasteText.trim().length > 0 && (
              <p className="text-red-500 text-xs font-bold text-center">Kam se kam 50 characters paste karo</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
