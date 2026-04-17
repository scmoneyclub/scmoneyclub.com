import { NextRequest, NextResponse } from "next/server";

const SCMC_API_BASE_URL = process.env.SCMC_API_BASE_URL || "";

export async function POST(request: NextRequest) {
  if (!SCMC_API_BASE_URL) {
    return NextResponse.json({ success: false, error: "API not configured" }, { status: 500 });
  }

  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }

  try {
    const wpResponse = await fetch(`${SCMC_API_BASE_URL}/scmc/v1/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await wpResponse.json();

    if (!data.success) {
      return NextResponse.json(
        { success: false, error: data.error || "Registration failed." },
        { status: wpResponse.status }
      );
    }

    return NextResponse.json({ success: true, user_id: data.user_id }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Service unavailable" }, { status: 503 });
  }
}
