
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface AutoPostConfig {
  siteUrl: string;
  username: string;
  password: string;
  posts: Array<{
    title: string;
    content: string;
    category?: string;
    tags?: string[];
    status?: 'publish' | 'draft';
  }>;
}

export class WordPressAutoPost {
  private baseUrl: string;
  private username: string;
  private password: string;
  private cookies: string[] = [];
  private nonce: string = '';

  constructor(siteUrl: string, username: string, password: string) {
    this.baseUrl = siteUrl.replace(/\/$/, '');
    this.username = username;
    this.password = password;
  }

  async login(): Promise<boolean> {
    try {
      // Step 1: Get login page to extract nonce
      const loginPageResponse = await axios.get(`${this.baseUrl}/wp-login.php`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 15000
      });

      const $ = cheerio.load(loginPageResponse.data);
      const loginNonce = $('input[name="log"]').closest('form').find('input[name="_wpnonce"]').val();

      // Step 2: Perform login
      const loginData = new URLSearchParams();
      loginData.append('log', this.username);
      loginData.append('pwd', this.password);
      loginData.append('wp-submit', 'Log In');
      loginData.append('redirect_to', `${this.baseUrl}/wp-admin/`);
      loginData.append('testcookie', '1');

      const loginResponse = await axios.post(
        `${this.baseUrl}/wp-login.php`,
        loginData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          maxRedirects: 0,
          validateStatus: (status) => status === 302 || status === 200,
          timeout: 15000
        }
      );

      // Extract cookies
      const setCookieHeaders = loginResponse.headers['set-cookie'];
      if (!setCookieHeaders || setCookieHeaders.length === 0) {
        console.error('No cookies received after login - credentials may be incorrect');
        return false;
      }
      
      this.cookies = setCookieHeaders.map((cookie: string) => cookie.split(';')[0]);

      // Step 3: Get admin page to extract nonce for posting
      const adminResponse = await axios.get(`${this.baseUrl}/wp-admin/post-new.php`, {
        headers: {
          'Cookie': this.cookies.join('; '),
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 15000
      });

      const $admin = cheerio.load(adminResponse.data);
      this.nonce = $admin('#_wpnonce').val() as string || '';

      if (!this.nonce) {
        console.warn('Could not extract nonce from admin page');
      }

      console.log('WordPress login successful');
      return true;
    } catch (error: any) {
      console.error('WordPress login failed:', error.message);
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.error('Authentication failed - check username and password');
      }
      return false;
    }
  }

  async createPost(post: {
    title: string;
    content: string;
    category?: string;
    tags?: string[];
    status?: 'publish' | 'draft';
  }): Promise<{ success: boolean; postId?: number; error?: string }> {
    try {
      if (!this.cookies.length || !this.nonce) {
        const loginSuccess = await this.login();
        if (!loginSuccess) {
          return { success: false, error: 'Login failed' };
        }
      }

      const postData = new URLSearchParams();
      postData.append('post_title', post.title);
      postData.append('content', post.content);
      postData.append('post_status', post.status || 'draft');
      postData.append('_wpnonce', this.nonce);
      postData.append('action', 'editpost');
      postData.append('post_type', 'post');

      if (post.tags && post.tags.length > 0) {
        postData.append('tax_input[post_tag]', post.tags.join(','));
      }

      const response = await axios.post(
        `${this.baseUrl}/wp-admin/post.php`,
        postData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': this.cookies.join('; '),
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          maxRedirects: 0,
          validateStatus: (status) => status === 302 || status === 200
        }
      );

      // Extract post ID from redirect location
      const location = response.headers.location || '';
      const postIdMatch = location.match(/post=(\d+)/);
      const postId = postIdMatch ? parseInt(postIdMatch[1], 10) : undefined;

      return { success: true, postId };
    } catch (error: any) {
      console.error('Post creation failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async bulkPublish(posts: Array<{
    title: string;
    content: string;
    category?: string;
    tags?: string[];
    status?: 'publish' | 'draft';
  }>): Promise<Array<{ success: boolean; postId?: number; error?: string }>> {
    const results: Array<{ success: boolean; postId?: number; error?: string }> = [];

    // Login once
    const loginSuccess = await this.login();
    if (!loginSuccess) {
      return posts.map(() => ({ success: false, error: 'Login failed' }));
    }

    // Create posts sequentially
    for (const post of posts) {
      const result = await this.createPost(post);
      results.push(result);
      
      // Wait 2 seconds between posts to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return results;
  }
}

export async function autoPublishPosts(config: AutoPostConfig): Promise<{
  success: boolean;
  published: number;
  failed: number;
  results: Array<{ success: boolean; postId?: number; error?: string }>;
}> {
  const autoPost = new WordPressAutoPost(
    config.siteUrl,
    config.username,
    config.password
  );

  const results = await autoPost.bulkPublish(config.posts);
  
  const published = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  return {
    success: published > 0,
    published,
    failed,
    results
  };
}
