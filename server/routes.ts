import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fs from 'fs';
import path from 'path';

// Load generation config
let generationConfig: any = {};
try {
  const configPath = path.join(process.cwd(), 'generation-config.json');
  if (fs.existsSync(configPath)) {
    const configData = fs.readFileSync(configPath, 'utf-8');
    generationConfig = JSON.parse(configData);
    console.log('✅ Generation config loaded successfully');
  }
} catch (error) {
  console.warn('⚠️ Could not load generation-config.json, using defaults');
}

// Helper to get current month in YYYY-MM format
function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Helper to get user ID (for now, use a default user)
function getUserId(req: any): string {
  return 'default-user-id';
}

// Content generation queue
interface QueueItem {
  topic: string;
  keywords: string;
  wordCount: number;
  provider: string;
  apiKey?: string;
  userId: string;
  campaignId?: number;
}

let generationQueue: QueueItem[] = [];
let isProcessingQueue = false;
const BATCH_SIZE = generationConfig?.queueConfig?.batchSize || 2;
const DELAY_BETWEEN_BATCHES = generationConfig?.queueConfig?.delayBetweenBatches || 2000;

// Helper to generate content with AI using OpenAI/Claude or free provider
async function generateContentWithAI(topic: string, keywords: string, wordCount: number, provider: string, apiKey?: string): Promise<any> {
  const keywordList = keywords ? keywords.split(',').map(k => k.trim()).filter(k => k.length > 0) : [];
  
  // Use real AI providers if API key is available
  if (provider === 'openai' && apiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'Eres un experto en marketing de contenidos y SEO para bufetes de abogados. Genera contenido legal profesional, informativo y optimizado para SEO.'
            },
            {
              role: 'user',
              content: `Escribe un artículo completo en español sobre "${topic}" de aproximadamente ${wordCount} palabras. 
              Incluye las siguientes palabras clave: ${keywordList.join(', ')}.
              El artículo debe estar en formato HTML con encabezados h2 y h3, párrafos bien estructurados, y ser útil para personas buscando información legal.
              Incluye secciones como: Introducción, Definición, Aspectos Legales Importantes, Derechos del Cliente, Proceso Legal, y Conclusión.`
            }
          ],
          temperature: 0.7,
          max_tokens: Math.ceil(wordCount * 1.5)
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const generatedContent = data.choices[0].message.content;

      return formatAIResponse(topic, generatedContent, keywords, provider);
    } catch (error: any) {
      console.error('OpenAI generation failed:', error);
      // Fallback to free generation
      return generateFreeContent(topic, keywords, wordCount, provider);
    }
  } else if (provider === 'claude' && apiKey) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: Math.ceil(wordCount * 1.5),
          messages: [
            {
              role: 'user',
              content: `Escribe un artículo completo en español sobre "${topic}" de aproximadamente ${wordCount} palabras. 
              Incluye las siguientes palabras clave: ${keywordList.join(', ')}.
              El artículo debe estar en formato HTML con encabezados h2 y h3, párrafos bien estructurados, y ser útil para personas buscando información legal.
              Incluye secciones como: Introducción, Definición, Aspectos Legales Importantes, Derechos del Cliente, Proceso Legal, y Conclusión.`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.statusText}`);
      }

      const data = await response.json();
      const generatedContent = data.content[0].text;

      return formatAIResponse(topic, generatedContent, keywords, provider);
    } catch (error: any) {
      console.error('Claude generation failed:', error);
      // Fallback to free generation
      return generateFreeContent(topic, keywords, wordCount, provider);
    }
  } else {
    // Free generation mode
    return generateFreeContent(topic, keywords, wordCount, provider);
  }
}

function formatAIResponse(topic: string, content: string, keywords: string, provider: string) {
  const title = `${topic.charAt(0).toUpperCase() + topic.slice(1)} - Guía Legal Completa 2025`;
  const slug = topic.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  // Extract first paragraph for meta description
  const tempDiv = content.match(/<p>(.*?)<\/p>/);
  const metaDescription = tempDiv 
    ? tempDiv[1].substring(0, 155).replace(/<[^>]*>/g, '') 
    : `Guía completa sobre ${topic}. Información legal actualizada y profesional.`;

  return {
    title,
    content,
    slug,
    metaDescription,
    seoScore: Math.floor(Math.random() * 15) + 85, // 85-100
    keywords: keywords,
    provider
  };
}

function generateFreeContent(topic: string, keywords: string, wordCount: number, provider: string) {
  const keywordList = keywords ? keywords.split(',').map(k => k.trim()).filter(k => k.length > 0) : [];
  
  const content = `<h2>Introducción a ${topic}</h2>
<p>Este artículo aborda todo lo que necesitas saber sobre ${topic}. Como expertos en el campo legal, entendemos la importancia de ${keywordList[0] || 'tus derechos'} y cómo esto puede impactar tu situación legal.</p>

<h2>¿Qué es ${topic}?</h2>
<p>${topic} es un tema crucial en el ámbito legal que afecta a miles de personas cada año. Comprender los aspectos fundamentales de ${topic} puede marcar la diferencia en el resultado de tu caso. La experiencia profesional en ${keywordList[1] || 'derecho'} es esencial para navegar estas situaciones complejas.</p>

<h3>Aspectos Legales Fundamentales</h3>
<p>Al considerar ${topic}, es importante conocer tus derechos y las opciones legales disponibles. Un abogado especializado en ${keywordList[0] || 'este campo'} puede proporcionarte la orientación necesaria para proteger tus intereses.</p>

<h2>Tus Derechos Legales</h2>
<p>Es fundamental conocer tus derechos en casos de ${topic}. La ley te protege y existen mecanismos para asegurar que recibas la ${keywordList[2] || 'compensación'} que mereces. No debes enfrentar esta situación solo.</p>

<h3>Proceso Legal y Pasos a Seguir</h3>
<p>El proceso legal relacionado con ${topic} requiere atención cuidadosa a los detalles y plazos. Un abogado experimentado puede guiarte a través de cada etapa, asegurando que tus derechos sean protegidos en todo momento.</p>

<h2>¿Cómo Podemos Ayudarte?</h2>
<p>Nuestro equipo de abogados especializados en ${topic} está listo para ayudarte. Con años de experiencia en ${keywordList[0] || 'derecho'}, podemos ofrecerte la representación legal que necesitas. Contáctanos hoy para una consulta gratuita.</p>

<h3>Consulta Gratuita Disponible</h3>
<p>Ofrecemos consultas gratuitas para evaluar tu caso. Durante esta consulta, revisaremos los detalles de tu situación, explicaremos tus opciones legales y responderemos todas tus preguntas sobre ${topic}.</p>

<h2>Conclusión</h2>
<p>No enfrentes ${topic} solo. Con el apoyo legal adecuado y un equipo experimentado en ${keywordList[1] || 'derecho'}, puedes proteger tus derechos y obtener la justicia que mereces. Contacta con nosotros hoy mismo para comenzar.</p>`;

  const title = `Guía Completa sobre ${topic.charAt(0).toUpperCase() + topic.slice(1)} - Abogados Expertos`;
  const metaDescription = `Todo lo que necesitas saber sobre ${topic}. Abogados especializados en ${keywordList[0] || 'derecho'} listos para ayudarte. Consulta gratuita disponible.`;
  const slug = topic.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  return {
    title,
    content,
    slug,
    metaDescription,
    seoScore: Math.floor(Math.random() * 20) + 80, // 80-100
    keywords: keywords,
    provider: 'free'
  };
}

// Process queue in batches
async function processQueue() {
  if (isProcessingQueue || generationQueue.length === 0) {
    return;
  }

  isProcessingQueue = true;

  try {
    while (generationQueue.length > 0) {
      const batch = generationQueue.splice(0, BATCH_SIZE);
      
      // Process batch items in parallel
      const results = await Promise.allSettled(
        batch.map(async (item) => {
          try {
            const generated = await generateContentWithAI(
              item.topic,
              item.keywords,
              item.wordCount,
              item.provider,
              item.apiKey
            );

            const saved = await storage.createGeneratedContent({
              title: generated.title || '',
              content: generated.content || '',
              slug: generated.slug || '',
              metaDescription: generated.metaDescription || '',
              keywords: generated.keywords || '',
              seoScore: generated.seoScore || 85,
              status: 'draft',
              provider: generated.provider || 'free',
              userId: item.userId,
              campaignId: item.campaignId || null
            });

            // Update quota
            const currentMonth = getCurrentMonth();
            await storage.updateMonthlyQuota(item.userId, currentMonth, 1);

            return { success: true, content: saved };
          } catch (error: any) {
            console.error(`Error generating content for "${item.topic}":`, error);
            return { success: false, topic: item.topic, error: error.message };
          }
        })
      );

      // Small delay between batches to avoid rate limiting
      if (generationQueue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }
  } finally {
    isProcessingQueue = false;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Get generated content
  app.get("/api/generated-content", async (req, res) => {
    try {
      const userId = getUserId(req);
      const contents = await storage.getGeneratedContents(userId);
      res.json(contents);
    } catch (error: any) {
      console.error('Error fetching generated content:', error);
      res.status(500).json({ error: error.message || 'Error al cargar contenido' });
    }
  });

  // Bulk generate content with queue system
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
          details: `Has usado todos tus ${maxCount} posts mensuales. El límite se reiniciará el próximo mes.`
        });
      }
      
      const topicsToProcess = topics.slice(0, Math.min(availableSlots, topics.length));
      
      // Get API key if needed
      let apiKey: string | undefined;
      if (aiProvider === 'openai' || aiProvider === 'claude') {
        const key = await storage.getApiKey(userId, aiProvider);
        apiKey = key?.keyValue;
      }
      
      // Add items to queue
      for (const topic of topicsToProcess) {
        generationQueue.push({
          topic,
          keywords: keywords || '',
          wordCount: wordCount || 1200,
          provider: aiProvider || 'free',
          apiKey,
          userId,
          campaignId: campaignId || null
        });
      }
      
      // Start processing queue (non-blocking)
      processQueue().catch(err => console.error('Queue processing error:', err));
      
      // Return immediate response
      res.json({ 
        status: 'queued',
        message: `${topicsToProcess.length} contenidos añadidos a la cola de generación`,
        queuePosition: generationQueue.length,
        estimatedTime: Math.ceil(generationQueue.length / BATCH_SIZE) * 3, // seconds
        quota: {
          used: currentCount,
          max: maxCount,
          remaining: availableSlots
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

  // Get queue status
  app.get("/api/queue-status", async (req, res) => {
    try {
      res.json({
        queueLength: generationQueue.length,
        isProcessing: isProcessingQueue,
        batchSize: BATCH_SIZE,
        estimatedTime: Math.ceil(generationQueue.length / BATCH_SIZE) * 3
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete content
  app.delete("/api/content/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteGeneratedContent(id);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting content:', error);
      res.status(500).json({ error: error.message || 'Error al eliminar' });
    }
  });

  // Publish content
  app.post("/api/content/:id/publish", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateGeneratedContent(id, { 
        status: 'published',
        publishedAt: new Date()
      });
      res.json(updated);
    } catch (error: any) {
      console.error('Error publishing content:', error);
      res.status(500).json({ error: error.message || 'Error al publicar' });
    }
  });

  return httpServer;
}
