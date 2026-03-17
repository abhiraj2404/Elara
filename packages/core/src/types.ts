// ─── Proof Types ───

export type ProofType =
  | "node_update"
  | "llm_response"
  | "tool_start"
  | "tool_end"
  | "human_intervention";

// ─── Proof Record ───

export interface ProofRecord {
  /** Type of event */
  type: ProofType;
  /** Unix timestamp (ms) */
  timestamp: number;
  /** The original content — readable in the explorer */
  content: Record<string, unknown>;
  /** Session identifier */
  sessionId?: string;
  /** Whether this needs human co-signature */
  needsHumanSignature?: boolean;
}

// ─── SDK Config ───

export interface ElaraConfig {
  /** API key from the Elara dashboard */
  apiKey: string;
  /** Registry backend URL (defaults to http://localhost:3001) */
  registryUrl?: string;
}

// ─── Verification Result ───

export interface VerificationResult {
  proof: ProofRecord;
  agentVerified: boolean;
  humanVerified: boolean | null;
  isValid: boolean;
}
