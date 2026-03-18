"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
import Link from "next/link";
import { Plus, Copy, Trash2, Bot, Key, Eye, EyeOff, Hexagon } from "lucide-react";

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
  useEffect(() => {
    setLoading(false);
  }, []);

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

  const agentViewHandler = (agentId: string) => {
    router.push(`/agent/${agentId}`);
  }

  const copyApiKey = (apiKey: string) => {
    navigator.clipboard.writeText(apiKey);
    toast.success("API key copied!");
  };

  const toggleKeyVisibility = (agentId: string) => {
    setVisibleKeys((prev) => ({ ...prev, [agentId]: !prev[agentId] }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center pt-32 min-h-screen bg-white">
        <p className="text-slate-500 font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 lg:px-20 py-4 border-b border-black/5 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2">
            <div className="size-8 bg-[#39FF14] flex items-center justify-center rounded">
              <Hexagon className="size-5 text-black" strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[#121212]">Elara</h2>
          </div>

          <nav className="hidden md:flex items-center gap-10">
            <Link
              className="text-sm font-medium text-slate-500 hover:text-[#121212] transition-colors"
              href={process.env.EXPLORER_URL || "https://localhost:3000"}
            >
              Explorer
            </Link>
            <Link
              className="text-sm font-medium text-slate-500 hover:text-[#121212] transition-colors"
              href={process.env.NEXT_PUBLIC_DOCS_URL || "http://localhost:5000"}
            >
              Docs
            </Link>
          </nav>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("elara_token");
            router.push("/login");
          }}
          className="bg-[#39FF14] text-black px-5 py-2 rounded font-bold text-sm hover:scale-[1.02] transition-transform shadow-[0_0_12px_rgba(57,255,20,0.35)]"
        >
          Log out
        </button>
      </header>

      <div className="px-6 lg:px-20 py-10 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#121212]">
              Dashboard
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Manage your agents and API keys.
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <button className="bg-[#39FF14] text-black px-6 py-3 rounded font-bold hover:scale-[1.02] transition-transform shadow-[0_0_15px_rgba(57,255,20,0.4)] inline-flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Agent
              </button>
            </DialogTrigger>
            <DialogContent className="bg-white border border-black/5 shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-[#121212] font-bold tracking-tight">Create a new agent</DialogTitle>
                <DialogDescription className="text-slate-500">
                  Give your agent a name. We&apos;ll generate keypairs and an API key for you.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAgent} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="agent-name" className="text-[#121212] font-medium">Agent Name</Label>
                  <Input
                    id="agent-name"
                    placeholder="e.g. math-agent"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    required
                    className="border-black/10 focus:border-[#39FF14] focus:ring-[#39FF14]/30"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#39FF14] text-black py-3 rounded font-bold hover:scale-[1.01] transition-transform shadow-[0_0_10px_rgba(57,255,20,0.3)] disabled:opacity-50 disabled:hover:scale-100"
                  disabled={creating}
                >
                  {creating ? "Creating..." : "Create Agent"}
                </button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="mb-10 grid grid-cols-2 gap-6 sm:grid-cols-3">
          <div className="bg-slate-50 border border-black/5 rounded p-6">
            <p className="text-[#121212] text-xs uppercase tracking-[0.3em] font-bold mb-2">
              Total Agents
            </p>
            <p className="text-3xl font-bold text-[#121212]">{agents.length}</p>
          </div>
          <div className="bg-slate-50 border border-black/5 rounded p-6">
            <p className="text-[#121212] text-xs uppercase tracking-[0.3em] font-bold mb-2">
              Total Proofs
            </p>
            <p className="text-3xl font-bold text-[#121212]">
              {agents.reduce((sum, a) => sum + a._count.proofs, 0)}
            </p>
          </div>
          <div className="bg-slate-50 border border-black/5 rounded p-6">
            <p className="text-[#121212] text-xs uppercase tracking-[0.3em] font-bold mb-2">
              API Keys
            </p>
            <p className="text-3xl font-bold text-[#121212]">{agents.length}</p>
          </div>
        </div>

        {/* Agents Table */}
        {agents.length === 0 ? (
          <div className="bg-slate-50 border border-black/5 rounded flex flex-col items-center justify-center py-20">
            <div className="size-14 bg-[#39FF14]/20 rounded-full flex items-center justify-center mb-5">
              <Bot className="h-7 w-7 text-[#121212]" />
            </div>
            <p className="mb-2 text-lg font-bold text-[#121212]">No agents yet</p>
            <p className="mb-6 text-sm text-slate-500">
              Create your first agent to get an API key.
            </p>
            <button
              onClick={() => setDialogOpen(true)}
              className="bg-[#39FF14] text-black px-6 py-3 rounded font-bold hover:scale-[1.02] transition-transform shadow-[0_0_15px_rgba(57,255,20,0.4)] inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Add Agent
            </button>
          </div>
        ) : (
          <div className="bg-white border border-black/5 rounded overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 border-b border-black/5 hover:bg-slate-50">
                  <TableHead className="text-[#121212] text-xs uppercase tracking-[0.2em] font-bold">Agent ID</TableHead>
                  <TableHead className="text-[#121212] text-xs uppercase tracking-[0.2em] font-bold">API Key</TableHead>
                  <TableHead className="text-[#121212] text-xs uppercase tracking-[0.2em] font-bold">Proofs</TableHead>
                  <TableHead className="text-[#121212] text-xs uppercase tracking-[0.2em] font-bold">Created</TableHead>
                  <TableHead className="text-right text-[#121212] text-xs uppercase tracking-[0.2em] font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent) => (
                  <TableRow key={agent.id} className="border-b border-black/5 hover:bg-slate-50/50 transition-colors" onClick={() =>agentViewHandler(agent.agentId)}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-[#39FF14]" />
                        <span className="font-mono text-sm font-bold text-[#121212]">{agent.agentId}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <code className="rounded bg-slate-50 border border-black/5 px-2 py-0.5 text-xs font-mono text-[#121212]">
                          {visibleKeys[agent.agentId]
                            ? agent.apiKey
                            : `${agent.apiKey.slice(0, 8)}${"•".repeat(20)}`}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-slate-500 hover:text-[#121212]"
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
                          className="h-6 w-6 text-slate-500 hover:text-[#121212]"
                          onClick={() => copyApiKey(agent.apiKey)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-[10px] font-mono text-[#121212] bg-[#39FF14]/20 px-2 py-1 rounded font-bold">
                        {agent._count.proofs}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {new Date(agent.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        onClick={() => handleDeleteAgent(agent.agentId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Quick Start */}
        <div className="mt-10 bg-[#121212] rounded overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
            <Key className="h-4 w-4 text-[#39FF14]" />
            <span className="text-sm font-bold text-white tracking-tight">Quick Start</span>
          </div>
          <pre className="overflow-x-auto p-6 text-sm font-mono text-[#39FF14]/90 leading-relaxed">
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
        </div>
      </div>
    </div>
  );
}
