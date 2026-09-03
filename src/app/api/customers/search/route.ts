import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/customers/search?q=<query>
 * Returns distinct customers (name + phone) from transaction history
 * matching the search query (case-insensitive, partial match).
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";

    if (q.length < 1) {
      return NextResponse.json([]);
    }

    // Query distinct customer_ref + customer_phone pairs from transactions
    const results = await prisma.transaction.findMany({
      where: {
        customer_ref: {
          contains: q,
          mode: "insensitive",
        },
        NOT: { customer_ref: null },
      },
      select: {
        customer_ref: true,
        customer_phone: true,
      },
      orderBy: { timestamp: "desc" },
      take: 50, // fetch extra to deduplicate
    });

    // Deduplicate by customer_ref (case-insensitive), keep latest phone
    const seen = new Map<string, { name: string; phone: string | null }>();
    for (const r of results) {
      if (!r.customer_ref) continue;
      const key = r.customer_ref.toLowerCase();
      if (!seen.has(key)) {
        seen.set(key, { name: r.customer_ref, phone: r.customer_phone });
      }
    }

    const customers = Array.from(seen.values()).slice(0, 10);

    return NextResponse.json(customers);
  } catch (error: any) {
    console.error("Error searching customers:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
