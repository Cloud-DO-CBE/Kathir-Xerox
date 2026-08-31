import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ status: "disconnected", error: "DATABASE_URL is not configured" }, { status: 503 });
    }
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "connected", provider: "Neon PostgreSQL", project: "purple-mouse-59499973" });
  } catch (err: any) {
    return NextResponse.json({ status: "error", message: err.message }, { status: 500 });
  }
}

