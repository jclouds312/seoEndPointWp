import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "../shared/db";
import { campaigns, generatedContent } from "../shared/schema";
import { eq } from "drizzle-orm";

interface GeneratedContent {
  id: string;
  title: string;
  content: string;
  metaDescription: string;
  seoScore: number;
  keywords: string;
  status: 'draft' | 'published';
  createdAt: Date;
  featuredImage?: string;
}

interface InsertGeneratedContent {
  title: string;
  content: string;
  metaDescription: string;
  seoScore: number;
  keywords: string;
  status: 'draft' | 'published';
  featuredImage?: string;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createGeneratedContent(content: InsertGeneratedContent): Promise<GeneratedContent>;
  getAllGeneratedContent(): Promise<GeneratedContent[]>;
  getGeneratedContent(id: string): Promise<GeneratedContent | undefined>;
  deleteGeneratedContent(id: string): Promise<void>;
  publishGeneratedContent(id: string): Promise<GeneratedContent>;
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
  }): Promise<GeneratedContent>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private generatedContent: Map<string, GeneratedContent>;

  constructor() {
    this.users = new Map();
    this.generatedContent = new Map();
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
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createGeneratedContent(data: {
    title: string;
    content: string;
    metaDescription: string;
    seoScore: number;
    keywords: string;
    status: 'draft' | 'published';
    featuredImage?: string;
    provider?: string;
    campaignId?: number;
  }): Promise<GeneratedContent> {
    const id = randomUUID();
    const content: GeneratedContent = {
      ...data,
      id,
      createdAt: new Date()
    };
    this.generatedContent.set(id, content);
    return content;
  }

  async getAllGeneratedContent(): Promise<GeneratedContent[]> {
    return Array.from(this.generatedContent.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getGeneratedContent(id: string): Promise<GeneratedContent | undefined> {
    return this.generatedContent.get(id);
  }

  async deleteGeneratedContent(id: string): Promise<void> {
    this.generatedContent.delete(id);
  }

  async publishGeneratedContent(id: string): Promise<GeneratedContent> {
    const content = this.generatedContent.get(id);
    if (!content) {
      throw new Error('Content not found');
    }
    content.status = 'published';
    this.generatedContent.set(id, content);
    return content;
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
  }) {
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
}

export const storage = new MemStorage();