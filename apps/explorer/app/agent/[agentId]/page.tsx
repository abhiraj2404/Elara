"use client";

import { useEffect, useState, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Bot,
  User,
  Clock,
  ArrowLeft,
  Loader2,
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="mb-4 h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Loading agent data...</p>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="flex flex-col items-center py-32">
        <ShieldAlert className="mb-4 h-12 w-12 text-destructive" />
        <h2 className="mb-2 text-xl font-semibold">Agent Not Found</h2>
        <p className="mb-6 text-muted-foreground">
          No agent registered with ID &quot;{agentId}&quot;
        </p>
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
          </Button>
        </Link>
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
    <div>
      {/* Back Button */}
      <Link href="/" className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="mr-1 h-3 w-3" /> Back to Search
      </Link>

      {/* Agent Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Bot className="h-7 w-7 text-blue-400" />
          <h1 className="text-2xl font-bold tracking-tight font-mono">{agent.agentId}</h1>
          {verification && (
            <Badge
              variant={verification.autonomous ? "default" : "destructive"}
              className={verification.autonomous ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" : ""}
            >
              {verification.autonomous ? (
                <><ShieldCheck className="mr-1 h-3 w-3" /> Autonomous</>
              ) : (
                <><User className="mr-1 h-3 w-3" /> Human Assisted</>
              )}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Registered {new Date(agent.createdAt).toLocaleDateString()} • {proofs.length} proofs • {Object.keys(sessions).length} session(s)
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-1 pt-4">
            <CardTitle className="text-xs text-muted-foreground">Total Proofs</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-2xl font-bold">{proofs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4">
            <CardTitle className="text-xs text-muted-foreground">Sessions</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-2xl font-bold">{Object.keys(sessions).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4">
            <CardTitle className="text-xs text-muted-foreground">Verified</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-2xl font-bold text-emerald-400">
              {verification ? `${verification.results.filter((r) => r.isValid).length}/${verification.totalProofs}` : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4">
            <CardTitle className="text-xs text-muted-foreground">Human Interventions</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-2xl font-bold">
              {proofs.filter((p) => p.humanSignature).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator className="mb-8" />

      {/* Proof Chain */}
      <h2 className="mb-4 text-lg font-semibold">Proof Chain</h2>

      {Object.entries(sessions).map(([sessionId, sessionProofs]) => (
        <div key={sessionId} className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-mono text-muted-foreground">
              Session: {sessionId.slice(0, 8)}...{sessionId.slice(-4)}
            </span>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Signed By</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessionProofs.map((proof, i) => {
                  const verifyResult = verification?.results.find(
                    (r) => r.proofId === proof.id
                  );
                  const isExpanded = expandedProof === proof.id;
                  const content = proof.content as Record<string, unknown>;

                  return (
                    <>
                      <TableRow
                        key={proof.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setExpandedProof(isExpanded ? null : proof.id)}
                      >
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {i + 1}
                        </TableCell>
                        <TableCell>
                          <ProofTypeBadge type={proof.type} event={content.event as string} />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          <ProofSummary content={content} type={proof.type} />
                        </TableCell>
                        <TableCell>
                          {proof.humanSignature ? (
                            <Badge variant="outline" className="text-amber-400 border-amber-400/30">
                              <User className="mr-1 h-3 w-3" /> Human + Agent
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-blue-400 border-blue-400/30">
                              <Bot className="mr-1 h-3 w-3" /> Agent Only
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {verifyResult ? (
                            verifyResult.isValid ? (
                              <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20">
                                <ShieldCheck className="mr-1 h-3 w-3" /> Verified
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <ShieldAlert className="mr-1 h-3 w-3" /> Failed
                              </Badge>
                            )
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              <Shield className="mr-1 h-3 w-3" /> Pending
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>

                      {/* Expanded view */}
                      {isExpanded && (
                        <TableRow key={`${proof.id}-expanded`}>
                          <TableCell colSpan={5} className="bg-muted/30 p-4">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {new Date(proof.timestamp).toLocaleString()}
                              </div>
                              <div>
                                <p className="mb-1 text-xs font-medium text-muted-foreground">Content</p>
                                <pre className="overflow-x-auto rounded-md bg-background p-3 text-xs font-mono">
                                  {JSON.stringify(proof.content, null, 2)}
                                </pre>
                              </div>
                              <div>
                                <p className="mb-1 text-xs font-medium text-muted-foreground">Agent Signature</p>
                                <p className="break-all font-mono text-xs text-muted-foreground">
                                  {proof.agentSignature.slice(0, 64)}...
                                </p>
                              </div>
                              {proof.humanSignature && (
                                <div>
                                  <p className="mb-1 text-xs font-medium text-muted-foreground">Human Signature</p>
                                  <p className="break-all font-mono text-xs text-amber-400/70">
                                    {proof.humanSignature.slice(0, 64)}...
                                  </p>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </div>
      ))}
    </div>
  );
}

// ─── Helper Components ───

function ProofTypeBadge({ type, event }: { type: string; event?: string }) {
  const label = event || type;
  const colorMap: Record<string, string> = {
    session_start: "bg-violet-500/15 text-violet-400 border-violet-500/20",
    session_end: "bg-violet-500/15 text-violet-400 border-violet-500/20",
    node_update: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    llm_response: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
    tool_start: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    tool_end: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    human_intervention: "bg-rose-500/15 text-rose-400 border-rose-500/20",
  };

  return (
    <Badge variant="outline" className={colorMap[event || ""] || colorMap[type] || ""}>
      {label.replace(/_/g, " ")}
    </Badge>
  );
}

function ProofSummary({ content, type }: { content: Record<string, unknown>; type: string }) {
  const node = content.node as string;
  const event = content.event as string;
  const toolName = content.toolName as string;

  if (event === "session_start") return <span>Session started</span>;
  if (event === "session_end") return <span>Session ended • {content.totalProofs as number} proofs</span>;
  if (node) return <span className="font-mono text-xs">{node}</span>;
  if (toolName) return <span className="font-mono text-xs">{toolName}</span>;
  if (type === "human_intervention") return <span>Human input received</span>;
  return <span className="font-mono text-xs">{type}</span>;
}
