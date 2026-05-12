import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Cache static assets aggressively (JS/CSS/images have hashed filenames)
  app.use(express.static(distPath, {
    maxAge: "1y",
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      // HTML files - no cache (always fresh)
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Pragma", "no-cache");
      }
      // JS/CSS - long cache (vite adds content hash to filename)
      else if (filePath.match(/\.(js|css)$/)) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
      // Images/fonts - 30 days
      else if (filePath.match(/\.(png|jpg|jpeg|webp|svg|ico|woff|woff2|ttf)$/)) {
        res.setHeader("Cache-Control", "public, max-age=2592000");
      }
    },
  }));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
