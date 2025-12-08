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
  // Free tier: Generate high-quality structured content
  if (provider === 'free' || !apiKey) {
    const mainKeyword = keywords[0] || 'el tema';
    const secondaryKeywords = keywords.slice(1, 4).join(', ') || 'aspectos relacionados';
    
    // Generate comprehensive HTML content
    return `<article>
<h1>Guía Completa: ${mainKeyword.charAt(0).toUpperCase() + mainKeyword.slice(1)}</h1>

<p class="lead">Esta guía completa cubre todo lo que necesitas saber sobre ${mainKeyword}. Aprenderás los conceptos fundamentales, el marco legal aplicable, y los pasos prácticos para proteger tus derechos e intereses.</p>

<h2>Introducción</h2>
<p>${mainKeyword.charAt(0).toUpperCase() + mainKeyword.slice(1)} es un tema crucial que afecta a muchas personas. En esta guía, exploraremos en detalle los aspectos más importantes relacionados con ${secondaryKeywords}.</p>

<h2>Aspectos Fundamentales</h2>
<p>Es esencial comprender los principios básicos de ${mainKeyword} para tomar decisiones informadas. Los elementos clave incluyen:</p>
<ul>
  <li>Comprensión del marco legal y regulatorio</li>
  <li>Derechos y obligaciones de las partes involucradas</li>
  <li>Procedimientos y plazos importantes</li>
  <li>Documentación necesaria y requisitos formales</li>
</ul>

<h2>Marco Legal y Regulatorio</h2>
<p>El marco legal que rige ${mainKeyword} se compone de múltiples fuentes de derecho, incluyendo legislación federal y estatal, jurisprudencia relevante, y regulaciones administrativas. Es fundamental conocer estos aspectos para navegar correctamente el proceso.</p>

<h2>Pasos Prácticos y Recomendaciones</h2>
<p>Para abordar efectivamente situaciones relacionadas con ${mainKeyword}, se recomienda seguir estos pasos:</p>
<ol>
  <li><strong>Evaluación inicial:</strong> Analiza tu situación específica y reúne toda la información relevante.</li>
  <li><strong>Documentación:</strong> Recopila y organiza todos los documentos necesarios de manera sistemática.</li>
  <li><strong>Asesoría profesional:</strong> Consulta con expertos calificados para obtener orientación personalizada.</li>
  <li><strong>Planificación estratégica:</strong> Desarrolla un plan de acción claro basado en tus objetivos.</li>
  <li><strong>Seguimiento:</strong> Mantén un registro detallado de todos los procedimientos y comunicaciones.</li>
</ol>

<h2>Errores Comunes a Evitar</h2>
<p>Al tratar con ${mainKeyword}, es importante evitar estos errores frecuentes:</p>
<ul>
  <li>No documentar adecuadamente los eventos y comunicaciones</li>
  <li>Perder plazos importantes o requisitos procedimentales</li>
  <li>Tomar decisiones sin asesoría profesional adecuada</li>
  <li>No comprender completamente tus derechos y opciones</li>
</ul>

<h2>Recursos Adicionales</h2>
<p>Para obtener más información sobre ${mainKeyword}, existen diversos recursos disponibles que pueden proporcionarte orientación adicional y apoyo especializado. Es recomendable consultar con profesionales calificados que puedan evaluar tu situación particular.</p>

<h2>Conclusión</h2>
<p>Entender ${mainKeyword} y sus implicaciones es fundamental para proteger tus derechos e intereses. Esta guía proporciona una base sólida de conocimiento, pero cada situación es única. No dudes en buscar asesoría profesional para asegurar el mejor resultado posible en tu caso específico.</p>
</article>`;
  }

  // OpenAI provider
  if (provider === 'openai') {
    try {
      const openai = new OpenAI({ apiKey });
      const systemPrompt = `Eres un experto escritor de contenido legal SEO-optimizado. Genera contenido HTML bien estructurado con:
- Título H1 principal
- Subtítulos H2 y H3 apropiados
- Párrafos bien formados con <p> tags
- Listas cuando sea apropiado
- Contenido profesional, preciso y bien investigado
- Tono profesional pero accesible
- Optimizado para las palabras clave proporcionadas`;

      const userPrompt = `${prompt}

Palabras clave a incluir naturalmente: ${keywords.join(', ')}
Longitud objetivo: aproximadamente ${wordCount} palabras
Formato: HTML (solo el contenido del artículo, sin tags <html>, <head> o <body>)

Genera un artículo completo, profesional y bien estructurado.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: Math.min(wordCount * 2, 4000)
      });
      
      const content = completion.choices[0].message.content || '';
      if (!content || content.trim().length === 0) {
        throw new Error('OpenAI returned empty content');
      }
      
      return content;
    } catch (error: any) {
      console.error('OpenAI generation error:', error);
      throw new Error(`Error con OpenAI: ${error.message}`);
    }
  }

  // Claude provider (placeholder for future implementation)
  if (provider === 'claude') {
    throw new Error('Claude integration coming soon');
  }

  return '';
}

function generateSEOMetadata(title: string, content: string, keywords: string[]) {
  // Extract plain text from HTML
  const plainText = content.replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Generate meta description (optimal length: 150-160 chars)
  let metaDescription = '';
  if (plainText.length > 160) {
    // Try to cut at sentence boundary
    const firstSentences = plainText.match(/^.{100,155}[.!?]/);
    if (firstSentences) {
      metaDescription = firstSentences[0];
    } else {
      metaDescription = plainText.substring(0, 155) + '...';
    }
  } else {
    metaDescription = plainText;
  }
  
  // Generate SEO-friendly slug
  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
    .substring(0, 80);
  
  // Calculate SEO score based on content quality
  let seoScore = 70; // Base score
  
  // Check title length (optimal: 50-60 chars)
  if (title.length >= 50 && title.length <= 60) {
    seoScore += 5;
  } else if (title.length >= 40 && title.length <= 70) {
    seoScore += 3;
  }
  
  // Check meta description length
  if (metaDescription.length >= 120 && metaDescription.length <= 160) {
    seoScore += 5;
  } else if (metaDescription.length >= 100 && metaDescription.length <= 170) {
    seoScore += 3;
  }
  
  // Check keyword presence in title
  const focusKeyword = keywords[0] || '';
  if (focusKeyword && title.toLowerCase().includes(focusKeyword.toLowerCase())) {
    seoScore += 5;
  }
  
  // Check content length (optimal: 1000+ words)
  const wordCount = plainText.split(/\s+/).length;
  if (wordCount >= 1200) {
    seoScore += 8;
  } else if (wordCount >= 800) {
    seoScore += 5;
  } else if (wordCount >= 500) {
    seoScore += 3;
  }
  
  // Check heading structure
  const h2Count = (content.match(/<h2/g) || []).length;
  const h3Count = (content.match(/<h3/g) || []).length;
  if (h2Count >= 3 && h2Count <= 8) {
    seoScore += 4;
  }
  if (h3Count >= 2) {
    seoScore += 2;
  }
  
  // Cap score at 100
  seoScore = Math.min(seoScore, 100);
  
  return {
    metaDescription,
    focusKeyword,
    slug,
    seoScore
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

  app.delete("/api/campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCampaign(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/generate-content", async (req, res) => {
    try {
      const userId = getUserId(req);
      
      // Verify user exists or create default user
      let user = await storage.getUser(userId);
      if (!user) {
        user = await storage.createUser({
          username: 'default-user',
          password: 'default-pass',
          email: 'default@example.com'
        });
      }
      
      const { campaignId, prompt, keywords, wordCount, aiProvider } = req.body;
      
      // Validation
      if (!prompt || prompt.trim().length === 0) {
        return res.status(400).json({ error: "Prompt requerido" });
      }

      const currentMonth = getCurrentMonth();
      let quota = await storage.getMonthlyQuota(userId, currentMonth);
      
      // Initialize quota if it doesn't exist
      if (!quota) {
        quota = await storage.createMonthlyQuota({
          userId,
          month: currentMonth,
          contentGenerated: 0,
          maxContent: 8
        });
      }
      
      // Check quota limit
      const currentCount = quota.contentGenerated ?? 0;
      const maxCount = quota.maxContent ?? 8;
      
      if (currentCount >= maxCount) {
        return res.status(403).json({ 
          error: "Límite mensual alcanzado",
          details: `Has generado ${currentCount}/${maxCount} contenidos este mes`
        });
      }

      let apiKey: string | undefined;
      if (aiProvider === 'openai' || aiProvider === 'claude') {
        const key = await storage.getApiKey(userId, aiProvider);
        apiKey = key?.keyValue;
        if (!apiKey && aiProvider !== 'free') {
          return res.status(400).json({ 
            error: `API key no configurada para ${aiProvider}`,
            details: "Por favor configura tu API key en Configuración"
          });
        }
      }

      const keywordList = keywords ? keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0) : [];
      const targetWordCount = wordCount && wordCount > 0 ? wordCount : 1200;
      
      // Generate content with AI
      const content = await generateWithAI(
        prompt, 
        keywordList, 
        targetWordCount, 
        aiProvider || 'free', 
        apiKey
      );
      
      const title = prompt.length > 60 ? prompt.substring(0, 60) + '...' : prompt;
      const seoData = generateSEOMetadata(title, content, keywordList);

      const savedContent = await storage.createGeneratedContent({
        title, 
        content, 
        slug: seoData.slug, 
        excerpt: seoData.metaDescription.substring(0, 200),
        keywords: keywords || '', 
        metaDescription: seoData.metaDescription, 
        focusKeyword: seoData.focusKeyword,
        seoScore: seoData.seoScore, 
        status: 'draft', 
        provider: aiProvider || 'free',
        userId, 
        campaignId: campaignId ? parseInt(campaignId) : null,
        metadata: { prompt, wordCount: targetWordCount, keywordCount: keywordList.length }
      });

      await storage.updateMonthlyQuota(userId, currentMonth, 1);
      
      res.json({ 
        content: savedContent, 
        seoMetadata: seoData,
        quota: {
          used: currentCount + 1,
          max: maxCount,
          remaining: maxCount - (currentCount + 1)
        }
      });
    } catch (error: any) {
      console.error('Error generating content:', error);
      res.status(500).json({ 
        error: error.message || 'Error al generar contenido',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  app.post("/api/bulk-generate", async (req, res) => {
    try {
      const userId = getUserId(req);
      
      // Verify user exists or create default user
      let user = await storage.getUser(userId);
      if (!user) {
        user = await storage.createUser({
          username: 'default-user',
          password: 'default-pass',
          email: 'default@example.com'
        });
      }
      
      const { topics, keywords, wordCount, aiProvider, campaignId } = req.body;
      
      // Validation
      if (!topics || !Array.isArray(topics) || topics.length === 0) {
        return res.status(400).json({ 
          error: "Topics requerido",
          details: "Debes proporcionar al menos un tema como array"
        });
      }

      const currentMonth = getCurrentMonth();
      let quota = await storage.getMonthlyQuota(userId, currentMonth);
      
      // Initialize quota if it doesn't exist
      if (!quota) {
        quota = await storage.createMonthlyQuota({
          userId,
          month: currentMonth,
          contentGenerated: 0,
          maxContent: 8
        });
      }
      
      const currentCount = quota.contentGenerated ?? 0;
      const maxCount = quota.maxContent ?? 8;
      const availableSlots = maxCount - currentCount;
      
      if (availableSlots <= 0) {
        return res.status(403).json({ 
          error: "Límite mensual alcanzado",
          details: `Has usado todos tus ${maxCount} contenidos este mes`
        });
      }

      // Filter and clean topics
      const cleanTopics = topics
        .map((t: string) => t.trim())
        .filter((t: string) => t.length > 0);
      
      const topicsToProcess = cleanTopics.slice(0, Math.min(cleanTopics.length, availableSlots));
      
      if (topicsToProcess.length === 0) {
        return res.status(400).json({ 
          error: "No hay temas válidos para procesar",
          details: "Asegúrate de proporcionar temas con contenido"
        });
      }

      // Check API key if needed
      let apiKey: string | undefined;
      if (aiProvider === 'openai' || aiProvider === 'claude') {
        const key = await storage.getApiKey(userId, aiProvider);
        apiKey = key?.keyValue;
        if (!apiKey) {
          return res.status(400).json({ 
            error: `API key no configurada para ${aiProvider}`,
            details: "Por favor configura tu API key en Configuración o usa el modo gratuito"
          });
        }
      }

      const results = [];
      const errors = [];
      const keywordList = keywords ? keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0) : [];
      const targetWordCount = wordCount && wordCount > 0 ? wordCount : 1200;

      // Process topics with error handling for each
      for (let i = 0; i < topicsToProcess.length; i++) {
        const topic = topicsToProcess[i];
        try {
          const prompt = `Escribe una guía completa y profesional sobre ${topic}. Incluye información relevante, bien estructurada y optimizada para SEO.`;
          const content = await generateWithAI(
            prompt, 
            keywordList, 
            targetWordCount, 
            aiProvider || 'free', 
            apiKey
          );
          
          const title = topic.length > 60 ? `${topic.substring(0, 57)}...` : topic;
          const seoData = generateSEOMetadata(title, content, keywordList);
          
          const saved = await storage.createGeneratedContent({
            title: `${title} - Guía Completa`,
            content, 
            slug: seoData.slug, 
            excerpt: seoData.metaDescription.substring(0, 200),
            keywords: keywords || '', 
            metaDescription: seoData.metaDescription, 
            focusKeyword: seoData.focusKeyword,
            seoScore: seoData.seoScore, 
            status: 'draft', 
            provider: aiProvider || 'free',
            featuredImage: `https://picsum.photos/seed/${Date.now() + i}/800/400`,
            userId, 
            campaignId: campaignId ? parseInt(campaignId) : null, 
            metadata: { topic, bulkGeneration: true, index: i + 1, totalInBatch: topicsToProcess.length }
          });
          
          await storage.updateMonthlyQuota(userId, currentMonth, 1);
          results.push(saved);
        } catch (error: any) {
          console.error(`Error processing topic "${topic}":`, error);
          errors.push({ topic, error: error.message });
        }
      }
      
      // Get updated quota
      const updatedQuota = await storage.getMonthlyQuota(userId, currentMonth);
      
      res.json({ 
        contents: results,
        summary: {
          requested: topicsToProcess.length,
          successful: results.length,
          failed: errors.length,
          errors: errors.length > 0 ? errors : undefined
        },
        quota: {
          used: updatedQuota?.contentGenerated ?? currentCount + results.length,
          max: maxCount,
          remaining: maxCount - ((updatedQuota?.contentGenerated ?? 0))
        }
      });
    } catch (error: any) {
      console.error('Error in bulk generation:', error);
      res.status(500).json({ 
        error: error.message || 'Error al generar contenido masivo',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
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

  // Installed Add-ons endpoints
  app.get("/api/installed-addons", async (req, res) => {
    try {
      const userId = getUserId(req);
      const addons = await storage.getInstalledAddons(userId);
      res.json(addons);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/install-addon", async (req, res) => {
    try {
      const userId = getUserId(req);
      const { addonId, addonName, category, config } = req.body;

      if (!addonId || !addonName || !category) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const addon = await storage.installAddon({
        userId,
        addonId,
        addonName,
        category,
        config: config || {},
        isActive: true
      });

      res.json(addon);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/uninstall-addon/:addonId", async (req, res) => {
    try {
      const userId = getUserId(req);
      const { addonId } = req.params;

      await storage.uninstallAddon(userId, addonId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/addon-used/:addonId", async (req, res) => {
    try {
      const userId = getUserId(req);
      const { addonId } = req.params;

      await storage.updateAddonLastUsed(userId, addonId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
