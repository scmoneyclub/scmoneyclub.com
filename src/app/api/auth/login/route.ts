import { NextRequest, NextResponse } from "next/server";

const SCMC_API_BASE_URL = process.env.SCMC_API_BASE_URL || "";

interface LoginResponse {
  success: boolean;
  user?: {
    ID: number;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    image: string;
    registration_status: string;
    company: string;
  };
  token?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  if (!SCMC_API_BASE_URL) {
    return NextResponse.json(
      { success: false, error: "API not configured" },
      { status: 500 }
    );
  }

  let body: { login?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { login, password } = body;
  if (!login || !password) {
    return NextResponse.json(
      { success: false, error: "Missing login or password" },
      { status: 400 }
    );
  }

  try {
    const wpResponse = await fetch(`${SCMC_API_BASE_URL}/scmc/v1/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login: login.trim(), password }),
    });

    const data: LoginResponse = await wpResponse.json();

    if (!data.success || !data.user || !data.token) {
      return NextResponse.json(
        { success: false, error: data.error || "Login failed" },
        { status: wpResponse.status }
      );
    }

    // Store token in an httpOnly cookie — never exposed to JS
    const response = NextResponse.json({
      success: true,
      user: data.user,
    });

    response.cookies.set("scmc_token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: "Service unavailable" },
      { status: 503 }
    );
  }
}
