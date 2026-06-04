import express, { type Express, type Request, type Response } from "express";
import fs from "fs";
import path from "path";
import { storage } from "./storage";

// ─── Bot Detection ────────────────────────────────────────────────────────────
const GOOD_BOTS = [
  'googlebot', 'google-inspection-tool', 'apis-google',
  'mediapartners-google', 'adsbot-google', 'bingbot',
  'facebookexternalhit', 'twitterbot', 'linkedinbot',
  'whatsapp', 'telegrambot', 'applebot', 'discordbot',
  'slackbot', 'chrome-lighthouse', 'developers.google.com',
  'w3c_validator',
];

function isGoodBot(ua: string): boolean {
  const u = ua.toLowerCase();
  // Google Search Console "Inspect URL" uses desktop Chrome UA
  if (u.includes('chrome') && u.includes('compatible') && u.includes('google')) return true;
  return GOOD_BOTS.some(b => u.includes(b));
}

// ─── HTML Escape ──────────────────────────────────────────────────────────────
function esc(val: unknown): string {
  return String(val ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function safe(val: unknown): string {
  return String(val ?? '').trim();
}

// ─── Rich Job Page HTML ───────────────────────────────────────────────────────
function buildJobHTML(job: any, canonical: string): string {
  const title = `${safe(job.title)} – Notification, Apply Online, Eligibility | SarkariJobSeva`;
  const rawDesc = safe(job.shortInfo || `${job.title} government job notification. Department: ${job.department}. Apply online at SarkariJobSeva.`);
  const metaDesc = esc(rawDesc.slice(0, 155));

  const vacancyDetails: any[] = Array.isArray(job.vacancyDetails) ? job.vacancyDetails : [];
  const importantDates: any[] = Array.isArray(job.importantDates) ? job.importantDates : [];
  const selectionProcess: string[] = Array.isArray(job.selectionProcess) ? job.selectionProcess : [];
  const applicationFee: any[] = Array.isArray(job.applicationFee) ? job.applicationFee : [];
  const ageLimit: any[] = Array.isArray(job.ageLimit) ? job.ageLimit : [];
  const links: any[] = Array.isArray(job.links) ? job.links : [];

  const schema: any = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": safe(job.title),
    "description": rawDesc,
    "datePosted": safe(job.postDate || job.createdAt),
    "employmentType": "FULL_TIME",
    "jobLocationType": "TELECOMMUTE",
    "hiringOrganization": {
      "@type": "Organization",
      "name": safe(job.department),
      "sameAs": "https://sarkarijobseva.com"
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "IN",
        "addressRegion": safe(job.state || "India")
      }
    },
    "applicantLocationRequirements": { "@type": "Country", "name": "India" },
    "directApply": true,
  };
  if (job.lastDate) schema.validThrough = safe(job.lastDate);
  if (vacancyDetails.length > 0) {
    const total = vacancyDetails.reduce((s: number, v: any) => {
      const n = parseInt(v.totalPost || '0', 10);
      return s + (isNaN(n) ? 0 : n);
    }, 0);
    if (total > 0) schema.totalJobOpenings = total;
  }

  // ── Body sections ──
  let body = `
    <h1>${esc(job.title)}</h1>
    <p class="dept-tag"><strong>${esc(job.department)}</strong>${job.lastDate ? ` — Last Date: <strong>${esc(job.lastDate)}</strong>` : ''}</p>

    <section class="info-box">
      <table>
        <tr><th>Department / Organization</th><td>${esc(job.department)}</td></tr>
        <tr><th>Post Date</th><td>${esc(job.postDate || '')}</td></tr>
        ${job.lastDate ? `<tr><th>Last Date to Apply</th><td><strong>${esc(job.lastDate)}</strong></td></tr>` : ''}
        ${job.qualification ? `<tr><th>Qualification Required</th><td>${esc(job.qualification)}</td></tr>` : ''}
        ${job.state ? `<tr><th>State / Location</th><td>${esc(job.state)}</td></tr>` : ''}
        ${job.category ? `<tr><th>Category</th><td>${esc(job.category)}</td></tr>` : ''}
      </table>
    </section>

    <section class="short-info">
      <h2>${
        job.type === 'admit-card' ? 'Admit Card Overview – ' + safe(job.title) :
        job.type === 'result' ? 'Result Overview – ' + safe(job.title) :
        job.type === 'answer-key' ? 'Answer Key Overview – ' + safe(job.title) :
        job.type === 'admission' ? 'Admission Overview – ' + safe(job.title) :
        'Job Overview – ' + safe(job.title)
      }</h2>
      <p>${esc(rawDesc)}</p>
    </section>`;

  if (job.eligibilityDetails) {
    body += `<section><h2>Eligibility / Qualification Details</h2><p>${esc(job.eligibilityDetails)}</p></section>`;
  }

  if (vacancyDetails.length > 0) {
    body += `<section><h2>Vacancy Details – Post-wise</h2><table><thead><tr><th>Post Name</th><th>Total Posts</th><th>Eligibility</th></tr></thead><tbody>`;
    vacancyDetails.forEach((v: any) => {
      if (v.postName) body += `<tr><td>${esc(v.postName)}</td><td>${esc(v.totalPost || 'N/A')}</td><td>${esc(v.eligibility || '')}</td></tr>`;
    });
    body += `</tbody></table></section>`;
  }

  if (importantDates.length > 0) {
    body += `<section><h2>Important Dates</h2><table><thead><tr><th>Event</th><th>Date</th></tr></thead><tbody>`;
    importantDates.forEach((d: any) => {
      if (d.label) body += `<tr><td>${esc(d.label)}</td><td>${esc(d.date || '')}</td></tr>`;
    });
    body += `</tbody></table></section>`;
  }

  if (applicationFee.length > 0) {
    body += `<section><h2>Application Fee</h2><table><thead><tr><th>Category</th><th>Fee</th></tr></thead><tbody>`;
    applicationFee.forEach((f: any) => {
      if (f.category) body += `<tr><td>${esc(f.category)}</td><td>${esc(f.fee || '')}</td></tr>`;
    });
    body += `</tbody></table></section>`;
  }

  if (ageLimit.length > 0) {
    body += `<section><h2>Age Limit</h2><table><thead><tr><th>Category</th><th>Min Age</th><th>Max Age</th></tr></thead><tbody>`;
    ageLimit.forEach((a: any) => {
      if (a.category) body += `<tr><td>${esc(a.category)}</td><td>${esc(a.minAge || '')}</td><td>${esc(a.maxAge || '')}</td></tr>`;
    });
    body += `</tbody></table></section>`;
  }

  if (selectionProcess.length > 0) {
    body += `<section><h2>Selection Process</h2><ol>`;
    selectionProcess.forEach((s: string) => { if (s) body += `<li>${esc(s)}</li>`; });
    body += `</ol></section>`;
  }

  // HTML sections from DB (already formatted)
  if (job.vacancyDetailsHtml) body += `<section><h2>Vacancy Details</h2>${job.vacancyDetailsHtml}</section>`;
  if (job.importantDatesHtml) body += `<section><h2>Important Dates</h2>${job.importantDatesHtml}</section>`;
  if (job.applicationFeeHtml) body += `<section><h2>Application Fee</h2>${job.applicationFeeHtml}</section>`;
  if (job.ageLimitHtml) body += `<section><h2>Age Limit</h2>${job.ageLimitHtml}</section>`;
  if (job.selectionProcessHtml) body += `<section><h2>Selection Process</h2>${job.selectionProcessHtml}</section>`;
  if (job.physicalStandardHtml) body += `<section><h2>Physical Standard</h2>${job.physicalStandardHtml}</section>`;
  if (job.importantLinksHtml) body += `<section><h2>Important Links</h2>${job.importantLinksHtml}</section>`;

  if (links.length > 0) {
    body += `<section><h2>Apply / Download Links</h2><ul>`;
    links.forEach((l: any) => {
      if (l.label && l.url) body += `<li><a href="${esc(l.url)}" rel="nofollow">${esc(l.label)}</a></li>`;
    });
    body += `</ul></section>`;
  }

  if (job.applyOnlineUrl) body += `<p><strong>Apply Online:</strong> <a href="${esc(job.applyOnlineUrl)}" rel="nofollow">${esc(job.applyOnlineUrl)}</a></p>`;

  return `<!DOCTYPE html>
<html lang="hi-IN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${metaDesc}">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
  <link rel="canonical" href="${esc(canonical)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${metaDesc}">
  <meta property="og:url" content="${esc(canonical)}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="SarkariJobSeva">
  <meta property="og:image" content="https://sarkarijobseva.com/opengraph.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
  <style>
    body{font-family:Arial,sans-serif;max-width:900px;margin:0 auto;padding:16px;color:#222;line-height:1.6}
    h1{color:#1d4ed8;font-size:1.5em;margin-bottom:8px}
    h2{color:#1e40af;font-size:1.1em;border-bottom:2px solid #dbeafe;padding-bottom:4px;margin-top:24px}
    table{width:100%;border-collapse:collapse;margin:8px 0}
    th,td{padding:8px 12px;border:1px solid #e2e8f0;text-align:left;font-size:.9em}
    th{background:#eff6ff;font-weight:600;width:40%}
    section{margin-bottom:20px}
    header a{color:#1d4ed8;font-weight:700;font-size:1.1em;text-decoration:none}
    footer{margin-top:32px;padding-top:12px;border-top:1px solid #e2e8f0;font-size:.85em;color:#64748b}
    .info-box{background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:12px;margin:16px 0}
  </style>
</head>
<body>
  <header>
    <a href="https://sarkarijobseva.com">🏛️ SarkariJobSeva – सरकारी नौकरी पोर्टल</a>
    <nav style="margin-top:8px;font-size:.85em">
      <a href="https://sarkarijobseva.com/latest-jobs">Latest Jobs</a> |
      <a href="https://sarkarijobseva.com/admit-card">Admit Card</a> |
      <a href="https://sarkarijobseva.com/results">Results</a> |
      <a href="https://sarkarijobseva.com/answer-key">Answer Key</a>
    </nav>
  </header>
  <main>${body}</main>
  <footer>
    <p>© 2026 <a href="https://sarkarijobseva.com">SarkariJobSeva.com</a> – India's trusted government job portal. Latest sarkari naukri, admit card, result updates daily.</p>
    <p><a href="https://sarkarijobseva.com/latest-jobs">Latest Jobs</a> | <a href="https://sarkarijobseva.com/about">About Us</a> | <a href="https://sarkarijobseva.com/contact">Contact</a> | <a href="https://sarkarijobseva.com/privacy-policy">Privacy Policy</a></p>
  </footer>
</body>
</html>`;
}

// ─── Category Page HTML ───────────────────────────────────────────────────────
function buildCategoryHTML(config: { title: string; desc: string; posts?: any[] }, canonical: string): string {
  const { title, desc, posts = [] } = config;

  let postsHtml = '';
  if (posts.length > 0) {
    postsHtml = `<section><h2>Latest Updates</h2>
    <table>
      <thead><tr><th>Job Title</th><th>Department</th><th>Last Date</th></tr></thead>
      <tbody>`;
    posts.forEach((p: any) => {
      const href = `https://sarkarijobseva.com/job/${p.slug || p.id}`;
      postsHtml += `<tr>
        <td><a href="${href}">${esc(p.title)}</a></td>
        <td>${esc(p.department || '')}</td>
        <td>${esc(p.lastDate || p.last_date || 'N/A')}</td>
      </tr>`;
    });
    postsHtml += `</tbody></table></section>`;
  }

  return `<!DOCTYPE html>
<html lang="hi-IN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)} | SarkariJobSeva</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="robots" content="index, follow, max-snippet:-1">
  <link rel="canonical" href="${esc(canonical)}">
  <meta property="og:title" content="${esc(title)} | SarkariJobSeva">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${esc(canonical)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="SarkariJobSeva">
  <meta property="og:image" content="https://sarkarijobseva.com/opengraph.jpg">
  <script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": title,
    "description": desc,
    "url": canonical,
    "publisher": { "@type": "Organization", "name": "SarkariJobSeva", "url": "https://sarkarijobseva.com" }
  })}</script>
  <style>
    body{font-family:Arial,sans-serif;max-width:900px;margin:0 auto;padding:16px;color:#222;line-height:1.6}
    h1{color:#1d4ed8;font-size:1.5em}
    h2{color:#1e40af;font-size:1.1em;border-bottom:2px solid #dbeafe;padding-bottom:4px;margin-top:24px}
    table{width:100%;border-collapse:collapse;margin:8px 0}
    th,td{padding:8px 12px;border:1px solid #e2e8f0;text-align:left;font-size:.9em}
    th{background:#eff6ff;font-weight:600}
    a{color:#1d4ed8}
    header a{font-weight:700;font-size:1.1em;text-decoration:none}
    footer{margin-top:32px;padding-top:12px;border-top:1px solid #e2e8f0;font-size:.85em;color:#64748b}
  </style>
</head>
<body>
  <header>
    <a href="https://sarkarijobseva.com">🏛️ SarkariJobSeva – सरकारी नौकरी पोर्टल</a>
    <nav style="margin-top:8px;font-size:.85em">
      <a href="https://sarkarijobseva.com/latest-jobs">Latest Jobs</a> |
      <a href="https://sarkarijobseva.com/admit-card">Admit Card</a> |
      <a href="https://sarkarijobseva.com/results">Results</a> |
      <a href="https://sarkarijobseva.com/answer-key">Answer Key</a>
    </nav>
  </header>
  <main>
    <h1>${esc(title)}</h1>
    <p>${esc(desc)}</p>
    ${postsHtml}
    ${posts.length === 0 ? '<p>Abhi koi updates nahi hain. Jaldi aayenge – bookmark karein SarkariJobSeva.com</p>' : ''}
  </main>
  <footer>
    <p>© 2026 <a href="https://sarkarijobseva.com">SarkariJobSeva.com</a> – India's trusted government job portal.</p>
    <p><a href="https://sarkarijobseva.com/latest-jobs">Latest Jobs</a> | <a href="https://sarkarijobseva.com/about">About Us</a> | <a href="https://sarkarijobseva.com/contact">Contact</a> | <a href="https://sarkarijobseva.com/privacy-policy">Privacy Policy</a></p>
  </footer>
</body>
</html>`;
}

// ─── Category Map ─────────────────────────────────────────────────────────────
const CATEGORY_MAP: Record<string, { title: string; desc: string; type?: string }> = {
  '/': {
    title: 'SarkariJobSeva – Latest Sarkari Naukri, Admit Card, Result 2026',
    desc: 'India ka #1 sarkari naukri portal. Latest government jobs, admit card, result, answer key 2026. SSC, Railway, UPSC, Bank, State Govt jobs daily updates.',
  },
  '/latest-jobs': {
    title: 'Latest Government Jobs 2026 – Sarkari Naukri',
    desc: 'Latest sarkari naukri 2026 – SSC CGL, Railway RRB, UPSC, Bank, State Govt jobs. Daily new vacancy updates. Apply online at SarkariJobSeva.',
    type: 'job',
  },
  '/admit-card': {
    title: 'Admit Card Download 2026 – Hall Ticket Sarkari Exam',
    desc: 'Download admit card 2026 for SSC, Railway, UPSC, Bank exams. Sarkari exam hall ticket download at SarkariJobSeva.',
    type: 'admit-card',
  },
  '/results': {
    title: 'Sarkari Result 2026 – Government Exam Results, Merit List',
    desc: 'Check sarkari result 2026. Government exam results, merit list, cut off marks for SSC, Railway, UPSC, Bank at SarkariJobSeva.',
    type: 'result',
  },
  '/answer-key': {
    title: 'Answer Key 2026 – Government Exam Official Answer Keys',
    desc: 'Download answer key 2026 for SSC, Railway, UPSC, Bank government exams. Raise objections online.',
    type: 'answer-key',
  },
  '/admission': {
    title: 'Admission Form 2026 – Government College Admission',
    desc: 'Government college admission 2026. B.Ed, University, polytechnic admission forms and important dates.',
    type: 'admission',
  },
  '/search': {
    title: 'Search Sarkari Jobs 2026 – Find Government Jobs',
    desc: 'Search latest sarkari jobs, admit cards, results 2026 at SarkariJobSeva.',
  },
  '/blog': {
    title: 'Sarkari Job Blog – Government Job Tips, Exam Syllabus & News',
    desc: 'Latest sarkari job news, exam tips, syllabus, preparation strategy for SSC, Railway, UPSC, Bank exams.',
  },
  '/jobs/10th-pass': {
    title: '10th Pass Government Jobs 2026 – Matric Sarkari Naukri',
    desc: 'Latest 10th pass sarkari naukri 2026. Government jobs for 10th pass / matriculation candidates in Railway, Police, Army.',
    type: 'job',
  },
  '/jobs/12th-pass': {
    title: '12th Pass Government Jobs 2026 – Inter Sarkari Naukri',
    desc: 'Latest 12th pass sarkari naukri 2026. Government jobs for 12th / intermediate pass candidates.',
    type: 'job',
  },
  '/jobs/graduation': {
    title: 'Graduation Level Government Jobs 2026 – Sarkari Naukri',
    desc: 'Latest graduation level sarkari naukri 2026. Government jobs for graduate candidates – SSC CGL, Bank, Railway.',
    type: 'job',
  },
  '/jobs/post-graduate': {
    title: 'Post Graduate Government Jobs 2026 – PG Sarkari Naukri',
    desc: 'Latest post graduate sarkari naukri 2026. Government jobs for PG / Masters degree holders.',
    type: 'job',
  },
  '/disclaimer': { title: 'Disclaimer – SarkariJobSeva', desc: 'Disclaimer for SarkariJobSeva.com. Read before using this government job portal.' },
  '/privacy-policy': { title: 'Privacy Policy – SarkariJobSeva', desc: 'Privacy policy of SarkariJobSeva.com. How we collect, use and protect your data.' },
  '/terms-of-service': { title: 'Terms of Service – SarkariJobSeva', desc: 'Terms of service for using SarkariJobSeva.com government job portal.' },
  '/about': { title: 'About Us – SarkariJobSeva', desc: "About SarkariJobSeva – India's trusted government job portal. Our mission and team." },
  '/about-us': { title: 'About Us – SarkariJobSeva', desc: "About SarkariJobSeva – India's trusted government job portal." },
  '/contact': { title: 'Contact Us – SarkariJobSeva', desc: 'Contact SarkariJobSeva for queries about government jobs, admit cards, and results.' },
  '/salary-calculator': { title: '7th Pay Commission Salary Calculator 2026 – SarkariJobSeva', desc: 'Calculate government job salary with 7th Pay Commission calculator. Basic pay, HRA, DA, TA.' },
};

// ─── Main Export ──────────────────────────────────────────────────────────────
export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(`Build directory not found: ${distPath}. Run npm run build first.`);
  }

  // ── Bot Pre-render Middleware ──────────────────────────────────────────────
  app.use(async (req: Request, res: Response, next: Function) => {
    const ua = req.headers['user-agent'] || '';
    if (!isGoodBot(ua)) return next();

    const urlPath = req.path;
    const canonical = `https://sarkarijobseva.com${urlPath}`;
    console.log(`[Prerender] ${ua.slice(0, 50)} → ${urlPath}`);

    try {
      // 1. /job/:slug  – individual job detail page
      const jobMatch = urlPath.match(/^\/job\/([^/?#]+)/);
      if (jobMatch) {
        const slug = decodeURIComponent(jobMatch[1]);
        let post: any = await storage.getPostBySlug(slug);

        // fallback: maybe it's a numeric id
        if (!post) {
          const numId = parseInt(slug, 10);
          if (!isNaN(numId)) post = await storage.getPost(numId);
        }

        if (post?.title) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.setHeader('X-Prerendered', '1');
          return res.send(buildJobHTML(post, canonical));
        }

        // post truly not found – send 404 so Google doesn't soft-404
        res.status(404).setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(`<!DOCTYPE html><html><head><title>404 Not Found</title>
          <meta name="robots" content="noindex"></head>
          <body><h1>Page Not Found</h1><p><a href="https://sarkarijobseva.com">Go to Home</a></p></body></html>`);
      }

      // 2. /blog/:slug
      const blogMatch = urlPath.match(/^\/blog\/([^/?#]+)/);
      if (blogMatch) {
        // Use direct storage if blog table is in same DB, else skip
        try {
          const { db } = await import('./db');
          const result = await (db as any).execute(
            `SELECT * FROM blogs WHERE slug = $1 LIMIT 1`,
            [decodeURIComponent(blogMatch[1])]
          );
          const blog = result?.rows?.[0];
          if (blog?.title) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.setHeader('X-Prerendered', '1');
            return res.send(buildCategoryHTML({
              title: blog.title,
              desc: (blog.excerpt || blog.title).slice(0, 155),
            }, canonical));
          }
        } catch (e) {
          console.error('[Prerender] blog fetch error:', e);
        }
        return next();
      }

      // 3. /jobs/state/:state
      const stateMatch = urlPath.match(/^\/jobs\/state\/([^/?#]+)/);
      if (stateMatch) {
        const stateName = decodeURIComponent(stateMatch[1]).replace(/-/g, ' ');
        const posts = await storage.getPostsByState(stateName);
        const label = stateName.charAt(0).toUpperCase() + stateName.slice(1);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('X-Prerendered', '1');
        return res.send(buildCategoryHTML({
          title: `${label} Government Jobs 2026 – Sarkari Naukri`,
          desc: `Latest ${label} sarkari naukri 2026. State government and central government jobs for ${label} candidates.`,
          posts,
        }, canonical));
      }

      // 4. Qualification pages + known static categories
      const catConfig = CATEGORY_MAP[urlPath];
      if (catConfig) {
        let posts: any[] = [];
        if (catConfig.type) {
          posts = await storage.getPostsByType(catConfig.type);
        } else if (urlPath === '/') {
          posts = await storage.getAllPosts(1, 30);
        }
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('X-Prerendered', '1');
        return res.send(buildCategoryHTML({ ...catConfig, posts }, canonical));
      }

    } catch (err) {
      console.error('[Prerender Error]', err);
    }

    next();
  });
  // ── End Pre-render ─────────────────────────────────────────────────────────

  // Static assets (JS, CSS, images etc.)
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

  // SPA fallback for all other routes
  app.use("*", (_req: Request, res: Response) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
