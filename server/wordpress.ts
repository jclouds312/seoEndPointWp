import axios from 'axios';

export interface WordPressCredentials {
  siteUrl: string;
  username: string;
  applicationPassword: string;
}

export interface WordPressPost {
  title: string;
  content: string;
  status?: 'draft' | 'publish' | 'pending' | 'private' | 'future';
  slug?: string;
  excerpt?: string;
  date?: string;
  categories?: number[];
  tags?: number[];
  featured_media?: number;
  meta?: {
    _yoast_wpseo_title?: string;
    _yoast_wpseo_metadesc?: string;
    _yoast_wpseo_focuskw?: string;
  };
}

export interface WordPressResponse {
  id: number;
  link: string;
  title: { rendered: string };
  status: string;
  date: string;
}

export class WordPressService {
  private credentials: WordPressCredentials;
  private baseUrl: string;
  private authHeader: string;

  constructor(credentials: WordPressCredentials) {
    this.credentials = credentials;
    this.baseUrl = credentials.siteUrl.replace(/\/$/, '') + '/wp-json/wp/v2';
    const auth = Buffer.from(`${credentials.username}:${credentials.applicationPassword}`).toString('base64');
    this.authHeader = `Basic ${auth}`;
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.get(`${this.baseUrl}/users/me`, {
        headers: { Authorization: this.authHeader },
        timeout: 10000
      });
      return { 
        success: true, 
        message: `Connected as ${response.data.name || response.data.slug}` 
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        return { success: false, message: 'Invalid credentials. Check username and application password.' };
      }
      if (error.code === 'ENOTFOUND') {
        return { success: false, message: 'Site not found. Check the URL.' };
      }
      return { success: false, message: error.message || 'Connection failed' };
    }
  }

  async createPost(post: WordPressPost): Promise<WordPressResponse> {
    try {
      const postData: any = {
        title: post.title,
        content: post.content,
        status: post.status || 'draft',
        excerpt: post.excerpt || '',
      };

      if (post.date) {
        postData.date = post.date;
        if (new Date(post.date) > new Date()) {
          postData.status = 'future';
        }
      }

      if (post.slug) {
        postData.slug = post.slug;
      }

      if (post.categories?.length) {
        postData.categories = post.categories;
      }

      if (post.tags?.length) {
        postData.tags = post.tags;
      }

      if (post.featured_media) {
        postData.featured_media = post.featured_media;
      }

      const response = await axios.post<WordPressResponse>(
        `${this.baseUrl}/posts`,
        postData,
        {
          headers: { 
            Authorization: this.authHeader,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('WordPress post creation error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to create WordPress post');
    }
  }

  async updateYoastMeta(postId: number, meta: {
    title?: string;
    description?: string;
    focusKeyword?: string;
  }): Promise<void> {
    try {
      const metaData: Record<string, string> = {};
      
      if (meta.title) {
        metaData['_yoast_wpseo_title'] = meta.title;
      }
      if (meta.description) {
        metaData['_yoast_wpseo_metadesc'] = meta.description;
      }
      if (meta.focusKeyword) {
        metaData['_yoast_wpseo_focuskw'] = meta.focusKeyword;
      }

      await axios.post(
        `${this.baseUrl}/posts/${postId}`,
        { meta: metaData },
        {
          headers: {
            Authorization: this.authHeader,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );
    } catch (error: any) {
      console.warn('Yoast meta update failed (plugin may not be active):', error.message);
    }
  }

  async getCategories(): Promise<Array<{ id: number; name: string; slug: string }>> {
    try {
      const response = await axios.get(`${this.baseUrl}/categories`, {
        headers: { Authorization: this.authHeader },
        params: { per_page: 100 },
        timeout: 10000
      });
      return response.data.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug
      }));
    } catch (error: any) {
      console.error('Failed to fetch categories:', error.message);
      return [];
    }
  }

  async uploadMedia(imageUrl: string, title: string): Promise<number | null> {
    try {
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(imageResponse.data);
      
      const response = await axios.post(
        `${this.baseUrl}/media`,
        imageBuffer,
        {
          headers: {
            Authorization: this.authHeader,
            'Content-Type': 'image/jpeg',
            'Content-Disposition': `attachment; filename="${title.replace(/[^a-z0-9]/gi, '-')}.jpg"`
          },
          timeout: 60000
        }
      );
      
      return response.data.id;
    } catch (error: any) {
      console.error('Media upload failed:', error.message);
      return null;
    }
  }
}

export interface ScheduleConfig {
  postsPerMonth: number;
  startDate?: Date;
  timezone?: string;
}

export function calculatePublishDates(config: ScheduleConfig): Date[] {
  const { postsPerMonth, startDate = new Date() } = config;
  const dates: Date[] = [];
  
  const daysInMonth = 30;
  const intervalDays = Math.floor(daysInMonth / postsPerMonth);
  
  for (let i = 0; i < postsPerMonth; i++) {
    const publishDate = new Date(startDate);
    publishDate.setDate(publishDate.getDate() + (i * intervalDays));
    publishDate.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);
    dates.push(publishDate);
  }
  
  return dates;
}

export async function publishToWordPress(
  credentials: WordPressCredentials,
  posts: Array<{
    title: string;
    content: string;
    metaDescription?: string;
    focusKeyword?: string;
    slug?: string;
  }>,
  options: {
    publishImmediately?: boolean;
    postsPerMonth?: number;
    useSchedule?: boolean;
  } = {}
): Promise<Array<{ success: boolean; postId?: number; link?: string; scheduledDate?: string; error?: string }>> {
  const wp = new WordPressService(credentials);
  const results: Array<{ success: boolean; postId?: number; link?: string; scheduledDate?: string; error?: string }> = [];
  
  const connectionTest = await wp.testConnection();
  if (!connectionTest.success) {
    return posts.map(() => ({ success: false, error: connectionTest.message }));
  }

  const publishDates = (options.postsPerMonth && options.useSchedule !== false)
    ? calculatePublishDates({ postsPerMonth: Math.min(posts.length, options.postsPerMonth) })
    : [];

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const scheduledDate = publishDates[i];
    
    try {
      let status: 'draft' | 'publish' | 'future' = 'draft';
      let dateStr: string | undefined;
      
      if (options.publishImmediately) {
        status = 'publish';
      } else if (scheduledDate && scheduledDate > new Date()) {
        status = 'future';
        dateStr = scheduledDate.toISOString();
      }

      const wpPost = await wp.createPost({
        title: post.title,
        content: post.content,
        status: status,
        slug: post.slug,
        excerpt: post.metaDescription,
        date: dateStr,
      });

      if (post.metaDescription || post.focusKeyword) {
        await wp.updateYoastMeta(wpPost.id, {
          description: post.metaDescription,
          focusKeyword: post.focusKeyword,
        });
      }

      results.push({
        success: true,
        postId: wpPost.id,
        link: wpPost.link,
        scheduledDate: dateStr
      });

      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error: any) {
      results.push({
        success: false,
        error: error.message
      });
    }
  }

  return results;
}
