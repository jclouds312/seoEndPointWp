import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { Router } from "express";
import { z } from "zod";
import { generateContent, generateBulkContent, type ContentGenerationRequest } from "./openai";
import { generateContentWithClaude, generateWithClaude } from "./claude";
import { generateContentWithNoCostAI, generateWithNoCostAI } from "./no-cost-ai";

// In-memory storage for generated content (replace with database in production)
interface StoredContent {
  id: string;
  title: string;
  content: string;
  metaDescription: string;
  seoScore: number;
  keywords: string[];
  createdAt: Date;
  campaignId?: string;
  status: 'draft' | 'published';
}

const contentStore: StoredContent[] = [];
let contentIdCounter = 1;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const router = Router();

  // Health check
  router.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Get user's generated content
  router.get('/api/content', async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      const content = await storage.getGeneratedContent(userId);
      res.json(content);
    } catch (error) {
      console.error('Error fetching content:', error);
      res.status(500).json({ error: 'Failed to fetch content' });
    }
  });

  // Get monthly quota
  router.get('/api/quota/:userId/:month', async (req, res) => {
    try {
      const { userId, month } = req.params;
      const quota = await storage.getMonthlyQuota(userId, month);

      if (!quota) {
        return res.json({
          contentGenerated: 0,
          maxContent: 10,
          remaining: 10
        });
      }

      res.json({
        contentGenerated: quota.contentGenerated,
        maxContent: quota.maxContent,
        remaining: (quota.maxContent || 10) - (quota.contentGenerated || 0)
      });
    } catch (error) {
      console.error('Error fetching quota:', error);
      res.status(500).json({ error: 'Failed to fetch quota' });
    }
  });


  // Content Generation with OpenAI
  router.post("/api/generate-content", async (req, res) => {
    try {
      const schema = z.object({
        topic: z.string().min(1),
        keywords: z.array(z.string()),
        wordCount: z.number().min(300).max(3000),
        tone: z.string(),
        language: z.string().optional(),
      });

      const data = schema.parse(req.body);
      const result = await generateContent(data as ContentGenerationRequest);

      res.json(result);
    } catch (error: any) {
      console.error("Error generating content:", error);
      res.status(500).json({
        error: "Failed to generate content",
        message: error.message
      });
    }
  });

  // Bulk content generation
  router.post('/api/content/bulk-generate', async (req, res) => {
    try {
      const { count = 8, topics, keywords, tone, provider = 'openai', userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      // Check monthly quota
      const currentMonth = new Date().toISOString().slice(0, 7);
      const quota = await storage.getMonthlyQuota(userId, currentMonth);
      const remaining = quota ? (quota.maxContent || 10) - (quota.contentGenerated || 0) : 10;

      if (remaining < count) {
        return res.status(429).json({
          error: `Monthly quota exceeded. You have ${remaining} posts remaining this month.`
        });
      }

      const promises = Array.from({ length: count }).map(async (_, i) => {
        const topic = topics?.[i] || topics?.[0] || 'general topic';
        return await generateContent({
          topic,
          keywords: keywords?.split(',') || [],
          wordCount: 300,
          tone: tone || 'neutral',
          language: 'en'
        } as ContentGenerationRequest);
      });

      const results = await Promise.all(promises);

      // Save to database
      const savedContent = await Promise.all(
        results.map(async (item) => {
          const content = await storage.saveGeneratedContent({
            title: item.title,
            content: item.content,
            slug: item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            excerpt: item.content.substring(0, 160),
            keywords: keywords ? keywords.split(',') : [],
            metaDescription: item.content.substring(0, 160),
            focusKeyword: keywords?.split(',')[0] || '',
            seoScore: null,
            status: 'draft',
            provider: provider,
            userId: userId,
            campaignId: null,
            metadata: { topics, tone },
          });

          // Update quota
          await storage.updateMonthlyQuota(userId, currentMonth);

          return content;
        })
      );

      res.json({
        success: true,
        generated: savedContent.length,
        content: savedContent
      });
    } catch (error: any) {
      console.error("Error generating bulk content:", error);
      res.status(500).json({
        error: "Failed to generate bulk content",
        message: error.message
      });
    }
  });

  // Content Generation with Claude
  router.post("/api/generate-content-claude", async (req, res) => {
    try {
      const schema = z.object({
        topic: z.string().min(1),
        keywords: z.array(z.string()),
        wordCount: z.number().min(300).max(8000),
        tone: z.string(),
        language: z.string().optional(),
      });

      const data = schema.parse(req.body);
      const result = await generateContentWithClaude(
        data.topic,
        data.keywords,
        data.wordCount,
        data.tone,
        data.language
      );

      res.json(result);
    } catch (error: any) {
      console.error("Error generating content with Claude:", error);
      res.status(500).json({
        error: "Failed to generate content with Claude",
        message: error.message
      });
    }
  });

  router.post("/api/claude", async (req, res) => {
    try {
      const schema = z.object({
        messages: z.array(z.object({
          role: z.enum(['user', 'assistant']),
          content: z.string(),
        })),
        model: z.string().optional(),
        max_tokens: z.number().optional(),
        temperature: z.number().optional(),
        system: z.string().optional(),
      });

      const data = schema.parse(req.body);
      const result = await generateWithClaude(data);

      res.json({ content: result });
    } catch (error: any) {
      console.error("Error calling Claude API:", error);
      res.status(500).json({
        error: "Failed to call Claude API",
        message: error.message
      });
    }
  });

  // Content Generation with no-cost-ai (FREE)
  router.post("/api/generate-content-free", async (req, res) => {
    try {
      const schema = z.object({
        topic: z.string().min(1),
        keywords: z.array(z.string()),
        wordCount: z.number().min(300).max(8000),
        tone: z.string(),
        language: z.string().optional(),
        model: z.string().optional(),
      });

      const data = schema.parse(req.body);
      const result = await generateContentWithNoCostAI(
        data.topic,
        data.keywords,
        data.wordCount,
        data.tone,
        data.language,
        data.model
      );

      res.json(result);
    } catch (error: any) {
      console.error("Error generating content with no-cost-ai:", error);
      res.status(500).json({
        error: "Failed to generate content with no-cost-ai",
        message: error.message
      });
    }
  });

  router.post("/api/no-cost-ai", async (req, res) => {
    try {
      const schema = z.object({
        messages: z.array(z.object({
          role: z.enum(['system', 'user', 'assistant']),
          content: z.string(),
        })),
        model: z.string().optional(),
        max_tokens: z.number().optional(),
        temperature: z.number().optional(),
      });

      const data = schema.parse(req.body);
      const result = await generateWithNoCostAI(data);

      res.json({ content: result });
    } catch (error: any) {
      console.error("Error calling no-cost-ai API:", error);
      res.status(500).json({
        error: "Failed to call no-cost-ai API",
        message: error.message
      });
    }
  });

  // Save generated content
  router.post("/api/content/save", async (req, res) => {
    try {
      const schema = z.object({
        title: z.string(),
        content: z.string(),
        metaDescription: z.string(),
        seoScore: z.number(),
        keywords: z.array(z.string()),
        campaignId: z.string().optional(),
        status: z.enum(['draft', 'published']).default('draft'),
      });

      const data = schema.parse(req.body);

      const newContent: StoredContent = {
        id: `content_${contentIdCounter++}`,
        ...data,
        createdAt: new Date(),
      };

      contentStore.push(newContent);

      res.json({
        success: true,
        id: newContent.id,
        message: "Content saved successfully"
      });
    } catch (error: any) {
      console.error("Error saving content:", error);
      res.status(500).json({
        error: "Failed to save content",
        message: error.message
      });
    }
  });

  // Get all saved content
  router.get("/api/content/list", async (req, res) => {
    try {
      const { status, campaignId } = req.query;

      let filtered = [...contentStore];

      if (status) {
        filtered = filtered.filter(c => c.status === status);
      }

      if (campaignId) {
        filtered = filtered.filter(c => c.campaignId === campaignId);
      }

      // Sort by newest first
      filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      res.json({
        contents: filtered,
        total: filtered.length
      });
    } catch (error: any) {
      console.error("Error listing content:", error);
      res.status(500).json({
        error: "Failed to list content",
        message: error.message
      });
    }
  });

  // Get single content by ID
  router.get("/api/content/:id", async (req, res) => {
    try {
      const content = contentStore.find(c => c.id === req.params.id);

      if (!content) {
        return res.status(404).json({ error: "Content not found" });
      }

      res.json(content);
    } catch (error: any) {
      console.error("Error getting content:", error);
      res.status(500).json({
        error: "Failed to get content",
        message: error.message
      });
    }
  });

  // Update content status
  router.patch("/api/content/:id/status", async (req, res) => {
    try {
      const schema = z.object({
        status: z.enum(['draft', 'published']),
      });

      const data = schema.parse(req.body);
      const content = contentStore.find(c => c.id === req.params.id);

      if (!content) {
        return res.status(404).json({ error: "Content not found" });
      }

      content.status = data.status;

      res.json({
        success: true,
        message: "Content status updated"
      });
    } catch (error: any) {
      console.error("Error updating content status:", error);
      res.status(500).json({
        error: "Failed to update content status",
        message: error.message
      });
    }
  });

  // Delete content
  router.delete("/api/content/:id", async (req, res) => {
    try {
      const index = contentStore.findIndex(c => c.id === req.params.id);

      if (index === -1) {
        return res.status(404).json({ error: "Content not found" });
      }

      contentStore.splice(index, 1);

      res.json({
        success: true,
        message: "Content deleted successfully"
      });
    } catch (error: any) {
      console.error("Error deleting content:", error);
      res.status(500).json({
        error: "Failed to delete content",
        message: error.message
      });
    }
  });

  app.use(router);

  return httpServer;
}