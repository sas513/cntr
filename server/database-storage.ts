import {
  users,
  categories,
  products,
  cartItems,
  orders,
  storeSettings,
  customerActivity,
  adminSessions,
  type User,
  type InsertUser,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type StoreSetting,
  type InsertStoreSetting,
  type CustomerActivity,
  type InsertCustomerActivity,
  type AdminSession,
  type InsertAdminSession,
  type LoginData,
  visitorStats,
  type VisitorStats,
  type InsertVisitorStats,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, or, and, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        password: hashedPassword,
      })
      .returning();
    return user;
  }

  // Admin authentication
  async authenticateAdmin(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user || user.role !== "admin") {
      return null;
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  async createAdminSession(userId: number): Promise<AdminSession> {
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const [session] = await db
      .insert(adminSessions)
      .values({
        userId,
        sessionToken,
        expiresAt,
      })
      .returning();
    
    return session;
  }

  async getAdminSession(sessionToken: string): Promise<AdminSession | undefined> {
    const [session] = await db
      .select()
      .from(adminSessions)
      .where(and(
        eq(adminSessions.sessionToken, sessionToken),
        sql`${adminSessions.expiresAt} > NOW()`
      ));
    return session;
  }

  async deleteAdminSession(sessionToken: string): Promise<boolean> {
    const result = await db
      .delete(adminSessions)
      .where(eq(adminSessions.sessionToken, sessionToken));
    return true;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }

  async updateCategory(id: number, updateData: Partial<InsertCategory>): Promise<Category | undefined> {
    const [category] = await db
      .update(categories)
      .set(updateData)
      .where(eq(categories.id, id))
      .returning();
    return category;
  }

  async deleteCategory(id: number): Promise<boolean> {
    await db.delete(categories).where(eq(categories.id, id));
    return true;
  }

  // Products
  async getProducts(filters?: { categoryId?: number; search?: string; featured?: boolean }): Promise<Product[]> {
    let query = db.select().from(products);
    const conditions = [];

    if (filters?.categoryId) {
      conditions.push(eq(products.categoryId, filters.categoryId));
    }

    if (filters?.search) {
      conditions.push(
        or(
          like(products.name, `%${filters.search}%`),
          like(products.nameAr, `%${filters.search}%`)
        )
      );
    }

    if (filters?.featured) {
      conditions.push(eq(products.isFeatured, true));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(products.createdAt));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(insertProduct)
      .returning();
    return product;
  }

  async updateProduct(id: number, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: number): Promise<boolean> {
    try {
      // Use transaction to ensure atomicity
      return await db.transaction(async (tx) => {
        // 1. Delete cart items that reference this product
        console.log(`Deleting cart items for product ${id}`);
        await tx.delete(cartItems).where(eq(cartItems.productId, id));
        
        // 2. Delete customer activity records that reference this product
        console.log(`Deleting activity records for product ${id}`);
        await tx.delete(customerActivity).where(eq(customerActivity.productId, id));
        
        // 3. Finally delete the product itself
        console.log(`Deleting product ${id}`);
        const result = await tx.delete(products).where(eq(products.id, id));
        
        console.log(`Product ${id} deletion completed successfully`);
        return true;
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }

  // Cart
  async getCartItems(sessionId: string): Promise<(CartItem & { product: Product })[]> {
    const items = await db
      .select({
        id: cartItems.id,
        sessionId: cartItems.sessionId,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        addedAt: cartItems.addedAt,
        product: products,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.sessionId, sessionId));

    return items;
  }

  async addToCart(insertItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.sessionId, insertItem.sessionId),
          eq(cartItems.productId, insertItem.productId!)
        )
      );

    if (existingItem) {
      // Update quantity
      const [updated] = await db
        .update(cartItems)
        .set({ quantity: existingItem.quantity + (insertItem.quantity || 1) })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updated;
    } else {
      // Create new item
      const [item] = await db
        .insert(cartItems)
        .values(insertItem)
        .returning();
      return item;
    }
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const [item] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return item;
  }

  async removeFromCart(id: number): Promise<boolean> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
    return true;
  }

  async clearCart(sessionId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values(insertOrder)
      .returning();
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  // Store Settings
  async getStoreSettings(): Promise<StoreSetting[]> {
    return await db.select().from(storeSettings);
  }

  async getStoreSetting(key: string): Promise<StoreSetting | undefined> {
    const [setting] = await db.select().from(storeSettings).where(eq(storeSettings.key, key));
    return setting;
  }

  async updateStoreSetting(key: string, value: string): Promise<StoreSetting> {
    const [setting] = await db
      .insert(storeSettings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: storeSettings.key,
        set: { value },
      })
      .returning();
    return setting;
  }

  // Customer Activity
  async logActivity(insertActivity: InsertCustomerActivity): Promise<CustomerActivity> {
    const [activity] = await db
      .insert(customerActivity)
      .values(insertActivity)
      .returning();
    return activity;
  }

  async getRecentActivity(): Promise<CustomerActivity[]> {
    return await db
      .select()
      .from(customerActivity)
      .orderBy(desc(customerActivity.timestamp))
      .limit(100);
  }

  async getActivityBySession(sessionId: string): Promise<CustomerActivity[]> {
    return await db
      .select()
      .from(customerActivity)
      .where(eq(customerActivity.sessionId, sessionId))
      .orderBy(desc(customerActivity.timestamp));
  }

  // Analytics
  async getStats(): Promise<{
    totalSales: string;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
  }> {
    const [salesResult] = await db
      .select({
        total: sql<string>`COALESCE(SUM(CAST(${orders.totalAmount} AS NUMERIC)), 0)`,
      })
      .from(orders);

    const [ordersResult] = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(orders);

    const [productsResult] = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(products);

    const [customersResult] = await db
      .select({
        count: sql<number>`COUNT(DISTINCT ${customerActivity.sessionId})`,
      })
      .from(customerActivity);

    return {
      totalSales: salesResult.total || "0",
      totalOrders: ordersResult.count,
      totalProducts: productsResult.count,
      totalCustomers: customersResult.count,
    };
  }

  // Visitor tracking
  async trackVisitor(visitor: InsertVisitorStats): Promise<VisitorStats> {
    const [existingVisitor] = await db
      .select()
      .from(visitorStats)
      .where(eq(visitorStats.sessionId, visitor.sessionId));

    if (existingVisitor) {
      // Update existing visitor
      const [updated] = await db
        .update(visitorStats)
        .set({
          lastVisit: new Date(),
          pageViews: sql`${visitorStats.pageViews} + 1`,
        })
        .where(eq(visitorStats.sessionId, visitor.sessionId))
        .returning();
      return updated;
    } else {
      // Create new visitor
      const [created] = await db
        .insert(visitorStats)
        .values(visitor)
        .returning();
      return created;
    }
  }

  async updateVisitorStats(sessionId: string, pageViews: number): Promise<void> {
    await db
      .update(visitorStats)
      .set({
        lastVisit: new Date(),
        pageViews: pageViews,
      })
      .where(eq(visitorStats.sessionId, sessionId));
  }

  async getVisitorStats(): Promise<{
    totalVisitors: number;
    todayVisitors: number;
    countryCounts: Array<{ country: string; count: number }>;
  }> {
    // Total visitors
    const [totalResult] = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(visitorStats);

    // Today's visitors
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [todayResult] = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(visitorStats)
      .where(sql`${visitorStats.firstVisit} >= ${today}`);

    // Country counts
    const countryResults = await db
      .select({
        country: visitorStats.country,
        count: sql<number>`COUNT(*)`,
      })
      .from(visitorStats)
      .where(sql`${visitorStats.country} IS NOT NULL`)
      .groupBy(visitorStats.country)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(10);

    return {
      totalVisitors: totalResult.count,
      todayVisitors: todayResult.count,
      countryCounts: countryResults.map(r => ({
        country: r.country || 'Unknown',
        count: r.count,
      })),
    };
  }
}