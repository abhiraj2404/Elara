import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { generateKeyPair, generateApiKey } from "../lib/crypto.js";
import { authMiddleware, type AuthRequest } from "../middleware/auth.js";

export const agentsRouter = Router();

// ─── Create agent (authenticated) ───

const CreateAgentSchema = z.object({
  agentName: z.string().min(1).max(100),
});

agentsRouter.post("/create", authMiddleware, async (req: AuthRequest, res) => {
  const parsed = CreateAgentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { agentName } = parsed.data;

  // Generate a unique agentId from the name
  const agentId = agentName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    + "-" + Date.now().toString(36);

  // Check for collision (very unlikely with timestamp suffix)
  const existing = await prisma.agent.findUnique({ where: { agentId } });
  if (existing) {
    res.status(409).json({ error: "Agent ID collision, please try again" });
    return;
  }

  // Generate agent keypair + API key
  const agentKeyPair = generateKeyPair();
  const apiKey = generateApiKey();

  const agent = await prisma.agent.create({
    data: {
      agentId,
      apiKey,
      agentPublicKey: agentKeyPair.publicKey,
      agentPrivateKey: agentKeyPair.privateKey,
      userId: req.userId!,
    },
  });

  res.json({
    agent: {
      id: agent.id,
      agentId: agent.agentId,
      apiKey: agent.apiKey,
      createdAt: agent.createdAt,
    },
  });
});

// ─── List my agents (authenticated) ───

agentsRouter.get("/my-agents", authMiddleware, async (req: AuthRequest, res) => {
  const agents = await prisma.agent.findMany({
    where: { userId: req.userId },
    select: {
      id: true,
      agentId: true,
      apiKey: true,
      createdAt: true,
      _count: { select: { proofs: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ agents });
});

// ─── Delete agent (authenticated) ───

agentsRouter.delete("/:agentId", authMiddleware, async (req: AuthRequest, res) => {
  const agent = await prisma.agent.findUnique({
    where: { agentId: req.params["agentId"] },
  });

  if (!agent || agent.userId !== req.userId) {
    res.status(404).json({ error: "Agent not found" });
    return;
  }

  // Delete proofs first, then agent
  await prisma.proof.deleteMany({ where: { agentId: agent.agentId } });
  await prisma.agent.delete({ where: { id: agent.id } });

  res.json({ deleted: true });
});

// ─── Get agent (public — for explorer) ───

agentsRouter.get("/:agentId", async (req, res) => {
  const agent = await prisma.agent.findUnique({
    where: { agentId: req.params["agentId"] },
    select: {
      id: true,
      agentId: true,
      agentPublicKey: true,
      createdAt: true,
      user: {
        select: { humanPublicKey: true },
      },
    },
  });

  if (!agent) {
    res.status(404).json({ error: "Agent not found" });
    return;
  }

  res.json({
    agent: {
      ...agent,
      humanPublicKey: agent.user.humanPublicKey,
      user: undefined,
    },
  });
});
