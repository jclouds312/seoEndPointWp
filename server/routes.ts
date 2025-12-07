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

  // Streaming content generation endpoint
  app.post("/api/content/generate-stream", async (req, res) => {
    try {
      const params = req.body;

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const { generateContentStream } = await import('./openai');
      
      for await (const chunk of generateContentStream(params)) {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      console.error('Streaming generation error:', error);
      res.status(500).json({ error: 'Failed to stream content' });
    }
  });

  // Content refinement endpoint
  app.post("/api/content/refine", async (req, res) => {
    try {
      const { content, instructions, history } = req.body;
      const { refineContent } = await import('./openai');
      const refined = await refineContent(content, instructions, history);
      
      res.json({ content: refined });
    } catch (error) {
      console.error('Content refinement error:', error);
      res.status(500).json({ error: 'Failed to refine content' });
    }
  });

  // Image generation endpoint
  app.post("/api/images/generate", async (req, res) => {
    try {
      const params = req.body;
      const { generateImages } = await import('./openai');
      const imageUrls = await generateImages(params);
      
      res.json({ images: imageUrls });
    } catch (error) {
      console.error('Image generation error:', error);
      res.status(500).json({ error: 'Failed to generate images' });
    }
  });

  // Metadata generation endpoint
  app.post("/api/content/metadata", async (req, res) => {
    try {
      const { content, keywords } = req.body;
      const { generateMetadata } = await import('./openai');
      const metadata = await generateMetadata(content, keywords);
      
      res.json(metadata);
    } catch (error) {
      console.error('Metadata generation error:', error);
      res.status(500).json({ error: 'Failed to generate metadata' });
    }
  });

  // Batch content generation endpoint
  app.post("/api/content/batch-generate", async (req, res) => {
    try {
      const { topics, baseParams } = req.body;
      const { batchGenerateContent } = await import('./openai');
      const results = await batchGenerateContent(topics, baseParams);
      
      res.json({ results });
    } catch (error) {
      console.error('Batch generation error:', error);
      res.status(500).json({ error: 'Failed to batch generate content' });
    }
  });

  // API health check endpoint
  app.get("/api/openai/health", async (req, res) => {
    try {
      const { checkAPIHealth } = await import('./openai');
      const health = await checkAPIHealth();
      
      res.json(health);
    } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json({ healthy: false, error: 'Health check failed' });
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