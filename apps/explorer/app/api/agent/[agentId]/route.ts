import { NextResponse } from "next/server";

const REGISTRY_URL = process.env.REGISTRY_URL || "http://localhost:3001";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params;

  try {
    const [agentRes, proofsRes] = await Promise.all([
      fetch(`${REGISTRY_URL}/api/agents/${agentId}`),
      fetch(`${REGISTRY_URL}/api/proofs/${agentId}`),
    ]);

    if (!agentRes.ok) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const agentData = await agentRes.json();
    const proofsData = await proofsRes.json();

    return NextResponse.json({
      agent: agentData.agent,
      proofs: proofsData.proofs || [],
    });
  } catch {
    return NextResponse.json(
      { error: "Registry unavailable" },
      { status: 503 }
    );
  }
}
