import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { db } from "../db";
import { campaigns } from "@db/schema";
import { eq } from "drizzle-orm";
import { generateContent, optimizeSEO, generateImageSuggestions } from "./openai";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);

  // Content generation endpoint
  app.post("/api/content/generate", async (req, res) => {
    try {
      const params = req.body;
      const content = await generateContent(params);

      // Optionally optimize SEO
      let seoData = null;
      if (params.includeSEO && params.keywords) {
        const keywords = params.keywords.split(',').map((k: string) => k.trim());
        seoData = await optimizeSEO(content, keywords);
      }

      // Optionally generate image suggestions
      let imageSuggestions = null;
      if (params.includeImages) {
        imageSuggestions = await generateImageSuggestions(content);
      }

      res.json({
        content,
        seo: seoData,
        images: imageSuggestions
      });
    } catch (error) {
      console.error('Content generation error:', error);
      res.status(500).json({ error: 'Failed to generate content' });
    }
  });

  // Content publishing endpoint
  app.post("/api/content/publish", async (req, res) => {
    try {
      const { campaignId, title, content, status } = req.body;

      // Here you would integrate with WordPress API or your database
      // For now, we'll just return success
      res.json({
        success: true,
        message: `Content ${status === 'published' ? 'published' : 'saved as draft'}`,
        postId: Math.floor(Math.random() * 10000)
      });
    } catch (error) {
      console.error('Content publishing error:', error);
      res.status(500).json({ error: 'Failed to publish content' });
    }
  });

  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  return httpServer;
}