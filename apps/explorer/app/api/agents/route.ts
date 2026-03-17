import { NextResponse } from "next/server";

const REGISTRY_URL = process.env.REGISTRY_URL || "http://localhost:3001";

export async function POST(request: Request) {
  const token = request.headers.get("authorization");
  const body = await request.json();

  try {
    const res = await fetch(`${REGISTRY_URL}/api/agents/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: token } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Registry unavailable" }, { status: 503 });
  }
}

export async function GET(request: Request) {
  const token = request.headers.get("authorization");

  try {
    const res = await fetch(`${REGISTRY_URL}/api/agents/my-agents`, {
      headers: {
        ...(token ? { Authorization: token } : {}),
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Registry unavailable" }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  const token = request.headers.get("authorization");
  const { agentId } = await request.json();

  try {
    const res = await fetch(`${REGISTRY_URL}/api/agents/${agentId}`, {
      method: "DELETE",
      headers: {
        ...(token ? { Authorization: token } : {}),
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Registry unavailable" }, { status: 503 });
  }
}
