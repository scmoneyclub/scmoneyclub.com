import { NextRequest, NextResponse } from "next/server";

const INVITE_CODES = (process.env.SCMC_INVITE_CODE || "")
  .split(",")
  .map((c) => c.trim())
  .filter(Boolean);

export async function POST(request: NextRequest) {
  let body: { code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }

  const code = (body.code || "").trim();
  if (!code) {
    return NextResponse.json(
      { success: false, error: "Invite code is required." },
      { status: 400 }
    );
  }

  if (!INVITE_CODES.length) {
    return NextResponse.json(
      { success: false, error: "Invitations are not available at this time." },
      { status: 503 }
    );
  }

  if (!INVITE_CODES.includes(code)) {
    return NextResponse.json(
      { success: false, error: "That invite code wasn't recognized. Please double-check and try again." },
      { status: 403 }
    );
  }

  return NextResponse.json({ success: true });
}
