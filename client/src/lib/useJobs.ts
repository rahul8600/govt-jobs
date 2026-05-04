import { useState, useEffect, useCallback } from 'react';
import { Job } from './data';

interface DbPost {
  id: number;
  slug: string | null;
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
  selectionProcess: string[];
  physicalEligibility: any[];
  links: any[];
  featured: boolean | null;
  trending: boolean | null;
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
  createdAt: string | null;
}

function dbPostToJob(post: DbPost): Job {
  return {
    id: String(post.id),
    slug: post.slug || undefined,
    title: post.title,
    department: post.department,
    type: (post.type as 'job' | 'admit-card' | 'result' | 'answer-key') || 'job',
    lastDate: post.lastDate || undefined,
    postDate: post.postDate,
    shortInfo: post.shortInfo,
    qualification: post.qualification || undefined,
    state: post.state || undefined,
    category: post.category || undefined,
    vacancyDetails: post.vacancyDetails || [],
    applicationFee: post.applicationFee || [],
    importantDates: post.importantDates || [],
    ageLimit: post.ageLimit || [],
    eligibilityDetails: post.eligibilityDetails || '',
    selectionProcess: post.selectionProcess || [],
    physicalEligibility: post.physicalEligibility || [],
    links: post.links || [],
    featured: post.featured || false,
    trending: post.trending || false,
    rawJobContent: post.rawJobContent || undefined,
    applyOnlineUrl: post.applyOnlineUrl || undefined,
    admitCardUrl: post.admitCardUrl || undefined,
    resultUrl: post.resultUrl || undefined,
    answerKeyUrl: post.answerKeyUrl || undefined,
    notificationUrl: post.notificationUrl || undefined,
    officialWebsiteUrl: post.officialWebsiteUrl || undefined,
    importantDatesHtml: post.importantDatesHtml || undefined,
    applicationFeeHtml: post.applicationFeeHtml || undefined,
    ageLimitHtml: post.ageLimitHtml || undefined,
    vacancyDetailsHtml: post.vacancyDetailsHtml || undefined,
    physicalStandardHtml: post.physicalStandardHtml || undefined,
    physicalEfficiencyHtml: post.physicalEfficiencyHtml || undefined,
    selectionProcessHtml: post.selectionProcessHtml || undefined,
    importantLinksHtml: post.importantLinksHtml || undefined,
  };
}

function jobToDbPost(job: Omit<Job, 'id'> & { id?: string }) {
  return {
    slug: job.slug || null,
    title: job.title,
    department: job.department,
    type: job.type || 'job',
    lastDate: job.lastDate || null,
    postDate: job.postDate,
    shortInfo: job.shortInfo,
    qualification: job.qualification || null,
    state: job.state || null,
    category: job.category || null,
    vacancyDetails: job.vacancyDetails || [],
    applicationFee: job.applicationFee || [],
    importantDates: job.importantDates || [],
    ageLimit: job.ageLimit || [],
    eligibilityDetails: job.eligibilityDetails || null,
    selectionProcess: job.selectionProcess || [],
    physicalEligibility: job.physicalEligibility || [],
    links: job.links || [],
    featured: job.featured || false,
    trending: job.trending || false,
    rawJobContent: job.rawJobContent || null,
    applyOnlineUrl: job.applyOnlineUrl || null,
    admitCardUrl: job.admitCardUrl || null,
    resultUrl: job.resultUrl || null,
    answerKeyUrl: job.answerKeyUrl || null,
    notificationUrl: job.notificationUrl || null,
    officialWebsiteUrl: job.officialWebsiteUrl || null,
    importantDatesHtml: job.importantDatesHtml || null,
    applicationFeeHtml: job.applicationFeeHtml || null,
    ageLimitHtml: job.ageLimitHtml || null,
    vacancyDetailsHtml: job.vacancyDetailsHtml || null,
    physicalStandardHtml: job.physicalStandardHtml || null,
    physicalEfficiencyHtml: job.physicalEfficiencyHtml || null,
    selectionProcessHtml: job.selectionProcessHtml || null,
    importantLinksHtml: job.importantLinksHtml || null,
  };
}

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = useCallback(async () => {
    try {
      const response = await fetch('/api/posts', {
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
      });
      if (response.ok) {
        const posts: DbPost[] = await response.json();
        setJobs(posts.map(dbPostToJob));
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const addJob = async (job: Job) => {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobToDbPost(job)),
      });
      if (response.ok) {
        const newPost: DbPost = await response.json();
        setJobs(prev => [dbPostToJob(newPost), ...prev]);
        return true;
      }
    } catch (error) {
      console.error('Error adding job:', error);
    }
    return false;
  };

  const updateJob = async (updatedJob: Job) => {
    try {
      const id = parseInt(updatedJob.id);
      if (isNaN(id)) return false;
      
      const response = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobToDbPost(updatedJob)),
      });
      if (response.ok) {
        const updated: DbPost = await response.json();
        setJobs(prev => prev.map(j => j.id === updatedJob.id ? dbPostToJob(updated) : j));
        return true;
      }
    } catch (error) {
      console.error('Error updating job:', error);
    }
    return false;
  };

  const deleteJob = async (id: string) => {
    try {
      const numId = parseInt(id);
      if (isNaN(numId)) return false;
      
      const response = await fetch(`/api/posts/${numId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setJobs(prev => prev.filter(j => j.id !== id));
        return true;
      }
    } catch (error) {
      console.error('Error deleting job:', error);
    }
    return false;
  };

  return { jobs, loading, addJob, updateJob, deleteJob, refetch: fetchJobs };
}
