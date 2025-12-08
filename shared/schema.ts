
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  blogUrl: text("blog_url").notNull(),
  description: text("description"),
  embedCode: text("embed_code").notNull(),
  status: text("status").notNull().default("active"),
  posts: integer("posts").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  userId: varchar("user_id").references(() => users.id),
  config: jsonb("config"),
});

export const generatedContent = pgTable("generated_content", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  slug: text("slug").notNull(),
  excerpt: text("excerpt"),
  keywords: text("keywords"),
  metaDescription: text("meta_description"),
  focusKeyword: text("focus_keyword"),
  seoScore: integer("seo_score"),
  status: text("status").notNull().default("draft"), // draft, published, scheduled
  provider: text("provider"), // openai, claude, no-cost-ai
  featuredImage: text("featured_image"), // AI-generated featured image URL
  publishedAt: timestamp("published_at"),
  scheduledFor: timestamp("scheduled_for"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  userId: varchar("user_id").references(() => users.id),
  campaignId: integer("campaign_id").references(() => campaigns.id),
  metadata: jsonb("metadata"),
});

export const contentHistory = pgTable("content_history", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").notNull().references(() => generatedContent.id),
  action: text("action").notNull(), // created, updated, published, scheduled
  changes: jsonb("changes"),
  performedBy: varchar("performed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const monthlyContentQuota = pgTable("monthly_content_quota", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  month: text("month").notNull(), // YYYY-MM format
  contentGenerated: integer("content_generated").default(0),
  maxContent: integer("max_content").default(8), // Límite mensual estándar: 8 posts
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  provider: text("provider").notNull(), // openai, claude, wordpress, etc
  keyValue: text("key_value").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns);
export const insertGeneratedContentSchema = createInsertSchema(generatedContent);
export const insertContentHistorySchema = createInsertSchema(contentHistory);
export const insertMonthlyQuotaSchema = createInsertSchema(monthlyContentQuota);
export const insertApiKeySchema = createInsertSchema(apiKeys);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
export type GeneratedContent = typeof generatedContent.$inferSelect;
export type ContentHistory = typeof contentHistory.$inferSelect;
export type MonthlyContentQuota = typeof monthlyContentQuota.$inferSelect;
export type ApiKey = typeof apiKeys.$inferSelect;
