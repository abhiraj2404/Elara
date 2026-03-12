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

export class ElaraSDK {
  private agentId: string;
  private keyDir: string;
  private agentKeyPair: KeyPair | null = null;
  private humanKeyPair: KeyPair | null = null;
  private proofs: ProofRecord[] = [];
  private initialized = false;

  constructor(config: ElaraConfig) {
    this.agentId = config.agentId;
    this.keyDir = config.keyDir ?? DEFAULT_KEY_DIR;
  }

  // ─── Initialization ───

  async init(): Promise<void> {
    if (this.initialized) return;

    // Ensure key directory exists
    if (!fs.existsSync(this.keyDir)) {
      fs.mkdirSync(this.keyDir, { recursive: true });
    }

    // Generate or load agent keypair
    this.agentKeyPair = this.loadOrGenerateKey(
      path.join(this.keyDir, `${this.agentId}.agent.pem`),
      path.join(this.keyDir, `${this.agentId}.agent.pub.pem`)
    );

    // Generate or load human keypair
    this.humanKeyPair = this.loadOrGenerateKey(
      path.join(this.keyDir, `${this.agentId}.human.pem`),
      path.join(this.keyDir, `${this.agentId}.human.pub.pem`)
    );

    this.initialized = true;
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

    const contentHash = this.hash(content);

    const agentSignature = this.signHash(
      contentHash,
      this.agentKeyPair!.privateKey
    );

    const proof: ProofRecord = {
      type,
      agentId: this.agentId,
      timestamp: Date.now(),
      contentHash,
      agentSignature,
      content,
    };

    this.proofs.push(proof);
    return proof;
  }

  /**
   * Co-sign content with BOTH agent and human keys (human intervention).
   */
  async coSign(
    type: ProofType,
    content: Record<string, unknown>
  ): Promise<ProofRecord> {
    this.ensureInitialized();

    const contentHash = this.hash(content);

    const agentSignature = this.signHash(
      contentHash,
      this.agentKeyPair!.privateKey
    );

    const humanSignature = this.signHash(
      contentHash,
      this.humanKeyPair!.privateKey
    );

    const proof: ProofRecord = {
      type,
      agentId: this.agentId,
      timestamp: Date.now(),
      contentHash,
      agentSignature,
      humanSignature,
      content,
    };

    this.proofs.push(proof);
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

  // ─── Private Helpers ───

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error(
        "ElaraSDK not initialized. Call await elara.init() first."
      );
    }
  }

  private hash(content: Record<string, unknown>): string {
    // Deterministic serialization: sort keys
    const serialized = JSON.stringify(content, Object.keys(content).sort());
    return crypto.createHash("sha256").update(serialized).digest("hex");
  }

  private signHash(hash: string, privateKeyPem: string): string {
    const sign = crypto.createSign("SHA256");
    sign.update(hash);
    sign.end();
    return sign.sign(privateKeyPem, "base64");
  }

  private loadOrGenerateKey(
    privatePath: string,
    publicPath: string
  ): KeyPair {
    // If keys already exist, load them
    if (fs.existsSync(privatePath) && fs.existsSync(publicPath)) {
      return {
        privateKey: fs.readFileSync(privatePath, "utf-8"),
        publicKey: fs.readFileSync(publicPath, "utf-8"),
      };
    }

    // Generate new ECDSA keypair
    const { publicKey, privateKey } = crypto.generateKeyPairSync("ec", {
      namedCurve: "P-256",
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });

    // Save to disk
    fs.writeFileSync(privatePath, privateKey, { mode: 0o600 });
    fs.writeFileSync(publicPath, publicKey);

    return { publicKey, privateKey };
  }
}
