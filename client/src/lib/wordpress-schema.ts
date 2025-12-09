export interface WordPressCredentials {
  siteUrl: string;
  username: string;
  applicationPassword?: string; // For REST API
  password?: string; // For Auto-login simulation
}

export interface N8nConfig {
  webhookUrl: string;
  workflowId?: string;
  apiKey?: string;
}

export interface PublishConfig {
  method: 'rest-api' | 'browser-auto-login' | 'n8n-webhook';
  status: 'draft' | 'publish' | 'future';
  date?: Date;
  categories?: number[];
  tags?: number[];
  featuredMediaId?: number;
}

export interface PostContent {
  title: string;
  content: string;
  excerpt?: string;
  slug?: string;
  meta?: {
    _yoast_wpseo_title?: string;
    _yoast_wpseo_metadesc?: string;
    [key: string]: any;
  };
}

export interface PublishResult {
  success: boolean;
  postId?: number;
  link?: string;
  error?: string;
  logs?: string[];
  methodUsed: string;
}
