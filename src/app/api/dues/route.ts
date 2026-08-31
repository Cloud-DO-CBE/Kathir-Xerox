import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const dues = await prisma.customerDue.findMany({
      where: { total_due: { gt: 0 } },
      orderBy: { total_due: "desc" },
    });

    const enriched = await Promise.all(
      dues.map(async (due) => {
        const txs = await prisma.transaction.findMany({
          where: {
            customer_ref: { equals: due.customer_ref, mode: "insensitive" },
            due_amount: { gt: 0 },
          },
          select: {
            id: true,
            token_no: true,
            timestamp: true,
            due_amount: true,
          },
          orderBy: { timestamp: "asc" },
        });

        return {
          customer_ref: due.customer_ref,
          customer_phone: due.customer_phone,
          total_due: due.total_due,
          transactions: txs.map((t) => ({
            transaction_id: t.id,
            token_no: t.token_no,
            date: t.timestamp.toISOString().split("T")[0],
            amount: t.due_amount,
          })),
        };
      })
    );

    return NextResponse.json(enriched);
  } catch (error: any) {
    console.error("Error fetching dues:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customer_ref, amount, payment_mode = "CASH" } = body;

    if (!customer_ref || !amount || amount <= 0) {
      return NextResponse.json({ error: "Valid customer_ref and amount are required" }, { status: 400 });
    }

    const settleAmount = Number(amount);

    await prisma.$transaction(async (prismaClient) => {
      const txs = await prismaClient.transaction.findMany({
        where: {
          customer_ref: { equals: customer_ref, mode: "insensitive" },
          due_amount: { gt: 0 },
        },
        orderBy: { timestamp: "asc" },
      });

      let remaining = settleAmount;
      for (const tx of txs) {
        if (remaining <= 0) break;
        const reduce = Math.min(tx.due_amount, remaining);

        await prismaClient.transaction.update({
          where: { id: tx.id },
          data: {
            due_amount: { decrement: reduce },
            cash_amount: payment_mode === "CASH" ? { increment: reduce } : undefined,
            upi_amount: payment_mode === "UPI" ? { increment: reduce } : undefined,
          },
        });

        remaining -= reduce;
      }

      await prismaClient.customerDue.updateMany({
        where: { customer_ref: { equals: customer_ref, mode: "insensitive" } },
        data: {
          total_due: { decrement: settleAmount },
          last_settled: new Date(),
        },
      });
    });

    return NextResponse.json({ success: true, message: "Dues settled successfully" });
  } catch (error: any) {
    console.error("Error settling dues:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
