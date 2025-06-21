import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

// Track failed login attempts for security
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

const JWT_SECRET = process.env.JWT_SECRET || "Al-Ramadi-Store-2025-Ultra-Secure-Key-#@$%^&*()_+{}[]|\\:;\"'<>,.?/~`";

export interface AuthRequest extends Request {
  admin?: {
    id: number;
    username: string;
    role: string;
  };
}

export function generateToken(userId: number, username: string): string {
  return jwt.sign(
    { 
      userId, 
      username, 
      role: "admin",
      iat: Math.floor(Date.now() / 1000),
      sessionId: Math.random().toString(36).substring(2, 15)
    },
    JWT_SECRET,
    { expiresIn: "8h" } // Reduced session time for better security
  );
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Check if IP is blocked due to failed attempts
export function isBlocked(ip: string): boolean {
  const attempts = failedAttempts.get(ip);
  if (!attempts) return false;
  
  const now = Date.now();
  if (now - attempts.lastAttempt > LOCKOUT_TIME) {
    failedAttempts.delete(ip);
    return false;
  }
  
  return attempts.count >= MAX_FAILED_ATTEMPTS;
}

// Record failed login attempt
export function recordFailedAttempt(ip: string): void {
  const attempts = failedAttempts.get(ip) || { count: 0, lastAttempt: 0 };
  attempts.count++;
  attempts.lastAttempt = Date.now();
  failedAttempts.set(ip, attempts);
}

// Clear failed attempts on successful login
export function clearFailedAttempts(ip: string): void {
  failedAttempts.delete(ip);
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  
  // Check if IP is blocked
  if (isBlocked(clientIP)) {
    return res.status(429).json({ 
      message: "تم حظر عنوان IP هذا مؤقتاً بسبب محاولات تسجيل دخول متعددة فاشلة" 
    });
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "رمز المصادقة مطلوب" });
  }

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== "admin") {
    return res.status(401).json({ message: "غير مصرح بالوصول" });
  }

  // Check token age for additional security
  const tokenAge = Date.now() / 1000 - decoded.iat;
  if (tokenAge > 8 * 60 * 60) { // 8 hours max
    return res.status(401).json({ message: "انتهت صلاحية الجلسة" });
  }

  req.admin = {
    id: decoded.userId,
    username: decoded.username,
    role: decoded.role,
  };

  next();
}