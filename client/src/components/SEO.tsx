import { useEffect } from 'react';
import { Job } from '@/lib/data';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  type?: 'website' | 'article';
  job?: Job;
}

const SITE_NAME = 'Govt Job Alert';
const BASE_URL = typeof window !== 'undefined' ? window.location.origin : '';

export function useSEO({ title, description, keywords, canonical, type = 'website', job }: SEOProps) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    document.title = fullTitle;

    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    if (description) {
      setMeta('description', description);
      setMeta('og:description', description, true);
      setMeta('twitter:description', description);
    }

    if (keywords) {
      setMeta('keywords', keywords);
    }

    setMeta('og:title', fullTitle, true);
    setMeta('twitter:title', fullTitle);
    setMeta('og:type', type, true);
    setMeta('og:site_name', SITE_NAME, true);

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonical || window.location.href.split('?')[0];

    setMeta('og:url', canonical || window.location.href.split('?')[0], true);

    if (job && job.type === 'job') {
      let script = document.querySelector('script[data-schema="job"]') as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-schema', 'job');
        document.head.appendChild(script);
      }

      const year = new Date().getFullYear();
      const jobPosting = {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: job.title,
        description: job.shortInfo || job.title,
        datePosted: job.createdAt || new Date().toISOString(),
        validThrough: job.lastDate ? parseIndianDate(job.lastDate) : undefined,
        hiringOrganization: {
          '@type': 'Organization',
          name: job.department || 'Government of India',
        },
        jobLocation: {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'IN',
            addressRegion: job.state || 'India',
          },
        },
        employmentType: 'FULL_TIME',
        industry: 'Government',
        qualifications: job.qualification || job.eligibilityDetails || undefined,
      };

      script.textContent = JSON.stringify(jobPosting);
    }

    return () => {
      const schema = document.querySelector('script[data-schema="job"]');
      if (schema) schema.remove();
    };
  }, [title, description, keywords, canonical, type, job]);
}

function parseIndianDate(dateStr: string): string | undefined {
  if (!dateStr) return undefined;
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return undefined;
}

export function generateJobMeta(job: Job): SEOProps {
  const yearMatch = job.title.match(/20\d{2}/);
  const year = yearMatch ? yearMatch[0] : new Date().getFullYear();
  const typeLabel = getTypeLabel(job.type);
  
  let title = job.title;
  const titleHasYear = /20\d{2}/.test(job.title);
  const yearSuffix = titleHasYear ? '' : ` ${year}`;
  
  if (job.type === 'job') {
    title = `${job.title}${yearSuffix} – Online Form, Eligibility, Last Date`;
  } else if (job.type === 'admit-card') {
    title = `${job.title}${yearSuffix} – Download Admit Card, Exam Date`;
  } else if (job.type === 'result') {
    title = `${job.title}${yearSuffix} – Check Result, Merit List, Cut Off`;
  } else if (job.type === 'answer-key') {
    title = `${job.title}${yearSuffix} – Download Answer Key, Solutions`;
  }
  
  let description = `${job.title} - online form, eligibility, age limit, syllabus, apply link`;
  if (job.department) description += `. ${job.department}`;
  if (job.lastDate) description += `. Last Date: ${job.lastDate}`;
  description = description.slice(0, 160);

  const keywordParts = [
    job.title,
    job.department,
    job.state,
    typeLabel,
    job.qualification,
    job.category,
    `${year}`,
    'sarkari result',
    'government job',
    'online form',
    'eligibility',
    'age limit',
    'syllabus',
    'apply link',
  ].filter(Boolean);
  const keywords = keywordParts.join(', ');

  const slug = job.slug || job.id;
  const canonical = `${typeof window !== 'undefined' ? window.location.origin : ''}/job/${slug}`;

  return { title, description, keywords, canonical, type: 'article', job };
}

function getTypeLabel(type: string): string {
  switch (type) {
    case 'job': return 'Government Job';
    case 'admit-card': return 'Admit Card';
    case 'result': return 'Result';
    case 'answer-key': return 'Answer Key';
    case 'admission': return 'Admission';
    default: return 'Notification';
  }
}

export function generateListMeta(type: string, searchQuery?: string): SEOProps {
  const year = new Date().getFullYear();
  
  let title: string;
  let description: string;
  let keywords: string;

  if (searchQuery) {
    title = `Search Results for "${searchQuery}"`;
    description = `Find government jobs, admit cards, results matching "${searchQuery}". Latest Govt Job Alert updates ${year}.`;
    keywords = `${searchQuery}, sarkari result, government jobs, ${year}`;
  } else {
    switch (type) {
      case 'job':
      case 'latest-jobs':
        title = `Latest Government Jobs ${year}`;
        description = `Browse latest government job notifications ${year}. Apply online for SSC, Railway, UPSC, State PSC and more sarkari naukri.`;
        keywords = `government jobs ${year}, sarkari naukri, latest govt jobs, SSC jobs, Railway jobs, UPSC`;
        break;
      case 'admit-card':
        title = `Admit Card Download ${year}`;
        description = `Download admit cards for government exams ${year}. SSC, Railway, UPSC, State exams hall tickets available.`;
        keywords = `admit card ${year}, hall ticket download, exam admit card, sarkari exam`;
        break;
      case 'result':
      case 'results':
        title = `Government Exam Results ${year}`;
        description = `Check latest government exam results ${year}. SSC, Railway, UPSC, State PSC results and merit lists.`;
        keywords = `result ${year}, sarkari result, exam result, merit list, government exam`;
        break;
      case 'answer-key':
        title = `Answer Keys ${year}`;
        description = `Download official answer keys for government exams ${year}. SSC, Railway, UPSC answer keys with solutions.`;
        keywords = `answer key ${year}, exam answer key, SSC answer key, Railway answer key`;
        break;
      case 'admission':
        title = `Admission Notifications ${year}`;
        description = `Latest admission notifications for government colleges and universities ${year}. Apply for higher education.`;
        keywords = `admission ${year}, government college admission, university admission`;
        break;
      default:
        title = `Govt Job Alert ${year}`;
        description = `Latest government jobs, admit cards, results and answer keys ${year}. Your one-stop portal for govt jobs.`;
        keywords = `sarkari result, government jobs, admit card, result ${year}`;
    }
  }

  return { title, description, keywords };
}

export function generateHomeMeta(): SEOProps {
  const year = new Date().getFullYear();
  return {
    title: `Govt Job Alert – Latest Govt Jobs, Admit Card, Results`,
    description: `Govt Job Alert ${year} - Latest government job notifications, admit cards, exam results, answer keys. Apply online for SSC, Railway, UPSC, Bank and State Government jobs.`,
    keywords: `sarkari result ${year}, government jobs, sarkari naukri, admit card, result, SSC, Railway, UPSC, Bank jobs`,
    canonical: typeof window !== 'undefined' ? window.location.origin : '',
  };
}
