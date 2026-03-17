import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { signData, serializeContent } from "../lib/crypto.js";
import { apiKeyMiddleware, type ApiKeyRequest } from "../middleware/auth.js";

export const proofsRouter = Router();

// ─── Submit proof (API key required) ───

const ProofSchema = z.object({
  type: z.string(),
  timestamp: z.number(),
  content: z.record(z.unknown()),
  sessionId: z.string().optional(),
  needsHumanSignature: z.boolean().optional(),
});

const SubmitSchema = z.union([ProofSchema, z.array(ProofSchema)]);

proofsRouter.post("/", apiKeyMiddleware, async (req: ApiKeyRequest, res) => {
  const parsed = SubmitSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const items = Array.isArray(parsed.data) ? parsed.data : [parsed.data];
  const agent = req.agent!;

  const proofsData = items.map((p) => {
    const serialized = serializeContent(p.content);
    const agentSignature = signData(serialized, agent.agentPrivateKey);

    let humanSignature: string | null = null;
    if (p.needsHumanSignature && req.humanPrivateKey) {
      humanSignature = signData(serialized, req.humanPrivateKey);
    }

    return {
      type: p.type,
      agentId: agent.agentId,
      sessionId: p.sessionId ?? null,
      timestamp: new Date(p.timestamp),
      content: p.content,
      agentSignature,
      humanSignature,
    };
  });

  const result = await prisma.proof.createMany({ data: proofsData });

  res.json({ created: result.count });
});

// ─── Get proofs for an agent (public) ───

proofsRouter.get("/:agentId", async (req, res) => {
  const proofs = await prisma.proof.findMany({
    where: { agentId: req.params["agentId"] },
    orderBy: { timestamp: "asc" },
  });

  res.json({ proofs });
});

// ─── Get proofs for a specific session (public) ───

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
