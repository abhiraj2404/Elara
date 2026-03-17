import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

const JWT_SECRET = process.env["JWT_SECRET"] || "elara-dev-secret";

// ─── JWT auth for dashboard routes ───

export interface AuthRequest extends Request {
  userId?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization header" });
    return;
  }

  try {
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function createToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

// ─── API key auth for SDK routes ───

export interface ApiKeyRequest extends Request {
  agent?: {
    id: string;
    agentId: string;
    agentPublicKey: string;
    agentPrivateKey: string;
    userId: string;
  };
  humanPrivateKey?: string;
}

export async function apiKeyMiddleware(req: ApiKeyRequest, res: Response, next: NextFunction): Promise<void> {
  const apiKey = req.headers["x-api-key"] as string;
  if (!apiKey) {
    res.status(401).json({ error: "Missing x-api-key header" });
    return;
  }

  const agent = await prisma.agent.findUnique({
    where: { apiKey },
    include: { user: true },
  });

  if (!agent) {
    res.status(401).json({ error: "Invalid API key" });
    return;
  }

  req.agent = {
    id: agent.id,
    agentId: agent.agentId,
    agentPublicKey: agent.agentPublicKey,
    agentPrivateKey: agent.agentPrivateKey,
    userId: agent.userId,
  };
  req.humanPrivateKey = agent.user.humanPrivateKey;
  next();
}
