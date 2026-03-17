"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Copy, Trash2, Bot, Key, Eye, EyeOff } from "lucide-react";

interface Agent {
  id: string;
  agentId: string;
  apiKey: string;
  createdAt: string;
  _count: { proofs: number };
}

export default function DashboardPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentName, setAgentName] = useState("");
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const router = useRouter();

  const getToken = () => localStorage.getItem("elara_token");

  const fetchAgents = async () => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("/api/agents", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("elara_token");
        router.push("/login");
        return;
      }

      const data = await res.json();
      setAgents(data.agents || []);
    } catch {
      toast.error("Failed to load agents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentName.trim()) return;
    setCreating(true);

    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ agentName: agentName.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to create agent");
        return;
      }

      toast.success(`Agent created! API key: ${data.agent.apiKey.slice(0, 12)}...`);
      setAgentName("");
      setDialogOpen(false);

      // Show the new key
      setVisibleKeys((prev) => ({ ...prev, [data.agent.agentId]: true }));
      await fetchAgents();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm(`Delete agent "${agentId}" and all its proofs?`)) return;

    try {
      const res = await fetch("/api/agents", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ agentId }),
      });

      if (!res.ok) {
        toast.error("Failed to delete agent");
        return;
      }

      toast.success("Agent deleted");
      await fetchAgents();
    } catch {
      toast.error("Something went wrong");
    }
  };

  const copyApiKey = (apiKey: string) => {
    navigator.clipboard.writeText(apiKey);
    toast.success("API key copied!");
  };

  const toggleKeyVisibility = (agentId: string) => {
    setVisibleKeys((prev) => ({ ...prev, [agentId]: !prev[agentId] }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center pt-32">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Manage your agents and API keys.
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Agent
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new agent</DialogTitle>
              <DialogDescription>
                Give your agent a name. We&apos;ll generate keypairs and an API key for you.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateAgent} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agent-name">Agent Name</Label>
                <Input
                  id="agent-name"
                  placeholder="e.g. math-agent"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={creating}>
                {creating ? "Creating..." : "Create Agent"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-1 pt-4">
            <CardTitle className="text-xs text-muted-foreground">Total Agents</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-2xl font-bold">{agents.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4">
            <CardTitle className="text-xs text-muted-foreground">Total Proofs</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-2xl font-bold">
              {agents.reduce((sum, a) => sum + a._count.proofs, 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4">
            <CardTitle className="text-xs text-muted-foreground">API Keys</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-2xl font-bold">{agents.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Agents Table */}
      {agents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Bot className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="mb-2 text-lg font-medium">No agents yet</p>
            <p className="mb-4 text-sm text-muted-foreground">
              Create your first agent to get an API key.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Agent
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent ID</TableHead>
                <TableHead>API Key</TableHead>
                <TableHead>Proofs</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono text-sm">{agent.agentId}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <code className="rounded bg-muted px-2 py-0.5 text-xs font-mono">
                        {visibleKeys[agent.agentId]
                          ? agent.apiKey
                          : `${agent.apiKey.slice(0, 8)}${"•".repeat(20)}`}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => toggleKeyVisibility(agent.agentId)}
                      >
                        {visibleKeys[agent.agentId] ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyApiKey(agent.apiKey)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{agent._count.proofs}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(agent.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteAgent(agent.agentId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Usage Guide */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Key className="h-4 w-4" /> Quick Start
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-md bg-muted p-4 text-sm font-mono">
{`import { ElaraSDK } from "@elara/core";
import { Elara } from "@elara/langchain";

const sdk = new ElaraSDK({ apiKey: "elk_your_api_key" });
await sdk.init();
const elara = new Elara(sdk);

// Wrap your agent stream
for await (const chunk of elara.watchAndSign(agentStream)) {
  // process chunks — proofs are signed & stored automatically
}`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
