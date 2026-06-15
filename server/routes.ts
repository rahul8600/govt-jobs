import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcrypt";
import OpenAI from "openai";
import { storage } from "./storage";
import { insertPostSchema } from "@shared/schema";
import { z } from "zod";
import { parseJobNotification } from "./jobParser";
import { dbInfo } from "./db";
import { writeFile, readdir, unlink, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

function generateSlug(title: string): string {
  const yearMatch = title.match(/20\d{2}/);
  const hasYear = yearMatch !== null;
  
  let slug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60);
  
  if (!hasYear) {
    slug += '-' + new Date().getFullYear();
  }
  
  return slug;
}

async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  let existing = await storage.getPostBySlug(slug);
  
  while (existing) {
    slug = `${baseSlug}-${counter}`;
    counter++;
    existing = await storage.getPostBySlug(slug);
  }
  
  return slug;
}

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const parsedJobSchema = z.object({
  title: z.string(),
  department: z.string(),
  type: z.enum(["job", "admit-card", "result", "answer-key", "admission"]),
  shortInfo: z.string(),
  qualification: z.string().optional(),
  state: z.string().optional(),
  category: z.string().optional(),
  vacancyDetails: z.array(z.object({
    postName: z.string(),
    totalPost: z.string(),
    eligibility: z.string()
  })).optional(),
  applicationFee: z.array(z.object({
    category: z.string(),
    fee: z.string()
  })).optional(),
  importantDates: z.array(z.object({
    label: z.string(),
    date: z.string()
  })).optional(),
  ageLimit: z.array(z.object({
    category: z.string(),
    minAge: z.string(),
    maxAge: z.string()
  })).optional(),
  eligibilityDetails: z.string().optional(),
  selectionProcess: z.array(z.string()).optional(),
  physicalEligibility: z.array(z.object({
    criteria: z.string(),
    male: z.string(),
    female: z.string()
  })).optional(),
  applyOnlineUrl: z.string().optional(),
  admitCardUrl: z.string().optional(),
  resultUrl: z.string().optional(),
  answerKeyUrl: z.string().optional(),
  notificationUrl: z.string().optional(),
  officialWebsiteUrl: z.string().optional(),
});

declare module 'express-session' {
  interface SessionData {
    isAdmin: boolean;
  }
}

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

let hashedPassword: string;

async function initializePasswordHash() {
  hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
}

initializePasswordHash();

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session?.isAdmin) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
}

// Bot detection
const BOTS = ['googlebot','google-inspection-tool','google search console','bingbot','facebookexternalhit','twitterbot','linkedinbot','whatsapp','telegrambot','applebot','discordbot','google-read-aloud','apis-google','feedfetcher','mediapartners-google','adsbot-google','yandexbot','baiduspider','duckduckbot'];
function isBot(ua: string): boolean { return BOTS.some(b => ua.toLowerCase().includes(b)); }
function esc(s: string): string { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }


// ===== TELEGRAM BOT AUTO POST =====
async function sendTelegramMessage(message: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHANNEL_ID;
  if (!token || !chatId) {
    console.log("Telegram not configured - skipping notification");
    return;
  }
  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const tgRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
        disable_web_page_preview: false,
      }),
    });
    const tgData = await tgRes.json();
    if (tgData.ok) {
      console.log("✅ Telegram notification sent successfully!");
    } else {
      console.error("❌ Telegram error:", JSON.stringify(tgData));
    }
  } catch (err) {
    console.error("Telegram send error:", err);
  }
}

// ===== ONESIGNAL PUSH NOTIFICATION =====
async function sendPushNotification(title: string, message: string, url: string): Promise<void> {
  const appId = "fd40d63f-bbbd-46e4-8162-c331854a0225";
  const apiKey = process.env.ONESIGNAL_REST_API_KEY;
  if (!apiKey) {
    console.log("OneSignal REST API key not set - skipping push notification");
    return;
  }
  try {
    const res = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${apiKey}`,
      },
      body: JSON.stringify({
        app_id: appId,
        included_segments: ["All"],
        headings: { en: title },
        contents: { en: message },
        url: url,
        chrome_web_icon: "https://sarkarijobseva.com/logo.png",
      }),
    });
    const data = await res.json();
    console.log("Push notification sent:", data.id || data.errors);
  } catch (err) {
    console.error("OneSignal push error:", err);
  }
}

// Send both Telegram + Push notification for a post
async function notifyAllChannels(post: any, req: any): Promise<void> {
  const postUrl = `https://sarkarijobseva.com/job/${post.slug || post.id}`;
  const typeEmoji: Record<string, string> = {
    job: "💼", "admit-card": "🎫", result: "📊", "answer-key": "🔑", admission: "🎓"
  };
  const typeLabel: Record<string, string> = {
    job: "New Job", "admit-card": "Admit Card Out", result: "Result Out", "answer-key": "Answer Key", admission: "Admission"
  };
  const emoji = typeEmoji[post.type] || "📢";
  const label = typeLabel[post.type] || "New Post";

  const telegramMsg = `${emoji} <b>${label}!</b>

📋 <b>${post.title}</b>

🏢 ${post.department || ""}
📅 Last Date: ${post.lastDate || "N/A"}
👥 Posts: ${post.totalPost || "N/A"}
🎓 Qualification: ${post.qualification || "N/A"}

🔗 <a href="${postUrl}">Full Details & Apply</a>

🌐 SarkariJobSeva.com
📲 Join: https://t.me/sarkarijobse`;

  await sendTelegramMessage(telegramMsg).catch(console.error);

  const pushMsg = `${post.department || ""} | Last Date: ${post.lastDate || "N/A"} | Posts: ${post.totalPost || "N/A"}`;
  await sendPushNotification(`${emoji} ${label}: ${post.title}`, pushMsg, postUrl).catch(console.error);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ===== BOT PRERENDER MIDDLEWARE =====
  app.use(async (req: any, res: any, next: any) => {
    const ua = req.headers['user-agent'] || '';
    if (!isBot(ua)) return next();
    const urlPath = req.path;
    const baseUrl = 'https://sarkarijobseva.com';

    try {
      // 1. Job/Post pages
      const jobMatch = urlPath.match(/^\/job\/([^/?]+)/);
      if (jobMatch) {
        const slug = jobMatch[1];
        let job: any = null;
        try { job = await storage.getPostBySlug(slug); } catch {}
        if (!job) { try { job = await storage.getPost(parseInt(slug)); } catch {} }
        if (job) {
          const jobSlug = job.slug || job.id;
          // Redirect if slug is null/invalid
          if (!jobSlug || jobSlug === 'null') {
            return res.status(404).send('Not Found');
          }
          const title = esc(job.title) + ' - Apply Online, Last Date, Eligibility | SarkariJobSeva';
          const descText = job.shortInfo || job.eligibilityDetails || job.title || '';
          const desc = esc(descText.slice(0, 155));
          const canonical = baseUrl + '/job/' + jobSlug;
          // JobPosting Schema for Google
          const jobSchema = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "JobPosting",
            "title": job.title,
            "description": (job.shortInfo || job.eligibilityDetails || job.title || '').slice(0, 500),
            "hiringOrganization": {
              "@type": "Organization",
              "name": job.department || "Government of India",
              "sameAs": job.officialWebsiteUrl || "https://sarkarijobseva.com"
            },
            "jobLocation": {
              "@type": "Place",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "IN"
              }
            },
            "datePosted": job.createdAt ? new Date(job.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            "employmentType": "FULL_TIME",
            "url": canonical,
            "educationRequirements": job.qualification || "See notification",
            "identifier": {
              "@type": "PropertyValue",
              "name": "SarkariJobSeva",
              "value": String(job.id)
            }
          });

          // Build vacancy details HTML
          const vacancyHtml = Array.isArray(job.vacancyDetails) ? job.vacancyDetails.map((v: any) =>
            `<tr><td>${esc(v.postName || '')}</td><td>${esc(v.totalPost || '')}</td><td>${esc(v.eligibility || '')}</td></tr>`
          ).join('') : '';

          // Build important dates HTML
          const datesHtml = Array.isArray(job.importantDates) ? job.importantDates.map((d: any) =>
            `<tr><td>${esc(d.label || '')}</td><td><strong>${esc(d.date || '')}</strong></td></tr>`
          ).join('') : '';

          // Build fee HTML
          const feeHtml = Array.isArray(job.applicationFee) ? job.applicationFee.map((f: any) =>
            `<tr><td>${esc(f.category || '')}</td><td><strong>Rs. ${esc(f.fee || '')}</strong></td></tr>`
          ).join('') : '';

          // Build age HTML
          const ageHtml = Array.isArray(job.ageLimit) ? job.ageLimit.map((a: any) =>
            `<tr><td>${esc(a.category || '')}</td><td>${esc(a.minAge || '18')} - ${esc(a.maxAge || '')} Years</td></tr>`
          ).join('') : '';

          // Build links HTML
          const linksHtml = Array.isArray(job.links) ? job.links.map((l: any) =>
            `<a href="${esc(l.url || '#')}" target="_blank" rel="noopener" style="display:inline-block;margin:6px;padding:10px 16px;background:#1d4ed8;color:white;border-radius:6px;text-decoration:none;font-weight:bold">${esc(l.label || 'Link')}</a>`
          ).join('') : '';

          return res.send(`<!DOCTYPE html>
<html lang="hi-IN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta name="robots" content="index,follow">
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${canonical}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="SarkariJobSeva">
<meta property="og:image" content="${baseUrl}/logo.png">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">${jobSchema}</script>
<style>
body{font-family:Arial,sans-serif;max-width:900px;margin:0 auto;padding:16px;background:#f8fafc;color:#1e293b}
h1{color:#1d4ed8;font-size:24px;margin-bottom:8px}
h2{color:#374151;font-size:18px;margin:20px 0 8px;padding:8px;background:#eff6ff;border-left:4px solid #1d4ed8}
table{width:100%;border-collapse:collapse;margin:12px 0}
th{background:#1d4ed8;color:white;padding:10px;text-align:left}
td{padding:8px 10px;border:1px solid #e2e8f0}
tr:nth-child(even){background:#f8fafc}
.badge{display:inline-block;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:bold;background:#dbeafe;color:#1d4ed8;margin:4px}
.dept{color:#64748b;font-size:14px;margin-bottom:12px}
.links-section{margin:16px 0;padding:16px;background:white;border-radius:8px;border:1px solid #e2e8f0}
header{background:#1d4ed8;color:white;padding:12px 16px;border-radius:8px;margin-bottom:16px}
header a{color:white;text-decoration:none;font-size:20px;font-weight:bold}
footer{margin-top:24px;padding:12px;background:#1e293b;color:#94a3b8;border-radius:8px;text-align:center;font-size:13px}
footer a{color:#60a5fa}
</style>
</head>
<body>
<header><a href="${baseUrl}">🏛️ SarkariJobSeva.com</a></header>

<span class="badge">${esc(job.type || 'Job').toUpperCase()}</span>
${job.qualification ? `<span class="badge">${esc(job.qualification)}</span>` : ''}
${job.trending ? '<span class="badge" style="background:#fef3c7;color:#92400e">🔥 TRENDING</span>' : ''}

<h1>${esc(job.title)}</h1>
<p class="dept">🏢 ${esc(job.department || '')} ${job.lastDate ? '| 📅 Last Date: <strong>' + esc(job.lastDate) + '</strong>' : ''}</p>

<p style="line-height:1.7;background:white;padding:12px;border-radius:8px;border:1px solid #e2e8f0">${esc(job.shortInfo || job.eligibilityDetails || '')}</p>

${datesHtml ? `<h2>📅 Important Dates</h2><table><tr><th>Event</th><th>Date</th></tr>${datesHtml}</table>` : ''}

${feeHtml ? `<h2>💰 Application Fee</h2><table><tr><th>Category</th><th>Fee</th></tr>${feeHtml}</table>` : ''}

${ageHtml ? `<h2>🎂 Age Limit</h2><table><tr><th>Category</th><th>Age</th></tr>${ageHtml}</table>` : ''}

${vacancyHtml ? `<h2>📊 Vacancy Details</h2><table><tr><th>Post Name</th><th>Total Posts</th><th>Eligibility</th></tr>${vacancyHtml}</table>` : ''}

${job.eligibilityDetails ? `<h2>📋 Eligibility Details</h2><p style="line-height:1.7;background:white;padding:12px;border-radius:8px;border:1px solid #e2e8f0">${esc(job.eligibilityDetails)}</p>` : ''}

${Array.isArray(job.selectionProcess) && job.selectionProcess.length ? `<h2>🎯 Selection Process</h2><ol>${job.selectionProcess.map((s: any) => `<li style="margin:6px 0">${esc(s)}</li>`).join('')}</ol>` : ''}

${linksHtml ? `<h2>🔗 Important Links</h2><div class="links-section">${linksHtml}</div>` : ''}

<p style="margin-top:16px;font-size:13px;color:#94a3b8;font-style:italic">⚠️ Disclaimer: Hamesha official website par jakar notification zaroor padhen. SarkariJobSeva ek information portal hai.</p>

<footer>
© 2026 SarkariJobSeva.com | 
<a href="${baseUrl}/latest-jobs">Latest Jobs</a> | 
<a href="${baseUrl}/admit-card">Admit Card</a> | 
<a href="${baseUrl}/results">Results</a> | 
<a href="${baseUrl}/disclaimer">Disclaimer</a> | 
<a href="${baseUrl}/privacy-policy">Privacy Policy</a>
<br>सरकारी नौकरी | Sarkari Naukri | Government Jobs India | Free Job Alert
</footer>
</body></html>`);
        }
      }

      // 2. Category pages with real posts
      const categoryMap: Record<string, {title: string; desc: string; type: string}> = {
        '/latest-jobs':  { title: 'Latest Government Jobs 2026', desc: 'Latest sarkari naukri 2026 – SSC, Railway, UPSC, Bank, State Govt jobs. Apply online at SarkariJobSeva.', type: 'job' },
        '/admit-card':   { title: 'Admit Card Download 2026', desc: 'Download admit card 2026 for all government exams – SSC, Railway, UPSC. Hall ticket at SarkariJobSeva.', type: 'admit-card' },
        '/results':      { title: 'Sarkari Result 2026', desc: 'Sarkari result 2026 – Check government exam results, merit list, cut off marks at SarkariJobSeva.', type: 'result' },
        '/answer-key':   { title: 'Answer Key Download 2026', desc: 'Download answer key 2026 for SSC, Railway, UPSC, Bank government exams at SarkariJobSeva.', type: 'answer-key' },
        '/admission':    { title: 'Admission Form 2026', desc: 'Government college admission 2026 – Apply online, eligibility, important dates at SarkariJobSeva.', type: 'admission' },
        '/search':       { title: 'Search Sarkari Jobs 2026', desc: 'Search latest sarkari jobs, admit cards, results 2026 at SarkariJobSeva.', type: 'all' },
        '/blog':         { title: 'Sarkari Job Blog', desc: 'Latest sarkari job news, tips, syllabus and updates for government job aspirants.', type: 'blog' },
        '/salary-calculator': { title: '7th Pay Commission Salary Calculator 2026 – Sarkari Naukri Salary', desc: '7th Pay Commission ke anusar sarkari naukri salary calculate karein. Basic Pay, DA 50%, HRA, TA sab milakaar in-hand salary jaanein.', type: 'all' },
        '/':             { title: 'SarkariJobSeva - Sarkari Result, Naukri, Admit Card 2026', desc: 'India ka #1 sarkari naukri portal. Latest government jobs, admit card, result, answer key 2026.', type: 'all' },
      };

      const catConfig = categoryMap[urlPath];
      if (catConfig) {
        const canonical = baseUrl + urlPath;
        let postsHtml = '';
        
        try {
          if (catConfig.type !== 'all' && catConfig.type !== 'blog') {
            // Use direct DB query for reliability
            const dbResult = await blogPool.query(
              `SELECT id, title, slug, department, last_date, qualification, type 
               FROM posts 
               WHERE type = $1 
               ORDER BY created_at DESC 
               LIMIT 20`,
              [catConfig.type]
            );
            const posts = dbResult.rows || [];
            postsHtml = posts.map((p: any) => {
              const slug = p.slug || p.id;
              if (!slug || String(slug) === 'null') return '';
              return `<li class="job-item"><a href="${baseUrl}/job/${slug}">${esc(p.title)}</a><div class="job-meta">🏢 ${esc(p.department || '')}${p.last_date ? ' | 📅 Last Date: <strong>' + esc(p.last_date) + '</strong>' : ''}${p.qualification ? ' | 🎓 ' + esc(p.qualification) : ''}</div></li>`;
            }).filter(Boolean).join('');
          }
        } catch(e) { console.error('[Prerender posts]', e); }

        return res.send(`<!DOCTYPE html>
<html lang="hi-IN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(catConfig.title)} | SarkariJobSeva.com</title>
<meta name="description" content="${esc(catConfig.desc)}">
<meta name="robots" content="index,follow">
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${esc(catConfig.title)} | SarkariJobSeva">
<meta property="og:description" content="${esc(catConfig.desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="SarkariJobSeva">
<style>
body{font-family:Arial,sans-serif;max-width:1200px;margin:0 auto;padding:16px;background:#f8fafc;color:#1e293b}
header{background:#1d4ed8;color:white;padding:16px;border-radius:8px;margin-bottom:20px}
header a{color:white;text-decoration:none;font-size:22px;font-weight:bold}
h1{color:#1d4ed8;font-size:28px;margin-bottom:8px}
h2{color:#374151;font-size:20px;margin-top:24px}
.job-list{list-style:none;padding:0}
.job-item{background:white;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:12px}
.job-item a{color:#1d4ed8;font-weight:bold;font-size:16px;text-decoration:none}
.job-item a:hover{text-decoration:underline}
.job-meta{color:#64748b;font-size:13px;margin-top:4px}
nav{margin:20px 0;padding:16px;background:white;border-radius:8px;border:1px solid #e2e8f0}
nav a{color:#1d4ed8;margin-right:16px;text-decoration:none;font-weight:bold}
footer{margin-top:32px;padding:16px;background:#1e293b;color:#94a3b8;border-radius:8px;text-align:center}
footer a{color:#60a5fa}
p{line-height:1.7;color:#374151}
</style>
</head>
<body>
<header>
<a href="${baseUrl}">🏛️ SarkariJobSeva.com</a>
<p style="margin:4px 0 0;font-size:14px;opacity:0.9">भारत का नंबर 1 सरकारी नौकरी पोर्टल | Free Job Alert</p>
</header>
<main>
<h1>${esc(catConfig.title)}</h1>
<p>${esc(catConfig.desc)}</p>
<p>SarkariJobSeva.com par aapko latest sarkari naukri, admit card, result aur answer key ki sabse sahi aur updated jankari milti hai. Hamare portal par rojana naye government job notifications add kiye jaate hain. SSC, Railway, UPSC, Bank, Police, Army, Teacher Bharti aur sabhi state government jobs ki poori jankari yahan uplabdh hai.</p>

${postsHtml ? `<h2>📋 Latest Updates (${postsHtml.split('<li').length - 1} posts)</h2><ul class="job-list">${postsHtml}</ul>` : '<p><strong>Abhi is category mein koi update nahi hai.</strong> Jald hi naye posts add honge. Hamare Telegram Channel join karein instant alert ke liye.</p>'}

<h2>📌 Quick Links</h2>
<nav>
<a href="${baseUrl}/latest-jobs">🔔 Latest Jobs</a>
<a href="${baseUrl}/admit-card">📄 Admit Card</a>
<a href="${baseUrl}/results">📊 Results</a>
<a href="${baseUrl}/answer-key">🔑 Answer Key</a>
<a href="${baseUrl}/salary-calculator">💰 Salary Calculator</a>
<a href="${baseUrl}/blog">📝 Blog</a>
</nav>

<h2>🎯 Hamare Baare Mein</h2>
<p>SarkariJobSeva.com ek free government job portal hai jo sarkari naukri ke aspirants ke liye daily job updates provide karta hai. Hum SSC CGL, CHSL, MTS, Railway RRB, NTPC, Group D, UPSC, NDA, CDS, Bank PO, Clerk, Police Constable, Army, Teacher Bharti aur sabhi state government jobs ki jankari dete hain.</p>
<p>Hamare portal par 10th pass, 12th pass, Graduate aur Post Graduate sabhi levels ke liye government jobs uplabdh hain. UP, Bihar, Rajasthan, MP, Haryana, Punjab, Uttarakhand aur sabhi states ki sarkari naukri yahan mil sakti hai.</p>

<h2>📲 Hume Follow Karein</h2>
<p>
<a href="https://t.me/sarkarijobse">📱 Telegram: @sarkarijobse</a> |
<a href="https://whatsapp.com/channel/0029Vb7dt842ER6rNwc6eB47">💬 WhatsApp Channel</a>
</p>
</main>

<footer>
<p>© 2026 SarkariJobSeva.com | 
<a href="${baseUrl}/disclaimer">Disclaimer</a> | 
<a href="${baseUrl}/privacy-policy">Privacy Policy</a> | 
<a href="${baseUrl}/terms-of-service">Terms</a> | 
<a href="${baseUrl}/contact">Contact: supportsarkarijobseva@gmail.com</a>
</p>
<p>सरकारी नौकरी | Sarkari Naukri | Government Jobs India | Free Job Alert | Rojgar Samachar | नौकरी</p>
</footer>
</body>
</html>`);
      }

    } catch(e) { console.error('[Prerender]', e); }
    next();
  });
  // ===== END BOT PRERENDER =====

  // Health check endpoint - shows database connection info
  app.get("/api/health", async (req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.json({
      status: 'ok',
      environment: 'production',
      mode: 'unified',
      database: {
        type: 'PostgreSQL',
        host: dbInfo.host,
        name: dbInfo.database,
        connected: true
      },
      timestamp: new Date().toISOString()
    });
  });

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }
      
      const isValidUser = username === ADMIN_USERNAME;
      const isValidPassword = await bcrypt.compare(password, hashedPassword);
      
      if (isValidUser && isValidPassword) {
        req.session.isAdmin = true;
        res.json({ success: true });
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (error) {
      res.status(500).json({ error: "Authentication failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/auth/check", (req, res) => {
    res.json({ isAdmin: !!req.session?.isAdmin });
  });

  // Analytics - Track page view (public)
  app.post("/api/analytics/track", async (req, res) => {
    try {
      const { page, postId, sessionId } = req.body;
      if (!page) {
        return res.status(400).json({ error: "Page is required" });
      }
      await storage.recordPageView({
        page,
        postId: postId ? parseInt(postId) : undefined,
        sessionId: sessionId || undefined
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to track page view" });
    }
  });

  // Analytics - Get dashboard data (admin only)
  app.get("/api/analytics", requireAuth, async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Get all posts with optional filters
  // Cache helper
  function setPublicCache(res: Response, seconds = 60) {
    res.setHeader("Cache-Control", `public, max-age=${seconds}, stale-while-revalidate=${seconds * 2}`);
  }

  app.get("/api/posts", async (req, res) => {
    setPublicCache(res, 60);
    try {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      res.set('Surrogate-Control', 'no-store');
      
      const { type, qualification, state } = req.query;
      
      if (qualification || state || type) {
        const filters: { type?: string; qualification?: string; state?: string } = {};
        if (type && typeof type === 'string') filters.type = type;
        if (qualification && typeof qualification === 'string') filters.qualification = qualification;
        if (state && typeof state === 'string') filters.state = state;
        const posts = await storage.getFilteredPosts(filters);
        return res.json(posts);
      }
      
      const posts = await storage.getAllPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  // Get posts by type (job, admit-card, result, answer-key, admission)
  app.get("/api/posts/type/:type", async (req, res) => {
    try {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      const posts = await storage.getPostsByType(req.params.type);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts by type:", error);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  // Get posts by qualification (10th Pass, 12th Pass, Graduation, Post Graduate)
  app.get("/api/posts/qualification/:qualification", async (req, res) => {
    try {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      const qualification = decodeURIComponent(req.params.qualification);
      const posts = await storage.getPostsByQualification(qualification);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts by qualification:", error);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  // Get posts by state
  app.get("/api/posts/state/:state", async (req, res) => {
    try {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      const state = decodeURIComponent(req.params.state);
      const posts = await storage.getPostsByState(state);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts by state:", error);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  // Get single post by ID
  app.get("/api/posts/:id", async (req, res) => {
    try {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      res.set('Surrogate-Control', 'no-store');
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid post ID" });
      }
      const post = await storage.getPost(id);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ error: "Failed to fetch post" });
    }
  });

  // Get post by slug
  app.get("/api/posts/slug/:slug", async (req, res) => {
    try {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      res.set('Surrogate-Control', 'no-store');
      const post = await storage.getPostBySlug(req.params.slug);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ error: "Failed to fetch post" });
    }
  });

  // Create new post (protected)
  app.post("/api/posts", requireAuth, async (req, res) => {
    try {
      const validatedData = insertPostSchema.parse(req.body);
      if (!validatedData.slug && validatedData.title) {
        const baseSlug = generateSlug(validatedData.title);
        validatedData.slug = await ensureUniqueSlug(baseSlug);
      }
      const post = await storage.createPost(validatedData);
      res.status(201).json(post);
      // Auto-notify Telegram + Push
      notifyAllChannels(post, req).catch(console.error);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(400).json({ error: "Failed to create post" });
    }
  });

  // Update post (protected)
  app.put("/api/posts/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid post ID" });
      }
      const validatedData = insertPostSchema.partial().parse(req.body);
      if (validatedData.title && !validatedData.slug) {
        const baseSlug = generateSlug(validatedData.title);
        validatedData.slug = await ensureUniqueSlug(baseSlug);
      }
      const post = await storage.updatePost(id, validatedData);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error updating post:", error);
      res.status(400).json({ error: "Failed to update post" });
    }
  });

  // Delete post (protected)
  app.delete("/api/posts/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid post ID" });
      }
      const deleted = await storage.deletePost(id);
      if (!deleted) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ error: "Failed to delete post" });
    }
  });

  // Rule-based Job Parser endpoint (protected) - NO AI
  app.post("/api/parse-job-rules", requireAuth, async (req, res) => {
    try {
      const { rawText } = req.body;
      
      if (!rawText || typeof rawText !== 'string' || rawText.trim().length < 50) {
        return res.status(400).json({ error: "Please provide job notification text (at least 50 characters)" });
      }

      const parsedData = parseJobNotification(rawText);
      res.json({ parsedData });
    } catch (error) {
      console.error("Error parsing job with rules:", error);
      res.status(500).json({ error: "Failed to parse job notification. Please try again." });
    }
  });

  // AI Job Parser endpoint (protected)
  app.post("/api/parse-job", requireAuth, async (req, res) => {
    try {
      const { rawText } = req.body;
      
      if (!rawText || typeof rawText !== 'string' || rawText.trim().length < 50) {
        return res.status(400).json({ error: "Please provide job notification text (at least 50 characters)" });
      }

      const systemPrompt = `You are an expert at parsing Indian government job notifications (Sarkari Result style). 
Extract structured data from the raw job notification text provided. Return a JSON object with the following fields:
- title: The job/notification title (e.g., "SSC CGL 2026 Registration")
- department: The department or organization (e.g., "Staff Selection Commission")
- type: One of "job", "admit-card", "result", "answer-key", or "admission"
- shortInfo: A brief 2-3 sentence summary of the notification
- qualification: Educational qualification required (if mentioned)
- state: State name if specific to a state (if mentioned)
- vacancyDetails: Array of {postName, totalPost, eligibility} for each position
- applicationFee: Array of {category, fee} (e.g., General/OBC, SC/ST fees)
- importantDates: Array of {label, date} (e.g., Application Start, Last Date, Exam Date)
- ageLimit: Array of {category, minAge, maxAge} for different categories
- eligibilityDetails: Detailed eligibility text
- selectionProcess: Array of selection stages (e.g., ["Written Exam", "Interview", "Document Verification"])
- physicalEligibility: Array of {criteria, male, female} if physical standards mentioned
- applyOnlineUrl: Apply online URL if found
- admitCardUrl: Admit card download URL if found
- resultUrl: Result download URL if found
- answerKeyUrl: Answer key URL if found
- notificationUrl: Official notification PDF URL if found
- officialWebsiteUrl: Official website URL if found

Return ONLY valid JSON. Extract all information present. Use empty arrays [] for missing array fields. Use empty string "" for missing string fields.
Format dates in DD/MM/YYYY or "Month DD, YYYY" format as they appear.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: rawText }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 4000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return res.status(500).json({ error: "AI returned empty response" });
      }

      const parsed = JSON.parse(content);
      const validated = parsedJobSchema.safeParse(parsed);
      
      if (!validated.success) {
        console.error("Validation errors:", validated.error.errors);
        return res.json({ 
          parsedData: parsed,
          warning: "Some fields may not match expected format"
        });
      }

      res.json({ parsedData: validated.data });
    } catch (error) {
      console.error("Error parsing job with AI:", error);
      res.status(500).json({ error: "Failed to parse job notification. Please try again." });
    }
  });


  // ===== BLOG ROUTES =====
  // Get all published blogs
  // Blog DB Pool
  const { Pool } = await import('pg').then(m => m.default || m);
  const blogPool = new Pool({ connectionString: process.env.DATABASE_URL });

  app.get('/api/blogs', async (req, res) => {
    try {
      const { db } = await import('./db');
      const result = await blogPool.query('SELECT id, title, slug, excerpt, image_url, category, tags, author, views, featured, created_at FROM blogs ORDER BY created_at DESC');
      res.json(result.rows || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      res.status(500).json({ error: 'Failed to fetch blogs' });
    }
  });

  // Get single blog by slug
  app.get('/api/blogs/:slug', async (req, res) => {
    try {
      const { db } = await import('./db');
      const { slug } = req.params;
      await blogPool.query('UPDATE blogs SET views = views + 1 WHERE slug = $1', [slug]);
      const result = await blogPool.query('SELECT * FROM blogs WHERE slug = $1', [slug]);
      if (!result.rows || result.rows.length === 0) return res.status(404).json({ error: 'Blog not found' });
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch blog' });
    }
  });

  // Create blog (admin only)
  app.post('/api/blogs', requireAuth, async (req, res) => {
    try {
      const { title, content: blogContent, excerpt, image_url, category, tags, featured, published } = req.body;
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '-' + Date.now();
      const result = await blogPool.query(
        'INSERT INTO blogs (title, slug, content, excerpt, image_url, category, tags, featured, published) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
        [title, slug, blogContent || '', excerpt || '', image_url || '', category || 'job', tags || '', featured || false, published !== false]
      );
      const blog = result.rows[0];
      res.json(blog);

      // Auto-post to Telegram
      try {
        const blogUrl = `https://sarkarijobseva.com/blog/${blog.slug}`;
        const telegramMsg = `📝 <b>New Blog Post!</b>

📋 <b>${blog.title}</b>

${blog.excerpt ? blog.excerpt.substring(0, 200) + '...' : ''}

🔗 <a href="${blogUrl}">Read More</a>

🌐 SarkariJobSeva.com
📲 Join: https://t.me/sarkarijobse`;
        sendTelegramMessage(telegramMsg).catch(console.error);
      } catch(e) { console.error("Blog Telegram error:", e); }

    } catch (error) {
      console.error('Error creating blog:', error);
      res.status(500).json({ error: 'Failed to create blog' });
    }
  });

  // Update blog (admin only)
  app.put('/api/blogs/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { title, content: blogContent, excerpt, image_url, category, tags, featured, published } = req.body;
      const result = await blogPool.query(
        'UPDATE blogs SET title=$1, content=$2, excerpt=$3, image_url=$4, category=$5, tags=$6, featured=$7, published=$8, updated_at=NOW() WHERE id=$9 RETURNING *',
        [title, blogContent || '', excerpt || '', image_url || '', category || 'job', tags || '', featured || false, published !== false, id]
      );
      if (!result.rows[0]) return res.status(404).json({ error: 'Blog not found' });
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Blog update error:', error);
      res.status(500).json({ error: 'Failed to update blog' });
    }
  });

  // Delete blog (admin only)
  app.delete('/api/blogs/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await blogPool.query('DELETE FROM blogs WHERE id = $1', [id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete blog' });
    }
  });

  // Get all blogs for admin
  app.get('/api/admin/blogs', requireAuth, async (req, res) => {
    try {
      const { db } = await import('./db');
      const result = await blogPool.query('SELECT * FROM blogs ORDER BY created_at DESC');
      res.json(result.rows || []);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch blogs' });
    }
  });

  // ads.txt - force text/plain so Google AdSense bot can read it
  app.get("/ads.txt", (req, res) => {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send("google.com, pub-2034546761813262, DIRECT, f08c47fec0942fa0");
  });

  // robots.txt
  app.get("/robots.txt", (req, res) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.type('text/plain');
    res.send(`User-agent: *
Allow: /
Allow: /job/
Allow: /latest-jobs
Allow: /admit-card
Allow: /results
Allow: /answer-key
Allow: /admission
Allow: /search
Allow: /blog/
Allow: /blogs
Allow: /blog
Allow: /about-us
Allow: /privacy-policy
Allow: /disclaimer
Allow: /terms-of-service
Allow: /contact-us
Disallow: /admin
Disallow: /api/

User-agent: Googlebot
Allow: /
Disallow: /admin

User-agent: AdsBot-Google
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`);
  });

  // sitemap.xml - Google validated
  app.get("/sitemap.xml", async (req, res) => {
    try {
      // Always use canonical domain
      const baseUrl = 'https://sarkarijobseva.com';
      const today = new Date().toISOString().split('T')[0];
      const posts = await storage.getAllPosts();

      const staticPages = [
        { loc: '/',                priority: '1.0', changefreq: 'daily',   lastmod: today },
        { loc: '/latest-jobs',     priority: '0.9', changefreq: 'daily',   lastmod: today },
        { loc: '/admit-card',      priority: '0.9', changefreq: 'daily',   lastmod: today },
        { loc: '/results',         priority: '0.9', changefreq: 'daily',   lastmod: today },
        { loc: '/answer-key',      priority: '0.8', changefreq: 'weekly',  lastmod: today },
        { loc: '/admission',       priority: '0.8', changefreq: 'daily',   lastmod: today },
        { loc: '/blog',            priority: '0.7', changefreq: 'daily',   lastmod: today },
        { loc: '/about',           priority: '0.5', changefreq: 'monthly', lastmod: today },
        { loc: '/contact',         priority: '0.4', changefreq: 'monthly', lastmod: today },
        { loc: '/disclaimer',      priority: '0.3', changefreq: 'monthly', lastmod: today },
        { loc: '/privacy-policy',  priority: '0.3', changefreq: 'monthly', lastmod: today },
      ];

      // Helper to escape XML special chars
      const xmlEsc = (s: string) => String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
      xml += '  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

      // Static pages
      for (const page of staticPages) {
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}${page.loc}</loc>\n`;
        xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
        xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
        xml += `    <priority>${page.priority}</priority>\n`;
        xml += `  </url>\n`;
      }

      // Job posts
      for (const post of posts) {
        const slug = post.slug || post.id;
        if (!slug || String(slug) === 'null' || String(slug) === 'undefined') continue;
        const cleanSlug = String(slug).trim();
        if (!cleanSlug) continue;

        const priority = (post.featured || post.trending) ? '0.9' : '0.7';
        const lastmod = post.createdAt
          ? new Date(post.createdAt).toISOString().split('T')[0]
          : today;

        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/job/${xmlEsc(cleanSlug)}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>${priority}</priority>\n`;
        xml += `  </url>\n`;
      }

      // Blog posts
      try {
        const blogResult = await blogPool.query(
          "SELECT slug, updated_at FROM blogs WHERE published = true AND slug IS NOT NULL AND slug != ''"
        );
        for (const blog of blogResult.rows) {
          if (!blog.slug) continue;
          const lastmod = blog.updated_at
            ? new Date(blog.updated_at).toISOString().split('T')[0]
            : today;
          xml += `  <url>\n`;
          xml += `    <loc>${baseUrl}/blog/${xmlEsc(blog.slug)}</loc>\n`;
          xml += `    <lastmod>${lastmod}</lastmod>\n`;
          xml += `    <changefreq>monthly</changefreq>\n`;
          xml += `    <priority>0.6</priority>\n`;
          xml += `  </url>\n`;
        }
      } catch(e) { console.error('[Sitemap blogs]', e); }

      xml += '</urlset>';

      res.set('Content-Type', 'application/xml; charset=utf-8');
      res.set('Cache-Control', 'public, max-age=3600');
      res.send(xml);

    } catch (error) {
      console.error("Error generating sitemap:", error);
      res.status(500).type('text/plain').send('Error generating sitemap');
    }
  });

  // IndexNow route
  app.get("/api/indexnow", async (req, res) => {
    try {
      const baseUrl = "https://sarkarijobseva.com";
      const apiKey = "sarkarijobseva2026indexnow";
      const allPosts = await storage.getAllPosts(1, 10000);
      const urls: string[] = allPosts.map((p: any) => `${baseUrl}/job/${p.slug || p.id}`);
      urls.push(baseUrl + "/");
      urls.push(baseUrl + "/latest-jobs");
      urls.push(baseUrl + "/admit-card");
      urls.push(baseUrl + "/results");
      urls.push(baseUrl + "/answer-key");
      urls.push(baseUrl + "/blog");
      const response = await fetch("https://api.indexnow.org/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          host: "sarkarijobseva.com",
          key: apiKey,
          keyLocation: "https://sarkarijobseva.com/sarkarijobseva2026indexnow.txt",
          urlList: urls.slice(0, 10000)
        })
      });
      res.json({ success: true, submitted: urls.length, status: response.status });
    } catch (error) {
      console.error("IndexNow error:", error);
      res.status(500).json({ error: "Failed to submit URLs" });
    }
  });


  // Manual notify route - send Telegram + Push for any post (admin only)
  app.post("/api/posts/:id/notify", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getPost(id);
      if (!post) return res.status(404).json({ error: "Post not found" });
      await notifyAllChannels(post, req);
      res.json({ success: true, message: "Notification sent to Telegram + Push!" });
    } catch (error) {
      console.error("Notify error:", error);
      res.status(500).json({ error: "Failed to send notification" });
    }
  });

  // ===== CLOUDINARY IMAGE GALLERY =====
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Upload image to Cloudinary (admin only)
  app.post("/api/upload-image", requireAuth, async (req, res) => {
    try {
      const { base64, filename, mimeType } = req.body;
      if (!base64) return res.status(400).json({ error: "base64 required" });
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (mimeType && !allowedTypes.includes(mimeType)) {
        return res.status(400).json({ error: "Only JPG, PNG, WebP, GIF allowed" });
      }
      const buffer = Buffer.from(base64, "base64");
      if (buffer.length > 5 * 1024 * 1024) {
        return res.status(400).json({ error: "Image too large. Max 5MB." });
      }
      const dataUri = `data:${mimeType || "image/jpeg"};base64,${base64}`;
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: "sarkarijobseva",
        resource_type: "image",
      });
      res.json({ url: result.secure_url, filename: result.public_id });
    } catch (error: any) {
      console.error("Cloudinary upload error:", error);
      res.status(500).json({ error: "Upload failed: " + (error.message || "unknown") });
    }
  });

  // Get gallery from Cloudinary (admin only)
  app.get("/api/image-gallery", requireAuth, async (req, res) => {
    try {
      const result = await cloudinary.api.resources({
        type: "upload",
        prefix: "sarkarijobseva/",
        max_results: 100,
        resource_type: "image",
      });
      const images = result.resources.map((r: any) => ({
        url: r.secure_url,
        filename: r.public_id,
      })).reverse();
      res.json(images);
    } catch (error: any) {
      console.error("Gallery fetch error:", error);
      res.status(500).json({ error: "Failed to fetch gallery" });
    }
  });

  // Delete image from Cloudinary (admin only)
  app.delete("/api/image-gallery/:filename(*)", requireAuth, async (req, res) => {
    try {
      const publicId = req.params.filename;
      await cloudinary.uploader.destroy(publicId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Delete failed" });
    }
  });

  return httpServer;
}
