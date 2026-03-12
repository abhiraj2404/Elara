import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

export const agentsRouter: Router = Router();

// ─── Register agent ───

const RegisterSchema = z.object({
  agentId: z.string().min(1),
  agentPublicKey: z.string().min(1),
  humanPublicKey: z.string().min(1),
});

agentsRouter.post("/register", async (req, res) => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { agentId, agentPublicKey, humanPublicKey } = parsed.data;

  const agent = await prisma.agent.upsert({
    where: { agentId },
    update: { agentPublicKey, humanPublicKey },
    create: { agentId, agentPublicKey, humanPublicKey },
  });

  res.json({ agent });
});

// ─── Get agent ───

agentsRouter.get("/:agentId", async (req, res) => {
  const agent = await prisma.agent.findUnique({
    where: { agentId: req.params["agentId"] },
  });

  if (!agent) {
    res.status(404).json({ error: "Agent not found" });
    return;
  }

  res.json({ agent });
});
