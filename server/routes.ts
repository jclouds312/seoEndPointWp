import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { Router } from "express";
import { z } from "zod";
import { generateContent, generateBulkContent, type ContentGenerationRequest } from "./openai";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const router = Router();

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

  router.post("/api/generate-bulk-content", async (req, res) => {
    try {
      const schema = z.object({
        requests: z.array(z.object({
          topic: z.string().min(1),
          keywords: z.array(z.string()),
          wordCount: z.number().min(300).max(3000),
          tone: z.string(),
          language: z.string().optional(),
        }))
      });

      const data = schema.parse(req.body);
      const results = await generateBulkContent(data.requests as ContentGenerationRequest[]);

      res.json({ results, count: results.length });
    } catch (error: any) {
      console.error("Error generating bulk content:", error);
      res.status(500).json({
        error: "Failed to generate bulk content",
        message: error.message
      });
    }
  });

  app.use(router);

  return httpServer;
}