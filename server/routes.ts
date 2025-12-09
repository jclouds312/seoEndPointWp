import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch from 'node-fetch';
import { setupVite, serveStatic, log } from "./vite";
import { insertUser, getUser, getUserByUsername } from "../shared/db";
import { db } from "../shared/db";
import { generatedContent, campaigns, dataSources } from "../shared/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "./auth";
import { publishToWordPress, testWordPressConnection } from "./wordpress-api";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Content Manager endpoints
  app.get('/api/generated-content', async (_req, res) => {
    try {
      const contents = await db.select().from(generatedContent).orderBy(generatedContent.createdAt);
      res.json(contents);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/content/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(generatedContent).where(eq(generatedContent.id, id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/content/:id/publish', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.update(generatedContent)
        .set({ status: 'published', publishedAt: new Date() })
        .where(eq(generatedContent.id, id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // WordPress publishing endpoints
  app.post("/api/wordpress/publish", publishToWordPress);
  app.post("/api/wordpress/test-connection", testWordPressConnection);

  // Add WordPress publishing API endpoints
  app.post('/api/wordpress/publish', async (req, res) => {
    try {
      const { credentials, post, config } = req.body;

      if (!credentials?.siteUrl || !credentials?.username || !credentials?.applicationPassword) {
        return res.status(400).json({
          success: false,
          error: 'Missing WordPress credentials'
        });
      }

      const wpApiUrl = `${credentials.siteUrl}/wp-json/wp/v2/posts`;
      const auth = Buffer.from(`${credentials.username}:${credentials.applicationPassword}`).toString('base64');

      const postData = {
        title: post.title,
        content: post.content,
        status: config?.status || 'draft',
        excerpt: post.excerpt || '',
        slug: post.slug || post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        meta: post.meta || {}
      };

      const wpResponse = await fetch(wpApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
      });

      if (!wpResponse.ok) {
        const errorText = await wpResponse.text();
        throw new Error(`WordPress API error: ${wpResponse.status} - ${errorText}`);
      }

      const result = await wpResponse.json();

      res.json({
        success: true,
        postId: result.id,
        link: result.link,
        methodUsed: 'rest-api'
      });
    } catch (error: any) {
      console.error('WordPress publish error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Test WordPress connection
  app.post('/api/wordpress/test-connection', async (req, res) => {
    try {
      const { siteUrl, username, applicationPassword } = req.body;

      const wpApiUrl = `${siteUrl}/wp-json/wp/v2/users/me`;
      const auth = Buffer.from(`${username}:${applicationPassword}`).toString('base64');

      const wpResponse = await fetch(wpApiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        }
      });

      if (!wpResponse.ok) {
        const errorText = await wpResponse.text();
        return res.json({
          success: false,
          message: `Authentication failed: ${wpResponse.status}`
        });
      }

      const userData = await wpResponse.json();

      res.json({
        success: true,
        message: `Connected as ${userData.name} (${userData.roles.join(', ')})`
      });
    } catch (error: any) {
      res.json({
        success: false,
        message: error.message
      });
    }
  });

  // Save generated content
  app.post('/api/content/save', async (req, res) => {
    try {
      const { posts, userId, batchId, bulkType } = req.body;
      
      const insertedPosts = [];
      for (const post of posts) {
        const [inserted] = await db.insert(generatedContent).values({
          title: post.title,
          content: post.content,
          metaDescription: post.metaDescription,
          seoScore: post.seoScore,
          status: 'draft',
          userId: userId || null,
          batchId: batchId || null,
          bulkType: bulkType || 'bulk-massive',
          createdAt: new Date(),
          updatedAt: new Date()
        }).returning();
        insertedPosts.push(inserted);
      }
      
      res.json({ success: true, saved: insertedPosts.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Bulk Massive Generator with Google AI
  app.post('/api/bulk-massive/generate', async (req, res) => {
    try {
      const { mainKeyword, targetSite, count = 8, apiKey } = req.body;

      if (!apiKey) {
        return res.status(400).json({ error: 'API Key is required' });
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `Generate ${count} diverse, SEO-optimized blog post titles and meta descriptions about "${mainKeyword}" for a legal website targeting California personal injury cases.

Return ONLY a valid JSON array with this exact structure:
[
  {
    "title": "Article title here",
    "metaDescription": "Meta description here (120-160 chars)",
    "seoScore": 85
  }
]

Requirements:
- Each title should cover a different angle or sub-topic
- Include search intent variations (informational, commercial, local)
- Meta descriptions should be compelling and include target keywords
- SEO scores should be realistic (75-95 range)`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from AI response');
      }

      const titles = JSON.parse(jsonMatch[0]);

      const contents = await Promise.all(
        titles.slice(0, count).map(async (item: any, index: number) => {
          const contentPrompt = `Write a comprehensive, SEO-optimized blog post about "${item.title}" for a California personal injury law firm.

Target audience: Accident victims in California seeking legal help
Word count: ~1200 words
Tone: Professional, empathetic, authoritative

Structure:
- Introduction with hook
- Main sections with H2 headers
- Practical advice and actionable steps
- Conclusion with call to action

Include relevant keywords naturally. Format in clean HTML with proper <h2>, <p>, <ul>, <li> tags.

Return ONLY the HTML content without any markdown or code blocks.`;

          const contentResult = await model.generateContent(contentPrompt);
          const contentResponse = await contentResult.response;
          const content = contentResponse.text()
            .replace(/```html\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

          return {
            id: `bulk-${Date.now()}-${index}`,
            title: item.title,
            content: content,
            metaDescription: item.metaDescription,
            seoScore: item.seoScore || Math.floor(Math.random() * 15) + 80,
            status: 'draft'
          };
        })
      );

      res.json({
        success: true,
        generated: contents.length,
        contents
      });
    } catch (error: any) {
      console.error('Bulk generation error:', error);
      res.status(500).json({ error: error.message || 'Generation failed' });
    }
  });

  // Bulk content generation
  app.post('/api/bulk-generate', async (req, res) => {
    try {
      const { count, topics, keywords, wordCount, provider, apiKey } = req.body;

      if (provider === 'gemini' && !apiKey) {
        return res.status(400).json({ error: 'API Key is required for Gemini' });
      }

      const topicsArray = topics.split(',').map((t: string) => t.trim());
      const keywordsArray = keywords.split(',').map((k: string) => k.trim());

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const contents = await Promise.all(
        Array.from({ length: count }).map(async (_, i) => {
          const topic = topicsArray[i % topicsArray.length];
          const keyword = keywordsArray[i % keywordsArray.length];

          const prompt = `Escribe un artículo de blog profesional sobre "${topic}" optimizado para SEO con la palabra clave "${keyword}".

Longitud: ${wordCount} palabras aproximadamente
Formato: HTML limpio con etiquetas <h2>, <p>, <ul>, <li>

Incluye:
- Título atractivo y optimizado para SEO
- Meta descripción (120-160 caracteres)
- Introducción convincente
- 3-4 secciones principales con H2
- Consejos prácticos y accionables
- Conclusión con llamado a la acción

Devuelve SOLO un objeto JSON válido con esta estructura:
{
  "title": "Título del artículo",
  "content": "Contenido HTML completo",
  "metaDescription": "Meta descripción SEO",
  "seoScore": 85
}`;

          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text();

          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            throw new Error('Could not extract JSON from AI response');
          }

          const parsed = JSON.parse(jsonMatch[0]);

          return {
            id: `bulk-${Date.now()}-${i}`,
            title: parsed.title,
            content: parsed.content,
            metaDescription: parsed.metaDescription,
            seoScore: parsed.seoScore || Math.floor(Math.random() * 15) + 80,
            status: 'draft'
          };
        })
      );

      res.json({
        success: true,
        generated: contents.length,
        contents
      });
    } catch (error: any) {
      console.error('Bulk generation error:', error);
      res.status(500).json({ error: error.message || 'Generation failed' });
    }
  });

  // n8n Webhook Integration
  app.post('/api/n8n/trigger', async (req, res) => {
    try {
      const { webhookUrl, payload } = req.body;

      if (!webhookUrl) {
        return res.status(400).json({
          success: false,
          error: 'Webhook URL required'
        });
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      res.json({
        success: true,
        executionId: result.executionId || 'n8n-' + Date.now()
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return httpServer;
}