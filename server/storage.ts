import {
  type User,
  type InsertUser,
  type Campaign,
  type GeneratedContent,
  type ContentHistory,
  type MonthlyContentQuota,
  type ApiKey,
  type InstalledAddon,
  type InsertInstalledAddon,
  users,
  campaigns,
  generatedContent,
  contentHistory,
  monthlyContentQuota,
  apiKeys,
  installedAddons,
  insertCampaignSchema,
  insertGeneratedContentSchema,
  insertContentHistorySchema,
  insertApiKeySchema,
  insertInstalledAddonSchema
} from "@shared/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, and, desc, sql } from "drizzle-orm";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Campaign methods
  getCampaigns(userId: string): Promise<Campaign[]>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  createCampaign(data: any): Promise<Campaign>;
  updateCampaign(id: number, data: any): Promise<Campaign>;
  deleteCampaign(id: number): Promise<void>;

  // Content methods
  getGeneratedContents(userId: string, campaignId?: number): Promise<GeneratedContent[]>;
  getGeneratedContent(id: number): Promise<GeneratedContent | undefined>;
  createGeneratedContent(data: any): Promise<GeneratedContent>;
  updateGeneratedContent(id: number, data: any): Promise<GeneratedContent>;
  deleteGeneratedContent(id: number): Promise<void>;
  publishContent(id: number): Promise<GeneratedContent>;

  // Content History
  createContentHistory(data: any): Promise<ContentHistory>;
  getContentHistory(contentId: number): Promise<ContentHistory[]>;

  // Monthly Quota
  getMonthlyQuota(userId: string, month: string): Promise<MonthlyContentQuota | undefined>;
  updateMonthlyQuota(userId: string, month: string, increment: number): Promise<MonthlyContentQuota>;

  // API Keys
  getApiKeys(userId: string): Promise<ApiKey[]>;
  getApiKey(userId: string, provider: string): Promise<ApiKey | undefined>;
  createApiKey(data: any): Promise<ApiKey>;
  updateApiKey(id: number, data: any): Promise<ApiKey>;
  deleteApiKey(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const result = await db.insert(users).values(insertUser).returning();
      return result[0];
    } catch (error: any) {
      // If user already exists, fetch and return it
      if (error.code === '23505') { // PostgreSQL unique violation
        const existing = await this.getUserByUsername(insertUser.username);
        if (existing) return existing;
      }
      throw error;
    }
  }

  // Campaign methods
  async getCampaigns(userId: string): Promise<Campaign[]> {
    return await db.select().from(campaigns).where(eq(campaigns.userId, userId)).orderBy(desc(campaigns.createdAt));
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    const result = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
    return result[0];
  }

  async createCampaign(data: any): Promise<Campaign> {
    const validated = insertCampaignSchema.parse(data);
    const result = await db.insert(campaigns).values(validated).returning();
    return result[0];
  }

  async updateCampaign(id: number, data: any): Promise<Campaign> {
    const result = await db
      .update(campaigns)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(campaigns.id, id))
      .returning();
    return result[0];
  }

  async deleteCampaign(id: number): Promise<void> {
    await db.delete(campaigns).where(eq(campaigns.id, id));
  }

  // Content methods
  async getGeneratedContents(userId: string, campaignId?: number): Promise<GeneratedContent[]> {
    if (campaignId) {
      return await db
        .select()
        .from(generatedContent)
        .where(and(eq(generatedContent.userId, userId), eq(generatedContent.campaignId, campaignId)))
        .orderBy(desc(generatedContent.createdAt));
    }
    return await db
      .select()
      .from(generatedContent)
      .where(eq(generatedContent.userId, userId))
      .orderBy(desc(generatedContent.createdAt));
  }

  async getGeneratedContent(id: number): Promise<GeneratedContent | undefined> {
    const result = await db.select().from(generatedContent).where(eq(generatedContent.id, id)).limit(1);
    return result[0];
  }

  async createGeneratedContent(data: any): Promise<GeneratedContent> {
    const validated = insertGeneratedContentSchema.parse(data);
    const result = await db.insert(generatedContent).values(validated).returning();

    // Track content history
    await this.createContentHistory({
      contentId: result[0].id,
      action: 'created',
      changes: { title: result[0].title },
      performedBy: result[0].userId
    });

    return result[0];
  }

  async updateGeneratedContent(id: number, data: any): Promise<GeneratedContent> {
    const result = await db
      .update(generatedContent)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(generatedContent.id, id))
      .returning();

    // Track content history
    await this.createContentHistory({
      contentId: id,
      action: 'updated',
      changes: data,
      performedBy: result[0].userId
    });

    return result[0];
  }

  async deleteGeneratedContent(id: number): Promise<void> {
    await db.delete(generatedContent).where(eq(generatedContent.id, id));
  }

  async publishContent(id: number): Promise<GeneratedContent> {
    const result = await db
      .update(generatedContent)
      .set({
        status: 'published',
        publishedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(generatedContent.id, id))
      .returning();

    // Track content history
    await this.createContentHistory({
      contentId: id,
      action: 'published',
      changes: { status: 'published', publishedAt: new Date() },
      performedBy: result[0].userId
    });

    return result[0];
  }

  // Content History
  async createContentHistory(data: any): Promise<ContentHistory> {
    const validated = insertContentHistorySchema.parse(data);
    const result = await db.insert(contentHistory).values(validated).returning();
    return result[0];
  }

  async getContentHistory(contentId: number): Promise<ContentHistory[]> {
    return await db
      .select()
      .from(contentHistory)
      .where(eq(contentHistory.contentId, contentId))
      .orderBy(desc(contentHistory.createdAt));
  }

  // Monthly Quota
  async getMonthlyQuota(userId: string, month: string): Promise<MonthlyContentQuota | undefined> {
    const result = await db
      .select()
      .from(monthlyContentQuota)
      .where(and(eq(monthlyContentQuota.userId, userId), eq(monthlyContentQuota.month, month)))
      .limit(1);
    return result[0];
  }

  async updateMonthlyQuota(userId: string, month: string, increment: number = 1): Promise<MonthlyContentQuota> {
    const existing = await this.getMonthlyQuota(userId, month);

    if (existing) {
      const result = await db
        .update(monthlyContentQuota)
        .set({
          contentGenerated: sql`${monthlyContentQuota.contentGenerated} + ${increment}`,
          updatedAt: new Date()
        })
        .where(eq(monthlyContentQuota.id, existing.id))
        .returning();
      return result[0];
    } else {
      const result = await db
        .insert(monthlyContentQuota)
        .values({
          userId,
          month,
          contentGenerated: increment,
          maxContent: 8
        })
        .returning();
      return result[0];
    }
  }

  // API Keys
  async getApiKeys(userId: string): Promise<ApiKey[]> {
    return await db.select().from(apiKeys).where(eq(apiKeys.userId, userId));
  }

  async getApiKey(userId: string, provider: string): Promise<ApiKey | undefined> {
    const result = await db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.userId, userId), eq(apiKeys.provider, provider), eq(apiKeys.isActive, true)))
      .limit(1);
    return result[0];
  }

  async createApiKey(data: any): Promise<ApiKey> {
    const validated = insertApiKeySchema.parse(data);
    const result = await db.insert(apiKeys).values(validated).returning();
    return result[0];
  }

  async updateApiKey(id: number, data: any): Promise<ApiKey> {
    const result = await db
      .update(apiKeys)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(apiKeys.id, id))
      .returning();
    return result[0];
  }

  async deleteApiKey(id: number): Promise<void> {
    await db.delete(apiKeys).where(eq(apiKeys.id, id));
  }
}

export const storage = new DatabaseStorage();


  // Installed Addons methods
  async getInstalledAddons(userId: string): Promise<InstalledAddon[]> {
    return await db.select().from(installedAddons).where(eq(installedAddons.userId, userId));
  }

  async installAddon(data: Omit<InsertInstalledAddon, 'id'>): Promise<InstalledAddon> {
    const validated = insertInstalledAddonSchema.parse(data);
    const result = await db.insert(installedAddons).values(validated).returning();
    return result[0];
  }

  async uninstallAddon(userId: string, addonId: string): Promise<void> {
    await db.delete(installedAddons)
      .where(and(
        eq(installedAddons.userId, userId),
        eq(installedAddons.addonId, addonId)
      ));
  }

  async updateAddonLastUsed(userId: string, addonId: string): Promise<void> {
    await db.update(installedAddons)
      .set({ lastUsed: new Date() })
      .where(and(
        eq(installedAddons.userId, userId),
        eq(installedAddons.addonId, addonId)
      ));
  }