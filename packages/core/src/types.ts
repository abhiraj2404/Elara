// ─── Proof Types ───

export type ProofType =
  | "node_update"
  | "llm_response"
  | "tool_start"
  | "tool_end"
  | "human_intervention";

// ─── Proof Record ───

export interface ProofRecord {
  /** Type of event that was signed */
  type: ProofType;
  /** Unique agent identifier */
  agentId: string;
  /** Unix timestamp (ms) when the proof was created */
  timestamp: number;
  /** The original content — readable in the explorer */
  content: Record<string, unknown>;
  /** Signature from the agent's private key (base64) */
  agentSignature: string;
  /** Signature from the human's private key (base64) — only present on HITL */
  humanSignature?: string;
}

// ─── SDK Config ───

export interface ElaraConfig {
  /** Unique identifier for this agent */
  agentId: string;
  /** Directory to store human keys (defaults to ~/.elara/) */
  keyDir?: string;
  /** Registry backend URL (defaults to http://localhost:3001) */
  registryUrl?: string;
}

// ─── Key Pair ───

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

// ─── Verification Result ───

export interface VerificationResult {
  /** The proof that was verified */
  proof: ProofRecord;
  /** Whether the agent signature is valid */
  agentVerified: boolean;
  /** Whether the human signature is valid (null if no human signature) */
  humanVerified: boolean | null;
  /** Overall verification status */
  isValid: boolean;
}
