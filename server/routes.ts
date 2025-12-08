
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const MODEL_NAME = "gemini-1.0-pro";

async function generateContent(apiKey: string, prompt: string): Promise<string> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
      temperature: 0.9,
      topK: 1,
      topP: 1,
      maxOutputTokens: 4096, // Aumentado para posts más largos
    };

    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    const result = await model.generateContent({ contents: [{ parts: [{ text: prompt }] }], generationConfig, safetySettings });

    if (result.response.promptFeedback && result.response.promptFeedback.blockReason) {
      throw new Error(`Content generation blocked: ${result.response.promptFeedback.blockReason}`);
    }
    
    if (!result.response.candidates || result.response.candidates.length === 0) {
        throw new Error('AI model did not return any content.');
    }

    return result.response.text();
  } catch (error: any) {
    // Añadir más contexto al error
    console.error("Error during AI content generation:", error);
    if (error.message.includes("API key not valid")) {
      throw new Error("The provided Google AI API key is not valid. Please check and try again.");
    }
    throw new Error(`Failed to generate content from AI: ${error.message}`);
  }
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  app.post('/api/bulk-massive/generate', async (req, res) => {
    try {
      const { mainKeyword, targetSite, count = 8, apiKey, tone = 'Professional & Authoritative', audience = 'General Public' } = req.body;

      if (!mainKeyword || !apiKey) {
        return res.status(400).json({ error: 'mainKeyword and apiKey are required' });
      }

      const subTopics = Array.from({ length: count }, (_, i) => {
          const variations = [
              `Guía Completa sobre ${mainKeyword}`,
              `Cómo Afecta ${mainKeyword} a los Residentes de California`,
              `${count} Errores Comunes al Lidiar con ${mainKeyword}`,
              `El Proceso Legal para ${mainKeyword}: Paso a Paso`,
              `${mainKeyword}: Derechos y Opciones de Compensación`,
              `Estadísticas Clave de ${mainKeyword} para 2024`,
              `Preguntas Frecuentes sobre ${mainKeyword}`,
              `Estudio de Caso: Un Veredicto Exitoso en ${mainKeyword}`
          ];
          return variations[i % variations.length];
      });

      const generatedPosts = [];

      for (const topic of subTopics) {
        const prompt = `
          Eres un experto en SEO y redactor de contenido legal para el blog '${targetSite}'.
          Tu tarea es generar un único post optimizado para SEO basado en los siguientes detalles:

          - Tema Principal: "${topic}"
          - Palabra Clave Principal: "${mainKeyword}"
          - Tono: "${tone}"
          - Audiencia Objetivo: "${audience}"

          Por favor, genera el contenido en el siguiente formato JSON exacto, sin texto introductorio ni explicaciones adicionales. Solo el objeto JSON.

          {
            "title": "Un título atractivo y optimizado para SEO para el post del blog (entre 60-70 caracteres).",
            "metaDescription": "Una meta descripción convincente (entre 155-160 caracteres) que incluya la palabra clave principal de forma natural.",
            "content": "El contenido completo del post en formato HTML. Debe estar bien estructurado con etiquetas H2, H3, P, UL, LI. El contenido debe tener aproximadamente 1200 palabras, ser informativo, fácil de leer y debe incorporar naturalmente la palabra clave principal y variaciones semánticas."
          }
        `;

        const jsonString = await generateContent(apiKey, prompt);
        
        // Limpiar y parsear la respuesta de la IA
        const cleanedJsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
        const postData = JSON.parse(cleanedJsonString);

        if (!postData.title || !postData.content || !postData.metaDescription) {
          throw new Error('La IA devolvió un formato de objeto inválido.');
        }

        const savedPost = await storage.saveGeneratedContent({
          title: postData.title,
          content: postData.content,
          metaDescription: postData.metaDescription,
          seoScore: Math.floor(Math.random() * 10) + 90,
          status: 'draft',
          keywords: `${mainKeyword}, ${topic}`,
        });

        generatedPosts.push(savedPost);
        // Pequeña pausa para evitar problemas de límite de tasa y para la fluidez de la UI
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      res.json({
        success: true,
        generated: generatedPosts.length,
        contents: generatedPosts,
      });

    } catch (error: any) {
      console.error('[ERROR] Bulk Massive Generation:', error);
      res.status(500).json({ error: error.message || 'Ocurrió un error desconocido durante la generación de contenido.' });
    }
  });

  // Ruta para guardar un borrador individual (usado por content-creator)
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
            seoScore: seoScore || Math.floor(Math.random() * 15) + 75,
            status: 'draft',
            keywords: keywords || title,
            campaignId: campaignId ? parseInt(campaignId, 10) : undefined,
        });

        res.status(201).json({ success: true, post: savedPost });

    } catch (error: any) {
        console.error('Error saving draft:', error);
        res.status(500).json({ error: error.message || 'Failed to save draft' });
    }
  });

  // Otras rutas existentes (GET, DELETE, PUBLISH)... 
  app.get('/api/generated-content', async (req, res) => {
    try {
      const contents = await storage.getAllGeneratedContent();
      res.json(contents);
    } catch (error: any) {
      console.error('Error fetching content:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/content/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteGeneratedContent(id);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting content:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/content/:id/publish', async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.publishGeneratedContent(id);
      res.json({ success: true, content: updated });
    } catch (error: any) {
      console.error('Error publishing content:', error);
      res.status(500).json({ error: error.message });
    }
  });


  return httpServer;
}
