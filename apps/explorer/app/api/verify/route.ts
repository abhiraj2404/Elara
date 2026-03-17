import { NextResponse } from "next/server";

const REGISTRY_URL = process.env.REGISTRY_URL || "http://localhost:3001";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const res = await fetch(`${REGISTRY_URL}/api/verify/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Registry unavailable" },
      { status: 503 }
    );
  }
}
