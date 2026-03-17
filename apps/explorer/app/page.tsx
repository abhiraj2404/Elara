"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Shield, Eye, Bot } from "lucide-react";

export default function Home() {
  const [agentId, setAgentId] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (agentId.trim()) {
      router.push(`/agent/${encodeURIComponent(agentId.trim())}`);
    }
  };

  return (
    <div className="flex flex-col items-center pt-16 pb-20">
      {/* Hero */}
      <div className="mb-12 text-center">
        <h1 className="mb-3 text-4xl font-bold tracking-tight">
          Verify Agent Autonomy
        </h1>
        <p className="text-lg text-muted-foreground">
          Browse cryptographic proof chains for any Elara-enabled AI agent.
        </p>
      </div>

      {/* Search Box */}
      <form onSubmit={handleSearch} className="mb-16 flex w-full max-w-lg gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="agent-search"
            placeholder="Enter agent ID (e.g. math-agent-001)"
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" disabled={!agentId.trim()}>
          Explore
        </Button>
      </form>

      {/* Feature Cards */}
      <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <Shield className="mb-2 h-6 w-6 text-emerald-400" />
            <CardTitle className="text-sm">Cryptographic Proof</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Every agent action is signed with ECDSA P-256. Signatures are verified against public keys.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <Bot className="mb-2 h-6 w-6 text-blue-400" />
            <CardTitle className="text-sm">Autonomy Detection</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Two-keypair model distinguishes agent-only actions from human interventions.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <Eye className="mb-2 h-6 w-6 text-violet-400" />
            <CardTitle className="text-sm">Full Transparency</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Readable proof content — see every tool call, LLM response, and state update.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
