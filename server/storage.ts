import { type User, type InsertUser, type Post, type InsertPost, type InsertPageView, users, posts, pageViews } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, gte, and, lt, count } from "drizzle-orm";

export interface PostFilters {
  type?: string;
  qualification?: string;
  state?: string;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllPosts(): Promise<Post[]>;
  getPostsByType(type: string): Promise<Post[]>;
  getPostsByQualification(qualification: string): Promise<Post[]>;
  getPostsByState(state: string): Promise<Post[]>;
  getFilteredPosts(filters: PostFilters): Promise<Post[]>;
  getPost(id: number): Promise<Post | undefined>;
  getPostBySlug(slug: string): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, post: Partial<InsertPost>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;
  
  recordPageView(view: InsertPageView): Promise<void>;
  getAnalytics(): Promise<AnalyticsData>;
}

export interface AnalyticsData {
  totalVisitors: number;
  todayVisitors: number;
  yesterdayVisitors: number;
  activeUsers: number;
  pageViews: { page: string; count: number }[];
  topPosts: { postId: number; title: string; views: number }[];
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

  async getAllPosts(): Promise<Post[]> {
    return db.select().from(posts).orderBy(desc(posts.createdAt));
  }

  async getPostsByType(type: string): Promise<Post[]> {
    return db.select().from(posts).where(eq(posts.type, type)).orderBy(desc(posts.createdAt));
  }

  async getPostsByQualification(qualification: string): Promise<Post[]> {
    return db.select().from(posts).where(eq(posts.qualification, qualification)).orderBy(desc(posts.createdAt));
  }

  async getPostsByState(state: string): Promise<Post[]> {
    return db.select().from(posts).where(eq(posts.state, state)).orderBy(desc(posts.createdAt));
  }

  async getFilteredPosts(filters: PostFilters): Promise<Post[]> {
    const conditions = [];
    
    if (filters.type) {
      conditions.push(eq(posts.type, filters.type));
    }
    
    if (filters.qualification) {
      conditions.push(eq(posts.qualification, filters.qualification));
    }
    
    if (filters.state) {
      conditions.push(eq(posts.state, filters.state));
    }
    
    if (conditions.length === 0) {
      return db.select().from(posts).orderBy(desc(posts.createdAt));
    }
    
    return db.select().from(posts).where(and(...conditions)).orderBy(desc(posts.createdAt));
  }

  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  async getPostBySlug(slug: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.slug, slug));
    return post;
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  async updatePost(id: number, post: Partial<InsertPost>): Promise<Post | undefined> {
    const [updatedPost] = await db.update(posts).set(post).where(eq(posts.id, id)).returning();
    return updatedPost;
  }

  async deletePost(id: number): Promise<boolean> {
    const result = await db.delete(posts).where(eq(posts.id, id)).returning();
    return result.length > 0;
  }

  async recordPageView(view: InsertPageView): Promise<void> {
    await db.insert(pageViews).values(view);
  }

  async getAnalytics(): Promise<AnalyticsData> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const last5MinutesStart = new Date(now.getTime() - 5 * 60 * 1000);

    const [totalResult] = await db.select({ count: count() }).from(pageViews);
    const totalVisitors = totalResult?.count || 0;

    const [todayResult] = await db.select({ count: count() }).from(pageViews)
      .where(gte(pageViews.createdAt, todayStart));
    const todayVisitors = todayResult?.count || 0;

    const [yesterdayResult] = await db.select({ count: count() }).from(pageViews)
      .where(and(gte(pageViews.createdAt, yesterdayStart), lt(pageViews.createdAt, todayStart)));
    const yesterdayVisitors = yesterdayResult?.count || 0;

    const [activeResult] = await db.select({ count: count() }).from(pageViews)
      .where(gte(pageViews.createdAt, last5MinutesStart));
    const activeUsers = activeResult?.count || 0;

    const pageViewsData = await db.select({
      page: pageViews.page,
      count: count()
    }).from(pageViews).groupBy(pageViews.page).orderBy(desc(count()));

    const topPostsRaw = await db.select({
      postId: pageViews.postId,
      views: count()
    }).from(pageViews)
      .where(sql`${pageViews.postId} IS NOT NULL`)
      .groupBy(pageViews.postId)
      .orderBy(desc(count()))
      .limit(5);

    const topPosts = await Promise.all(
      topPostsRaw.map(async (p) => {
        const post = p.postId ? await this.getPost(p.postId) : null;
        return {
          postId: p.postId || 0,
          title: post?.title || 'Unknown Post',
          views: p.views
        };
      })
    );

    return {
      totalVisitors,
      todayVisitors,
      yesterdayVisitors,
      activeUsers,
      pageViews: pageViewsData.map(p => ({ page: p.page, count: p.count })),
      topPosts
    };
  }
}

export const storage = new DatabaseStorage();
