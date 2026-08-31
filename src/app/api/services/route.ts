import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { INITIAL_SERVICES } from "@/lib/initialData";

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: { id: "asc" },
    });

    if (services.length === 0) {
      return NextResponse.json(INITIAL_SERVICES);
    }

    return NextResponse.json(services);
  } catch (error: any) {
    console.error("Error fetching services:", error);
    // Fallback to initial services if database is temporarily unavailable
    return NextResponse.json(INITIAL_SERVICES);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, name, name_ta, category, default_unit_price, unit_label, is_active } = body;

    if (!id || !name || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const service = await prisma.service.upsert({
      where: { id },
      update: {
        name,
        name_ta,
        category,
        default_unit_price: Number(default_unit_price) || 0,
        unit_label: unit_label || "unit",
        is_active: is_active ?? true,
      },
      create: {
        id,
        name,
        name_ta,
        category,
        default_unit_price: Number(default_unit_price) || 0,
        unit_label: unit_label || "unit",
        is_active: is_active ?? true,
      },
    });

    return NextResponse.json(service);
  } catch (error: any) {
    console.error("Error saving service:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

