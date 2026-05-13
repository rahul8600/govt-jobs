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

const SITE_NAME = 'SarkariJobSeva';
const BASE_URL = 'https://sarkarijobseva.com';

export function useSEO({ title, description, keywords, canonical, type = 'website', job }: SEOProps) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} – Latest Sarkari Naukri, Admit Card, Result 2026`;
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

    if (keywords) setMeta('keywords', keywords);

    setMeta('og:title', fullTitle, true);
    setMeta('twitter:title', fullTitle);
    setMeta('og:type', type, true);
    setMeta('og:site_name', SITE_NAME, true);
    setMeta('og:image', `${BASE_URL}/og-image.png`, true);
    setMeta('og:image:width', '1200', true);
    setMeta('og:image:height', '630', true);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:image', `${BASE_URL}/og-image.png`);
    setMeta('twitter:site', '@sarkarijobseva');

    // Canonical
    const canonicalUrl = canonical || `${BASE_URL}${window.location.pathname}`;
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonicalUrl;
    setMeta('og:url', canonicalUrl, true);

    // Job Schema
    if (job) {
      let jobScript = document.querySelector('script[data-schema="job"]') as HTMLScriptElement;
      if (!jobScript) {
        jobScript = document.createElement('script');
        jobScript.type = 'application/ld+json';
        jobScript.setAttribute('data-schema', 'job');
        document.head.appendChild(jobScript);
      }

      const slug = (job as any).slug || job.id;
      const jobUrl = `${BASE_URL}/job/${slug}`;

      if (job.type === 'job') {
        jobScript.textContent = JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'JobPosting',
          title: job.title,
          description: job.shortInfo || job.eligibilityDetails || job.title,
          datePosted: (job as any).createdAt || new Date().toISOString().split('T')[0],
          validThrough: job.lastDate ? parseIndianDate(job.lastDate) : undefined,
          url: jobUrl,
          hiringOrganization: {
            '@type': 'Organization',
            name: job.department || 'Government of India',
            sameAs: (job as any).officialWebsiteUrl || BASE_URL,
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
          applicantLocationRequirements: {
            '@type': 'Country',
            name: 'India',
          },
          directApply: true,
        });
      } else {
        // Article schema for admit card, result, answer key, admission
        const typeLabel = getTypeLabel(job.type);
        jobScript.textContent = JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: job.title,
          description: job.shortInfo || job.title,
          url: jobUrl,
          datePublished: (job as any).createdAt || new Date().toISOString().split('T')[0],
          dateModified: new Date().toISOString().split('T')[0],
          publisher: {
            '@type': 'Organization',
            name: SITE_NAME,
            url: BASE_URL,
            logo: {
              '@type': 'ImageObject',
              url: `${BASE_URL}/favicon.png`,
            },
          },
          mainEntityOfPage: jobUrl,
          keywords: `${job.title}, ${job.department}, ${typeLabel}, sarkari result`,
        });
      }

      // BreadcrumbList schema
      let breadcrumbScript = document.querySelector('script[data-schema="breadcrumb"]') as HTMLScriptElement;
      if (!breadcrumbScript) {
        breadcrumbScript = document.createElement('script');
        breadcrumbScript.type = 'application/ld+json';
        breadcrumbScript.setAttribute('data-schema', 'breadcrumb');
        document.head.appendChild(breadcrumbScript);
      }
      const typeHref = getTypeHref(job.type);
      breadcrumbScript.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
          { '@type': 'ListItem', position: 2, name: getTypeLabel(job.type), item: `${BASE_URL}${typeHref}` },
          { '@type': 'ListItem', position: 3, name: job.title, item: jobUrl },
        ],
      });
    }

    return () => {
      document.querySelector('script[data-schema="job"]')?.remove();
      document.querySelector('script[data-schema="breadcrumb"]')?.remove();
    };
  }, [title, description, keywords, canonical, type, job]);
}

function parseIndianDate(dateStr: string): string | undefined {
  if (!dateStr) return undefined;
  // Handle "DD/MM/YYYY"
  const slashParts = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slashParts) return `${slashParts[3]}-${slashParts[2].padStart(2,'0')}-${slashParts[1].padStart(2,'0')}`;
  // Handle "DD Month YYYY"
  const months: Record<string, string> = {
    january:'01', february:'02', march:'03', april:'04', may:'05', june:'06',
    july:'07', august:'08', september:'09', october:'10', november:'11', december:'12'
  };
  const wordParts = dateStr.toLowerCase().match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
  if (wordParts && months[wordParts[2]]) {
    return `${wordParts[3]}-${months[wordParts[2]]}-${wordParts[1].padStart(2,'0')}`;
  }
  return undefined;
}

function getTypeLabel(type: string): string {
  switch (type) {
    case 'job':        return 'Government Jobs';
    case 'admit-card': return 'Admit Card';
    case 'result':     return 'Result';
    case 'answer-key': return 'Answer Key';
    case 'admission':  return 'Admission';
    default:           return 'Notification';
  }
}

function getTypeHref(type: string): string {
  switch (type) {
    case 'job':        return '/latest-jobs';
    case 'admit-card': return '/admit-card';
    case 'result':     return '/results';
    case 'answer-key': return '/answer-key';
    case 'admission':  return '/admission';
    default:           return '/';
  }
}

export function generateJobMeta(job: Job): SEOProps {
  const year = new Date().getFullYear();
  const titleYear = job.title.match(/20\d{2}/)?.[0] || year;
  const yearSuffix = /20\d{2}/.test(job.title) ? '' : ` ${year}`;
  const typeLabel = getTypeLabel(job.type);

  // Power title — keyword rich
  let title = job.title;
  if (job.type === 'job')        title = `${job.title}${yearSuffix} – Apply Online, Eligibility, Last Date`;
  else if (job.type === 'admit-card') title = `${job.title}${yearSuffix} – Download Admit Card, Exam Date, Hall Ticket`;
  else if (job.type === 'result')     title = `${job.title}${yearSuffix} – Check Result, Merit List, Cut Off Marks`;
  else if (job.type === 'answer-key') title = `${job.title}${yearSuffix} – Download Answer Key, Question Paper`;
  else if (job.type === 'admission')  title = `${job.title}${yearSuffix} – Apply Online, Eligibility, Important Dates`;

  // Power description — 155 chars max
  let desc = '';
  if (job.type === 'job') {
    desc = `${job.title} — Apply online for ${job.department} recruitment ${titleYear}. `;
    if (job.qualification) desc += `Eligibility: ${job.qualification}. `;
    if (job.lastDate) desc += `Last Date: ${job.lastDate}. `;
    desc += `Check vacancy, age limit, fee, syllabus at SarkariJobSeva.`;
  } else if (job.type === 'admit-card') {
    desc = `Download ${job.title} admit card ${titleYear} from ${job.department}. `;
    if (job.lastDate) desc += `Exam Date: ${job.lastDate}. `;
    desc += `Hall ticket download link, exam schedule at SarkariJobSeva.`;
  } else if (job.type === 'result') {
    desc = `Check ${job.title} result ${titleYear} — ${job.department}. `;
    desc += `Merit list, cut off marks, scorecard download at SarkariJobSeva.`;
  } else if (job.type === 'answer-key') {
    desc = `Download ${job.title} answer key ${titleYear} — ${job.department}. `;
    desc += `Official answer key, question paper, objection link at SarkariJobSeva.`;
  } else {
    desc = `${job.title} — ${job.department} ${titleYear}. `;
    if (job.lastDate) desc += `Last Date: ${job.lastDate}. `;
    desc += `Apply online, eligibility, important dates at SarkariJobSeva.`;
  }
  const description = desc.slice(0, 155);

  // Power keywords
  const deptWords = job.department?.split(' ') || [];
  const keywords = [
    job.title,
    `${job.title} ${titleYear}`,
    job.department,
    ...deptWords,
    typeLabel,
    `${typeLabel} ${titleYear}`,
    job.qualification,
    job.state,
    'sarkari result',
    'sarkarijobseva',
    'sarkari naukri',
    'government job',
    `online form ${titleYear}`,
    'apply online',
    'eligibility',
    'last date',
    'age limit',
  ].filter(Boolean).join(', ');

  const slug = (job as any).slug || job.id;
  const canonical = `${BASE_URL}/job/${slug}`;

  return { title, description, keywords, canonical, type: 'article', job };
}

export function generateListMeta(type: string, searchQuery?: string): SEOProps {
  const year = new Date().getFullYear();

  if (searchQuery) {
    return {
      title: `"${searchQuery}" – Sarkari Job Search Results ${year}`,
      description: `Search results for "${searchQuery}" — latest government jobs, admit cards, results ${year}. Find sarkari naukri on SarkariJobSeva.`,
      keywords: `${searchQuery}, sarkari result, sarkari naukri, government jobs ${year}, sarkarijobseva`,
    };
  }

  switch (type) {
    case 'job':
      return {
        title: `Latest Government Jobs ${year} – Sarkari Naukri Online Form`,
        description: `Latest sarkari naukri ${year} — 10वीं 12वीं पास सरकारी नौकरी। SSC, Railway, Army, Police, Anganwadi, Teacher Bharti। UP, Bihar, Rajasthan, MP सरकारी नौकरी। Free Job Alert।`,
        keywords: `sarkari naukri ${year}, government jobs ${year}, 10th pass sarkari job, 12th pass sarkari job, railway job ${year}, army bharti ${year}, police bharti ${year}, anganwadi bharti, teacher bharti, bank job, SSC GD, group d, group c, constable bharti, patwari, lekhpal, gram sevak, gramin naukri, up naukri, bihar naukri, rajasthan naukri, free job alert`,
      };
    case 'admit-card':
      return {
        title: `Admit Card Download ${year} – Hall Ticket Sarkari Exam`,
        description: `Download admit card ${year} for all government exams. SSC, Railway, UPSC, State PSC hall tickets. Exam date, center details at SarkariJobSeva.`,
        keywords: `admit card ${year}, hall ticket download, sarkari exam admit card, SSC admit card, Railway admit card, UPSC admit card`,
      };
    case 'result':
      return {
        title: `Sarkari Result ${year} – Government Exam Results, Merit List`,
        description: `Sarkari result ${year} — check government exam results, merit list, cut off marks. SSC, Railway, UPSC, Bank, State PSC results at SarkariJobSeva.`,
        keywords: `sarkari result ${year}, government exam result, merit list, cut off marks, SSC result, Railway result, UPSC result`,
      };
    case 'answer-key':
      return {
        title: `Answer Key ${year} – Government Exam Official Answer Keys`,
        description: `Download official answer keys ${year} for government exams. SSC, Railway, UPSC answer key with question papers and solutions at SarkariJobSeva.`,
        keywords: `answer key ${year}, sarkari exam answer key, SSC answer key, Railway answer key, UPSC answer key, official answer key`,
      };
    case 'admission':
      return {
        title: `Admission ${year} – Government College University Admission Form`,
        description: `Latest admission notifications ${year} for government colleges and universities. Apply online, eligibility, important dates at SarkariJobSeva.`,
        keywords: `admission ${year}, government college admission, university admission, sarkari admission, B.Ed admission, engineering admission`,
      };
    default:
      return {
        title: `SarkariJobSeva – Sarkari Result, Naukri, Admit Card ${year}`,
        description: `SarkariJobSeva — India's trusted govt job portal. Latest sarkari result, naukri, admit card, answer key ${year}. 100% free daily updates.`,
        keywords: `sarkarijobseva, sarkari result ${year}, sarkari naukri, government jobs, admit card, result`,
      };
  }
}

export function generateHomeMeta(): SEOProps {
  const year = new Date().getFullYear();
  return {
    title: `SarkariJobSeva – सरकारी नौकरी, सरकारी रिजल्ट, Admit Card ${year}`,
    description: `SarkariJobSeva.com — भारत का नंबर 1 सरकारी नौकरी पोर्टल। 10वीं 12वीं पास सरकारी नौकरी ${year}। Railway, Army, Police, Anganwadi, Teacher Bharti। Admit Card, Result। Free Job Alert।`,
    keywords: `sarkari naukri, sarkari job, government job, sarkari result, free job alert, rojgar samachar, 10th pass sarkari job, 12th pass sarkari job, railway job, army bharti, police bharti, anganwadi bharti, gram sevak bharti, lekhpal bharti, patwari bharti, teacher bharti, shikshak bharti, bank job, post office job, SSC, SSC GD, SSC CHSL, UPSC, NDA, up sarkari job, bihar sarkari job, rajasthan sarkari job, mp sarkari job, new vacancy ${year}, online form ${year}, admit card download, sarkari exam, sarkarijobseva, naukri, rozgar, gramin naukri, panchayat job, iti job, group d, group c, constable bharti, forest guard, home guard, clerk job, data entry job government, computer operator job, anm gnm nursing job, driver job government, village job india`,
    canonical: BASE_URL,
  };
}
