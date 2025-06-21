import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateToken, requireAdmin, isBlocked, recordFailedAttempt, clearFailedAttempts, type AuthRequest } from "./auth";
import { customRateLimit, logSecurityEvent } from "./security";
import { telegramService } from "./telegram-service";
import { loginSchema, insertProductSchema, insertOrderSchema, insertCustomerActivitySchema, insertStoreSettingSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Admin authentication routes with extra rate limiting
  app.post('/api/admin/login', 
    customRateLimit(
      15 * 60 * 1000, // 15 minutes
      3, // Max 3 login attempts per window per IP
      "تم تجاوز عدد محاولات تسجيل الدخول المسموح. حاول مرة أخرى بعد 15 دقيقة."
    ),
    async (req, res) => {
    try {
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      
      // Check if IP is blocked
      if (isBlocked(clientIP)) {
        return res.status(429).json({ 
          message: "تم حظر عنوان IP هذا مؤقتاً بسبب محاولات تسجيل دخول متعددة فاشلة. المحاولة مرة أخرى بعد 15 دقيقة." 
        });
      }

      const { username, password } = loginSchema.parse(req.body);
      
      const admin = await storage.authenticateAdmin(username, password);
      if (!admin) {
        // Record failed attempt
        recordFailedAttempt(clientIP);
        return res.status(401).json({ message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
      }

      // Clear failed attempts on successful login
      clearFailedAttempts(clientIP);
      
      const token = generateToken(admin.id, admin.username);
      
      // Log successful login for security monitoring
      console.log(`Admin login successful: ${admin.username} from IP: ${clientIP} at ${new Date().toISOString()}`);
      
      res.json({ token, user: { id: admin.id, username: admin.username, role: admin.role } });
    } catch (error) {
      console.error('Login error:', error);
      res.status(400).json({ message: "بيانات غير صحيحة" });
    }
  });

  app.post('/api/admin/logout', requireAdmin, async (req: AuthRequest, res) => {
    res.json({ message: "تم تسجيل الخروج بنجاح" });
  });

  app.get('/api/admin/verify', requireAdmin, async (req: AuthRequest, res) => {
    res.json({ user: req.admin });
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const { categoryId, search, featured } = req.query;
      const filters: any = {};
      
      if (categoryId) filters.categoryId = parseInt(categoryId as string);
      if (search) filters.search = search as string;
      if (featured) filters.featured = featured === 'true';
      
      const products = await storage.getProducts(filters);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, validatedData);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log(`Attempting to delete product with ID: ${id}`);
      
      // Check if product exists before deletion
      const existingProduct = await storage.getProduct(id);
      if (!existingProduct) {
        console.log(`Product ${id} not found`);
        return res.status(404).json({ message: "Product not found" });
      }
      
      console.log(`Product ${id} exists, proceeding with deletion`);
      const deleted = await storage.deleteProduct(id);
      
      if (!deleted) {
        console.log(`Failed to delete product ${id} from database`);
        return res.status(500).json({ message: "Failed to delete product from database" });
      }
      
      console.log(`Product ${id} deleted successfully`);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({ 
        message: "Failed to delete product", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Cart
  app.get("/api/cart/:sessionId", async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      const cartItems = await storage.getCartItems(sessionId);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const { sessionId, productId, quantity } = req.body;
      
      if (!sessionId || !productId || !quantity) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const cartItem = await storage.addToCart({ sessionId, productId, quantity });
      
      // Log activity
      await storage.logActivity({
        sessionId,
        action: "add_to_cart",
        productId,
        metadata: { quantity }
      });
      
      res.status(201).json(cartItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;
      
      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
      
      const cartItem = await storage.updateCartItem(id, quantity);
      
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.json(cartItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.removeFromCart(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove cart item" });
    }
  });

  // Orders
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(validatedData);
      
      // Send Telegram notification for new order
      try {
        await telegramService.sendOrderNotification(order);
      } catch (telegramError) {
        console.error('Failed to send Telegram notification:', telegramError);
        // Don't fail the order creation if Telegram fails
      }
      
      // Clear the cart after successful order
      await storage.clearCart(validatedData.sessionId);
      
      // Log activity
      await storage.logActivity({
        sessionId: validatedData.sessionId,
        action: "place_order",
        metadata: { orderId: order.id, totalAmount: validatedData.totalAmount }
      });
      
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.put("/api/orders/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const order = await storage.updateOrderStatus(id, status);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Store Settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getStoreSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put("/api/settings/:key", async (req, res) => {
    try {
      const key = req.params.key;
      const { value } = req.body;
      
      if (!value) {
        return res.status(400).json({ message: "Value is required" });
      }
      
      const setting = await storage.updateStoreSetting(key, value);
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Failed to update setting" });
    }
  });

  // Analytics
  app.get("/api/analytics/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get("/api/analytics/activity", async (req, res) => {
    try {
      const activity = await storage.getRecentActivity();
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });

  // Activity logging
  app.post("/api/activity", async (req, res) => {
    try {
      const validatedData = insertCustomerActivitySchema.parse(req.body);
      const activity = await storage.logActivity(validatedData);
      res.status(201).json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid activity data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to log activity" });
    }
  });

  // Visitor tracking routes
  app.post('/api/analytics/visitor', async (req, res) => {
    try {
      const sessionId = (req as any).sessionID || 'anonymous-' + Date.now();
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';

      // Simple country detection based on IP patterns
      let country = 'غير معروف';
      let city = 'غير معروف';
      
      // For local/internal IPs, assume Iraq
      if (ipAddress.includes('192.168') || ipAddress.includes('127.0') || ipAddress.includes('10.') || ipAddress === 'unknown') {
        country = 'العراق';
        city = 'الرمادي';
      }

      const visitor = await storage.trackVisitor({
        sessionId,
        ipAddress,
        country,
        city,
        userAgent,
      });

      res.json(visitor);
    } catch (error) {
      console.error('Error tracking visitor:', error);
      res.status(500).json({ message: 'Failed to track visitor' });
    }
  });

  app.get('/api/analytics/visitors', requireAdmin, async (req, res) => {
    try {
      const visitorStats = await storage.getVisitorStats();
      res.json(visitorStats);
    } catch (error) {
      console.error('Error fetching visitor stats:', error);
      res.status(500).json({ message: 'Failed to fetch visitor stats' });
    }
  });

  // Telegram Bot test endpoint
  app.post('/api/telegram/test', requireAdmin, async (req, res) => {
    try {
      await telegramService.sendTestMessage();
      res.json({ success: true, message: 'Test message sent successfully' });
    } catch (error) {
      console.error('Failed to send test message:', error);
      
      // Return more detailed error message
      let errorMessage = 'Failed to send test message';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      res.status(500).json({ 
        success: false, 
        message: errorMessage,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
