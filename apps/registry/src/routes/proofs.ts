import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

export const proofsRouter: Router = Router();

// ─── Submit proof(s) ───

const ProofSchema = z.object({
  type: z.string(),
  agentId: z.string(),
  sessionId: z.string().optional(),
  timestamp: z.number(),
  content: z.record(z.unknown()),
  agentSignature: z.string(),
  humanSignature: z.string().optional(),
});

// Accept a single proof or a batch
const SubmitSchema = z.union([ProofSchema, z.array(ProofSchema)]);

proofsRouter.post("/", async (req, res) => {
  const parsed = SubmitSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const items = Array.isArray(parsed.data) ? parsed.data : [parsed.data];

  // Verify agent exists
  const agentId = items[0]?.agentId;
  if (!agentId) {
    res.status(400).json({ error: "Missing agentId" });
    return;
  }

  const agentExists = await prisma.agent.findUnique({ where: { agentId } });
  if (!agentExists) {
    res.status(404).json({
      error: `Agent "${agentId}" not registered. Call POST /api/agents/register first.`,
    });
    return;
  }

  const proofs = await prisma.proof.createMany({
    data: items.map((p) => ({
      type: p.type,
      agentId: p.agentId,
      sessionId: p.sessionId ?? null,
      timestamp: new Date(p.timestamp),
      content: p.content,
      agentSignature: p.agentSignature,
      humanSignature: p.humanSignature ?? null,
    })),
  });

  res.json({ created: proofs.count });
});

// ─── Get proofs for an agent ───

proofsRouter.get("/:agentId", async (req, res) => {
  const proofs = await prisma.proof.findMany({
    where: { agentId: req.params["agentId"] },
    orderBy: { timestamp: "asc" },
  });

  res.json({ proofs });
});

// ─── Get proofs for a specific session ───

proofsRouter.get("/:agentId/sessions/:sessionId", async (req, res) => {
  const proofs = await prisma.proof.findMany({
    where: {
      agentId: req.params["agentId"],
      sessionId: req.params["sessionId"],
    },
    orderBy: { timestamp: "asc" },
  });

  res.json({ proofs });
});
