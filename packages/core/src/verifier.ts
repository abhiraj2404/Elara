import crypto from "node:crypto";

import type { ProofRecord, VerificationResult } from "./types.js";

export class ElaraVerifier {
  private agentPublicKey: string;
  private humanPublicKey: string;

  constructor(keys: { agentPublicKey: string; humanPublicKey: string }) {
    this.agentPublicKey = keys.agentPublicKey;
    this.humanPublicKey = keys.humanPublicKey;
  }

  /**
   * Verify a single proof record.
   */
  verify(proof: ProofRecord): VerificationResult {
    const serialized = JSON.stringify(proof.content, Object.keys(proof.content).sort());

    // Verify agent signature (always present)
    const agentVerified = this.verifySignature(
      serialized,
      proof.agentSignature,
      this.agentPublicKey
    );

    // Verify human signature (only if present)
    let humanVerified: boolean | null = null;
    if (proof.humanSignature) {
      humanVerified = this.verifySignature(
        serialized,
        proof.humanSignature,
        this.humanPublicKey
      );
    }

    const isValid =
      agentVerified && (humanVerified === null || humanVerified === true);

    return { proof, agentVerified, humanVerified, isValid };
  }

  /**
   * Verify all proofs in a batch.
   */
  verifyAll(proofs: ProofRecord[]): VerificationResult[] {
    return proofs.map((proof) => this.verify(proof));
  }

  // ─── Private ───

  private verifySignature(
    data: string,
    signature: string,
    publicKeyPem: string
  ): boolean {
    try {
      const verify = crypto.createVerify("SHA256");
      verify.update(data);
      verify.end();
      return verify.verify(publicKeyPem, signature, "base64");
    } catch {
      return false;
    }
  }
}
