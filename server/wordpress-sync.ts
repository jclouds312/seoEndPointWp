
import WordPressDatabase from './wordpress-db';
import { generateContent, optimizeSEO } from './openai';

interface SyncOptions {
  autoOptimizeSEO?: boolean;
  batchSize?: number;
  targetKeywords?: string[];
}

class WordPressSync {
  private wpDb: WordPressDatabase;

  constructor(wpDb: WordPressDatabase) {
    this.wpDb = wpDb;
  }

  // Sincronizar y optimizar posts sin SEO
  async syncAndOptimizePosts(options: SyncOptions = {}): Promise<any> {
    const {
      autoOptimizeSEO = true,
      batchSize = 10,
      targetKeywords = ['personal injury', 'car accident', 'lawyer']
    } = options;

    try {
      // Obtener posts que necesitan SEO
      const posts = await this.wpDb.getPostsNeedingSEO(batchSize);
      const results = [];

      for (const post of posts) {
        try {
          if (autoOptimizeSEO) {
            // Generar metadata SEO con OpenAI
            const seoData = await optimizeSEO(post.post_content, targetKeywords);
            
            // Actualizar en WordPress
            await this.wpDb.updateYoastSEO(post.ID, {
              title: seoData.title || post.post_title,
              metadesc: seoData.description,
              focuskw: targetKeywords[0],
              metakeywords: targetKeywords.join(', ')
            });

            results.push({
              postId: post.ID,
              title: post.post_title,
              status: 'optimized',
              seoData
            });
          }
        } catch (error) {
          console.error(`Error optimizing post ${post.ID}:`, error);
          results.push({
            postId: post.ID,
            title: post.post_title,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return {
        processed: results.length,
        successful: results.filter(r => r.status === 'optimized').length,
        failed: results.filter(r => r.status === 'error').length,
        results
      };
    } catch (error) {
      console.error('Sync and optimize error:', error);
      throw error;
    }
  }

  // Generar contenido nuevo y publicar en WordPress
  async generateAndPublish(params: {
    topic: string;
    keywords: string[];
    campaignId?: string;
    status?: 'draft' | 'publish';
  }): Promise<any> {
    try {
      // Generar contenido con OpenAI
      const content = await generateContent({
        prompt: params.topic,
        keywords: params.keywords.join(', '),
        wordCount: 1500,
        creativity: 0.7,
        tone: 'professional-empathetic',
        language: 'es'
      });

      // Extraer título del contenido generado
      const titleMatch = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
      const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '') : params.topic;

      // Insertar post en WordPress
      const postId = await this.wpDb.insertPost({
        title,
        content,
        status: params.status || 'draft',
        type: 'post'
      });

      // Optimizar SEO
      const seoData = await optimizeSEO(content, params.keywords);
      await this.wpDb.updateYoastSEO(postId, {
        title: seoData.title || title,
        metadesc: seoData.description,
        focuskw: params.keywords[0],
        metakeywords: params.keywords.join(', ')
      });

      return {
        success: true,
        postId,
        title,
        status: params.status || 'draft',
        seoOptimized: true
      };
    } catch (error) {
      console.error('Generate and publish error:', error);
      throw error;
    }
  }

  // Análisis de cobertura de keywords
  async analyzeKeywordCoverage(keywords: string[]): Promise<any> {
    const results = [];

    for (const keyword of keywords) {
      const analysis = await this.wpDb.analyzeKeywordUsage(keyword);
      results.push({
        keyword,
        postsCount: analysis.length,
        avgDensity: analysis.reduce((sum, p) => sum + p.keyword_count, 0) / analysis.length || 0,
        topPosts: analysis.slice(0, 5)
      });
    }

    return {
      keywords: results,
      totalKeywords: keywords.length,
      needsMoreContent: results.filter(r => r.postsCount < 5)
    };
  }
}

export default WordPressSync;
