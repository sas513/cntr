import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("customer"), // customer, admin
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  descriptionAr: text("description_ar"),
  isActive: boolean("is_active").default(true),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  description: text("description"),
  descriptionAr: text("description_ar"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  categoryId: integer("category_id").references(() => categories.id),
  images: text("images").array(),
  sku: text("sku").unique(),
  stock: integer("stock").default(0),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  productId: integer("product_id").references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  addedAt: timestamp("added_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  shippingAddress: text("shipping_address").notNull(),
  city: text("city").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, confirmed, shipped, delivered, cancelled
  items: jsonb("items").$type<Array<{
    productId: number;
    name: string;
    nameAr: string;
    price: string;
    quantity: number;
    image?: string;
  }>>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const storeSettings = pgTable("store_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const customerActivity = pgTable("customer_activity", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  action: text("action").notNull(), // view_product, add_to_cart, purchase, etc.
  productId: integer("product_id").references(() => products.id),
  metadata: jsonb("metadata"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  role: true,
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  nameAr: true,
  slug: true,
  description: true,
  descriptionAr: true,
  isActive: true,
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  nameAr: true,
  description: true,
  descriptionAr: true,
  price: true,
  originalPrice: true,
  categoryId: true,
  images: true,
  sku: true,
  stock: true,
  isActive: true,
  isFeatured: true,
  tags: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).pick({
  sessionId: true,
  productId: true,
  quantity: true,
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  sessionId: true,
  customerName: true,
  customerPhone: true,
  customerEmail: true,
  shippingAddress: true,
  city: true,
  totalAmount: true,
  items: true,
});

export const insertStoreSettingSchema = createInsertSchema(storeSettings).pick({
  key: true,
  value: true,
});

export const insertCustomerActivitySchema = createInsertSchema(customerActivity).pick({
  sessionId: true,
  action: true,
  productId: true,
  metadata: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type StoreSetting = typeof storeSettings.$inferSelect;
export type InsertStoreSetting = z.infer<typeof insertStoreSettingSchema>;

export type CustomerActivity = typeof customerActivity.$inferSelect;
export type InsertCustomerActivity = z.infer<typeof insertCustomerActivitySchema>;
