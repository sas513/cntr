import { 
  users, categories, products, cartItems, orders, storeSettings, 
  customerActivity, visitorStats,
  type User, type InsertUser,
  type Category, type InsertCategory,
  type Product, type InsertProduct,
  type CartItem, type InsertCartItem,
  type Order, type InsertOrder,
  type StoreSetting, type InsertStoreSetting,
  type CustomerActivity, type InsertCustomerActivity,
  type VisitorStats, type InsertVisitorStats
} from "@shared/schema";
import { db } from "@shared/db";
import { eq, desc, and, count, sum, like, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

export class DatabaseStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const result = await db.insert(users).values({
      ...user,
      password: hashedPassword
    }).returning();
    return result[0];
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Admin authentication
  async authenticateAdmin(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user || user.role !== 'admin') {
      return null;
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  async createAdminSession(userId: number): Promise<any> {
    return { id: 'temp', userId, expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000) };
  }

  async getAdminSession(sessionToken: string): Promise<any> {
    return undefined;
  }

  async deleteAdminSession(sessionToken: string): Promise<boolean> {
    return true;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.id);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id));
    return result[0];
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(category).returning();
    return result[0];
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const result = await db.update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    return result[0];
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return result.changes > 0;
  }

  // Products
  async getProducts(filters?: { categoryId?: number; search?: string; featured?: boolean }): Promise<Product[]> {
    let query = db.select().from(products);
    
    const conditions = [];
    
    if (filters?.categoryId) {
      conditions.push(eq(products.categoryId, filters.categoryId));
    }
    
    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        sql`${products.name} ILIKE ${searchTerm} OR ${products.nameAr} ILIKE ${searchTerm}`
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
    const result = await db.select().from(products).where(eq(products.id, id));
    return result[0];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(product).returning();
    return result[0];
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await db.update(products)
      .set(product)
      .where(eq(products.id, id))
      .returning();
    return result[0];
  }

  async deleteProduct(id: number): Promise<boolean> {
    // Delete related cart items first
    await db.delete(cartItems).where(eq(cartItems.productId, id));
    
    // Delete the product
    const result = await db.delete(products).where(eq(products.id, id));
    return result.changes > 0;
  }

  // Cart
  async getCartItems(sessionId: string): Promise<(CartItem & { product: Product })[]> {
    const result = await db
      .select({
        id: cartItems.id,
        sessionId: cartItems.sessionId,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        addedAt: cartItems.addedAt,
        product: products
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.sessionId, sessionId));
    
    return result;
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if item already exists
    const existing = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.sessionId, item.sessionId),
          eq(cartItems.productId, item.productId!)
        )
      );

    if (existing.length > 0) {
      // Update quantity
      const result = await db
        .update(cartItems)
        .set({ quantity: existing[0].quantity + item.quantity! })
        .where(eq(cartItems.id, existing[0].id))
        .returning();
      return result[0];
    } else {
      // Create new
      const result = await db.insert(cartItems).values(item).returning();
      return result[0];
    }
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const result = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return result[0];
  }

  async removeFromCart(id: number): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id));
    return result.changes > 0;
  }

  async clearCart(sessionId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id));
    return result[0];
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const result = await db.insert(orders).values(order).returning();
    return result[0];
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const result = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return result[0];
  }

  // Store Settings
  async getStoreSettings(): Promise<StoreSetting[]> {
    return await db.select().from(storeSettings);
  }

  async getStoreSetting(key: string): Promise<StoreSetting | undefined> {
    const result = await db.select().from(storeSettings).where(eq(storeSettings.key, key));
    return result[0];
  }

  async updateStoreSetting(key: string, value: string): Promise<StoreSetting> {
    const existing = await this.getStoreSetting(key);
    
    if (existing) {
      const result = await db
        .update(storeSettings)
        .set({ value, updatedAt: new Date() })
        .where(eq(storeSettings.key, key))
        .returning();
      return result[0];
    } else {
      const result = await db
        .insert(storeSettings)
        .values({ key, value })
        .returning();
      return result[0];
    }
  }

  // Customer Activity
  async logActivity(activity: InsertCustomerActivity): Promise<CustomerActivity> {
    const result = await db.insert(customerActivity).values(activity).returning();
    return result[0];
  }

  async getRecentActivity(): Promise<CustomerActivity[]> {
    return await db
      .select()
      .from(customerActivity)
      .orderBy(desc(customerActivity.timestamp))
      .limit(10);
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
      .select({ total: sum(orders.totalAmount) })
      .from(orders);
    
    const [ordersResult] = await db
      .select({ count: count() })
      .from(orders);
    
    const [productsResult] = await db
      .select({ count: count() })
      .from(products);
    
    const [customersResult] = await db
      .select({ count: count() })
      .from(visitorStats);

    return {
      totalSales: salesResult.total || "0",
      totalOrders: ordersResult.count,
      totalProducts: productsResult.count,
      totalCustomers: customersResult.count
    };
  }

  // Visitor tracking
  async trackVisitor(visitor: InsertVisitorStats): Promise<VisitorStats> {
    const result = await db.insert(visitorStats).values(visitor).returning();
    return result[0];
  }

  async updateVisitorStats(sessionId: string, pageViews: number): Promise<void> {
    await db
      .update(visitorStats)
      .set({ pageViews })
      .where(eq(visitorStats.sessionId, sessionId));
  }

  async getVisitorStats(): Promise<{
    totalVisitors: number;
    todayVisitors: number;
    countryCounts: Array<{ country: string; count: number }>;
  }> {
    const [totalResult] = await db
      .select({ count: count() })
      .from(visitorStats);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [todayResult] = await db
      .select({ count: count() })
      .from(visitorStats)
      .where(sql`${visitorStats.timestamp} >= ${today}`);

    const countryResults = await db
      .select({
        country: visitorStats.country,
        count: count()
      })
      .from(visitorStats)
      .groupBy(visitorStats.country);

    return {
      totalVisitors: totalResult.count,
      todayVisitors: todayResult.count,
      countryCounts: countryResults.map(r => ({
        country: r.country || 'Unknown',
        count: r.count
      }))
    };
  }
}

export const storage = new DatabaseStorage();