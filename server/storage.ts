import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL!;

export const db = drizzle({
  connection: connectionString,
  schema,
  ws: ws,
});

export const storage = {
  // User methods
  async getUser(userId: string) {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, userId));
    return user;
  },

  async createUser(data: typeof schema.insertUserSchema._type) {
    const [user] = await db.insert(schema.users).values(data).returning();
    return user;
  },

  // Generated Content methods
  async getGeneratedContents(userId: string) {
    return await db.select()
      .from(schema.generatedContent)
      .where(eq(schema.generatedContent.userId, userId))
      .orderBy(desc(schema.generatedContent.createdAt));
  },

  async createGeneratedContent(data: typeof schema.insertGeneratedContentSchema._type) {
    const [content] = await db.insert(schema.generatedContent).values(data).returning();
    return content;
  },

  async updateGeneratedContent(id: number, data: Partial<typeof schema.insertGeneratedContentSchema._type>) {
    const [updated] = await db.update(schema.generatedContent)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.generatedContent.id, id))
      .returning();
    return updated;
  },

  async deleteGeneratedContent(id: number) {
    await db.delete(schema.generatedContent).where(eq(schema.generatedContent.id, id));
  },

  // Monthly Quota methods
  async getMonthlyQuota(userId: string, month: string) {
    const [quota] = await db.select()
      .from(schema.monthlyContentQuota)
      .where(
        and(
          eq(schema.monthlyContentQuota.userId, userId),
          eq(schema.monthlyContentQuota.month, month)
        )
      );
    return quota;
  },

  async createMonthlyQuota(data: typeof schema.insertMonthlyQuotaSchema._type) {
    const [quota] = await db.insert(schema.monthlyContentQuota).values(data).returning();
    return quota;
  },

  async updateMonthlyQuota(userId: string, month: string, increment: number) {
    const quota = await this.getMonthlyQuota(userId, month);
    if (!quota) {
      return await this.createMonthlyQuota({
        userId,
        month,
        contentGenerated: increment,
        maxContent: 8
      });
    }

    const [updated] = await db.update(schema.monthlyContentQuota)
      .set({ 
        contentGenerated: (quota.contentGenerated ?? 0) + increment,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(schema.monthlyContentQuota.userId, userId),
          eq(schema.monthlyContentQuota.month, month)
        )
      )
      .returning();
    return updated;
  }
};