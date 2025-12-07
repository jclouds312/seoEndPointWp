
interface JetpackConfig {
  siteUrl: string;
  apiKey?: string;
  wpUsername?: string;
  wpPassword?: string;
}

interface JetpackPublicizeConnection {
  id: string;
  service: string;
  display_name: string;
  external_id: string;
}

interface JetpackStats {
  date: string;
  views: number;
  visitors: number;
  likes: number;
  comments: number;
}

class JetpackIntegration {
  private config: JetpackConfig;
  private baseUrl: string;

  constructor(config: JetpackConfig) {
    this.config = config;
    this.baseUrl = `${config.siteUrl}/wp-json`;
  }

  // Obtener estadísticas de Jetpack Stats
  async getStats(days: number = 30): Promise<JetpackStats[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/jetpack/v4/module/stats/data?range=${days}d`,
        {
          headers: this.getAuthHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`Jetpack Stats API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Jetpack Stats fetch error:', error);
      throw error;
    }
  }

  // Publicar en redes sociales usando Jetpack Publicize
  async shareToSocial(postId: number, message?: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/jetpack/v4/publicize/posts/${postId}/share`,
        {
          method: 'POST',
          headers: {
            ...this.getAuthHeaders(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: message || '',
            skip_if_already_shared: false
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Jetpack Publicize API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Jetpack Publicize error:', error);
      throw error;
    }
  }

  // Obtener conexiones de redes sociales
  async getSocialConnections(): Promise<JetpackPublicizeConnection[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/jetpack/v4/publicize/connections`,
        {
          headers: this.getAuthHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`Jetpack Connections API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.connections || [];
    } catch (error) {
      console.error('Jetpack Connections fetch error:', error);
      throw error;
    }
  }

  // Verificar si el sitio tiene Jetpack activo
  async isJetpackActive(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/jetpack/v4/connection`,
        {
          headers: this.getAuthHeaders()
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Jetpack connection check error:', error);
      return false;
    }
  }

  // Optimizar imágenes con Jetpack CDN (Photon)
  getPhotonUrl(imageUrl: string, width?: number, height?: number): string {
    const cleanUrl = imageUrl.replace(/^https?:\/\//, '');
    let photonUrl = `https://i0.wp.com/${cleanUrl}`;
    
    const params = [];
    if (width) params.push(`w=${width}`);
    if (height) params.push(`h=${height}`);
    
    if (params.length > 0) {
      photonUrl += `?${params.join('&')}`;
    }
    
    return photonUrl;
  }

  // Análisis SEO con Jetpack
  async analyzeSEO(postId: number): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/jetpack/v4/seo/posts/${postId}/analysis`,
        {
          headers: this.getAuthHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`Jetpack SEO API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Jetpack SEO analysis error:', error);
      throw error;
    }
  }

  // Headers de autenticación
  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Accept': 'application/json'
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
}

export default JetpackIntegration;
