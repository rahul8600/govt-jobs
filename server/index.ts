import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import MemoryStore from "memorystore";
import path from "path";
import fs from "fs";

// Environment logging at startup - Always treat as production for data handling
console.log('='.repeat(60));
console.log('[ENV] Server starting...');
console.log('[ENV] Mode: PRODUCTION (unified)');
console.log(`[ENV] DATABASE_URL: ${process.env.DATABASE_URL ? 'SET (masked)' : 'NOT SET - will retry on requests'}`);
console.log('='.repeat(60));

if (!process.env.DATABASE_URL) {
  console.warn('[WARN] DATABASE_URL is not set! Database operations will fail until configured.');
}

const MemoryStoreSession = MemoryStore(session);

const app = express();
const httpServer = createServer(app);

app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xFrameOptions: { action: "deny" },
  xContentTypeOptions: true,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
}));

// Block known bad bots and spam user-agents
app.use((req, res, next) => {
  const ua = req.headers["user-agent"] || "";
  const badBots = [
    "ahrefsbot", "semrushbot", "dotbot", "mj12bot", "blexbot",
    "petalbot", "sogou", "yandexbot", "baiduspider", "scrapy",
    "python-requests", "go-http-client", "libwww", "masscan",
    "zgrab", "nikto", "sqlmap", "nmap"
  ];
  if (badBots.some(bot => ua.toLowerCase().includes(bot))) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
});

// Block suspicious query patterns (SQL injection, XSS attempts)
app.use((req, res, next) => {
  const toCheck = req.url + JSON.stringify(req.query);
  const hasSqlInjection = /union[\s\+]+select/i.test(toCheck) || /exec[\s\+]+(s|x)p\w+/i.test(toCheck);
  const hasXss = /<script[\s>]/i.test(toCheck) || /javascript:/i.test(toCheck);
  const hasPathTraversal = /\.\.\//.test(toCheck);
  if (hasSqlInjection || hasXss || hasPathTraversal) {
    return res.status(400).json({ error: "Bad request" });
  }
  next();
});

// Strict rate limiter for API
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.startsWith("/uploads/"),
});

// Very strict for login - prevent brute force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many login attempts, please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// API specific limiter - tighter for write ops
const apiWriteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: "Slow down! Too many requests." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);
app.post("/api/auth/login", loginLimiter);
app.post("/api/posts", apiWriteLimiter);
app.post("/api/blogs", apiWriteLimiter);

app.use(session({
  secret: process.env.SESSION_SECRET || 'sarkari-admin-secret-key-2026',
  resave: false,
  saveUninitialized: false,
  store: new MemoryStoreSession({
    checkPeriod: 86400000
  }),
  cookie: {
    secure: true,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  }
}));

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    limit: "10mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false, limit: "10mb" }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Serve uploaded blog images
    const uploadsDir = path.join(process.cwd(), "uploads", "blog-images");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    app.use("/uploads/blog-images", express.static(uploadsDir));

    await registerRoutes(httpServer, app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = 'Internal Server Error';
      res.status(status).json({ error: message });
      console.error('[ERROR]', err.message);
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (process.env.NODE_ENV === "production") {
      serveStatic(app);
    } else {
      const { setupVite } = await import("./vite");
      await setupVite(httpServer, app);
    }

    // Use PORT from environment (required for deployment), fallback to 5000 for local dev
    const port = parseInt(process.env.PORT || "5000", 10);
    httpServer.listen(
      {
        port,
        host: "0.0.0.0",
        reusePort: true,
      },
      () => {
        log(`serving on port ${port}`);
      },
    );
  } catch (error) {
    console.error('[FATAL] Server failed to start:', error);
    // Don't exit - let the process manager handle restarts
  }
})();
