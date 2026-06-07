import express, { type Express, type Request, type Response } from "express";
import fs from "fs";
import path from "path";

// ALL bots + Google Inspection Tool
const BOT_AGENTS = [
  'googlebot', 'google-inspection-tool', 'google-site-verification',
  'apis-google', 'mediapartners-google', 'adsbot-google',
  'bingbot', 'yandex', 'baiduspider', 'facebookexternalhit',
  'twitterbot', 'linkedinbot', 'whatsapp', 'telegrambot',
  'applebot', 'discordbot', 'slackbot', 'chrome-lighthouse',
  'developers.google.com', 'w3c_validator', 'ahrefsbot', 'semrushbot'
];

function isBot(userAgent: string): boolean {
  const ua = (userAgent || '').toLowerCase();
  // Also catch Google Inspection Tool which uses smartphone UA
  if (ua.includes('mobile') && ua.includes('chrome') && !ua.includes('android')) return true;
  return BOT_AGENTS.some(bot => ua.includes(bot));
}

function esc(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generateJobHTML(job: any, canonical: string): string {
  const title = `${job.title} – Apply Online, Eligibility, Last Date | SarkariJobSeva`;
  const desc = esc((job.shortInfo || `${job.title} – ${job.department}. Apply online for government job at SarkariJobSeva.com`).slice(0, 155));
  const isJobPosting = job.type === 'job';
  const schemaObj: any = isJobPosting ? {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": job.title,
    "description": (job.shortInfo || job.title || '').slice(0, 500),
    "datePosted": job.postDate || new Date().toISOString().split('T')[0],
    "validThrough": (job.lastDate && job.lastDate !== 'N/A') ? job.lastDate : "2027-12-31",
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.department || "Government of India",
      "sameAs": job.officialWebsiteUrl || "https://www.india.gov.in"
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Government Office",
        "addressLocality": job.state || "New Delhi",
        "addressRegion": job.state || "Delhi",
        "postalCode": "110001",
        "addressCountry": "IN"
      }
    },
    "applicantLocationRequirements": {
      "@type": "Country",
      "name": "India"
    },
    "employmentType": "FULL_TIME",
    "baseSalary": {
      "@type": "MonetaryAmount",
      "currency": "INR",
      "value": {
        "@type": "QuantitativeValue",
        "minValue": 18000,
        "maxValue": 200000,
        "unitText": "MONTH"
      }
    },
    "educationRequirements": {
      "@type": "EducationalOccupationalCredential",
      "credentialCategory": job.qualification || "bachelor degree"
    }
  } : {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": job.title,
    "description": (job.shortInfo || job.title || '').slice(0, 500),
    "author": {"@type": "Organization", "name": "SarkariJobSeva"},
    "publisher": {"@type": "Organization", "name": "SarkariJobSeva", "url": "https://sarkarijobseva.com"},
    "datePublished": job.postDate || new Date().toISOString().split('T')[0],
    "url": "https://sarkarijobseva.com/job/" + (job.slug || job.id)
  };
  const schema = JSON.stringify(schemaObj);

  // Full content for Google to read
  let bodyContent = `
    <h1>${esc(job.title)}</h1>
    <p><strong>Department:</strong> ${esc(job.department)}</p>
    <p>${esc(job.shortInfo || '')}</p>
    ${job.lastDate ? `<p><strong>Last Date to Apply:</strong> ${esc(job.lastDate)}</p>` : ''}
    ${job.qualification ? `<p><strong>Eligibility:</strong> ${esc(job.qualification)}</p>` : ''}
    ${job.eligibilityDetails ? `<p><strong>Eligibility Details:</strong> ${esc(job.eligibilityDetails)}</p>` : ''}
    ${job.postDate ? `<p><strong>Post Date:</strong> ${esc(job.postDate)}</p>` : ''}
  `;

  // Add vacancy details
  if (job.vacancyDetails && Array.isArray(job.vacancyDetails) && job.vacancyDetails.length > 0) {
    bodyContent += `<h2>Vacancy Details</h2><ul>`;
    job.vacancyDetails.forEach((v: any) => {
      if (v.postName) bodyContent += `<li>${esc(v.postName)} – ${esc(v.totalPost || 'NA')} Posts – ${esc(v.eligibility || '')}</li>`;
    });
    bodyContent += `</ul>`;
  }

  // Add important dates
  if (job.importantDates && Array.isArray(job.importantDates) && job.importantDates.length > 0) {
    bodyContent += `<h2>Important Dates</h2><ul>`;
    job.importantDates.forEach((d: any) => {
      if (d.label) bodyContent += `<li>${esc(d.label)}: ${esc(d.date || '')}</li>`;
    });
    bodyContent += `</ul>`;
  }

  // Add selection process
  if (job.selectionProcess && Array.isArray(job.selectionProcess) && job.selectionProcess.length > 0) {
    bodyContent += `<h2>Selection Process</h2><ol>`;
    job.selectionProcess.forEach((s: string) => {
      if (s) bodyContent += `<li>${esc(s)}</li>`;
    });
    bodyContent += `</ol>`;
  }

  return `<!DOCTYPE html>
<html lang="hi-IN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${desc}">
  <meta name="robots" content="index, follow, max-snippet:-1">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${desc}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="SarkariJobSeva">
  <meta property="og:image" content="https://sarkarijobseva.com/og-image.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${desc}">
  <script type="application/ld+json">${schema}</script>
</head>
<body>
  <header><a href="https://sarkarijobseva.com">SarkariJobSeva</a></header>
  <main>${bodyContent}</main>
  <footer><p>Visit <a href="https://sarkarijobseva.com">SarkariJobSeva.com</a> for latest government jobs.</p></footer>
</body>
</html>`;
}

function generateCategoryHTML(config: {title: string; desc: string; posts?: any[]}, canonical: string): string {
  let postsHtml = '';
  if (config.posts && config.posts.length > 0) {
    postsHtml = `<h2>Latest Updates</h2><ul>`;
    config.posts.forEach((p: any) => {
      postsHtml += `<li><a href="https://sarkarijobseva.com/job/${p.slug || p.id}">${esc(p.title)}</a>`;
      if (p.lastDate) postsHtml += ` – Last Date: ${esc(p.lastDate)}`;
      if (p.department) postsHtml += ` | ${esc(p.department)}`;
      postsHtml += `</li>`;
    });
    postsHtml += `</ul>`;
  }

  return `<!DOCTYPE html>
<html lang="hi-IN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(config.title)} | SarkariJobSeva</title>
  <meta name="description" content="${esc(config.desc)}">
  <meta name="robots" content="index, follow, max-snippet:-1">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${esc(config.title)} | SarkariJobSeva">
  <meta property="og:description" content="${esc(config.desc)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="SarkariJobSeva">
</head>
<body>
  <header><a href="https://sarkarijobseva.com">SarkariJobSeva</a></header>
  <main>
    <h1>${esc(config.title)}</h1>
    <p>${esc(config.desc)}</p>
    ${postsHtml}
    <p>Visit <a href="https://sarkarijobseva.com">SarkariJobSeva.com</a> for more updates.</p>
  </main>
</body>
</html>`;
}

const CATEGORY_MAP: Record<string, {title: string; desc: string; type?: string}> = {
  '/': { title: 'SarkariJobSeva – Latest Sarkari Naukri, Admit Card, Result 2026', desc: 'India ka #1 sarkari naukri portal. Latest government jobs, admit card, result, answer key 2026. SSC, Railway, UPSC, Bank, State Govt jobs daily updates.' },
  '/latest-jobs': { title: 'Latest Government Jobs 2026 – Sarkari Naukri', desc: 'Latest sarkari naukri 2026 – SSC CGL, Railway RRB ALP, UPSC, Bank, State Govt jobs. Apply online for latest government jobs at SarkariJobSeva.', type: 'job' },
  '/admit-card': { title: 'Admit Card Download 2026 – Hall Ticket', desc: 'Download admit card 2026 for all government exams – SSC, Railway, UPSC, Bank. Hall ticket download link at SarkariJobSeva.', type: 'admit-card' },
  '/results': { title: 'Sarkari Result 2026 – Government Exam Results', desc: 'Sarkari result 2026 – Check government exam results, merit list, cut off marks. SSC, Railway, UPSC, Bank exam results at SarkariJobSeva.', type: 'result' },
  '/answer-key': { title: 'Answer Key 2026 – Government Exam Answer Keys', desc: 'Download answer key 2026 for government exams – SSC, Railway, UPSC, Bank. Official answer keys at SarkariJobSeva.', type: 'answer-key' },
  '/admission': { title: 'Admission Form 2026 – Government College Admission', desc: 'Government college admission 2026 – Apply online, eligibility, important dates. B.Ed, University admission at SarkariJobSeva.', type: 'admission' },
  '/search': { title: 'Search Sarkari Jobs 2026 – Find Government Jobs', desc: 'Search latest sarkari jobs, admit cards, results 2026 at SarkariJobSeva. Find SSC, Railway, UPSC, Bank jobs.' },
  '/blog': { title: 'Sarkari Job Blog – Government Job Tips & Updates', desc: 'Latest sarkari job news, tips, syllabus and updates for government job aspirants at SarkariJobSeva.' },
};

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(`Could not find the build directory: ${distPath}, make sure to build the client first`);
  }

  // ===== UNIFIED BOT PRERENDER MIDDLEWARE =====
  app.use(async (req: Request, res: Response, next: Function) => {
    const ua = req.headers['user-agent'] || '';
    if (!isBot(ua)) return next();

    const urlPath = req.path;
    const baseUrl = process.env.SITE_URL || 'https://sarkarijobseva.com';
    const canonical = `${baseUrl}${urlPath}`;

    try {
      // 1. Job/Post pages
      const jobMatch = urlPath.match(/^\/job\/([^/?]+)/);
      if (jobMatch) {
        const slug = jobMatch[1];
        let job: any = null;
        
        // Try slug first, then ID
        try {
          const r1 = await fetch(`${baseUrl}/api/posts/slug/${slug}`);
          if (r1.ok) job = await r1.json();
        } catch {}
        
        if (!job) {
          try {
            const r2 = await fetch(`${baseUrl}/api/posts/${slug}`);
            if (r2.ok) job = await r2.json();
          } catch {}
        }

        if (job && job.title) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.setHeader('X-Prerendered', '1');
          return res.send(generateJobHTML(job, canonical));
        }
      }

      // 2. Blog pages
      const blogMatch = urlPath.match(/^\/blog\/([^/?]+)/);
      if (blogMatch) {
        const slug = blogMatch[1];
        try {
          const r = await fetch(`${baseUrl}/api/blogs/${slug}`);
          if (r.ok) {
            const blog = await r.json();
            if (blog && blog.title) {
              const blogContent = blog.content || '';
              const blogTitle = esc(`${blog.title} | SarkariJobSeva`);
              const blogDesc = esc((blog.excerpt || blog.title || '').slice(0, 155));
              const blogSchema = JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": blog.title,
                "description": blog.excerpt || blog.title,
                "author": {"@type": "Organization", "name": "SarkariJobSeva"},
                "publisher": {"@type": "Organization", "name": "SarkariJobSeva", "url": "https://sarkarijobseva.com"},
                "url": canonical
              });
              const blogHtml = `<!DOCTYPE html>
<html lang="hi-IN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${blogTitle}</title>
<meta name="description" content="${blogDesc}">
<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large">
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${blogTitle}">
<meta property="og:description" content="${blogDesc}">
<meta property="og:url" content="${canonical}">
<meta property="og:type" content="article">
<script type="application/ld+json">${blogSchema}</script>
<style>body{font-family:Arial,sans-serif;max-width:860px;margin:0 auto;padding:16px;color:#222}h1{font-size:1.6rem;color:#1a1a2e}h2{font-size:1.2rem;color:#16213e;margin-top:1.5rem}p{line-height:1.7}a{color:#0066cc}header{padding:10px 0;border-bottom:2px solid #e63946;margin-bottom:20px}footer{margin-top:30px;padding-top:10px;border-top:1px solid #ddd;font-size:.85rem;color:#666}</style>
</head>
<body>
<header><a href="https://sarkarijobseva.com"><strong>SarkariJobSeva</strong></a> – Sarkari Naukri, Admit Card, Result 2026</header>
<main><h1>${esc(blog.title)}</h1><div>${blogContent}</div></main>
<footer><p>Latest Sarkari Jobs ke liye visit karein <a href="https://sarkarijobseva.com">SarkariJobSeva.com</a> | <a href="https://sarkarijobseva.com/latest-jobs">Latest Jobs</a> | <a href="https://sarkarijobseva.com/admit-card">Admit Card</a> | <a href="https://sarkarijobseva.com/results">Results</a></p></footer>
</body></html>`;
              res.setHeader('Content-Type', 'text/html; charset=utf-8');
              res.setHeader('X-Prerendered', '1');
              return res.send(blogHtml);
            }
          }
        } catch {}
      }

      // 3. Category pages
      const catConfig = CATEGORY_MAP[urlPath];
      if (catConfig) {
        let posts: any[] = [];
        if (catConfig.type) {
          try {
            const r = await fetch(`${baseUrl}/api/posts?type=${catConfig.type}&page=1&limit=20`);
            if (r.ok) {
              const data = await r.json();
              posts = Array.isArray(data) ? data : (data.data || []);
            }
          } catch {}
        }
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('X-Prerendered', '1');
        return res.send(generateCategoryHTML({ ...catConfig, posts }, canonical));
      }

    } catch (e) {
      console.error('[Prerender Error]', e);
    }

    next();
  });
  // ===== END PRERENDER =====

  // Static files
  app.use(express.static(distPath, {
    maxAge: "1y",
    etag: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      } else if (filePath.match(/\.(js|css)$/)) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
    },
  }));

  // SPA fallback
  app.use("*", (_req: Request, res: Response) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
