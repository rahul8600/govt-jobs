import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, jsonb, timestamp, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  slug: text("slug"),
  title: text("title").notNull(),
  department: text("department").notNull(),
  type: text("type").notNull().default("job"),
  lastDate: text("last_date"),
  postDate: text("post_date").notNull(),
  shortInfo: text("short_info").notNull(),
  qualification: text("qualification"),
  state: text("state"),
  category: text("category"),
  vacancyDetails: jsonb("vacancy_details").default([]),
  applicationFee: jsonb("application_fee").default([]),
  importantDates: jsonb("important_dates").default([]),
  ageLimit: jsonb("age_limit").default([]),
  eligibilityDetails: text("eligibility_details"),
  selectionProcess: jsonb("selection_process").default([]),
  physicalEligibility: jsonb("physical_eligibility").default([]),
  links: jsonb("links").default([]),
  featured: boolean("featured").default(false),
  trending: boolean("trending").default(false),
  rawJobContent: text("raw_job_content"),
  applyOnlineUrl: text("apply_online_url"),
  admitCardUrl: text("admit_card_url"),
  resultUrl: text("result_url"),
  answerKeyUrl: text("answer_key_url"),
  notificationUrl: text("notification_url"),
  officialWebsiteUrl: text("official_website_url"),
  importantDatesHtml: text("important_dates_html"),
  applicationFeeHtml: text("application_fee_html"),
  ageLimitHtml: text("age_limit_html"),
  vacancyDetailsHtml: text("vacancy_details_html"),
  physicalStandardHtml: text("physical_standard_html"),
  physicalEfficiencyHtml: text("physical_efficiency_html"),
  selectionProcessHtml: text("selection_process_html"),
  importantLinksHtml: text("important_links_html"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
});

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export const pageViews = pgTable("page_views", {
  id: serial("id").primaryKey(),
  page: text("page").notNull(),
  postId: integer("post_id"),
  sessionId: text("session_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPageViewSchema = createInsertSchema(pageViews).omit({
  id: true,
  createdAt: true,
});

export type PageView = typeof pageViews.$inferSelect;
export type InsertPageView = z.infer<typeof insertPageViewSchema>;
