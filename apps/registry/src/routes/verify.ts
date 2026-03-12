import { Router } from "express";
import { z } from "zod";
import { ElaraVerifier } from "@elara/core";
import { prisma } from "../lib/prisma.js";

export const verifyRouter: Router = Router();

// ─── Verify a proof by ID ───

verifyRouter.get("/:proofId", async (req, res) => {
  const proof = await prisma.proof.findUnique({
    where: { id: req.params["proofId"] },
    include: { agent: true },
  });

  if (!proof) {
    res.status(404).json({ error: "Proof not found" });
    return;
  }

  const verifier = new ElaraVerifier({
    agentPublicKey: proof.agent.agentPublicKey,
    humanPublicKey: proof.agent.humanPublicKey,
  });

  const result = verifier.verify({
    type: proof.type as Parameters<typeof verifier.verify>[0]["type"],
    agentId: proof.agentId,
    timestamp: proof.timestamp.getTime(),
    content: proof.content as Record<string, unknown>,
    agentSignature: proof.agentSignature,
    humanSignature: proof.humanSignature ?? undefined,
  });

  res.json({
    proofId: proof.id,
    agentVerified: result.agentVerified,
    humanVerified: result.humanVerified,
    isValid: result.isValid,
    isHumanIntervention: !!proof.humanSignature,
    proof: {
      type: proof.type,
      agentId: proof.agentId,
      sessionId: proof.sessionId,
      timestamp: proof.timestamp,
      content: proof.content,
    },
  });
});

// ─── Verify all proofs in a session ───

const SessionVerifySchema = z.object({
  agentId: z.string(),
  sessionId: z.string(),
});

verifyRouter.post("/session", async (req, res) => {
  const parsed = SessionVerifySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { agentId, sessionId } = parsed.data;

  const [proofs, agent] = await Promise.all([
    prisma.proof.findMany({
      where: { agentId, sessionId },
      orderBy: { timestamp: "asc" },
    }),
    prisma.agent.findUnique({ where: { agentId } }),
  ]);

  if (!agent) {
    res.status(404).json({ error: "Agent not found" });
    return;
  }

  const verifier = new ElaraVerifier({
    agentPublicKey: agent.agentPublicKey,
    humanPublicKey: agent.humanPublicKey,
  });

  const results = verifier.verifyAll(
    proofs.map((p) => ({
      type: p.type as Parameters<typeof verifier.verify>[0]["type"],
      agentId: p.agentId,
      timestamp: p.timestamp.getTime(),
      content: p.content as Record<string, unknown>,
      agentSignature: p.agentSignature,
      humanSignature: p.humanSignature ?? undefined,
    }))
  );

  const allValid = results.every((r) => r.isValid);
  const hasHumanIntervention = results.some((r) => r.humanVerified !== null);

  res.json({
    agentId,
    sessionId,
    totalProofs: proofs.length,
    allValid,
    hasHumanIntervention,
    autonomous: allValid && !hasHumanIntervention,
    results: results.map((r, i) => ({
      proofId: proofs[i]?.id,
      type: r.proof.type,
      agentVerified: r.agentVerified,
      humanVerified: r.humanVerified,
      isValid: r.isValid,
    })),
  });
});
