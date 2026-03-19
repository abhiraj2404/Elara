"use client";

import { useEffect, useState, use, Fragment } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Bot,
  User,
  Clock,
  ArrowLeft,
  Loader2,
  Hexagon,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

// ─── Types ───

interface Agent {
  id: string;
  agentId: string;
  agentPublicKey: string;
  humanPublicKey: string;
  createdAt: string;
}

interface Proof {
  id: string;
  type: string;
  agentId: string;
  sessionId: string | null;
  timestamp: string;
  content: Record<string, unknown>;
  agentSignature: string;
  humanSignature: string | null;
  createdAt: string;
}

interface VerifyResult {
  allValid: boolean;
  autonomous: boolean;
  totalProofs: number;
  hasHumanIntervention: boolean;
  results: {
    proofId: string;
    type: string;
    agentVerified: boolean;
    humanVerified: boolean | null;
    isValid: boolean;
  }[];
}

// ─── Page ───

export default function AgentPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = use(params);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [verification, setVerification] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedProof, setExpandedProof] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/agent/${encodeURIComponent(agentId)}`);
        if (!res.ok) throw new Error("Agent not found");

        const data = await res.json();
        setAgent(data.agent);
        setProofs(data.proofs);

        // Group proofs by session and verify the first session
        if (data.proofs.length > 0) {
          const sessionId = data.proofs[0]?.content?.sessionId;
          if (sessionId) {
            const verifyRes = await fetch("/api/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ agentId, sessionId }),
            });
            if (verifyRes.ok) {
              setVerification(await verifyRes.json());
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load agent");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [agentId]);

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 className="mb-4 h-8 w-8 animate-spin text-[#39FF14]" />
        <p className="text-slate-500 font-medium">Loading agent data…</p>
      </div>
    );
  }

  /* ── Error state ── */
  if (error || !agent) {
    return (
      <div className="min-h-screen bg-white">
        {/* Navbar */}
        <header className="sticky top-0 z-50 flex items-center justify-between px-6 lg:px-20 py-4 border-b border-black/5 bg-white/80 backdrop-blur-md">
          <Link href="/" className="flex items-center gap-2">
            <div className="size-8 bg-[#39FF14] flex items-center justify-center rounded">
              <Hexagon className="size-5 text-black" strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[#121212]">Elara</h2>
          </Link>
        </header>

        <div className="flex flex-col items-center py-32 px-6">
          <div className="size-16 bg-red-50 rounded-full flex items-center justify-center mb-5">
            <ShieldAlert className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-[#121212]">Agent Not Found</h2>
          <p className="mb-6 text-slate-500 text-sm">
            No agent registered with ID &quot;{agentId}&quot;
          </p>
          <Link
            href="/"
            className="bg-[#39FF14] text-black px-6 py-3 rounded font-bold hover:scale-[1.02] transition-transform shadow-[0_0_15px_rgba(57,255,20,0.4)] inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Search
          </Link>
        </div>
      </div>
    );
  }

  // Group proofs by session
  const sessions = proofs.reduce<Record<string, Proof[]>>((acc, p) => {
    const sid = (p.content?.sessionId as string) || "unknown";
    if (!acc[sid]) acc[sid] = [];
    acc[sid]!.push(p);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-white">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 lg:px-20 py-4 border-b border-black/5 bg-white/80 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2">
          <div className="size-8 bg-[#39FF14] flex items-center justify-center rounded">
            <Hexagon className="size-5 text-black" strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[#121212]">Elara</h2>
        </Link>
        <Link
          href="/"
          className="text-sm font-medium text-slate-500 hover:text-[#121212] transition-colors inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-3 w-3" /> Back to Search
        </Link>
      </header>

      <div className="px-6 lg:px-20 py-10 max-w-7xl mx-auto">
        {/* ── Agent Header ── */}
        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <div className="size-10 bg-[#39FF14]/20 rounded-full flex items-center justify-center">
              <Bot className="h-5 w-5 text-[#121212]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#121212] font-mono">
              {agent.agentId}
            </h1>
            {verification && (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  verification.autonomous
                    ? "bg-[#39FF14]/20 text-[#121212] border border-[#39FF14]/40"
                    : "bg-amber-50 text-amber-600 border border-amber-200"
                }`}
              >
                {verification.autonomous ? (
                  <><ShieldCheck className="h-3 w-3" /> Autonomous</>
                ) : (
                  <><User className="h-3 w-3" /> Human Assisted</>
                )}
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Registered {new Date(agent.createdAt).toLocaleDateString()} •{" "}
            {proofs.length} proofs • {Object.keys(sessions).length} session(s)
          </p>
        </div>

        {/* ── Stats Cards ── */}
        <div className="mb-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div className="bg-slate-50 border border-black/5 rounded p-6">
            <p className="text-[#121212] text-xs uppercase tracking-[0.3em] font-bold mb-2">
              Total Proofs
            </p>
            <p className="text-3xl font-bold text-[#121212]">{proofs.length}</p>
          </div>
          <div className="bg-slate-50 border border-black/5 rounded p-6">
            <p className="text-[#121212] text-xs uppercase tracking-[0.3em] font-bold mb-2">
              Sessions
            </p>
            <p className="text-3xl font-bold text-[#121212]">
              {Object.keys(sessions).length}
            </p>
          </div>
          <div className="bg-slate-50 border border-black/5 rounded p-6">
            <p className="text-[#121212] text-xs uppercase tracking-[0.3em] font-bold mb-2">
              Verified
            </p>
            <p className="text-3xl font-bold text-[#39FF14]">
              {verification
                ? `${verification.results.filter((r) => r.isValid).length}/${verification.totalProofs}`
                : "—"}
            </p>
          </div>
          <div className="bg-slate-50 border border-black/5 rounded p-6">
            <p className="text-[#121212] text-xs uppercase tracking-[0.3em] font-bold mb-2">
              Human Interventions
            </p>
            <p className="text-3xl font-bold text-[#121212]">
              {proofs.filter((p) => p.humanSignature).length}
            </p>
          </div>
        </div>

        {/* ── Separator ── */}
        <div className="h-px bg-black/5 mb-10" />

        {/* ── Proof Chain ── */}
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#121212] mb-6">
          Proof Chain
        </h2>

        {Object.entries(sessions).map(([sessionId, sessionProofs]) => (
          <div key={sessionId} className="mb-10">
            {/* Session header */}
            <div className="mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#39FF14]" />
              <span className="text-xs font-mono text-slate-500 font-medium">
                Session: {sessionId.slice(0, 8)}…{sessionId.slice(-4)}
              </span>
            </div>

            {/* Table */}
            <div className="bg-white border border-black/5 rounded overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-black/5">
                    <th className="text-left px-4 py-3 text-[#121212] text-xs uppercase tracking-[0.2em] font-bold w-10">
                      #
                    </th>
                    <th className="text-left px-4 py-3 text-[#121212] text-xs uppercase tracking-[0.2em] font-bold">
                      Type
                    </th>
                    <th className="text-left px-4 py-3 text-[#121212] text-xs uppercase tracking-[0.2em] font-bold">
                      Details
                    </th>
                    <th className="text-left px-4 py-3 text-[#121212] text-xs uppercase tracking-[0.2em] font-bold">
                      Signed By
                    </th>
                    <th className="text-right px-4 py-3 text-[#121212] text-xs uppercase tracking-[0.2em] font-bold">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sessionProofs.map((proof, i) => {
                    const verifyResult = verification?.results.find(
                      (r) => r.proofId === proof.id
                    );
                    const isExpanded = expandedProof === proof.id;
                    const content = proof.content as Record<string, unknown>;

                    return (
                      <Fragment key={proof.id}>
                        <tr
                          className="border-b border-black/5 hover:bg-slate-50/50 transition-colors cursor-pointer"
                          onClick={() =>
                            setExpandedProof(isExpanded ? null : proof.id)
                          }
                        >
                          <td className="px-4 py-3 font-mono text-xs text-slate-400">
                            <span className="inline-flex items-center gap-1">
                              {isExpanded ? (
                                <ChevronDown className="h-3 w-3" />
                              ) : (
                                <ChevronRight className="h-3 w-3" />
                              )}
                              {i + 1}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <ProofTypeBadge
                              type={proof.type}
                              event={content.event as string}
                            />
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-500">
                            <ProofSummary content={content} type={proof.type} />
                          </td>
                          <td className="px-4 py-3">
                            {proof.humanSignature ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded bg-amber-50 text-amber-600 border border-amber-200">
                                <User className="h-3 w-3" /> Human + Agent
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded bg-slate-50 text-slate-600 border border-black/5">
                                <Bot className="h-3 w-3" /> Agent Only
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {verifyResult ? (
                              verifyResult.isValid ? (
                                <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded bg-[#39FF14]/15 text-[#121212] border border-[#39FF14]/30">
                                  <ShieldCheck className="h-3 w-3 text-[#39FF14]" />{" "}
                                  Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded bg-red-50 text-red-500 border border-red-200">
                                  <ShieldAlert className="h-3 w-3" /> Failed
                                </span>
                              )
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded bg-slate-50 text-slate-400 border border-black/5">
                                <Shield className="h-3 w-3" /> Pending
                              </span>
                            )}
                          </td>
                        </tr>

                        {/* Expanded view */}
                        {isExpanded && (
                          <tr className="border-b border-black/5">
                            <td colSpan={5} className="bg-slate-50/50 p-6">
                              <div className="space-y-4">
                                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                  <Clock className="h-3 w-3 text-[#39FF14]" />
                                  {new Date(proof.timestamp).toLocaleString()}
                                </div>
                                <div>
                                  <p className="mb-2 text-xs uppercase tracking-[0.2em] font-bold text-[#121212]">
                                    Content
                                  </p>
                                  <pre className="overflow-x-auto rounded bg-[#121212] p-4 text-xs font-mono text-[#39FF14]/90 leading-relaxed">
                                    {JSON.stringify(proof.content, null, 2)}
                                  </pre>
                                </div>
                                <div>
                                  <p className="mb-2 text-xs uppercase tracking-[0.2em] font-bold text-[#121212]">
                                    Agent Signature
                                  </p>
                                  <p className="break-all font-mono text-xs text-slate-500 bg-white border border-black/5 rounded p-3">
                                    {proof.agentSignature.slice(0, 64)}…
                                  </p>
                                </div>
                                {proof.humanSignature && (
                                  <div>
                                    <p className="mb-2 text-xs uppercase tracking-[0.2em] font-bold text-[#121212]">
                                      Human Signature
                                    </p>
                                    <p className="break-all font-mono text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded p-3">
                                      {proof.humanSignature.slice(0, 64)}…
                                    </p>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Helper Components ───

function ProofTypeBadge({ type, event }: { type: string; event?: string }) {
  const label = event || type;
  const colorMap: Record<string, string> = {
    session_start: "bg-violet-50 text-violet-600 border-violet-200",
    session_end: "bg-violet-50 text-violet-600 border-violet-200",
    node_update: "bg-blue-50 text-blue-600 border-blue-200",
    llm_response: "bg-cyan-50 text-cyan-600 border-cyan-200",
    tool_start: "bg-amber-50 text-amber-600 border-amber-200",
    tool_end: "bg-amber-50 text-amber-600 border-amber-200",
    human_intervention: "bg-rose-50 text-rose-600 border-rose-200",
  };

  const classes =
    colorMap[event || ""] || colorMap[type] || "bg-slate-50 text-slate-600 border-black/5";

  return (
    <span
      className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${classes}`}
    >
      {label.replace(/_/g, " ")}
    </span>
  );
}

function ProofSummary({
  content,
  type,
}: {
  content: Record<string, unknown>;
  type: string;
}) {
  const node = content.node as string;
  const event = content.event as string;
  const toolName = content.toolName as string;

  if (event === "session_start") return <span>Session started</span>;
  if (event === "session_end")
    return (
      <span>
        Session ended • {content.totalProofs as number} proofs
      </span>
    );
  if (node) return <span className="font-mono text-xs">{node}</span>;
  if (toolName) return <span className="font-mono text-xs">{toolName}</span>;
  if (type === "human_intervention") return <span>Human input received</span>;
  return <span className="font-mono text-xs">{type}</span>;
}
