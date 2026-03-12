import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

import type {
  ElaraConfig,
  KeyPair,
  ProofRecord,
  ProofType,
} from "./types.js";

const DEFAULT_KEY_DIR = path.join(os.homedir(), ".elara");
const DEFAULT_REGISTRY_URL = "http://localhost:3001";

export class ElaraSDK {
  private agentId: string;
  private keyDir: string;
  private registryUrl: string;
  private agentKeyPair: KeyPair | null = null;
  private humanKeyPair: KeyPair | null = null;
  private proofs: ProofRecord[] = [];
  private initialized = false;

  constructor(config: ElaraConfig) {
    this.agentId = config.agentId;
    this.keyDir = config.keyDir ?? DEFAULT_KEY_DIR;
    this.registryUrl = config.registryUrl ?? DEFAULT_REGISTRY_URL;
  }

  // ─── Initialization ───

  async init(): Promise<void> {
    if (this.initialized) return;

    if (!fs.existsSync(this.keyDir)) {
      fs.mkdirSync(this.keyDir, { recursive: true });
    }

    this.agentKeyPair = this.loadOrGenerateKey(
      path.join(this.keyDir, `${this.agentId}.agent.pem`),
      path.join(this.keyDir, `${this.agentId}.agent.pub.pem`)
    );

    this.humanKeyPair = this.loadOrGenerateKey(
      path.join(this.keyDir, `${this.agentId}.human.pem`),
      path.join(this.keyDir, `${this.agentId}.human.pub.pem`)
    );

    this.initialized = true;

    // Auto-register with backend (fire-and-forget — won't fail if offline)
    await this.registerWithBackend();
  }

  // ─── Signing ───

  /**
   * Sign content with the agent key only (autonomous action).
   */
  async sign(
    type: ProofType,
    content: Record<string, unknown>
  ): Promise<ProofRecord> {
    this.ensureInitialized();

    const serialized = this.serialize(content);
    const agentSignature = this.signData(serialized, this.agentKeyPair!.privateKey);

    const proof: ProofRecord = {
      type,
      agentId: this.agentId,
      timestamp: Date.now(),
      content,
      agentSignature,
    };

    this.proofs.push(proof);
    void this.pushProof(proof);
    return proof;
  }

  /**
   * Co-sign with BOTH agent and human keys (human intervention).
   */
  async coSign(
    type: ProofType,
    content: Record<string, unknown>
  ): Promise<ProofRecord> {
    this.ensureInitialized();

    const serialized = this.serialize(content);
    const agentSignature = this.signData(serialized, this.agentKeyPair!.privateKey);
    const humanSignature = this.signData(serialized, this.humanKeyPair!.privateKey);

    const proof: ProofRecord = {
      type,
      agentId: this.agentId,
      timestamp: Date.now(),
      content,
      agentSignature,
      humanSignature,
    };

    this.proofs.push(proof);
    void this.pushProof(proof);
    return proof;
  }

  // ─── Getters ───

  getProofs(): ProofRecord[] {
    return [...this.proofs];
  }

  getPublicKeys(): { agentPublicKey: string; humanPublicKey: string } {
    this.ensureInitialized();
    return {
      agentPublicKey: this.agentKeyPair!.publicKey,
      humanPublicKey: this.humanKeyPair!.publicKey,
    };
  }

  clearProofs(): void {
    this.proofs = [];
  }

  // ─── Backend Integration ───

  private async registerWithBackend(): Promise<void> {
    try {
      const keys = this.getPublicKeys();
      await fetch(`${this.registryUrl}/api/agents/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: this.agentId,
          agentPublicKey: keys.agentPublicKey,
          humanPublicKey: keys.humanPublicKey,
        }),
      });
    } catch {
      // Backend offline — local-only mode, silently continue
    }
  }

  private async pushProof(proof: ProofRecord): Promise<void> {
    try {
      await fetch(`${this.registryUrl}/api/proofs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proof),
      });
    } catch {
      // Backend offline — proof is still stored locally
    }
  }

  // ─── Private Helpers ───

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error(
        "ElaraSDK not initialized. Call await elara.init() first."
      );
    }
  }

  private serialize(content: Record<string, unknown>): string {
    return JSON.stringify(content, Object.keys(content).sort());
  }

  private signData(data: string, privateKeyPem: string): string {
    const sign = crypto.createSign("SHA256");
    sign.update(data);
    sign.end();
    return sign.sign(privateKeyPem, "base64");
  }

  private loadOrGenerateKey(
    privatePath: string,
    publicPath: string
  ): KeyPair {
    if (fs.existsSync(privatePath) && fs.existsSync(publicPath)) {
      return {
        privateKey: fs.readFileSync(privatePath, "utf-8"),
        publicKey: fs.readFileSync(publicPath, "utf-8"),
      };
    }

    const { publicKey, privateKey } = crypto.generateKeyPairSync("ec", {
      namedCurve: "P-256",
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });

    fs.writeFileSync(privatePath, privateKey, { mode: 0o600 });
    fs.writeFileSync(publicPath, publicKey);

    return { publicKey, privateKey };
  }
}
