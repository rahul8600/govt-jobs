import express, { type Express, type Request, type Response } from "express";
import fs from "fs";
import path from "path";

// Bot user agents jo prerender chahte hain
const BOT_AGENTS = [
  'googlebot', 'bingbot', 'yandex', 'baiduspider', 'facebookexternalhit',
  'twitterbot', 'rogerbot', 'linkedinbot', 'embedly', 'quora link preview',
  'showyoubot', 'outbrain', 'pinterest', 'slackbot', 'vkshare', 'w3c_validator',
  'whatsapp', 'telegrambot', 'applebot', 'discordbot'
];

function isBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return BOT_AGENTS.some(bot => ua.includes(bot));
}

async function prerenderPage(url: string, baseUrl: string): Promise<string | null> {
  try {
    // Fetch the page data from our own API based on URL pattern
    const jobMatch = url.match(/\/job\/([^/?]+)/);
    const blogMatch = url.match(/\/blog\/([^/?]+)/);
    
    if (jobMatch) {
      const slug = jobMatch[1];
      const res = await fetch(`${baseUrl}/api/posts/slug/${slug}`).catch(() => 
        fetch(`${baseUrl}/api/posts/${slug}`)
      );
      if (res?.ok) {
        const job = await res.json();
        return generateJobHTML(job, url, baseUrl);
      }
    } else if (blogMatch) {
      const slug = blogMatch[1];
      const res = await fetch(`${baseUrl}/api/blogs/${slug}`);
      if (res?.ok) {
        const blog = await res.json();
        return generateBlogHTML(blog, url, baseUrl);
      }
    }
    return null;
  } catch {
    return null;
  }
}

function generateJobHTML(job: any, url: string, baseUrl: string): string {
  const title = `${job.title} – Apply Online, Eligibility, Last Date | SarkariJobSeva`;
  const desc = job.shortInfo?.slice(0, 155) || `${job.title} – ${job.department}. Apply online at SarkariJobSeva.`;
  const canonical = `${baseUrl}${url}`;
  
  return `<!DOCTYPE html>
<html lang="hi-IN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(desc)}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(desc)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="SarkariJobSeva">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(desc)}">
  <script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": job.type === 'job' ? "JobPosting" : "Article",
    "title": job.title,
    "description": desc,
    "datePosted": job.postDate,
    "validThrough": job.lastDate,
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.department
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "IN"
      }
    }
  })}</script>
</head>
<body>
  <h1>${escapeHtml(job.title)}</h1>
  <p>${escapeHtml(job.department)}</p>
  <p>${escapeHtml(job.shortInfo || '')}</p>
  ${job.lastDate ? `<p>Last Date: ${escapeHtml(job.lastDate)}</p>` : ''}
  ${job.qualification ? `<p>Eligibility: ${escapeHtml(job.qualification)}</p>` : ''}
</body>
</html>`;
}

function generateBlogHTML(blog: any, url: string, baseUrl: string): string {
  const title = `${blog.title} | SarkariJobSeva`;
  const desc = blog.excerpt?.slice(0, 155) || blog.title;
  const canonical = `${baseUrl}${url}`;
  
  return `<!DOCTYPE html>
<html lang="hi-IN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(desc)}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(desc)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:type" content="article">
</head>
<body>
  <h1>${escapeHtml(blog.title)}</h1>
  <p>${escapeHtml(blog.excerpt || '')}</p>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Bot prerender middleware
  app.use(async (req: Request, res: Response, next: Function) => {
    const userAgent = req.headers['user-agent'] || '';
    
    if (isBot(userAgent) && (req.path.startsWith('/job/') || req.path.startsWith('/blog/'))) {
      const baseUrl = process.env.SITE_URL || `${req.protocol}://${req.get('host')}`;
      const html = await prerenderPage(req.path, baseUrl);
      
      if (html) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('X-Prerendered', 'true');
        return res.send(html);
      }
    }
    next();
  });

  // Cache static assets
  app.use(express.static(distPath, {
    maxAge: "1y",
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Pragma", "no-cache");
      } else if (filePath.match(/\.(js|css)$/)) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      } else if (filePath.match(/\.(png|jpg|jpeg|webp|svg|ico|woff|woff2|ttf)$/)) {
        res.setHeader("Cache-Control", "public, max-age=2592000");
      }
    },
  }));

  // fallthrough to index.html
  app.use("*", (_req: Request, res: Response) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
