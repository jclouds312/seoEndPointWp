import { WordPressCredentials, PostContent, PublishResult, PublishConfig, N8nConfig } from './wordpress-schema';
import { BrowserAutoLoginService, N8nWorkflowService } from './publishing-service';

export class WordPressService {
  // Central method to handle publishing via chosen strategy
  static async publishPost(
    credentials: WordPressCredentials,
    n8nConfig: N8nConfig | null,
    post: PostContent,
    config: PublishConfig
  ): Promise<PublishResult> {
    
    // Strategy 1: N8n Webhook
    if (config.method === 'n8n-webhook') {
      if (!n8nConfig?.webhookUrl) {
        return { success: false, error: 'Missing n8n Webhook URL', methodUsed: 'n8n-webhook' };
      }
      return N8nWorkflowService.triggerWebhook(n8nConfig, {
        credentials: {
          url: credentials.siteUrl,
          user: credentials.username,
          appPass: credentials.applicationPassword 
        },
        post,
        config
      });
    }

    // Strategy 2: Browser Auto-Login Simulation
    if (config.method === 'browser-auto-login') {
      return BrowserAutoLoginService.publish(credentials, post);
    }

    // Strategy 3: Direct REST API (Mocked)
    return this.publishViaRestApi(credentials, post, config);
  }

  private static async publishViaRestApi(
    credentials: WordPressCredentials,
    post: PostContent,
    config: PublishConfig
  ): Promise<PublishResult> {
    console.log(`[WP REST API] POST ${credentials.siteUrl}/wp-json/wp/v2/posts`);
    
    // Simulate network request
    await new Promise(r => setTimeout(r, 1500));

    if (!credentials.applicationPassword) {
      // Mock failure if no app password
      // return { success: false, error: 'Application Password required for REST API', methodUsed: 'rest-api' };
    }

    return {
      success: true,
      postId: Math.floor(Math.random() * 10000),
      link: `${credentials.siteUrl}/${post.slug || 'new-post'}`,
      methodUsed: 'rest-api',
      logs: ['Authenticated via App Password', 'Post created', 'Meta fields updated']
    };
  }
}
