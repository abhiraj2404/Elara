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
    // Verify agent signature (always present)
    const agentVerified = this.verifySignature(
      proof.contentHash,
      proof.agentSignature,
      this.agentPublicKey
    );

    // Verify human signature (only if present)
    let humanVerified: boolean | null = null;
    if (proof.humanSignature) {
      humanVerified = this.verifySignature(
        proof.contentHash,
        proof.humanSignature,
        this.humanPublicKey
      );
    }

    // Valid = agent sig checks out AND human sig checks out (if present)
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
    hash: string,
    signature: string,
    publicKeyPem: string
  ): boolean {
    try {
      const verify = crypto.createVerify("SHA256");
      verify.update(hash);
      verify.end();
      return verify.verify(publicKeyPem, signature, "base64");
    } catch {
      return false;
    }
  }
}
