import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export interface AuthRequest extends Request {
  admin?: {
    id: number;
    username: string;
    role: string;
  };
}

export function generateToken(userId: number, username: string): string {
  return jwt.sign(
    { userId, username, role: "admin" },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "رمز المصادقة مطلوب" });
  }

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== "admin") {
    return res.status(401).json({ message: "غير مصرح بالوصول" });
  }

  req.admin = {
    id: decoded.userId,
    username: decoded.username,
    role: decoded.role,
  };

  next();
}