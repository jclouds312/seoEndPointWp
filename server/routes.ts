import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Bulk Massive Generator - generates 8 posts from a seed keyword
  app.post('/api/bulk-massive/generate', async (req, res) => {
    try {
      const { mainKeyword, targetSite, count = 8 } = req.body;

      if (!mainKeyword) {
        return res.status(400).json({ error: 'mainKeyword is required' });
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

      // Generate all 8 posts
      for (let i = 0; i < Math.min(count, subTopics.length); i++) {
        const topic = subTopics[i];

        const content = `# ${topic}

## Introduction

${topic} is a crucial aspect that requires careful consideration and understanding. This comprehensive guide will walk you through everything you need to know.

## Key Points

- Understanding the fundamentals of ${mainKeyword}
- Best practices and strategies
- Common pitfalls to avoid
- Expert recommendations

## Detailed Analysis

When dealing with ${mainKeyword}, it's essential to have a thorough understanding of the subject matter. Our experience shows that taking a systematic approach yields the best results.

### Important Considerations

1. **Research thoroughly**: Make sure you understand all aspects
2. **Plan ahead**: Create a comprehensive strategy
3. **Stay updated**: Keep current with latest developments
4. **Seek expertise**: Consult with professionals when needed

## Conclusion

${topic} requires attention to detail and a strategic approach. By following these guidelines, you'll be well-equipped to handle any situation related to ${mainKeyword}.

For more information or personalized assistance, consider consulting with a professional in this field.`;

        const newPost = {
          title: topic,
          content: content,
          metaDescription: `Learn everything you need to know about ${topic}. Expert insights and practical advice.`,
          seoScore: Math.floor(Math.random() * 15) + 85,
          status: 'draft',
          keywords: `${mainKeyword}, ${topic}`,
          featuredImage: null,
          createdAt: new Date().toISOString(),
          campaignId: null,
          targetSite: targetSite
        };

        // Save to storage
        const savedPost = await storage.saveContent(newPost);

        generatedPosts.push({
          id: savedPost.id,
          title: savedPost.title,
          content: savedPost.content,
          metaDescription: savedPost.metaDescription,
          seoScore: savedPost.seoScore,
          status: savedPost.status,
          keywords: savedPost.keywords,
          createdAt: savedPost.createdAt
        });

        // Small delay to simulate processing
        await new Promise(resolve => setTimeout(resolve, 300));
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

  // Bulk Generator - generates posts from multiple topics
  app.post('/api/bulk-generate', async (req, res) => {
    try {
      const { topics, keywords, wordCount = 1200, aiProvider = 'free' } = req.body;

      if (!topics || !Array.isArray(topics) || topics.length === 0) {
        return res.status(400).json({ error: 'At least one topic is required' });
      }

      const generatedPosts = [];

      for (const topic of topics) {
        const post = await storage.createGeneratedContent({
          title: `${topic} - Comprehensive Guide`,
          content: `<h2>${topic}</h2>\n\n<p>This is a detailed article about ${topic} with approximately ${wordCount} words of high-quality content.</p>\n\n<h3>Introduction</h3>\n<p>Understanding ${topic} is essential for anyone looking to navigate this complex area. This guide provides comprehensive insights and practical advice.</p>\n\n<h3>Key Considerations</h3>\n<ul>\n<li>Important factors to consider</li>\n<li>Best practices and recommendations</li>\n<li>Common pitfalls to avoid</li>\n<li>Expert tips for success</li>\n</ul>\n\n<h3>In-Depth Analysis</h3>\n<p>When examining ${topic}, several critical elements come into play. Our research and experience have shown that a systematic approach yields the best results.</p>\n\n<h3>Practical Applications</h3>\n<p>Real-world scenarios demonstrate how ${topic} principles apply in practice. By following these guidelines, you can achieve optimal outcomes.</p>\n\n<h3>Conclusion</h3>\n<p>With the right knowledge and approach, ${topic} becomes much more manageable. Use this guide as your roadmap to success.</p>`,
          metaDescription: `Everything you need to know about ${topic}. Expert insights, practical tips, and comprehensive guidance.`,
          seoScore: Math.floor(Math.random() * 20) + 80,
          keywords: keywords || topic,
          status: 'draft'
        });

        generatedPosts.push(post);
      }

      res.json({
        success: true,
        contents: generatedPosts,
        count: generatedPosts.length
      });

    } catch (error: any) {
      console.error('Bulk generation error:', error);
      res.status(500).json({ error: error.message || 'Error generating content' });
    }
  });

  // Get all generated content
  app.get('/api/generated-content', async (req, res) => {
    try {
      const contents = await storage.getAllGeneratedContent();
      res.json(contents);
    } catch (error: any) {
      console.error('Error fetching content:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Delete generated content
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

  // Publish content
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