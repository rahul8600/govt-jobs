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
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
        disable_web_page_preview: false,
      }),
    });
    console.log("Telegram notification sent!");
  } catch (err) {
    console.error("Telegram send error:", err);
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
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
  // Cache helper for public APIs
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
      
      const { type, qualification, state, page, limit } = req.query;
      
      const pageNum = page ? parseInt(page as string) || 1 : 1;
      const limitNum = limit ? parseInt(limit as string) || 500 : 500;
      
      if (qualification || state || type) {
        const filters: { type?: string; qualification?: string; state?: string } = {};
        if (type && typeof type === 'string') filters.type = type;
        if (qualification && typeof qualification === 'string') filters.qualification = qualification;
        if (state && typeof state === 'string') filters.state = state;
        const posts = await storage.getFilteredPosts(filters, pageNum, limitNum);
        return res.json(posts);
      }
      
      const posts = await storage.getAllPosts(pageNum, limitNum);
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

      // Auto-post to Telegram
      try {
        const postUrl = `https://sarkarijobseva.com/job/${post.slug || post.id}`;
        const typeEmoji: Record<string, string> = {
          job: "💼", "admit-card": "🎫", result: "📊", "answer-key": "🔑", admission: "🎓"
        };
        const emoji = typeEmoji[post.type] || "📢";
        const typeLabel: Record<string, string> = {
          job: "New Job", "admit-card": "Admit Card", result: "Result Out", "answer-key": "Answer Key", admission: "Admission"
        };
        const label = typeLabel[post.type] || "New Post";
        const msg = `${emoji} <b>${label}!</b>

📋 <b>${post.title}</b>

🏢 ${post.organization || ""}
📅 Last Date: ${post.lastDate || "N/A"}
👥 Posts: ${post.totalPost || "N/A"}
🎓 Qualification: ${post.qualification || "N/A"}

🔗 <a href="${postUrl}">Full Details & Apply</a>

🌐 SarkariJobSeva.com
📲 Join: https://t.me/sarkarijobse`;
        sendTelegramMessage(msg).catch(console.error);
      } catch(e) { console.error("Telegram job notify error:", e); }

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
  const { Pool } = await import('pg').then(m => m.default || m);
  const blogPool = new Pool({ connectionString: process.env.DATABASE_URL });

  // Get all published blogs
  app.get('/api/blogs', async (req, res) => {
    setPublicCache(res, 120);
    try {
      const result = await blogPool.query('SELECT id, title, slug, excerpt, image_url, category, tags, author, views, featured, created_at FROM blogs WHERE published = true ORDER BY created_at DESC');
      res.json(result.rows || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      res.status(500).json({ error: 'Failed to fetch blogs' });
    }
  });

  // Get single blog by slug
  app.get('/api/blogs/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      await blogPool.query('UPDATE blogs SET views = views + 1 WHERE slug = $1', [slug]);
      const result = await blogPool.query('SELECT * FROM blogs WHERE slug = $1 AND published = true', [slug]);
      if (!result.rows || result.rows.length === 0) return res.status(404).json({ error: 'Blog not found' });
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch blog' });
    }
  });

  // Create blog (admin only)
  app.post('/api/blogs', requireAuth, async (req, res) => {
    try {
      const { title, content, excerpt, image_url, category, tags, featured, published } = req.body;
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '-' + Date.now();
      const result = await blogPool.query(
        'INSERT INTO blogs (title, slug, content, excerpt, image_url, category, tags, featured, published) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
        [title, slug, content || '', excerpt || '', image_url || '', category || 'job', tags || '', featured || false, published !== false]
      );
      const blog = result.rows[0];
      res.json(blog);

      // Auto-post to Telegram
      const siteUrl = `${req.protocol}://${req.get('host')}`;
      const blogUrl = `https://sarkarijobseva.com/blog/${blog.slug}`;
      const telegramMsg = `📢 <b>New Blog Post!</b>

📝 <b>${blog.title}</b>

${blog.excerpt ? blog.excerpt.substring(0, 200) + '...' : ''}

🔗 <a href="${blogUrl}">Read More</a>

🌐 SarkariJobSeva.com
📲 Join: https://t.me/sarkarijobse`;
      sendTelegramMessage(telegramMsg).catch(console.error);

    } catch (error) {
      console.error('Error creating blog:', error);
      res.status(500).json({ error: 'Failed to create blog' });
    }
  });

  // Update blog (admin only)
  app.put('/api/blogs/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { title, content, excerpt, image_url, category, tags, featured, published } = req.body;
      const result = await blogPool.query(
        'UPDATE blogs SET title=$1, content=$2, excerpt=$3, image_url=$4, category=$5, tags=$6, featured=$7, published=$8, updated_at=NOW() WHERE id=$9 RETURNING *',
        [title, content || '', excerpt || '', image_url || '', category || 'job', tags || '', featured || false, published !== false, id]
      );
      res.json(result.rows[0]);
    } catch (error) {
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
      const result = await blogPool.query('SELECT * FROM blogs ORDER BY created_at DESC');
      res.json(result.rows || []);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch blogs' });
    }
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
Disallow: /admin
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`);
  });

  // sitemap.xml
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const posts = await storage.getAllPosts();
      
      const staticPages = [
        { loc: '/', priority: '1.0', changefreq: 'daily' },
        { loc: '/latest-jobs', priority: '0.9', changefreq: 'daily' },
        { loc: '/admit-card', priority: '0.9', changefreq: 'daily' },
        { loc: '/results', priority: '0.9', changefreq: 'daily' },
        { loc: '/answer-key', priority: '0.8', changefreq: 'daily' },
        { loc: '/admission', priority: '0.8', changefreq: 'daily' },
        { loc: '/search', priority: '0.7', changefreq: 'weekly' },
        { loc: '/disclaimer', priority: '0.3', changefreq: 'monthly' },
        { loc: '/privacy-policy', priority: '0.3', changefreq: 'monthly' },
        { loc: '/terms-of-service', priority: '0.3', changefreq: 'monthly' },
      ];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
      
      for (const page of staticPages) {
        xml += `  <url>
    <loc>${baseUrl}${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
      }

      for (const post of posts) {
        const slug = post.slug || post.id;
        const lastmod = post.createdAt ? new Date(post.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        xml += `  <url>
    <loc>${baseUrl}/job/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
      }

      // Blog pages sitemap
      const blogs = await storage.getAllBlogs();
      for (const blog of blogs) {
        const slug = blog.slug || blog.id;
        const lastmod = blog.createdAt ? new Date(blog.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        xml += `  <url>
    <loc>${baseUrl}/blog/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      }

      xml += `</urlset>`;

      res.type('application/xml');
      res.send(xml);
    } catch (error) {
      console.error("Error generating sitemap:", error);
      res.status(500).send('Error generating sitemap');
    }
  });


  // ===== IMAGE GALLERY ROUTES =====
  const UPLOAD_DIR = path.join(process.cwd(), "uploads", "blog-images");

  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }

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
