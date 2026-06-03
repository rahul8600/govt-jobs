import express, { type Express, type Request, type Response } from "express";
import fs from "fs";
import path from "path";
import pkg from "pg";
const { Pool } = pkg;

// ─── Bot Detection ────────────────────────────────────────────────────────────
// NOTE: Keep this list in sync with the BAD-BOT blocklist in index.ts.
// Good crawlers we WANT to pre-render for:
const GOOD_BOTS = [
  'googlebot',
  'google-inspection-tool',
  'apis-google',
  'mediapartners-google',
  'adsbot-google',
  'bingbot',
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'whatsapp',
  'telegrambot',
  'applebot',
  'discordbot',
  'slackbot',
  'chrome-lighthouse',
  'developers.google.com',
  'w3c_validator',
];

function isGoodBot(userAgent: string): boolean {
  const ua = (userAgent || '').toLowerCase();
  // Google Search Console "Inspect URL" uses smartphone UA pattern
  if (ua.includes('mobile') && ua.includes('chrome') && !ua.includes('android') && !ua.includes('iphone')) return true;
  return GOOD_BOTS.some(bot => ua.includes(bot));
}

// ─── HTML Escape ──────────────────────────────────────────────────────────────
function esc(str: unknown): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ─── DB Pool (lazy — only created when first bot request arrives) ─────────────
let _pool: InstanceType<typeof Pool> | null = null;
function getPool(): InstanceType<typeof Pool> {
  if (!_pool) {
    _pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return _pool;
}

// ─── DB Helpers ───────────────────────────────────────────────────────────────
async function fetchJobBySlug(slug: string): Promise<any | null> {
  try {
    const pool = getPool();
    // Try slug column first, fall back to id
    const r1 = await pool.query('SELECT * FROM posts WHERE slug = $1 LIMIT 1', [slug]);
    if (r1.rows.length > 0) return r1.rows[0];

    const idNum = parseInt(slug, 10);
    if (!isNaN(idNum)) {
      const r2 = await pool.query('SELECT * FROM posts WHERE id = $1 LIMIT 1', [idNum]);
      if (r2.rows.length > 0) return r2.rows[0];
    }
    return null;
  } catch (e) {
    console.error('[Prerender] fetchJobBySlug error:', e);
    return null;
  }
}

async function fetchBlogBySlug(slug: string): Promise<any | null> {
  try {
    const pool = getPool();
    const r = await pool.query('SELECT * FROM blogs WHERE slug = $1 LIMIT 1', [slug]);
    return r.rows[0] || null;
  } catch (e) {
    console.error('[Prerender] fetchBlogBySlug error:', e);
    return null;
  }
}

async function fetchPostsByType(type: string, limit = 20): Promise<any[]> {
  try {
    const pool = getPool();
    const r = await pool.query(
      'SELECT id, title, slug, department, last_date FROM posts WHERE type = $1 ORDER BY created_at DESC LIMIT $2',
      [type, limit]
    );
    return r.rows;
  } catch (e) {
    console.error('[Prerender] fetchPostsByType error:', e);
    return [];
  }
}

async function fetchRecentPosts(limit = 20): Promise<any[]> {
  try {
    const pool = getPool();
    const r = await pool.query(
      'SELECT id, title, slug, department, last_date, type FROM posts ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    return r.rows;
  } catch (e) {
    return [];
  }
}

// ─── HTML Generators ──────────────────────────────────────────────────────────
function generateJobHTML(job: any, canonical: string): string {
  const title = `${esc(job.title)} – Apply Online, Eligibility, Last Date | SarkariJobSeva`;
  const rawDesc = job.short_info || job.shortInfo || `${job.title} – ${job.department}. Apply online at SarkariJobSeva.com`;
  const desc = esc(rawDesc.slice(0, 155));

  // Parse JSON columns safely
  const vacancyDetails: any[] = safeJsonParse(job.vacancy_details || job.vacancyDetails, []);
  const importantDates: any[] = safeJsonParse(job.important_dates || job.importantDates, []);
  const selectionProcess: string[] = safeJsonParse(job.selection_process || job.selectionProcess, []);

  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": job.title,
    "description": rawDesc,
    "datePosted": job.post_date || job.postDate || job.created_at,
    "validThrough": job.last_date || job.lastDate || undefined,
    "hiringOrganization": { "@type": "Organization", "name": job.department },
    "jobLocation": {
      "@type": "Place",
      "address": { "@type": "PostalAddress", "addressCountry": "IN" }
    },
  });

  let bodyContent = `
    <h1>${esc(job.title)}</h1>
    <p><strong>Department:</strong> ${esc(job.department)}</p>
    <p>${esc(rawDesc)}</p>
    ${job.last_date || job.lastDate ? `<p><strong>Last Date to Apply:</strong> ${esc(job.last_date || job.lastDate)}</p>` : ''}
    ${job.qualification ? `<p><strong>Eligibility:</strong> ${esc(job.qualification)}</p>` : ''}
    ${job.eligibility_details || job.eligibilityDetails ? `<p><strong>Eligibility Details:</strong> ${esc(job.eligibility_details || job.eligibilityDetails)}</p>` : ''}
    ${job.post_date || job.postDate ? `<p><strong>Post Date:</strong> ${esc(job.post_date || job.postDate)}</p>` : ''}
  `;

  if (vacancyDetails.length > 0) {
    bodyContent += `<h2>Vacancy Details</h2><ul>`;
    vacancyDetails.forEach((v: any) => {
      if (v.postName) bodyContent += `<li>${esc(v.postName)} – ${esc(v.totalPost || 'NA')} Posts – ${esc(v.eligibility || '')}</li>`;
    });
    bodyContent += `</ul>`;
  }

  if (importantDates.length > 0) {
    bodyContent += `<h2>Important Dates</h2><ul>`;
    importantDates.forEach((d: any) => {
      if (d.label) bodyContent += `<li>${esc(d.label)}: ${esc(d.date || '')}</li>`;
    });
    bodyContent += `</ul>`;
  }

  if (selectionProcess.length > 0) {
    bodyContent += `<h2>Selection Process</h2><ol>`;
    selectionProcess.forEach((s: string) => {
      if (s) bodyContent += `<li>${esc(s)}</li>`;
    });
    bodyContent += `</ol>`;
  }

  return `<!DOCTYPE html>
<html lang="hi-IN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${desc}">
  <meta name="robots" content="index, follow, max-snippet:-1">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="SarkariJobSeva">
  <meta property="og:image" content="https://sarkarijobseva.com/opengraph.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <script type="application/ld+json">${schema}</script>
</head>
<body>
  <header><a href="https://sarkarijobseva.com">SarkariJobSeva – सरकारी नौकरी पोर्टल</a></header>
  <main>${bodyContent}</main>
  <footer><p>Visit <a href="https://sarkarijobseva.com">SarkariJobSeva.com</a> for latest government jobs.</p></footer>
</body>
</html>`;
}

function generateCategoryHTML(config: { title: string; desc: string; posts?: any[] }, canonical: string): string {
  let postsHtml = '';
  if (config.posts && config.posts.length > 0) {
    postsHtml = `<h2>Latest Updates</h2><ul>`;
    config.posts.forEach((p: any) => {
      const href = `https://sarkarijobseva.com/job/${p.slug || p.id}`;
      postsHtml += `<li><a href="${href}">${esc(p.title)}</a>`;
      if (p.last_date || p.lastDate) postsHtml += ` – Last Date: ${esc(p.last_date || p.lastDate)}`;
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
  <meta property="og:image" content="https://sarkarijobseva.com/opengraph.jpg">
</head>
<body>
  <header><a href="https://sarkarijobseva.com">SarkariJobSeva – सरकारी नौकरी पोर्टल</a></header>
  <main>
    <h1>${esc(config.title)}</h1>
    <p>${esc(config.desc)}</p>
    ${postsHtml}
    <p><a href="https://sarkarijobseva.com">SarkariJobSeva.com</a> – Latest sarkari naukri updates daily.</p>
  </main>
</body>
</html>`;
}

// ─── Category Config ──────────────────────────────────────────────────────────
const CATEGORY_MAP: Record<string, { title: string; desc: string; type?: string }> = {
  '/': {
    title: 'SarkariJobSeva – Latest Sarkari Naukri, Admit Card, Result 2026',
    desc: 'India ka #1 sarkari naukri portal. Latest government jobs, admit card, result, answer key 2026. SSC, Railway, UPSC, Bank, State Govt jobs daily updates.',
  },
  '/latest-jobs': {
    title: 'Latest Government Jobs 2026 – Sarkari Naukri',
    desc: 'Latest sarkari naukri 2026 – SSC CGL, Railway RRB, UPSC, Bank, State Govt jobs. Apply online.',
    type: 'job',
  },
  '/admit-card': {
    title: 'Admit Card Download 2026 – Hall Ticket',
    desc: 'Download admit card 2026 for SSC, Railway, UPSC, Bank exams. Hall ticket download link.',
    type: 'admit-card',
  },
  '/results': {
    title: 'Sarkari Result 2026 – Government Exam Results',
    desc: 'Sarkari result 2026 – SSC, Railway, UPSC, Bank exam results, merit list, cut off marks.',
    type: 'result',
  },
  '/answer-key': {
    title: 'Answer Key 2026 – Government Exam Answer Keys',
    desc: 'Download answer key 2026 for SSC, Railway, UPSC, Bank government exams.',
    type: 'answer-key',
  },
  '/admission': {
    title: 'Admission Form 2026 – Government College Admission',
    desc: 'Government college admission 2026 – B.Ed, University admission forms and important dates.',
    type: 'admission',
  },
  '/search': {
    title: 'Search Sarkari Jobs 2026 – Find Government Jobs',
    desc: 'Search latest sarkari jobs, admit cards, results 2026 at SarkariJobSeva.',
  },
  '/blog': {
    title: 'Sarkari Job Blog – Government Job Tips & Updates',
    desc: 'Latest sarkari job news, tips, syllabus and exam updates for government job aspirants.',
  },
  '/disclaimer': {
    title: 'Disclaimer – SarkariJobSeva',
    desc: 'Disclaimer for SarkariJobSeva.com. Read our terms before using this government job portal.',
  },
  '/privacy-policy': {
    title: 'Privacy Policy – SarkariJobSeva',
    desc: 'Privacy policy of SarkariJobSeva.com. How we collect and use your data.',
  },
  '/terms-of-service': {
    title: 'Terms of Service – SarkariJobSeva',
    desc: 'Terms of service for using SarkariJobSeva.com government job portal.',
  },
  '/about': {
    title: 'About Us – SarkariJobSeva',
    desc: 'About SarkariJobSeva – India\'s trusted government job portal since 2024.',
  },
  '/about-us': {
    title: 'About Us – SarkariJobSeva',
    desc: 'About SarkariJobSeva – India\'s trusted government job portal since 2024.',
  },
  '/contact': {
    title: 'Contact Us – SarkariJobSeva',
    desc: 'Contact SarkariJobSeva for queries about government jobs, admit cards, and results.',
  },
  '/salary-calculator': {
    title: '7th Pay Commission Salary Calculator 2026 – SarkariJobSeva',
    desc: 'Calculate your government job salary with our 7th Pay Commission calculator. Basic pay, HRA, DA, TA calculator.',
  },
};

// ─── Util ─────────────────────────────────────────────────────────────────────
function safeJsonParse(val: any, fallback: any = null) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch { return fallback; }
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(`Could not find the build directory: ${distPath}. Run npm run build first.`);
  }

  // ── Bot Pre-render Middleware ──
  app.use(async (req: Request, res: Response, next: Function) => {
    const ua = req.headers['user-agent'] || '';
    if (!isGoodBot(ua)) return next();

    const urlPath = req.path;
    const baseUrl = 'https://sarkarijobseva.com';
    const canonical = `${baseUrl}${urlPath}`;

    console.log(`[Prerender] Bot detected: ${ua.slice(0, 60)} → ${urlPath}`);

    try {
      // 1. Job/Post detail page  /job/:slug
      const jobMatch = urlPath.match(/^\/job\/([^/?]+)/);
      if (jobMatch) {
        const job = await fetchJobBySlug(jobMatch[1]);
        if (job?.title) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.setHeader('X-Prerendered', '1');
          return res.send(generateJobHTML(job, canonical));
        }
        // Job not found — fall through to SPA (404 page)
        return next();
      }

      // 2. Blog detail page  /blog/:slug
      const blogMatch = urlPath.match(/^\/blog\/([^/?]+)/);
      if (blogMatch) {
        const blog = await fetchBlogBySlug(blogMatch[1]);
        if (blog?.title) {
          const title = `${blog.title} | SarkariJobSeva`;
          const desc = (blog.excerpt || blog.title).slice(0, 155);
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.setHeader('X-Prerendered', '1');
          return res.send(generateCategoryHTML({ title, desc }, canonical));
        }
        return next();
      }

      // 3. State jobs page  /jobs/state/:state
      const stateMatch = urlPath.match(/^\/jobs\/state\/([^/?]+)/);
      if (stateMatch) {
        const state = decodeURIComponent(stateMatch[1]).replace(/-/g, ' ');
        let posts: any[] = [];
        try {
          const pool = getPool();
          const r = await pool.query(
            'SELECT id, title, slug, department, last_date FROM posts WHERE LOWER(state) = LOWER($1) ORDER BY created_at DESC LIMIT 20',
            [state]
          );
          posts = r.rows;
        } catch {}
        const stateTitle = state.charAt(0).toUpperCase() + state.slice(1);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('X-Prerendered', '1');
        return res.send(generateCategoryHTML({
          title: `${stateTitle} Government Jobs 2026 – Sarkari Naukri`,
          desc: `Latest ${stateTitle} government jobs 2026. Apply online for state govt jobs at SarkariJobSeva.`,
          posts,
        }, canonical));
      }

      // 4. Qualification pages  /jobs/10th-pass  etc.
      const qualMatch = urlPath.match(/^\/jobs\/(10th-pass|12th-pass|graduation|post-graduate)/);
      if (qualMatch) {
        const qual = qualMatch[1];
        const qualLabels: Record<string, string> = {
          '10th-pass': '10th Pass',
          '12th-pass': '12th Pass',
          'graduation': 'Graduation',
          'post-graduate': 'Post Graduate',
        };
        let posts: any[] = [];
        try {
          const pool = getPool();
          const r = await pool.query(
            'SELECT id, title, slug, department, last_date FROM posts WHERE qualification = $1 ORDER BY created_at DESC LIMIT 20',
            [qual]
          );
          posts = r.rows;
        } catch {}
        const label = qualLabels[qual] || qual;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('X-Prerendered', '1');
        return res.send(generateCategoryHTML({
          title: `${label} Government Jobs 2026 – Sarkari Naukri`,
          desc: `Latest ${label} sarkari naukri 2026. Government jobs for ${label} candidates at SarkariJobSeva.`,
          posts,
        }, canonical));
      }

      // 5. Known category pages
      const catConfig = CATEGORY_MAP[urlPath];
      if (catConfig) {
        let posts: any[] = [];
        if (catConfig.type) {
          posts = await fetchPostsByType(catConfig.type);
        } else if (urlPath === '/') {
          posts = await fetchRecentPosts(20);
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
  // ── End Pre-render ──

  // Static assets
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
