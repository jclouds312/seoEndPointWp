
import { type User, type InsertUser, type GeneratedContent, type MonthlyContentQuota, type Campaign, type ApiKey } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Content operations
  saveGeneratedContent(content: any): Promise<GeneratedContent>;
  getGeneratedContent(userId: string, limit?: number): Promise<GeneratedContent[]>;
  updateContentStatus(id: number, status: string): Promise<void>;
  
  // Quota operations
  getMonthlyQuota(userId: string, month: string): Promise<MonthlyContentQuota | undefined>;
  updateMonthlyQuota(userId: string, month: string): Promise<void>;
  
  // Campaign operations
  getCampaigns(userId: string): Promise<Campaign[]>;
  
  // API Keys
  getApiKey(userId: string, provider: string): Promise<ApiKey | undefined>;
  saveApiKey(userId: string, provider: string, keyValue: string): Promise<ApiKey>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private generatedContent: Map<number, GeneratedContent>;
  private monthlyQuotas: Map<string, MonthlyContentQuota>;
  private campaigns: Map<number, Campaign>;
  private apiKeys: Map<number, ApiKey>;
  private contentIdCounter: number;
  private campaignIdCounter: number;
  private apiKeyIdCounter: number;
  private quotaIdCounter: number;

  constructor() {
    this.users = new Map();
    this.generatedContent = new Map();
    this.monthlyQuotas = new Map();
    this.campaigns = new Map();
    this.apiKeys = new Map();
    this.contentIdCounter = 1;
    this.campaignIdCounter = 1;
    this.apiKeyIdCounter = 1;
    this.quotaIdCounter = 1;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      email: insertUser.email || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async saveGeneratedContent(content: any): Promise<GeneratedContent> {
    const id = this.contentIdCounter++;
    const newContent: GeneratedContent = {
      id,
      ...content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.generatedContent.set(id, newContent);
    return newContent;
  }

  async getGeneratedContent(userId: string, limit: number = 50): Promise<GeneratedContent[]> {
    return Array.from(this.generatedContent.values())
      .filter(content => content.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async updateContentStatus(id: number, status: string): Promise<void> {
    const content = this.generatedContent.get(id);
    if (content) {
      content.status = status;
      content.updatedAt = new Date();
      if (status === 'published') {
        content.publishedAt = new Date();
      }
    }
  }

  async getMonthlyQuota(userId: string, month: string): Promise<MonthlyContentQuota | undefined> {
    const key = `${userId}-${month}`;
    return this.monthlyQuotas.get(key);
  }

  async updateMonthlyQuota(userId: string, month: string): Promise<void> {
    const key = `${userId}-${month}`;
    let quota = this.monthlyQuotas.get(key);
    
    if (!quota) {
      quota = {
        id: this.quotaIdCounter++,
        userId,
        month,
        contentGenerated: 1,
        maxContent: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } else {
      quota.contentGenerated = (quota.contentGenerated || 0) + 1;
      quota.updatedAt = new Date();
    }
    
    this.monthlyQuotas.set(key, quota);
  }

  async getCampaigns(userId: string): Promise<Campaign[]> {
    return Array.from(this.campaigns.values())
      .filter(campaign => campaign.userId === userId);
  }

  async getApiKey(userId: string, provider: string): Promise<ApiKey | undefined> {
    return Array.from(this.apiKeys.values())
      .find(key => key.userId === userId && key.provider === provider && key.isActive);
  }

  async saveApiKey(userId: string, provider: string, keyValue: string): Promise<ApiKey> {
    const id = this.apiKeyIdCounter++;
    const apiKey: ApiKey = {
      id,
      userId,
      provider,
      keyValue,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.apiKeys.set(id, apiKey);
    return apiKey;
  }
}

export const storage = new MemStorage();
