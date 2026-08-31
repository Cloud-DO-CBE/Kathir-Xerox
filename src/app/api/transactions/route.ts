import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateTokenNumber, getTodayDateString } from "@/lib/formatters";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const month = searchParams.get("month"); // YYYY-MM
    const customerRef = searchParams.get("customer_ref");

    const whereClause: any = {};

    if (date) {
      const start = new Date(`${date}T00:00:00.000Z`);
      const end = new Date(`${date}T23:59:59.999Z`);
      whereClause.timestamp = { gte: start, lte: end };
    } else if (month) {
      const [year, m] = month.split("-").map(Number);
      const start = new Date(Date.UTC(year, m - 1, 1, 0, 0, 0));
      const end = new Date(Date.UTC(year, m, 0, 23, 59, 59, 999));
      whereClause.timestamp = { gte: start, lte: end };
    }

    if (customerRef) {
      whereClause.customer_ref = { contains: customerRef, mode: "insensitive" };
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        items: true,
      },
      orderBy: { timestamp: "desc" },
    });

    // Format to match frontend Transaction interface
    const formatted = transactions.map((tx) => ({
      id: tx.id,
      book_id: tx.book_id || "",
      timestamp: tx.timestamp.toISOString(),
      token_no: tx.token_no,
      payment_mode: tx.payment_mode,
      customer_ref: tx.customer_ref || undefined,
      customer_phone: tx.customer_phone || undefined,
      grand_total: tx.grand_total,
      cash_amount: tx.cash_amount,
      upi_amount: tx.upi_amount,
      due_amount: tx.due_amount,
      notes: tx.notes || undefined,
      items: tx.items.map((item) => ({
        id: item.id,
        service_id: item.service_id || "",
        item_name: item.item_name,
        category: item.category,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
      })),
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      payment_mode,
      customer_ref,
      customer_phone,
      grand_total,
      cash_amount = 0,
      upi_amount = 0,
      due_amount = 0,
      notes,
      items = [],
      timestamp,
      date,
    } = body;

    const txDate = date || (timestamp ? timestamp.split("T")[0] : getTodayDateString());
    const txTimestamp = timestamp ? new Date(timestamp) : new Date();

    // Ensure DailyBook exists for the given date
    let book = await prisma.dailyBook.findUnique({
      where: { date: txDate },
    });

    if (!book) {
      book = await prisma.dailyBook.create({
        data: {
          date: txDate,
          status: "OPEN",
          total_cash: 0,
          total_upi: 0,
          total_due: 0,
          total_amount: 0,
          total_transactions: 0,
        },
      });
    }

    // Count today existing transactions to generate sequential token
    const dayCount = await prisma.transaction.count({
      where: {
        timestamp: {
          gte: new Date(`${txDate}T00:00:00.000Z`),
          lte: new Date(`${txDate}T23:59:59.999Z`),
        },
      },
    });

    const tokenNo = body.token_no || generateTokenNumber(dayCount + 1, txDate);

    // Create transaction + items and update daybook in a transaction
    const newTx = await prisma.$transaction(async (prismaClient) => {
      const createdTx = await prismaClient.transaction.create({
        data: {
          book_id: book.id,
          timestamp: txTimestamp,
          token_no: tokenNo,
          payment_mode,
          customer_ref: customer_ref || null,
          customer_phone: customer_phone || null,
          grand_total: Number(grand_total),
          cash_amount: Number(cash_amount),
          upi_amount: Number(upi_amount),
          due_amount: Number(due_amount),
          notes: notes || null,
          items: {
            create: items.map((item: any) => ({
              service_id: item.service_id || null,
              item_name: item.item_name,
              category: item.category || "OTHER",
              quantity: Number(item.quantity) || 1,
              unit_price: Number(item.unit_price) || 0,
              subtotal: Number(item.subtotal) || 0,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Update DailyBook totals
      await prismaClient.dailyBook.update({
        where: { id: book.id },
        data: {
          total_cash: { increment: Number(cash_amount) },
          total_upi: { increment: Number(upi_amount) },
          total_due: { increment: Number(due_amount) },
          total_amount: { increment: Number(grand_total) },
          total_transactions: { increment: 1 },
        },
      });

      // Update customer due ledger if due_amount > 0 and customer_ref is provided
      if (due_amount > 0 && customer_ref) {
        await prismaClient.customerDue.upsert({
          where: { customer_ref: customer_ref.trim() },
          update: {
            total_due: { increment: Number(due_amount) },
            customer_phone: customer_phone || undefined,
          },
          create: {
            customer_ref: customer_ref.trim(),
            customer_phone: customer_phone || null,
            total_due: Number(due_amount),
          },
        });
      }

      return createdTx;
    });

    return NextResponse.json(newTx, { status: 201 });
  } catch (error: any) {
    console.error("Error creating transaction:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Transaction id is required" }, { status: 400 });
    }

    const existing = await prisma.transaction.findUnique({
      where: { id },
      include: { book: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    await prisma.$transaction(async (prismaClient) => {
      if (existing.book_id) {
        await prismaClient.dailyBook.update({
          where: { id: existing.book_id },
          data: {
            total_cash: { decrement: existing.cash_amount },
            total_upi: { decrement: existing.upi_amount },
            total_due: { decrement: existing.due_amount },
            total_amount: { decrement: existing.grand_total },
            total_transactions: { decrement: 1 },
          },
        });
      }

      if (existing.due_amount > 0 && existing.customer_ref) {
        await prismaClient.customerDue.updateMany({
          where: { customer_ref: existing.customer_ref },
          data: {
            total_due: { decrement: existing.due_amount },
          },
        });
      }

      await prismaClient.transaction.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true, message: "Transaction deleted" });
  } catch (error: any) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

