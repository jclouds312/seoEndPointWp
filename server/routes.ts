import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { db } from "../db";
import { campaigns } from "@db/schema";
import { eq } from "drizzle-orm";
import { generateContent, optimizeSEO, generateImageSuggestions } from "./openai";
import WordPressDatabase from "./wordpress-db";
import JetpackIntegration from "./jetpack-integration";
import N8nIntegration from "./n8n-integration";
import WpSeoIntegration from "./wp-seo-integration";

// Inicializar conexión a WordPress y Jetpack
const jetpack = new JetpackIntegration({
  siteUrl: 'https://www.californiapersonalinjurylawyersblog.com',
  wpUsername: process.env.WP_USERNAME || 'walchlaw4',
  wpPassword: process.env.WP_PASSWORD || ''
});

// Inicializar conexión a wp-seo plugin
const wpSeo = new WpSeoIntegration({
  siteUrl: 'https://www.californiapersonalinjurylawyersblog.com',
  wpUsername: process.env.WP_USERNAME || 'walchlaw4',
  wpPassword: process.env.WP_PASSWORD || ''
});

// Inicializar conexión a n8n
const n8n = new N8nIntegration({
  baseUrl: process.env.N8N_BASE_URL || 'http://localhost:5678',
  apiKey: process.env.N8N_API_KEY || ''
});

// Inicializar conexión a WordPress DB
let wpDb: WordPressDatabase | null = null;

if (process.env.WORDPRESS_DB_URL) {
  wpDb = new WordPressDatabase(
    process.env.WORDPRESS_DB_URL,
    process.env.WP_TABLE_PREFIX || 'wp_'
  );
}

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

  // Content analysis endpoint
  app.post("/api/content/analyze", async (req, res) => {
    try {
      const { content, keywords } = req.body;
      const { analyzeContent } = await import('./openai');
      const analysis = await analyzeContent(content, keywords.split(',').map((k: string) => k.trim()));
      
      res.json(analysis);
    } catch (error) {
      console.error('Content analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze content' });
    }
  });

  // Keyword extraction endpoint
  app.post("/api/content/extract-keywords", async (req, res) => {
    try {
      const { content, topN = 10 } = req.body;
      const { extractKeywords } = await import('./openai');
      const keywords = await extractKeywords(content, topN);
      
      res.json({ keywords });
    } catch (error) {
      console.error('Keyword extraction error:', error);
      res.status(500).json({ error: 'Failed to extract keywords' });
    }
  });

  // Content variations for A/B testing
  app.post("/api/content/variations", async (req, res) => {
    try {
      const { prompt, keywords, variations = 3 } = req.body;
      const { generateContentVariations } = await import('./openai');
      const results = await generateContentVariations(prompt, keywords, variations);
      
      res.json({ variations: results });
    } catch (error) {
      console.error('Content variations error:', error);
      res.status(500).json({ error: 'Failed to generate variations' });
    }
  });

  // Content translation endpoint
  app.post("/api/content/translate", async (req, res) => {
    try {
      const { content, targetLanguages } = req.body;
      const { translateContent } = await import('./openai');
      const translations = await translateContent(content, targetLanguages);
      
      res.json({ translations });
    } catch (error) {
      console.error('Translation error:', error);
      res.status(500).json({ error: 'Failed to translate content' });
    }
  });

  // Enhanced SEO optimization with detailed metrics
  app.post("/api/content/seo-optimize", async (req, res) => {
    try {
      const { content, keywords } = req.body;
      const { optimizeSEO } = await import('./openai');
      const seoData = await optimizeSEO(content, keywords.split(',').map((k: string) => k.trim()));
      
      res.json(seoData);
    } catch (error) {
      console.error('SEO optimization error:', error);
      res.status(500).json({ error: 'Failed to optimize SEO' });
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

  // WordPress Database Integration Routes
  
  // Obtener posts de lesiones personales desde WordPress
  app.get("/api/wordpress/posts", async (req, res) => {
    try {
      if (!wpDb) {
        return res.status(503).json({ error: 'WordPress database not configured' });
      }

      const limit = parseInt(req.query.limit as string) || 50;
      const posts = await wpDb.getPersonalInjuryPosts(limit);
      
      res.json({ posts, count: posts.length });
    } catch (error) {
      console.error('WordPress posts fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch WordPress posts' });
    }
  });

  // Obtener datos SEO de Yoast para un post
  app.get("/api/wordpress/seo/:postId", async (req, res) => {
    try {
      if (!wpDb) {
        return res.status(503).json({ error: 'WordPress database not configured' });
      }

      const postId = parseInt(req.params.postId);
      const seoData = await wpDb.getYoastSEOData(postId);
      
      res.json(seoData);
    } catch (error) {
      console.error('Yoast SEO data fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch SEO data' });
    }
  });

  // Crear nuevo post en WordPress
  app.post("/api/wordpress/posts", async (req, res) => {
    try {
      if (!wpDb) {
        return res.status(503).json({ error: 'WordPress database not configured' });
      }

      const { title, content, status, author, type } = req.body;
      const postId = await wpDb.insertPost({ title, content, status, author, type });
      
      res.json({ success: true, postId });
    } catch (error) {
      console.error('WordPress post creation error:', error);
      res.status(500).json({ error: 'Failed to create post' });
    }
  });

  // Actualizar SEO de Yoast para un post
  app.put("/api/wordpress/seo/:postId", async (req, res) => {
    try {
      if (!wpDb) {
        return res.status(503).json({ error: 'WordPress database not configured' });
      }

      const postId = parseInt(req.params.postId);
      const seoData = req.body;
      
      await wpDb.updateYoastSEO(postId, seoData);
      
      res.json({ success: true, message: 'SEO data updated' });
    } catch (error) {
      console.error('Yoast SEO update error:', error);
      res.status(500).json({ error: 'Failed to update SEO data' });
    }
  });

  // Obtener posts que necesitan optimización SEO
  app.get("/api/wordpress/posts/needs-seo", async (req, res) => {
    try {
      if (!wpDb) {
        return res.status(503).json({ error: 'WordPress database not configured' });
      }

      const limit = parseInt(req.query.limit as string) || 20;
      const posts = await wpDb.getPostsNeedingSEO(limit);
      
      res.json({ posts, count: posts.length });
    } catch (error) {
      console.error('Posts needing SEO fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  });

  // Obtener categorías de lesiones personales
  app.get("/api/wordpress/categories", async (req, res) => {
    try {
      if (!wpDb) {
        return res.status(503).json({ error: 'WordPress database not configured' });
      }

      const categories = await wpDb.getPersonalInjuryCategories();
      
      res.json({ categories });
    } catch (error) {
      console.error('Categories fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  });

  // Jetpack Routes
  
  // Verificar estado de Jetpack
  app.get("/api/jetpack/status", async (req, res) => {
    try {
      const isActive = await jetpack.isJetpackActive();
      res.json({ active: isActive });
    } catch (error) {
      console.error('Jetpack status check error:', error);
      res.status(500).json({ error: 'Failed to check Jetpack status' });
    }
  });

  // Obtener estadísticas de Jetpack
  app.get("/api/jetpack/stats", async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const stats = await jetpack.getStats(days);
      res.json({ stats });
    } catch (error) {
      console.error('Jetpack stats error:', error);
      res.status(500).json({ error: 'Failed to fetch Jetpack stats' });
    }
  });

  // Compartir post en redes sociales
  app.post("/api/jetpack/share/:postId", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const { message } = req.body;
      
      const result = await jetpack.shareToSocial(postId, message);
      res.json({ success: true, result });
    } catch (error) {
      console.error('Jetpack share error:', error);
      res.status(500).json({ error: 'Failed to share post' });
    }
  });

  // Obtener conexiones de redes sociales
  app.get("/api/jetpack/social-connections", async (req, res) => {
    try {
      const connections = await jetpack.getSocialConnections();
      res.json({ connections });
    } catch (error) {
      console.error('Jetpack connections error:', error);
      res.status(500).json({ error: 'Failed to fetch social connections' });
    }
  });

  // Optimizar imagen con Jetpack CDN
  app.get("/api/jetpack/optimize-image", async (req, res) => {
    try {
      const imageUrl = req.query.url as string;
      const width = req.query.width ? parseInt(req.query.width as string) : undefined;
      const height = req.query.height ? parseInt(req.query.height as string) : undefined;

      if (!imageUrl) {
        return res.status(400).json({ error: 'Image URL required' });
      }

      const optimizedUrl = jetpack.getPhotonUrl(imageUrl, width, height);
      res.json({ optimizedUrl });
    } catch (error) {
      console.error('Image optimization error:', error);
      res.status(500).json({ error: 'Failed to optimize image' });
    }
  });

  // Análisis SEO de Jetpack
  app.get("/api/jetpack/seo/:postId", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const analysis = await jetpack.analyzeSEO(postId);
      res.json(analysis);
    } catch (error) {
      console.error('Jetpack SEO analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze SEO' });
    }
  });

  // Analizar uso de keywords
  app.get("/api/wordpress/analyze-keyword", async (req, res) => {
    try {
      if (!wpDb) {
        return res.status(503).json({ error: 'WordPress database not configured' });
      }

      const keyword = req.query.keyword as string;
      if (!keyword) {
        return res.status(400).json({ error: 'Keyword parameter required' });
      }

      const analysis = await wpDb.analyzeKeywordUsage(keyword);
      
      res.json({ keyword, results: analysis });
    } catch (error) {
      console.error('Keyword analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze keyword' });
    }
  });

  // Test de conexión a WordPress DB
  app.get("/api/wordpress/health", async (req, res) => {
    try {
      if (!wpDb) {
        return res.json({ 
          connected: false, 
          message: 'WordPress database not configured. Set WORDPRESS_DB_URL environment variable.' 
        });
      }

      const isConnected = await wpDb.testConnection();
      
      res.json({ 
        connected: isConnected,
        message: isConnected ? 'WordPress database connected' : 'Connection failed'
      });
    } catch (error) {
      console.error('WordPress DB health check error:', error);
      res.status(500).json({ connected: false, error: 'Health check failed' });
    }
  });

  // n8n Integration Routes
  
  // Obtener todos los workflows
  app.get("/api/n8n/workflows", async (req, res) => {
    try {
      const workflows = await n8n.getWorkflows();
      res.json({ workflows });
    } catch (error) {
      console.error('n8n workflows fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch workflows' });
    }
  });

  // Obtener un workflow específico
  app.get("/api/n8n/workflows/:id", async (req, res) => {
    try {
      const workflow = await n8n.getWorkflow(req.params.id);
      res.json(workflow);
    } catch (error) {
      console.error('n8n workflow fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch workflow' });
    }
  });

  // Crear nuevo workflow
  app.post("/api/n8n/workflows", async (req, res) => {
    try {
      const workflow = await n8n.createWorkflow(req.body);
      res.json(workflow);
    } catch (error) {
      console.error('n8n workflow creation error:', error);
      res.status(500).json({ error: 'Failed to create workflow' });
    }
  });

  // Actualizar workflow
  app.put("/api/n8n/workflows/:id", async (req, res) => {
    try {
      const workflow = await n8n.updateWorkflow(req.params.id, req.body);
      res.json(workflow);
    } catch (error) {
      console.error('n8n workflow update error:', error);
      res.status(500).json({ error: 'Failed to update workflow' });
    }
  });

  // Eliminar workflow
  app.delete("/api/n8n/workflows/:id", async (req, res) => {
    try {
      await n8n.deleteWorkflow(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('n8n workflow deletion error:', error);
      res.status(500).json({ error: 'Failed to delete workflow' });
    }
  });

  // Activar workflow
  app.post("/api/n8n/workflows/:id/activate", async (req, res) => {
    try {
      const workflow = await n8n.activateWorkflow(req.params.id);
      res.json(workflow);
    } catch (error) {
      console.error('n8n workflow activation error:', error);
      res.status(500).json({ error: 'Failed to activate workflow' });
    }
  });

  // Desactivar workflow
  app.post("/api/n8n/workflows/:id/deactivate", async (req, res) => {
    try {
      const workflow = await n8n.deactivateWorkflow(req.params.id);
      res.json(workflow);
    } catch (error) {
      console.error('n8n workflow deactivation error:', error);
      res.status(500).json({ error: 'Failed to deactivate workflow' });
    }
  });

  // Ejecutar workflow manualmente
  app.post("/api/n8n/workflows/:id/execute", async (req, res) => {
    try {
      const execution = await n8n.executeWorkflow(req.params.id, req.body.data);
      res.json(execution);
    } catch (error) {
      console.error('n8n workflow execution error:', error);
      res.status(500).json({ error: 'Failed to execute workflow' });
    }
  });

  // Obtener ejecuciones
  app.get("/api/n8n/executions", async (req, res) => {
    try {
      const workflowId = req.query.workflowId as string | undefined;
      const executions = await n8n.getExecutions(workflowId);
      res.json({ executions });
    } catch (error) {
      console.error('n8n executions fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch executions' });
    }
  });

  // Crear workflow de sincronización Yoast
  app.post("/api/n8n/workflows/templates/yoast-sync", async (req, res) => {
    try {
      const { siteUrl } = req.body;
      const workflow = await n8n.createYoastSyncWorkflow(
        siteUrl || 'https://www.californiapersonalinjurylawyersblog.com'
      );
      res.json(workflow);
    } catch (error) {
      console.error('Yoast sync workflow creation error:', error);
      res.status(500).json({ error: 'Failed to create Yoast sync workflow' });
    }
  });

  // Crear workflow de generación de contenido
  app.post("/api/n8n/workflows/templates/content-generation", async (req, res) => {
    try {
      const workflow = await n8n.createContentGenerationWorkflow(
        process.env.OPENAI_API_KEY || ''
      );
      res.json(workflow);
    } catch (error) {
      console.error('Content generation workflow creation error:', error);
      res.status(500).json({ error: 'Failed to create content generation workflow' });
    }
  });

  // Crear workflow de análisis de keywords
  app.post("/api/n8n/workflows/templates/keyword-analysis", async (req, res) => {
    try {
      const workflow = await n8n.createKeywordAnalysisWorkflow();
      res.json(workflow);
    } catch (error) {
      console.error('Keyword analysis workflow creation error:', error);
      res.status(500).json({ error: 'Failed to create keyword analysis workflow' });
    }
  });

  // Health check de n8n
  app.get("/api/n8n/health", async (req, res) => {
    try {
      const healthy = await n8n.checkHealth();
      res.json({ 
        healthy, 
        message: healthy ? 'n8n is connected' : 'n8n connection failed',
        baseUrl: process.env.N8N_BASE_URL || 'http://localhost:5678'
      });
    } catch (error) {
      console.error('n8n health check error:', error);
      res.status(500).json({ healthy: false, error: 'Health check failed' });
    }
  });

  // wp-seo Integration Routes

  // Obtener metadata SEO de un post
  app.get("/api/wp-seo/posts/:postId/seo", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const seoData = await wpSeo.getPostSEO(postId);
      res.json(seoData);
    } catch (error) {
      console.error('wp-seo get post SEO error:', error);
      res.status(500).json({ error: 'Failed to fetch post SEO data' });
    }
  });

  // Actualizar metadata SEO de un post
  app.put("/api/wp-seo/posts/:postId/seo", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      await wpSeo.updatePostSEO(postId, req.body);
      res.json({ success: true, message: 'SEO data updated successfully' });
    } catch (error) {
      console.error('wp-seo update post SEO error:', error);
      res.status(500).json({ error: 'Failed to update post SEO data' });
    }
  });

  // Analizar SEO de un post
  app.get("/api/wp-seo/posts/:postId/analyze", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const analysis = await wpSeo.analyzeSEO(postId);
      res.json(analysis);
    } catch (error) {
      console.error('wp-seo analyze error:', error);
      res.status(500).json({ error: 'Failed to analyze post SEO' });
    }
  });

  // Generar schema.org markup
  app.post("/api/wp-seo/posts/:postId/schema", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const { schemaType } = req.body;
      const schema = await wpSeo.generateSchema(postId, schemaType);
      res.json(schema);
    } catch (error) {
      console.error('wp-seo schema generation error:', error);
      res.status(500).json({ error: 'Failed to generate schema' });
    }
  });

  // Obtener posts con SEO incompleto
  app.get("/api/wp-seo/posts/incomplete", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const posts = await wpSeo.getPostsWithIncompleteSEO(limit);
      res.json({ posts, count: posts.length });
    } catch (error) {
      console.error('wp-seo incomplete posts error:', error);
      res.status(500).json({ error: 'Failed to fetch posts with incomplete SEO' });
    }
  });

  // Validar configuración SEO del sitio
  app.get("/api/wp-seo/settings/validate", async (req, res) => {
    try {
      const validation = await wpSeo.validateSiteConfiguration();
      res.json(validation);
    } catch (error) {
      console.error('wp-seo validation error:', error);
      res.status(500).json({ error: 'Failed to validate site configuration' });
    }
  });

  // Obtener sugerencias de mejora SEO
  app.get("/api/wp-seo/posts/:postId/suggestions", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const suggestions = await wpSeo.getSEOSuggestions(postId);
      res.json({ suggestions });
    } catch (error) {
      console.error('wp-seo suggestions error:', error);
      res.status(500).json({ error: 'Failed to get SEO suggestions' });
    }
  });

  // Exportar datos SEO
  app.get("/api/wp-seo/export", async (req, res) => {
    try {
      const data = await wpSeo.exportAllSEOData();
      res.json({ data, count: data.length });
    } catch (error) {
      console.error('wp-seo export error:', error);
      res.status(500).json({ error: 'Failed to export SEO data' });
    }
  });

  // Importar datos SEO en batch
  app.post("/api/wp-seo/import", async (req, res) => {
    try {
      const { posts } = req.body;
      await wpSeo.importSEOData(posts);
      res.json({ success: true, message: `Imported SEO data for ${posts.length} posts` });
    } catch (error) {
      console.error('wp-seo import error:', error);
      res.status(500).json({ error: 'Failed to import SEO data' });
    }
  });

  // Health check de wp-seo
  app.get("/api/wp-seo/health", async (req, res) => {
    try {
      const connected = await wpSeo.checkConnection();
      res.json({ 
        connected, 
        message: connected ? 'wp-seo plugin is accessible' : 'wp-seo connection failed'
      });
    } catch (error) {
      console.error('wp-seo health check error:', error);
      res.status(500).json({ connected: false, error: 'Health check failed' });
    }
  });

  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  return httpServer;
}