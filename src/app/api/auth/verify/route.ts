import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const isAuthenticated = cookieHeader.includes("kx_auth_token=authenticated");
    return NextResponse.json({ authenticated: isAuthenticated }, { status: 200 });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}
