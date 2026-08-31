import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { transactions = [], services = [] } = body;

    let syncedTxCount = 0;
    let syncedServicesCount = 0;

    // 1. Sync Services
    if (Array.isArray(services) && services.length > 0) {
      for (const s of services) {
        await prisma.service.upsert({
          where: { id: s.id },
          update: {
            name: s.name,
            name_ta: s.name_ta,
            category: s.category,
            default_unit_price: Number(s.default_unit_price) || 0,
            unit_label: s.unit_label || "unit",
            is_active: s.is_active ?? true,
          },
          create: {
            id: s.id,
            name: s.name,
            name_ta: s.name_ta,
            category: s.category,
            default_unit_price: Number(s.default_unit_price) || 0,
            unit_label: s.unit_label || "unit",
            is_active: s.is_active ?? true,
          },
        });
        syncedServicesCount++;
      }
    }

    // 2. Sync Transactions
    if (Array.isArray(transactions) && transactions.length > 0) {
      for (const tx of transactions) {
        const txDate = tx.timestamp ? tx.timestamp.split("T")[0] : new Date().toISOString().split("T")[0];

        let book = await prisma.dailyBook.findUnique({ where: { date: txDate } });
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

        const existing = await prisma.transaction.findUnique({ where: { id: tx.id } });
        if (!existing) {
          await prisma.transaction.create({
            data: {
              id: tx.id,
              book_id: book.id,
              timestamp: new Date(tx.timestamp || Date.now()),
              token_no: tx.token_no,
              payment_mode: tx.payment_mode,
              customer_ref: tx.customer_ref || null,
              customer_phone: tx.customer_phone || null,
              grand_total: Number(tx.grand_total) || 0,
              cash_amount: Number(tx.cash_amount) || 0,
              upi_amount: Number(tx.upi_amount) || 0,
              due_amount: Number(tx.due_amount) || 0,
              notes: tx.notes || null,
              items: {
                create: (tx.items || []).map((it: any) => ({
                  service_id: it.service_id || null,
                  item_name: it.item_name,
                  category: it.category || "OTHER",
                  quantity: Number(it.quantity) || 1,
                  unit_price: Number(it.unit_price) || 0,
                  subtotal: Number(it.subtotal) || 0,
                })),
              },
            },
          });

          await prisma.dailyBook.update({
            where: { id: book.id },
            data: {
              total_cash: { increment: Number(tx.cash_amount || 0) },
              total_upi: { increment: Number(tx.upi_amount || 0) },
              total_due: { increment: Number(tx.due_amount || 0) },
              total_amount: { increment: Number(tx.grand_total || 0) },
              total_transactions: { increment: 1 },
            },
          });

          if (tx.due_amount > 0 && tx.customer_ref) {
            await prisma.customerDue.upsert({
              where: { customer_ref: tx.customer_ref.trim() },
              update: { total_due: { increment: Number(tx.due_amount) } },
              create: {
                customer_ref: tx.customer_ref.trim(),
                customer_phone: tx.customer_phone || null,
                total_due: Number(tx.due_amount),
              },
            });
          }

          syncedTxCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      syncedTransactions: syncedTxCount,
      syncedServices: syncedServicesCount,
      message: "Data synchronized to Neon PostgreSQL successfully",
    });
  } catch (error: any) {
    console.error("Error syncing data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
