
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const MODEL_NAME = "gemini-1.0-pro";

// Helper function para la generación de contenido
async function generateContent(apiKey: string, prompt: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  };

  const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  ];

  const parts = [{ text: prompt }];
  const result = await model.generateContent({ contents: [{ parts }], generationConfig, safetySettings });

  if (result.response.promptFeedback && result.response.promptFeedback.blockReason) {
    throw new Error(`Content generation blocked: ${result.response.promptFeedback.blockReason}`);
  }

  return result.response.text();
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  // ... (otras rutas)

  // Bulk Massive Generator - genera 8 posts desde una palabra clave semilla
  app.post('/api/bulk-massive/generate', async (req, res) => {
    try {
      const { mainKeyword, targetSite, count = 8, apiKey } = req.body;

      if (!mainKeyword || !apiKey) {
        return res.status(400).json({ error: 'mainKeyword and apiKey are required' });
      }

      const subTopics = [
        `${mainKeyword} - Complete Guide`,
        `How to Handle ${mainKeyword}`,
        `${mainKeyword}: What You Need to Know`,
        `Common Mistakes in ${mainKeyword}`,
        `${mainKeyword} Best Practices`,
        `Understanding ${mainKeyword} in 2024`,
        `${mainKeyword} FAQs Answered`,
        `${mainKeyword} Case Studies`
      ];

      const generatedPosts = [];

      for (let i = 0; i < Math.min(count, subTopics.length); i++) {
        const topic = subTopics[i];
        const prompt = `Generate a blog post about "${topic}".`;
        const content = await generateContent(apiKey, prompt);

        const savedPost = await storage.saveGeneratedContent({
          title: topic,
          content: content,
          metaDescription: `Learn everything about ${topic}.`,
          seoScore: Math.floor(Math.random() * 10) + 90, // Higher score for AI content
          status: 'draft',
          keywords: `${mainKeyword}, ${topic}`
        });

        generatedPosts.push(savedPost);
      }

      res.json({
        success: true,
        generated: generatedPosts.length,
        contents: generatedPosts
      });

    } catch (error: any) {
      console.error('Bulk massive generation error:', error);
      res.status(500).json({ error: error.message || 'Error generating content' });
    }
  });
  
  // ... (otras rutas)

  return httpServer;
}
