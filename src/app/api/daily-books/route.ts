import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const month = searchParams.get("month"); // YYYY-MM

    if (date) {
      const book = await prisma.dailyBook.findUnique({
        where: { date },
        include: {
          transactions: {
            include: { items: true },
            orderBy: { timestamp: "desc" },
          },
        },
      });
      return NextResponse.json(book || null);
    }

    if (month) {
      const books = await prisma.dailyBook.findMany({
        where: {
          date: { startsWith: month },
        },
        orderBy: { date: "desc" },
      });
      return NextResponse.json(books);
    }

    const books = await prisma.dailyBook.findMany({
      take: 30,
      orderBy: { date: "desc" },
    });
    return NextResponse.json(books);
  } catch (error: any) {
    console.error("Error fetching daily books:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { date, status } = body;

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const book = await prisma.dailyBook.upsert({
      where: { date },
      update: {
        status: status || "OPEN",
        closed_at: status === "CLOSED" ? new Date() : null,
      },
      create: {
        date,
        status: status || "OPEN",
        closed_at: status === "CLOSED" ? new Date() : null,
      },
    });

    return NextResponse.json(book);
  } catch (error: any) {
    console.error("Error updating daily book:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
