import { Router } from "express";
import { z } from "zod";
import crypto from "node:crypto";
import { prisma } from "../lib/prisma.js";

export const verifyRouter: Router = Router();

// ─── Verify a proof by ID ───

verifyRouter.get("/:proofId", async (req, res) => {
  const proof = await prisma.proof.findUnique({
    where: { id: req.params["proofId"] },
    include: {
      agent: {
        include: { user: { select: { humanPublicKey: true } } },
      },
    },
  });

  if (!proof) {
    res.status(404).json({ error: "Proof not found" });
    return;
  }

  const content = proof.content as Record<string, unknown>;
  const serialized = JSON.stringify(content, Object.keys(content).sort());

  const agentVerified = verifySignature(
    serialized,
    proof.agentSignature,
    proof.agent.agentPublicKey
  );

  let humanVerified: boolean | null = null;
  if (proof.humanSignature) {
    humanVerified = verifySignature(
      serialized,
      proof.humanSignature,
      proof.agent.user.humanPublicKey
    );
  }

  const isValid = agentVerified && (humanVerified === null || humanVerified === true);

  res.json({
    proofId: proof.id,
    agentVerified,
    humanVerified,
    isValid,
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

  const agent = await prisma.agent.findUnique({
    where: { agentId },
    include: { user: { select: { humanPublicKey: true } } },
  });

  if (!agent) {
    res.status(404).json({ error: "Agent not found" });
    return;
  }

  const proofs = await prisma.proof.findMany({
    where: { agentId, sessionId },
    orderBy: { timestamp: "asc" },
  });

  const results = proofs.map((proof) => {
    const content = proof.content as Record<string, unknown>;
    const serialized = JSON.stringify(content, Object.keys(content).sort());

    const agentVerified = verifySignature(
      serialized,
      proof.agentSignature,
      agent.agentPublicKey
    );

    let humanVerified: boolean | null = null;
    if (proof.humanSignature) {
      humanVerified = verifySignature(
        serialized,
        proof.humanSignature,
        agent.user.humanPublicKey
      );
    }

    const isValid = agentVerified && (humanVerified === null || humanVerified === true);

    return {
      proofId: proof.id,
      type: proof.type,
      agentVerified,
      humanVerified,
      isValid,
    };
  });

  const allValid = results.every((r) => r.isValid);
  const hasHumanIntervention = results.some((r) => r.humanVerified !== null);

  res.json({
    agentId,
    sessionId,
    totalProofs: proofs.length,
    allValid,
    hasHumanIntervention,
    autonomous: allValid && !hasHumanIntervention,
    results,
  });
});

// ─── Helper ───

function verifySignature(data: string, signature: string, publicKeyPem: string): boolean {
  try {
    const verify = crypto.createVerify("SHA256");
    verify.update(data);
    verify.end();
    return verify.verify(publicKeyPem, signature, "base64");
  } catch {
    return false;
  }
}
