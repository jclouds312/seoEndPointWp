import { type User, type InsertUser, type Campaign, type InsertCampaign, type GeneratedContent, type InsertGeneratedContent, type WordpressConnection, type InsertWordpressConnection } from "@shared/schema";
import { db } from "../shared/db";
import { users, campaigns, generatedContent, wordpressConnections } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getCampaigns(): Promise<Campaign[]>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  
  getContent(): Promise<GeneratedContent[]>;
  getContentById(id: number): Promise<GeneratedContent | undefined>;
  createContent(content: InsertGeneratedContent): Promise<GeneratedContent>;
  updateContent(id: number, content: Partial<GeneratedContent>): Promise<GeneratedContent>;
  deleteContent(id: number): Promise<void>;

  getWordpressConnections(userId: string): Promise<WordpressConnection[]>;
  createWordpressConnection(conn: InsertWordpressConnection): Promise<WordpressConnection>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getCampaigns(): Promise<Campaign[]> {
    return db.select().from(campaigns);
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const [campaign] = await db.insert(campaigns).values(insertCampaign).returning();
    return campaign;
  }

  async getContent(): Promise<GeneratedContent[]> {
    return db.select().from(generatedContent);
  }

  async getContentById(id: number): Promise<GeneratedContent | undefined> {
    const [content] = await db.select().from(generatedContent).where(eq(generatedContent.id, id));
    return content;
  }

  async createContent(insertContent: InsertGeneratedContent): Promise<GeneratedContent> {
    const [content] = await db.insert(generatedContent).values(insertContent).returning();
    return content;
  }

  async updateContent(id: number, content: Partial<GeneratedContent>): Promise<GeneratedContent> {
    const [updated] = await db.update(generatedContent).set(content).where(eq(generatedContent.id, id)).returning();
    return updated;
  }

  async deleteContent(id: number): Promise<void> {
    await db.delete(generatedContent).where(eq(generatedContent.id, id));
  }

  async getWordpressConnections(userId: string): Promise<WordpressConnection[]> {
    return db.select().from(wordpressConnections).where(eq(wordpressConnections.userId, userId));
  }

  async createWordpressConnection(conn: InsertWordpressConnection): Promise<WordpressConnection> {
    const [connection] = await db.insert(wordpressConnections).values(conn).returning();
    return connection;
  }
}

export const storage = new DatabaseStorage();
