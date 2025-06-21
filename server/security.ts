import type { Request, Response, NextFunction } from "express";

// Simple rate limiting implementation
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function customRateLimit(windowMs: number, maxRequests: number, message: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    const existing = requestCounts.get(ip);
    
    if (!existing || now > existing.resetTime) {
      requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (existing.count >= maxRequests) {
      return res.status(429).json({ message });
    }
    
    existing.count++;
    next();
  };
}

// Security headers middleware
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Prevent information disclosure
  res.removeHeader('X-Powered-By');
  
  // Strict transport security (HTTPS only)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https: blob:; " +
    "connect-src 'self' https:; " +
    "frame-ancestors 'none';"
  );
  
  next();
}

// Input sanitization middleware
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  // Basic input sanitization for common attack vectors
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  next();
}

function sanitizeObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeObject(value);
  }
  
  return sanitized;
}

function sanitizeString(input: any): any {
  if (typeof input !== 'string') {
    return input;
  }
  
  // Remove potential script injections
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/eval\s*\(/gi, '')
    .replace(/expression\s*\(/gi, '');
}

// Validate admin session token format
export function validateTokenFormat(token: string): boolean {
  // JWT format: header.payload.signature
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  
  // Basic validation that each part is base64-like
  const base64Regex = /^[A-Za-z0-9_-]+$/;
  return parts.every(part => base64Regex.test(part));
}

// Log security events
export function logSecurityEvent(event: string, details: any) {
  const timestamp = new Date().toISOString();
  console.log(`[SECURITY] ${timestamp} - ${event}:`, JSON.stringify(details));
}

// Detect suspicious activity patterns
const suspiciousPatterns = [
  /union\s+select/i,
  /drop\s+table/i,
  /delete\s+from/i,
  /insert\s+into/i,
  /<script[^>]*>/i,
  /javascript:/i,
  /vbscript:/i,
  /on\w+\s*=/i,
  /eval\s*\(/i,
  /expression\s*\(/i,
  /\.\.\/\.\.\//,
  /etc\/passwd/i,
  /windows\/system32/i,
];

export function detectSuspiciousActivity(req: Request): boolean {
  const checkString = JSON.stringify({ 
    url: req.url, 
    body: req.body, 
    query: req.query,
    headers: req.headers
  });
  
  return suspiciousPatterns.some(pattern => pattern.test(checkString));
}

// IP whitelist for admin access (optional)
const adminWhitelist: string[] = [];

export function checkAdminWhitelist(ip: string): boolean {
  if (adminWhitelist.length === 0) return true; // No whitelist = allow all
  return adminWhitelist.includes(ip);
}