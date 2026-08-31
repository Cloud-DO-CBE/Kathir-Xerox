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

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Service id is required" }, { status: 400 });
    }

    // Set service_id to null in any transaction items referencing this service before deleting
    await prisma.transactionItem.updateMany({
      where: { service_id: id },
      data: { service_id: null },
    });

    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Service deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting service:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

