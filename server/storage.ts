import { type User, type InsertUser, type GeneratedContent as DBGeneratedContent } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "@shared/db";
import { users, generatedContent, bulkGenerationBatches } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllGeneratedContent(): Promise<DBGeneratedContent[]>;
  getGeneratedContent(id: number): Promise<DBGeneratedContent | undefined>;
  deleteGeneratedContent(id: number): Promise<void>;
  publishGeneratedContent(id: number): Promise<DBGeneratedContent>;
  saveGeneratedContent(data: {
    title: string;
    content: string;
    metaDescription: string;
    seoScore: number;
    status: 'draft' | 'published';
    keywords: string;
    featuredImage?: string;
    provider?: string;
    campaignId?: number;
  }): Promise<DBGeneratedContent>;
  createBulkBatch(data: any): Promise<any>;
  updateBulkBatch(batchId: string, data: any): Promise<any>;
  getBulkBatches(userId?: string): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getAllGeneratedContent(): Promise<DBGeneratedContent[]> {
    return await db.select()
      .from(generatedContent)
      .orderBy(desc(generatedContent.createdAt));
  }

  async getGeneratedContent(id: number): Promise<DBGeneratedContent | undefined> {
    const result = await db.select()
      .from(generatedContent)
      .where(eq(generatedContent.id, id));
    return result[0];
  }

  async deleteGeneratedContent(id: number): Promise<void> {
    await db.delete(generatedContent).where(eq(generatedContent.id, id));
  }

  async publishGeneratedContent(id: number): Promise<DBGeneratedContent> {
    const result = await db.update(generatedContent)
      .set({ status: 'published', publishedAt: new Date() })
      .where(eq(generatedContent.id, id))
      .returning();
    
    if (!result[0]) {
      throw new Error('Content not found');
    }
    return result[0];
  }

  async saveGeneratedContent(data: {
    title: string;
    content: string;
    metaDescription: string;
    seoScore: number;
    status: 'draft' | 'published';
    keywords: string;
    featuredImage?: string;
    provider?: string;
    campaignId?: number;
  }): Promise<DBGeneratedContent> {
    const result = await db.insert(generatedContent).values({
      title: data.title,
      content: data.content,
      metaDescription: data.metaDescription,
      seoScore: data.seoScore,
      status: data.status,
      keywords: data.keywords,
      featuredImage: data.featuredImage,
      provider: data.provider || 'free',
      campaignId: data.campaignId,
      slug: data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
    }).returning();

    return result[0];
  }

  async createBulkBatch(data: any) {
    const result = await db.insert(bulkGenerationBatches).values({
      ...data,
      createdAt: new Date()
    }).returning();
    return result[0];
  }

  async updateBulkBatch(batchId: string, data: any) {
    const result = await db.update(bulkGenerationBatches)
      .set({ ...data })
      .where(eq(bulkGenerationBatches.batchId, batchId))
      .returning();
    return result[0];
  }

  async getBulkBatches(userId?: string) {
    if (userId) {
      return await db.select()
        .from(bulkGenerationBatches)
        .where(eq(bulkGenerationBatches.userId, userId))
        .orderBy(desc(bulkGenerationBatches.createdAt));
    }
    return await db.select()
      .from(bulkGenerationBatches)
      .orderBy(desc(bulkGenerationBatches.createdAt));
  }
}

export const storage = new DatabaseStorage();
