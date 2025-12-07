
import axios, { AxiosInstance } from 'axios';

export interface N8nWorkflow {
  id?: string;
  name: string;
  active: boolean;
  nodes: N8nNode[];
  connections: Record<string, any>;
  settings?: Record<string, any>;
  staticData?: Record<string, any>;
}

export interface N8nNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, any>;
}

export interface N8nExecution {
  id: string;
  finished: boolean;
  mode: string;
  startedAt: string;
  stoppedAt?: string;
  workflowId: string;
  data?: any;
}

export class N8nIntegration {
  private baseUrl: string;
  private apiKey: string;
  private client: AxiosInstance;

  constructor(config: { baseUrl?: string; apiKey?: string }) {
    this.baseUrl = config.baseUrl || process.env.N8N_BASE_URL || 'http://localhost:5678';
    this.apiKey = config.apiKey || process.env.N8N_API_KEY || '';
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'X-N8N-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  // Workflow Management
  async getWorkflows(): Promise<N8nWorkflow[]> {
    const response = await this.client.get('/api/v1/workflows');
    return response.data.data || [];
  }

  async getWorkflow(id: string): Promise<N8nWorkflow> {
    const response = await this.client.get(`/api/v1/workflows/${id}`);
    return response.data;
  }

  async createWorkflow(workflow: Partial<N8nWorkflow>): Promise<N8nWorkflow> {
    const response = await this.client.post('/api/v1/workflows', workflow);
    return response.data;
  }

  async updateWorkflow(id: string, workflow: Partial<N8nWorkflow>): Promise<N8nWorkflow> {
    const response = await this.client.patch(`/api/v1/workflows/${id}`, workflow);
    return response.data;
  }

  async deleteWorkflow(id: string): Promise<void> {
    await this.client.delete(`/api/v1/workflows/${id}`);
  }

  async activateWorkflow(id: string): Promise<N8nWorkflow> {
    return this.updateWorkflow(id, { active: true });
  }

  async deactivateWorkflow(id: string): Promise<N8nWorkflow> {
    return this.updateWorkflow(id, { active: false });
  }

  // Execution Management
  async executeWorkflow(id: string, data?: any): Promise<N8nExecution> {
    const response = await this.client.post(`/api/v1/workflows/${id}/execute`, { data });
    return response.data;
  }

  async getExecutions(workflowId?: string): Promise<N8nExecution[]> {
    const params = workflowId ? { workflowId } : {};
    const response = await this.client.get('/api/v1/executions', { params });
    return response.data.data || [];
  }

  async getExecution(id: string): Promise<N8nExecution> {
    const response = await this.client.get(`/api/v1/executions/${id}`);
    return response.data;
  }

  async deleteExecution(id: string): Promise<void> {
    await this.client.delete(`/api/v1/executions/${id}`);
  }

  // Pre-built Workflows for SEO Automation
  async createYoastSyncWorkflow(siteUrl: string): Promise<N8nWorkflow> {
    const workflow: Partial<N8nWorkflow> = {
      name: 'Yoast Metadata Sync',
      active: true,
      nodes: [
        {
          id: 'trigger',
          name: 'Schedule Trigger',
          type: 'n8n-nodes-base.scheduleTrigger',
          typeVersion: 1,
          position: [250, 300],
          parameters: {
            rule: { interval: [{ field: 'hours', hoursInterval: 6 }] }
          }
        },
        {
          id: 'wordpress',
          name: 'WordPress',
          type: 'n8n-nodes-base.wordpress',
          typeVersion: 1,
          position: [450, 300],
          parameters: {
            resource: 'post',
            operation: 'getAll',
            url: siteUrl,
            returnAll: true
          }
        },
        {
          id: 'yoast',
          name: 'Extract Yoast SEO',
          type: 'n8n-nodes-base.function',
          typeVersion: 1,
          position: [650, 300],
          parameters: {
            functionCode: `
              const items = [];
              for (const item of $input.all()) {
                const yoast = item.json.yoast_meta || {};
                items.push({
                  json: {
                    postId: item.json.id,
                    title: item.json.title.rendered,
                    metaTitle: yoast.yoast_wpseo_title,
                    metaDescription: yoast.yoast_wpseo_metadesc,
                    focusKeyword: yoast.yoast_wpseo_focuskw,
                    seoScore: yoast.yoast_wpseo_linkdex
                  }
                });
              }
              return items;
            `
          }
        },
        {
          id: 'database',
          name: 'Save to Database',
          type: 'n8n-nodes-base.postgres',
          typeVersion: 1,
          position: [850, 300],
          parameters: {
            operation: 'insert',
            table: 'seo_metadata',
            columns: 'postId,title,metaTitle,metaDescription,focusKeyword,seoScore'
          }
        }
      ],
      connections: {
        'Schedule Trigger': { main: [[{ node: 'WordPress', type: 'main', index: 0 }]] },
        'WordPress': { main: [[{ node: 'Extract Yoast SEO', type: 'main', index: 0 }]] },
        'Extract Yoast SEO': { main: [[{ node: 'Save to Database', type: 'main', index: 0 }]] }
      }
    };

    return this.createWorkflow(workflow);
  }

  async createContentGenerationWorkflow(openaiKey: string): Promise<N8nWorkflow> {
    const workflow: Partial<N8nWorkflow> = {
      name: 'AI Content Generation Pipeline',
      active: false,
      nodes: [
        {
          id: 'manual',
          name: 'Manual Trigger',
          type: 'n8n-nodes-base.manualTrigger',
          typeVersion: 1,
          position: [250, 300],
          parameters: {}
        },
        {
          id: 'openai',
          name: 'OpenAI GPT-4',
          type: 'n8n-nodes-base.openAi',
          typeVersion: 1,
          position: [450, 300],
          parameters: {
            resource: 'text',
            operation: 'complete',
            model: 'gpt-4',
            prompt: '={{$json.prompt}}',
            apiKey: openaiKey
          }
        },
        {
          id: 'format',
          name: 'Format Content',
          type: 'n8n-nodes-base.function',
          typeVersion: 1,
          position: [650, 300],
          parameters: {
            functionCode: `
              const content = $json.choices[0].text;
              return {
                json: {
                  content,
                  wordCount: content.split(' ').length,
                  generated: new Date().toISOString()
                }
              };
            `
          }
        },
        {
          id: 'wordpress-post',
          name: 'Create WordPress Draft',
          type: 'n8n-nodes-base.wordpress',
          typeVersion: 1,
          position: [850, 300],
          parameters: {
            resource: 'post',
            operation: 'create',
            title: '={{$json.title}}',
            content: '={{$json.content}}',
            status: 'draft'
          }
        }
      ],
      connections: {
        'Manual Trigger': { main: [[{ node: 'OpenAI GPT-4', type: 'main', index: 0 }]] },
        'OpenAI GPT-4': { main: [[{ node: 'Format Content', type: 'main', index: 0 }]] },
        'Format Content': { main: [[{ node: 'Create WordPress Draft', type: 'main', index: 0 }]] }
      }
    };

    return this.createWorkflow(workflow);
  }

  async createKeywordAnalysisWorkflow(): Promise<N8nWorkflow> {
    const workflow: Partial<N8nWorkflow> = {
      name: 'Keyword Density Analyzer',
      active: true,
      nodes: [
        {
          id: 'webhook',
          name: 'Webhook Trigger',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [250, 300],
          parameters: {
            path: 'analyze-keywords',
            httpMethod: 'POST'
          }
        },
        {
          id: 'analyze',
          name: 'Analyze Keywords',
          type: 'n8n-nodes-base.function',
          typeVersion: 1,
          position: [450, 300],
          parameters: {
            functionCode: `
              const content = $json.body.content.toLowerCase();
              const keywords = $json.body.keywords || [];
              const results = {};
              
              for (const keyword of keywords) {
                const regex = new RegExp(keyword.toLowerCase(), 'gi');
                const matches = content.match(regex) || [];
                const density = (matches.length / content.split(' ').length) * 100;
                results[keyword] = {
                  count: matches.length,
                  density: density.toFixed(2) + '%'
                };
              }
              
              return { json: { results, analyzed: new Date() } };
            `
          }
        },
        {
          id: 'email',
          name: 'Send Report Email',
          type: 'n8n-nodes-base.emailSend',
          typeVersion: 1,
          position: [650, 300],
          parameters: {
            fromEmail: 'seo@example.com',
            toEmail: '={{$json.recipientEmail}}',
            subject: 'Keyword Analysis Report',
            text: '={{JSON.stringify($json.results, null, 2)}}'
          }
        }
      ],
      connections: {
        'Webhook Trigger': { main: [[{ node: 'Analyze Keywords', type: 'main', index: 0 }]] },
        'Analyze Keywords': { main: [[{ node: 'Send Report Email', type: 'main', index: 0 }]] }
      }
    };

    return this.createWorkflow(workflow);
  }

  // Health check
  async checkHealth(): Promise<boolean> {
    try {
      await this.client.get('/healthz');
      return true;
    } catch {
      return false;
    }
  }
}

export default N8nIntegration;
