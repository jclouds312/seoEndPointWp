import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch from 'node-fetch';
import { setupVite } from "./vite";
import { publishToWordPress, testWordPressConnection } from "./wordpress-api";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get('/api/generated-content', async (_req, res) => {
    try {
      const contents = await storage.getContent();
      res.json(contents);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/content/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteContent(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/content/:id/publish', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.updateContent(id, { status: 'published', publishedAt: new Date() });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/wordpress/publish", publishToWordPress);
  app.post("/api/wordpress/test-connection", testWordPressConnection);

  app.post('/api/content/save', async (req, res) => {
    try {
      const { posts, userId, batchId, bulkType } = req.body;
      const insertedPosts = [];
      for (const post of posts) {
        const inserted = await storage.createContent({
          title: post.title,
          content: post.content,
          metaDescription: post.metaDescription,
          seoScore: post.seoScore,
          status: 'draft',
          userId: userId || null,
          batchId: batchId || null,
          bulkType: bulkType || 'bulk-massive',
          slug: post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        });
        insertedPosts.push(inserted);
      }
      res.json({ success: true, saved: insertedPosts.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/bulk-massive/generate', async (req, res) => {
    try {
      const { mainKeyword, count = 8, apiKey } = req.body;
      if (!apiKey) return res.status(400).json({ error: 'API Key is required' });
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Generate ${count} diverse, SEO-optimized blog post titles and meta descriptions about "${mainKeyword}" for a legal website targeting California personal injury cases. Return ONLY a valid JSON array.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const jsonMatch = response.text().match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('Could not extract JSON from AI response');
      const titles = JSON.parse(jsonMatch[0]);
      const contents = titles.slice(0, count).map((item: any, index: number) => ({
        id: `bulk-${Date.now()}-${index}`,
        title: item.title,
        content: "<p>Sample AI generated content...</p>",
        metaDescription: item.metaDescription,
        seoScore: item.seoScore || 85,
        status: 'draft'
      }));
      res.json({ success: true, generated: contents.length, contents });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Generation failed' });
    }
  });

  return httpServer;
}
