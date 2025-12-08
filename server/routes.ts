import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

// Helper to get current month in YYYY-MM format
function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Helper to get user ID (for now, use a default user)
function getUserId(req: any): string {
  return 'default-user-id';
}

// Helper to generate content with AI (mock for now)
async function generateContentWithAI(topic: string, keywords: string, wordCount: number, provider: string): Promise<any> {
  // Simulate AI generation delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const content = `<h2>Introducción a ${topic}</h2>
<p>Este artículo aborda todo lo que necesitas saber sobre ${topic}. Como expertos en el campo legal, entendemos la importancia de ${keywords.split(',')[0]?.trim() || 'tus derechos'}.</p>

<h2>¿Qué es ${topic}?</h2>
<p>${topic} es un tema crucial en el ámbito legal que afecta a miles de personas cada año. Comprender los aspectos fundamentales de ${topic} puede marcar la diferencia en el resultado de tu caso.</p>

<h2>Aspectos Importantes</h2>
<p>Al considerar ${topic}, debes tener en cuenta varios factores clave. La experiencia de un abogado especializado puede ayudarte a navegar este complejo proceso.</p>

<h2>Tus Derechos</h2>
<p>Es fundamental conocer tus derechos en casos de ${topic}. La ley te protege y existen mecanismos para asegurar que recibas la compensación que mereces.</p>

<h2>¿Cómo Podemos Ayudarte?</h2>
<p>Nuestro equipo de abogados especializados en ${topic} está listo para ayudarte. Contáctanos hoy para una consulta gratuita.</p>

<h2>Conclusión</h2>
<p>No enfrentes ${topic} solo. Con el apoyo legal adecuado, puedes proteger tus derechos y obtener la justicia que mereces.</p>`;

  const title = `Guía Completa sobre ${topic.charAt(0).toUpperCase() + topic.slice(1)} - Abogados Expertos`;
  const metaDescription = `Todo lo que necesitas saber sobre ${topic}. Abogados especializados listos para ayudarte. Consulta gratuita disponible.`;
  const slug = topic.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  return {
    title,
    content,
    slug,
    metaDescription,
    seoScore: Math.floor(Math.random() * 20) + 80, // 80-100
    keywords: keywords,
    provider
  };
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

  // Bulk generate content
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
      
      const results = [];
      const errors = [];
      
      for (const topic of topicsToProcess) {
        try {
          const generated = await generateContentWithAI(
            topic,
            keywords || '',
            wordCount || 1200,
            aiProvider || 'free'
          );
          
          const saved = await storage.createGeneratedContent({
            title: generated.title,
            content: generated.content,
            slug: generated.slug,
            metaDescription: generated.metaDescription,
            keywords: generated.keywords,
            seoScore: generated.seoScore,
            status: 'draft',
            provider: generated.provider,
            userId: userId,
            campaignId: campaignId || null
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
