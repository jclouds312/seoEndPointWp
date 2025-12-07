
import axios, { AxiosInstance } from 'axios';

interface WpSeoConfig {
  siteUrl: string;
  wpUsername?: string;
  wpPassword?: string;
  apiKey?: string;
}

interface WpSeoMetadata {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  robots?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
}

interface WpSeoPost {
  id: number;
  title: string;
  content: string;
  seo: WpSeoMetadata;
  schema?: any;
}

export class WpSeoIntegration {
  private baseUrl: string;
  private client: AxiosInstance;
  private config: WpSeoConfig;

  constructor(config: WpSeoConfig) {
    this.config = config;
    this.baseUrl = `${config.siteUrl}/wp-json`;
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: this.getAuthHeaders(),
    });
  }

  // Obtener metadata SEO de un post
  async getPostSEO(postId: number): Promise<WpSeoMetadata> {
    try {
      const response = await this.client.get(`/wp/v2/posts/${postId}`);
      const post = response.data;
      
      // wp-seo almacena metadata en meta fields
      return {
        title: post.meta?.seo_title || post.title?.rendered,
        description: post.meta?.seo_description || post.excerpt?.rendered,
        keywords: post.meta?.seo_keywords || '',
        canonical: post.meta?.seo_canonical || post.link,
        robots: post.meta?.seo_robots || 'index,follow',
        og_title: post.meta?.og_title || post.title?.rendered,
        og_description: post.meta?.og_description || post.excerpt?.rendered,
        og_image: post.meta?.og_image || post.featured_media_url,
        twitter_title: post.meta?.twitter_title || post.title?.rendered,
        twitter_description: post.meta?.twitter_description || post.excerpt?.rendered,
        twitter_image: post.meta?.twitter_image || post.featured_media_url,
      };
    } catch (error) {
      console.error('Error fetching post SEO:', error);
      throw error;
    }
  }

  // Actualizar metadata SEO de un post
  async updatePostSEO(postId: number, seoData: Partial<WpSeoMetadata>): Promise<void> {
    try {
      const meta: any = {};
      
      if (seoData.title) meta.seo_title = seoData.title;
      if (seoData.description) meta.seo_description = seoData.description;
      if (seoData.keywords) meta.seo_keywords = seoData.keywords;
      if (seoData.canonical) meta.seo_canonical = seoData.canonical;
      if (seoData.robots) meta.seo_robots = seoData.robots;
      if (seoData.og_title) meta.og_title = seoData.og_title;
      if (seoData.og_description) meta.og_description = seoData.og_description;
      if (seoData.og_image) meta.og_image = seoData.og_image;
      if (seoData.twitter_title) meta.twitter_title = seoData.twitter_title;
      if (seoData.twitter_description) meta.twitter_description = seoData.twitter_description;
      if (seoData.twitter_image) meta.twitter_image = seoData.twitter_image;

      await this.client.post(`/wp/v2/posts/${postId}`, { meta });
    } catch (error) {
      console.error('Error updating post SEO:', error);
      throw error;
    }
  }

  // Obtener análisis de SEO de un post
  async analyzeSEO(postId: number): Promise<any> {
    try {
      const response = await this.client.get(`/wp-seo/v1/posts/${postId}/analysis`);
      return response.data;
    } catch (error) {
      console.error('Error analyzing SEO:', error);
      throw error;
    }
  }

  // Generar schema.org markup
  async generateSchema(postId: number, schemaType: string = 'Article'): Promise<any> {
    try {
      const response = await this.client.post(`/wp-seo/v1/schema/generate`, {
        post_id: postId,
        schema_type: schemaType,
      });
      return response.data;
    } catch (error) {
      console.error('Error generating schema:', error);
      throw error;
    }
  }

  // Obtener posts con SEO incompleto
  async getPostsWithIncompleteSEO(limit: number = 20): Promise<WpSeoPost[]> {
    try {
      const response = await this.client.get('/wp/v2/posts', {
        params: {
          per_page: limit,
          meta_query: JSON.stringify([
            {
              relation: 'OR',
              [
                { key: 'seo_title', compare: 'NOT EXISTS' },
                { key: 'seo_description', compare: 'NOT EXISTS' },
                { key: 'seo_title', value: '', compare: '=' },
                { key: 'seo_description', value: '', compare: '=' },
              ]
            }
          ])
        }
      });

      return response.data.map((post: any) => ({
        id: post.id,
        title: post.title.rendered,
        content: post.content.rendered,
        seo: {
          title: post.meta?.seo_title || '',
          description: post.meta?.seo_description || '',
          keywords: post.meta?.seo_keywords || '',
        }
      }));
    } catch (error) {
      console.error('Error fetching posts with incomplete SEO:', error);
      throw error;
    }
  }

  // Validar configuración SEO del sitio
  async validateSiteConfiguration(): Promise<any> {
    try {
      const response = await this.client.get('/wp-seo/v1/settings/validate');
      return response.data;
    } catch (error) {
      console.error('Error validating site configuration:', error);
      throw error;
    }
  }

  // Obtener sugerencias de mejora SEO
  async getSEOSuggestions(postId: number): Promise<string[]> {
    try {
      const analysis = await this.analyzeSEO(postId);
      const suggestions: string[] = [];

      if (!analysis.meta_title || analysis.meta_title.length < 30) {
        suggestions.push('El título SEO es demasiado corto (mínimo 30 caracteres)');
      }
      if (analysis.meta_title && analysis.meta_title.length > 60) {
        suggestions.push('El título SEO es demasiado largo (máximo 60 caracteres)');
      }
      if (!analysis.meta_description || analysis.meta_description.length < 120) {
        suggestions.push('La descripción es demasiado corta (mínimo 120 caracteres)');
      }
      if (analysis.meta_description && analysis.meta_description.length > 160) {
        suggestions.push('La descripción es demasiado larga (máximo 160 caracteres)');
      }
      if (!analysis.focus_keyword) {
        suggestions.push('No hay palabra clave principal definida');
      }
      if (!analysis.has_images) {
        suggestions.push('El contenido no tiene imágenes');
      }
      if (!analysis.has_internal_links) {
        suggestions.push('El contenido carece de enlaces internos');
      }

      return suggestions;
    } catch (error) {
      console.error('Error getting SEO suggestions:', error);
      return [];
    }
  }

  // Exportar datos SEO de todos los posts
  async exportAllSEOData(): Promise<any[]> {
    try {
      const response = await this.client.get('/wp-seo/v1/export/all');
      return response.data;
    } catch (error) {
      console.error('Error exporting SEO data:', error);
      throw error;
    }
  }

  // Importar datos SEO en batch
  async importSEOData(data: Array<{ post_id: number; seo: WpSeoMetadata }>): Promise<void> {
    try {
      await this.client.post('/wp-seo/v1/import/batch', { posts: data });
    } catch (error) {
      console.error('Error importing SEO data:', error);
      throw error;
    }
  }

  // Headers de autenticación
  private getAuthHeaders(): any {
    const headers: any = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (this.config.wpUsername && this.config.wpPassword) {
      const auth = Buffer.from(
        `${this.config.wpUsername}:${this.config.wpPassword}`
      ).toString('base64');
      headers['Authorization'] = `Basic ${auth}`;
    } else if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    return headers;
  }

  // Health check
  async checkConnection(): Promise<boolean> {
    try {
      await this.client.get('/wp/v2/posts?per_page=1');
      return true;
    } catch (error) {
      console.error('Connection check failed:', error);
      return false;
    }
  }
}

export default WpSeoIntegration;
