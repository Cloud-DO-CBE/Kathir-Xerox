import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    // Retrieve active password from DB (fallback to RX135)
    let expectedPassword = "RX135";
    try {
      const settings = await prisma.shopSettings.findUnique({
        where: { id: "default" },
      });
      if (settings?.access_password) {
        expectedPassword = settings.access_password;
      }
    } catch (e) {
      console.warn("Could not query DB settings for password, using default RX135", e);
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

    // Set secure auth cookie
    response.cookies.set("kx_auth_token", "authenticated", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days session
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
