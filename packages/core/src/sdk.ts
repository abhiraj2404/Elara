import type {
  ElaraConfig,
  ProofRecord,
  ProofType,
} from "./types.js";

const DEFAULT_REGISTRY_URL = "http://localhost:3001";

export class ElaraSDK {
  private apiKey: string;
  private registryUrl: string;
  private agentId: string | null = null;
  private proofs: ProofRecord[] = [];
  private initialized = false;

  constructor(config: ElaraConfig) {
    this.apiKey = config.apiKey;
    this.registryUrl = config.registryUrl ?? DEFAULT_REGISTRY_URL;
  }

  // ─── Initialization ───

  async init(): Promise<void> {
    if (this.initialized) return;

    // Validate API key with backend and get agentId
    const res = await fetch(`${this.registryUrl}/api/agents/validate`, {
      headers: { "x-api-key": this.apiKey },
    });

    if (!res.ok) {
      throw new Error("Invalid API key. Get one at your Elara dashboard.");
    }

    const data = await res.json();
    this.agentId = data.agentId;
    this.initialized = true;
  }

  // ─── Signing ───

  async sign(
    type: ProofType,
    content: Record<string, unknown>
  ): Promise<ProofRecord> {
    this.ensureInitialized();

    const proof: ProofRecord = {
      type,
      timestamp: Date.now(),
      content,
    };

    this.proofs.push(proof);
    void this.pushProof(proof);
    return proof;
  }

  async coSign(
    type: ProofType,
    content: Record<string, unknown>
  ): Promise<ProofRecord> {
    this.ensureInitialized();

    const proof: ProofRecord = {
      type,
      timestamp: Date.now(),
      content,
      needsHumanSignature: true,
    };

    this.proofs.push(proof);
    void this.pushProof(proof);
    return proof;
  }

  // ─── Getters ───

  getAgentId(): string {
    this.ensureInitialized();
    return this.agentId!;
  }

  getProofs(): ProofRecord[] {
    return [...this.proofs];
  }

  clearProofs(): void {
    this.proofs = [];
  }

  // ─── Private ───

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error("ElaraSDK not initialized. Call await sdk.init() first.");
    }
  }

  private async pushProof(proof: ProofRecord): Promise<void> {
    try {
      await fetch(`${this.registryUrl}/api/proofs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
        },
        body: JSON.stringify(proof),
      });
    } catch {
      // Backend offline — proof stored locally only
    }
  }
}
