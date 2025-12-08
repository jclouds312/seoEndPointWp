import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { Router } from "express";
import { z } from "zod";
import { generateContent, generateBulkContent, type ContentGenerationRequest } from "./openai";
import { generateContentWithClaude, generateWithClaude } from "./claude";
import { generateContentWithNoCostAI, generateWithNoCostAI } from "./no-cost-ai";

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

  // Generic Claude API endpoint
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

  // Generic no-cost-ai API endpoint
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


  app.use(router);

  return httpServer;
}