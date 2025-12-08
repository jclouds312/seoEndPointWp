import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
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
  userId: text("user_id"),
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
  status: text("status").notNull().default("draft"),
  provider: text("provider"),
  featuredImage: text("featured_image"),
  publishedAt: timestamp("published_at"),
  scheduledFor: timestamp("scheduled_for"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  userId: varchar("user_id").references(() => users.id),
  campaignId: integer("campaign_id").references(() => campaigns.id),
  batchId: text("batch_id"), // For bulk generation tracking
  bulkType: text("bulk_type"), // 'standard' or 'massive'
  metadata: jsonb("metadata"),
});

export const bulkGenerationBatches = pgTable("bulk_generation_batches", {
  id: serial("id").primaryKey(),
  batchId: text("batch_id").notNull().unique(),
  userId: varchar("user_id").notNull().references(() => users.id),
  mainKeyword: text("main_keyword").notNull(),
  targetSite: text("target_site"),
  bulkType: text("bulk_type").notNull(), // 'standard' or 'massive'
  totalPosts: integer("total_posts").notNull(),
  completedPosts: integer("completed_posts").default(0),
  status: text("status").notNull().default("processing"), // processing, completed, failed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  metadata: jsonb("metadata"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
export type GeneratedContent = typeof generatedContent.$inferSelect;
