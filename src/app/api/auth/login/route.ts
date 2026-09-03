import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// The password is controlled via ACCESS_PASSWORD in .env
// Fallback priority: 1. DB shopSettings row  2. ACCESS_PASSWORD env var
const ENV_PASSWORD = process.env.ACCESS_PASSWORD || "";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password } = body;

    if (!password || !password.trim()) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    // Try to read the password stored in the database first.
    // If the DB is unreachable the catch block silently falls back to the env var.
    let expectedPassword = ENV_PASSWORD;
    try {
      const settings = await prisma.shopSettings.findUnique({
        where: { id: "default" },
      });
      if (settings?.access_password) {
        expectedPassword = settings.access_password;
      }
    } catch (dbErr) {
      console.warn("[auth/login] DB unavailable – using env password.", dbErr);
    }

    if (!expectedPassword) {
      // No password configured anywhere — log a warning and deny access
      console.error("[auth/login] ACCESS_PASSWORD is not set in .env");
      return NextResponse.json(
        { error: "Shop password not configured. Contact the administrator." },
        { status: 500 }
      );
    }

    if (password.trim() !== expectedPassword.trim()) {
      return NextResponse.json(
        { error: "Incorrect password. Please try again." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful",
      shopName: "Kathir Xerox & E-Service Centre",
    });

    response.cookies.set("kx_auth_token", "authenticated", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30-day session
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("[auth/login] Unexpected error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
