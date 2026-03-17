import { NextResponse } from "next/server";

const REGISTRY_URL = process.env.REGISTRY_URL || "http://localhost:3001";

export async function POST(request: Request) {
  const body = await request.json();
  const path = new URL(request.url).searchParams.get("action") || "signup";

  try {
    const res = await fetch(`${REGISTRY_URL}/api/auth/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Registry unavailable" }, { status: 503 });
  }
}
