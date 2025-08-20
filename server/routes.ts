import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateToken, requireAdmin, isBlocked, recordFailedAttempt, clearFailedAttempts, clearAllFailedAttempts, type AuthRequest } from "./auth";
import { customRateLimit, logSecurityEvent } from "./security";
import { telegramService } from "./telegram-service";
import { loginSchema, insertProductSchema, insertOrderSchema, insertCustomerActivitySchema, insertStoreSettingSchema, users } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { saveUploadedFile, getLocalImageUrl } from "./localStorage";
import multer from 'multer';

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Check if any users exist
  app.get('/api/admin/check-users', async (req, res) => {
    try {
      // Simply check database directly
      const result = await db.select().from(users).limit(1);
      res.json(result.length > 0);
    } catch (error) {
      console.error('Error checking users:', error);
      res.json(false); // If error, assume no users exist
    }
  });

  // Create first user (only when no users exist)
  app.post('/api/admin/create-first-user', async (req, res) => {
    try {
      // Check if any users already exist
      const existingUsers = await db.select().from(users).limit(1);
      if (existingUsers.length > 0) {
        return res.status(400).json({ message: 'يوجد مستخدمين بالفعل في النظام' });
      }

      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: 'اسم المستخدم وكلمة المرور مطلوبان' });
      }

      // Hash password and create user directly
      const hashedPassword = await bcrypt.hash(password, 10);
      const [user] = await db.insert(users).values({
        username,
        email: `${username}@system.local`,
        password: hashedPassword,
        role: 'admin'
      }).returning();

      // Generate token
      const token = generateToken(user.id, user.username);
      
      // Clear all IP blocks when first user is created successfully
      clearAllFailedAttempts();
      
      res.json({ 
        token,
        message: 'تم إنشاء الحساب بنجاح'
      });
    } catch (error) {
      console.error('Error creating first user:', error);
      res.status(500).json({ message: 'خطأ في إنشاء الحساب' });
    }
  });

  // Clear IP blocks endpoint (for troubleshooting)
  app.post('/api/admin/clear-blocks', async (req, res) => {
    try {
      clearAllFailedAttempts();
      res.json({ message: 'تم تنظيف قائمة IP المحظورة' });
    } catch (error) {
      console.error('Error clearing blocks:', error);
      res.status(500).json({ message: 'خطأ في النظام' });
    }
  });

  // Admin authentication routes  
  app.post('/api/admin/login', async (req, res) => {
    try {
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      
      const { username, password } = loginSchema.parse(req.body);
      
      const admin = await storage.authenticateAdmin(username, password);
      if (!admin) {
        return res.status(401).json({ message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
      }

      // Clear any previous blocks on successful login
      clearFailedAttempts(clientIP);
      
      const token = generateToken(admin.id, admin.username);
      
      // Log successful login
      console.log(`Admin login successful: ${admin.username} from IP: ${clientIP} at ${new Date().toISOString()}`);
      
      res.json({ token, user: { id: admin.id, username: admin.username, role: admin.role } });
    } catch (error) {
      console.error('Login error:', error);
      res.status(400).json({ message: "بيانات غير صحيحة" });
    }
  });

  app.post('/api/admin/logout', requireAdmin, async (req: AuthRequest, res) => {
    try {
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      
      // Clear any IP blocks for this user on logout
      clearFailedAttempts(clientIP);
      
      // Log successful logout
      console.log(`Admin logout successful: ${req.admin?.username} from IP: ${clientIP} at ${new Date().toISOString()}`);
      
      res.json({ message: "تم تسجيل الخروج بنجاح" });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: "حدث خطأ أثناء تسجيل الخروج" });
    }
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

  // إلغاء الطلب مع خصم المبلغ من الإيرادات
  app.post("/api/orders/:id/cancel", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // الحصول على تفاصيل الطلب قبل الإلغاء
      const orders = await storage.getOrders();
      const order = orders.find(o => o.id === id);
      
      if (!order) {
        return res.status(404).json({ message: "الطلب غير موجود" });
      }
      
      if (order.status === 'cancelled') {
        return res.status(400).json({ message: "الطلب ملغي مسبقاً" });
      }
      
      // تحديث حالة الطلب إلى ملغي
      const cancelledOrder = await storage.updateOrderStatus(id, 'cancelled');
      
      if (!cancelledOrder) {
        return res.status(500).json({ message: "فشل في إلغاء الطلب" });
      }
      
      // إرسال إشعار Telegram بالإلغاء
      try {
        await telegramService.sendCancellationNotification({
          orderId: order.id,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          totalAmount: order.totalAmount,
          cancelledBy: req.admin?.username || 'Admin'
        });
        console.log(`Telegram cancellation notification sent for order ${id}`);
      } catch (telegramError) {
        console.error('Failed to send Telegram cancellation notification:', telegramError);
        // لا نفشل عملية الإلغاء إذا فشل Telegram
      }
      
      // تسجيل النشاط
      await storage.logActivity({
        sessionId: order.sessionId,
        action: "cancel_order",
        metadata: { 
          orderId: order.id, 
          totalAmount: order.totalAmount,
          cancelledBy: req.admin?.username 
        }
      });
      
      console.log(`Order ${id} cancelled successfully by admin: ${req.admin?.username}`);
      
      res.json({ 
        message: "تم إلغاء الطلب بنجاح", 
        order: cancelledOrder,
        refundAmount: order.totalAmount 
      });
    } catch (error) {
      console.error('Error cancelling order:', error);
      res.status(500).json({ message: "فشل في إلغاء الطلب" });
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

  // Admin theme application endpoint
  app.post('/api/admin/settings', requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { key, value } = req.body;
      
      if (!key || !value) {
        return res.status(400).json({ message: "Key and value are required" });
      }
      
      const setting = await storage.updateStoreSetting(key, value);
      res.json(setting);
    } catch (error) {
      console.error('Error updating setting:', error);
      res.status(500).json({ message: "Failed to update setting" });
    }
  });

  // Object Storage Routes
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // إعداد multer للرفع المحلي
  const upload = multer({
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB حد أقصى
    },
    fileFilter: (req, file, cb) => {
      // قبول الصور فقط
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('نوع الملف غير مسموح - يجب أن يكون صورة'));
      }
    }
  });

  // رفع الصور محلياً
  app.post("/api/upload/image", requireAdmin, upload.single('image'), async (req: AuthRequest, res) => {
    try {
      console.log('Local image upload request from admin:', req.admin?.username);
      
      if (!req.file) {
        return res.status(400).json({ 
          error: "لم يتم تحديد أي ملف للرفع" 
        });
      }
      
      // حفظ الملف محلياً
      const imagePath = await saveUploadedFile(req.file.buffer, req.file.originalname);
      console.log('Image uploaded successfully:', imagePath);
      
      res.json({ 
        success: true,
        imagePath,
        message: "تم رفع الصورة بنجاح"
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      
      if (error instanceof Error) {
        return res.status(500).json({ 
          error: "خطأ في رفع الصورة: " + error.message 
        });
      }
      
      res.status(500).json({ 
        error: "خطأ غير معروف في رفع الصورة" 
      });
    }
  });

  // Get upload URL for product images (fallback للنظام القديم)
  app.post("/api/objects/upload", requireAdmin, async (req: AuthRequest, res) => {
    // تحويل الطلب إلى استخدام النظام المحلي
    res.json({ 
      useLocalUpload: true,
      endpoint: "/api/upload/image",
      message: "استخدم النظام المحلي لرفع الصور"
    });
  });

  // Serve uploaded images locally
  app.use('/uploads', (req, res, next) => {
    // إضافة headers للكاش
    res.setHeader('Cache-Control', 'public, max-age=3600');
    next();
  });
  
  // تقديم الصور المرفوعة محلياً
  const express = await import('express');
  app.use('/uploads', express.static('uploads'));

  // Serve uploaded objects (للنظام القديم)
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Placeholder image endpoint
  app.get("/api/placeholder-image", (req, res) => {
    const svg = `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#F3F4F6"/>
      <path d="M35 40H65V60H35V40Z" fill="#9CA3AF"/>
      <path d="M45 45H55V55H45V45Z" fill="#6B7280"/>
    </svg>`;
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
  });

  const httpServer = createServer(app);
  return httpServer;
}
