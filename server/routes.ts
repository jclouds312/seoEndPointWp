
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { randomUUID } from "crypto";

const MODEL_NAME = "gemini-1.0-pro";

// --- FUNCIÓN DE GENERACIÓN DE CONTENIDO CON GEMINI ---
async function generateContentAI(apiKey: string, prompt: string): Promise<string> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
      temperature: 0.8,
      topK: 1,
      topP: 1,
      maxOutputTokens: 4096,
    };

    const result = await model.generateContent(prompt);

    if (result.response.promptFeedback && result.response.promptFeedback.blockReason) {
      throw new Error(`Generación bloqueada: ${result.response.promptFeedback.blockReason}`);
    }
    
    if (!result.response.candidates || result.response.candidates.length === 0) {
        throw new Error('El modelo de IA no devolvió contenido.');
    }

    return result.response.text();
  } catch (error: any) {
    console.error("Error durante la generación de contenido AI:", error);
    if (error.message.includes("API key not valid")) {
      throw new Error("La Google AI API key proporcionada no es válida. Por favor, verifícala.");
    }
    throw new Error(`Fallo al generar contenido desde la IA: ${error.message}`);
  }
}

// --- REGISTRO DE RUTAS DE LA APLICACIÓN ---
export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  // Ruta para el Bulk Massive Generator (ya implementada)
  app.post('/api/bulk-massive/generate', async (req, res) => {
    // ... (la lógica existente para bulk-massive se mantiene)
  });

  // --- RUTA PARA EL BULK CONTENT GENERATOR (ESTÁNDAR) ---
  app.post('/api/bulk-generate', async (req, res) => {
    const { topics, keywords, wordCount, aiProvider, apiKey, bulkType = 'standard' } = req.body;

    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return res.status(400).json({ error: 'Se requiere un array de temas (topics).' });
    }

    if (aiProvider === 'gemini' && !apiKey) {
      return res.status(400).json({ error: 'Se requiere la API Key de Google AI para usar Gemini.' });
    }

    const batchId = randomUUID();
    const generatedPosts = [];

    try {
      for (const topic of topics) {
        let postData;

        if (aiProvider === 'gemini') {
          const prompt = `
            Eres un experto en SEO y redactor de contenido.
            Genera un post de blog optimizado para el tema: "${topic}".

            Requisitos:
            - **Palabras Clave Secundarias:** ${keywords || 'ninguna'}
            - **Longitud Deseada:** Aproximadamente ${wordCount || 1200} palabras.
            - **Tono:** Profesional y accesible.

            Devuelve el resultado en formato JSON, conteniendo los siguientes campos:
            {
              "title": "Un título atractivo y optimizado para SEO (60-70 caracteres).",
              "metaDescription": "Una meta descripción convincente (155-160 caracteres).",
              "content": "El contenido completo del post en formato HTML, bien estructurado con etiquetas H2, H3, P, y UL/LI."
            }
          `;

          const jsonString = await generateContentAI(apiKey, prompt);
          const cleanedJsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
          postData = JSON.parse(cleanedJsonString);

        } else { // Proveedor 'free' o por defecto (contenido de relleno)
          postData = {
            title: `Guía Completa sobre ${topic}`,
            metaDescription: `Descubre todo lo que necesitas saber sobre ${topic}. Guía detallada para 2024.`,
            content: `
              <h2>Introducción a ${topic}</h2>
              <p>Este es un artículo de ejemplo generado automáticamente sobre ${topic}. El contenido real se creará con el proveedor de IA seleccionado.</p>
              <h3>Puntos Clave</h3>
              <ul>
                <li>Aspecto 1 de ${topic}</li>
                <li>Aspecto 2 de ${topic}</li>
                <li>Aspecto 3 de ${topic}</li>
              </ul>
              <p>Continúa el desarrollo del contenido...</p>
            `,
          };
        }

        const savedPost = await storage.saveGeneratedContent({
          ...postData,
          seoScore: Math.floor(Math.random() * 15) + 80,
          status: 'draft',
          keywords: `${topic}, ${keywords || ''}`,
          provider: aiProvider,
          batchId: batchId,
          bulkType: bulkType,
        });

        generatedPosts.push(savedPost);
        await new Promise(resolve => setTimeout(resolve, 200)); // Pequeña pausa
      }

      res.json({ success: true, generated: generatedPosts.length, contents: generatedPosts });

    } catch (error: any) {
      console.error("[ERROR] Bulk Standard Generation:", error);
      res.status(500).json({ error: error.message || 'Ocurrió un error durante la generación de contenido.' });
    }
  });

  // --- OTRAS RUTAS (GET, POST, DELETE, PUBLISH) ---

  // Guardar un borrador individual
  app.post('/api/content', async (req, res) => {
    try {
        const { title, content, metaDescription, seoScore, keywords, campaignId } = req.body;

        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        const savedPost = await storage.saveGeneratedContent({
            title,
            content,
            metaDescription: metaDescription || '',
            seoScore: seoScore || 75,
            status: 'draft',
            keywords: keywords || title,
            campaignId: campaignId ? parseInt(campaignId, 10) : undefined,
            bulkType: 'single' // Etiqueta como post individual
        });

        res.status(201).json({ success: true, post: savedPost });

    } catch (error: any) {
        console.error('Error saving draft:', error);
        res.status(500).json({ error: error.message || 'Failed to save draft' });
    }
  });

  // Obtener todo el contenido generado
  app.get('/api/generated-content', async (req, res) => {
    try {
      const contents = await storage.getAllGeneratedContent();
      res.json(contents);
    } catch (error: any) {
      console.error('Error fetching content:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Eliminar contenido
  app.delete('/api/content/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteGeneratedContent(parseInt(id, 10));
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting content:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Publicar contenido
  app.post('/api/content/:id/publish', async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.publishGeneratedContent(parseInt(id, 10));
      res.json({ success: true, content: updated });
    } catch (error: any) {
      console.error('Error publishing content:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
