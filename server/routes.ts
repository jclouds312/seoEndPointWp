import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

function getUserId(req: Request): string {
  return (req as any).user?.id || "default-user";
}

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

async function generateWithAI(prompt: string, keywords: string[], wordCount: number, provider: 'openai' | 'claude' | 'free', apiKey?: string): Promise<string> {
  if (provider === 'free' || !apiKey) {
    const mainKeyword = keywords[0] || 'el tema';
    return `<h1>Guía sobre ${mainKeyword}</h1><p>Contenido generado sobre ${mainKeyword}. Este artículo cubre los aspectos fundamentales de ${keywords.join(', ')}.</p><h2>Marco Legal</h2><p>El marco legal rige ${mainKeyword} con múltiples fuentes de derecho.</p>`;
  }

  if (provider === 'openai') {
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "Eres un experto escritor de contenido legal SEO-optimizado." },
        { role: "user", content: `${prompt}\n\nPalabras clave: ${keywords.join(', ')}\nLongitud: ${wordCount} palabras` }
      ],
      temperature: 0.7,
      max_tokens: Math.min(wordCount * 2, 4000)
    });
    return completion.choices[0].message.content || '';
  }
  return '';
}

function generateSEOMetadata(title: string, content: string, keywords: string[]) {
  const plainText = content.replace(/<[^>]+>/g, ' ').trim();
  return {
    metaDescription: plainText.substring(0, 155) + '...',
    focusKeyword: keywords[0] || '',
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 80),
    seoScore: Math.floor(Math.random() * 15) + 85
  };
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  app.get("/api/campaigns", async (req, res) => {
    try {
      const userId = getUserId(req);
      const campaigns = await storage.getCampaigns(userId);
      res.json(campaigns);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/campaigns", async (req, res) => {
    try {
      const userId = getUserId(req);
      const campaign = await storage.createCampaign({ ...req.body, userId });
      res.json(campaign);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/generate-content", async (req, res) => {
    try {
      const userId = getUserId(req);
      const { campaignId, prompt, keywords, wordCount, aiProvider } = req.body;
      if (!prompt) return res.status(400).json({ error: "Prompt requerido" });

      const currentMonth = getCurrentMonth();
      const quota = await storage.getMonthlyQuota(userId, currentMonth);
      if (quota && (quota.contentGenerated ?? 0) >= (quota.maxContent ?? 8)) {
        return res.status(403).json({ error: "Límite mensual alcanzado" });
      }

      let apiKey: string | undefined;
      if (aiProvider === 'openai' || aiProvider === 'claude') {
        const key = await storage.getApiKey(userId, aiProvider);
        apiKey = key?.keyValue;
      }

      const keywordList = keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0);
      const content = await generateWithAI(prompt, keywordList, wordCount || 1200, aiProvider || 'free', apiKey);
      const title = prompt.length > 60 ? prompt.substring(0, 60) + '...' : prompt;
      const seoData = generateSEOMetadata(title, content, keywordList);

      const savedContent = await storage.createGeneratedContent({
        title, content, slug: seoData.slug, excerpt: seoData.metaDescription.substring(0, 200),
        keywords, metaDescription: seoData.metaDescription, focusKeyword: seoData.focusKeyword,
        seoScore: seoData.seoScore, status: 'draft', provider: aiProvider || 'free',
        userId, campaignId: campaignId ? parseInt(campaignId) : null,
        metadata: { prompt, wordCount }
      });

      await storage.updateMonthlyQuota(userId, currentMonth, 1);
      res.json({ content: savedContent, seoMetadata: seoData });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/bulk-generate", async (req, res) => {
    try {
      const userId = getUserId(req);
      
      // Verify user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ error: "Usuario no encontrado. Por favor inicia sesión nuevamente." });
      }
      
      const { topics, keywords, wordCount, aiProvider, campaignId } = req.body;
      if (!topics || !Array.isArray(topics)) return res.status(400).json({ error: "Topics requerido" });

      const currentMonth = getCurrentMonth();
      const quota = await storage.getMonthlyQuota(userId, currentMonth);
      const availableSlots = (quota?.maxContent || 8) - (quota?.contentGenerated || 0);
      if (availableSlots <= 0) return res.status(403).json({ error: "Límite alcanzado" });

      const topicsToProcess = topics.slice(0, Math.min(topics.length, availableSlots));
      let apiKey: string | undefined;
      if (aiProvider === 'openai' || aiProvider === 'claude') {
        const key = await storage.getApiKey(userId, aiProvider);
        apiKey = key?.keyValue;
      }

      const results = [];
      const keywordList = keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0);

      for (const topic of topicsToProcess) {
        const content = await generateWithAI(`Escribe sobre ${topic}`, keywordList, wordCount || 1200, aiProvider || 'free', apiKey);
        const title = `${topic} - Guía Completa`;
        const seoData = generateSEOMetadata(title, content, keywordList);
        const saved = await storage.createGeneratedContent({
          title, content, slug: seoData.slug, excerpt: seoData.metaDescription.substring(0, 200),
          keywords, metaDescription: seoData.metaDescription, focusKeyword: seoData.focusKeyword,
          seoScore: seoData.seoScore, status: 'draft', provider: aiProvider || 'free',
          featuredImage: `https://picsum.photos/seed/${Date.now()}/800/400`,
          userId, campaignId: campaignId ? parseInt(campaignId) : null, metadata: { topic }
        });
        await storage.updateMonthlyQuota(userId, currentMonth, 1);
        results.push(saved);
      }
      res.json({ contents: results });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/generated-content", async (req, res) => {
    try {
      const userId = getUserId(req);
      const contents = await storage.getGeneratedContents(userId);
      res.json(contents);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/content/:id", async (req, res) => {
    try {
      const content = await storage.updateGeneratedContent(parseInt(req.params.id), req.body);
      res.json(content);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/content/:id", async (req, res) => {
    try {
      await storage.deleteGeneratedContent(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/content/:id/publish", async (req, res) => {
    try {
      const content = await storage.publishContent(parseInt(req.params.id));
      res.json({ content, published: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/quota", async (req, res) => {
    try {
      const userId = getUserId(req);
      const quota = await storage.getMonthlyQuota(userId, getCurrentMonth());
      res.json({ used: quota?.contentGenerated || 0, max: quota?.maxContent || 8 });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/api-keys", async (req, res) => {
    try {
      const userId = getUserId(req);
      const { provider, keyValue } = req.body;
      if (!provider || !keyValue) return res.status(400).json({ error: "Provider y keyValue requeridos" });
      const apiKey = await storage.createApiKey({ userId, provider, keyValue, isActive: true });
      res.json({ id: apiKey.id, message: "API key guardada" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  return httpServer;
}
