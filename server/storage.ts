import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { campaigns, generatedContent, users } from "@shared/schema";
import type { Campaign, GeneratedContent, User, InsertUser } from "@shared/schema";

export interface ContentPost {
  id?: number;
  title: string;
  content: string;
  metaDescription?: string | null;
  seoScore?: number | null;
  keywords?: string | null;
  status: 'draft' | 'published';
  provider?: string | null;
  bulkType?: string | null;
  batchId?: string | null;
  campaignId?: number | null;
  slug?: string;
}

export interface IStorage {
  saveGeneratedContent(data: ContentPost): Promise<ContentPost>;
  getAllGeneratedContent(campaignId?: number): Promise<ContentPost[]>;
  getGeneratedContent(id: number): Promise<ContentPost | null>;
  updateGeneratedContent(id: number, data: Partial<ContentPost>): Promise<ContentPost>;
  deleteGeneratedContent(id: number): Promise<void>;
  publishGeneratedContent(id: number): Promise<ContentPost>;
  createCampaign(data: Partial<Campaign>): Promise<Campaign>;
  getCampaigns(): Promise<Campaign[]>;
  getCampaign(id: number): Promise<Campaign | null>;
  updateCampaign(id: number, data: Partial<Campaign>): Promise<Campaign>;
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

class PostgresStorage implements IStorage {
  async saveGeneratedContent(data: ContentPost): Promise<ContentPost> {
    const slug = data.slug || generateSlug(data.title);
    const [result] = await db.insert(generatedContent).values({
      title: data.title,
      content: data.content,
      slug: slug,
      metaDescription: data.metaDescription || '',
      seoScore: data.seoScore || 75,
      keywords: data.keywords || '',
      status: data.status || 'draft',
      provider: data.provider,
      bulkType: data.bulkType,
      batchId: data.batchId,
      campaignId: data.campaignId,
    }).returning();
    return { ...result, status: result.status as 'draft' | 'published' };
  }

  async getAllGeneratedContent(campaignId?: number): Promise<ContentPost[]> {
    let query;
    if (campaignId) {
      query = await db.select().from(generatedContent)
        .where(eq(generatedContent.campaignId, campaignId))
        .orderBy(desc(generatedContent.createdAt));
    } else {
      query = await db.select().from(generatedContent)
        .orderBy(desc(generatedContent.createdAt));
    }
    return query.map(item => ({ ...item, status: item.status as 'draft' | 'published' }));
  }

  async getGeneratedContent(id: number): Promise<ContentPost | null> {
    const [result] = await db.select().from(generatedContent).where(eq(generatedContent.id, id));
    return result ? { ...result, status: result.status as 'draft' | 'published' } : null;
  }

  async updateGeneratedContent(id: number, data: Partial<ContentPost>): Promise<ContentPost> {
    const [result] = await db.update(generatedContent)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(generatedContent.id, id))
      .returning();
    return { ...result, status: result.status as 'draft' | 'published' };
  }

  async deleteGeneratedContent(id: number): Promise<void> {
    await db.delete(generatedContent).where(eq(generatedContent.id, id));
  }

  async publishGeneratedContent(id: number): Promise<ContentPost> {
    const [result] = await db.update(generatedContent)
      .set({ status: 'published', publishedAt: new Date(), updatedAt: new Date() })
      .where(eq(generatedContent.id, id))
      .returning();
    return { ...result, status: result.status as 'draft' | 'published' };
  }

  async createCampaign(data: Partial<Campaign>): Promise<Campaign> {
    const [result] = await db.insert(campaigns).values({
      name: data.name || 'New Campaign',
      blogUrl: data.blogUrl || '',
      description: data.description || '',
      embedCode: data.embedCode || '',
      status: data.status || 'active',
    }).returning();
    return result;
  }

  async getCampaigns(): Promise<Campaign[]> {
    return await db.select().from(campaigns).orderBy(desc(campaigns.createdAt));
  }

  async getCampaign(id: number): Promise<Campaign | null> {
    const [result] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return result || null;
  }

  async updateCampaign(id: number, data: Partial<Campaign>): Promise<Campaign> {
    const [result] = await db.update(campaigns)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(campaigns.id, id))
      .returning();
    return result;
  }

  async getUser(id: string): Promise<User | undefined> {
    const [result] = await db.select().from(users).where(eq(users.id, id));
    return result;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [result] = await db.select().from(users).where(eq(users.username, username));
    return result;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [result] = await db.insert(users).values(user).returning();
    return result;
  }
}

export const storage = new PostgresStorage();
