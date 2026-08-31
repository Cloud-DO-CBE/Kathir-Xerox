import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SETTINGS } from "@/lib/db";

export async function GET() {
  try {
    const settings = await prisma.shopSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      return NextResponse.json(DEFAULT_SETTINGS);
    }

    return NextResponse.json({
      shopName: settings.shop_name,
      shopNameTa: settings.shop_name_ta || DEFAULT_SETTINGS.shopNameTa,
      phone: settings.phone || DEFAULT_SETTINGS.phone,
      ownerWhatsApp: settings.owner_whatsapp || DEFAULT_SETTINGS.ownerWhatsApp,
      upiId: settings.upi_id || DEFAULT_SETTINGS.upiId,
      address: settings.address || DEFAULT_SETTINGS.address,
      accessPassword: settings.access_password || 'RX135',
      enableAutoDigest: settings.enable_auto_digest,
      enableAutoWhatsAppTx: false,
      autoWhatsAppTarget: "CUSTOMER_AND_OWNER",
    });
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { shopName, shopNameTa, phone, ownerWhatsApp, upiId, address, accessPassword, enableAutoDigest } = body;

    const saved = await prisma.shopSettings.upsert({
      where: { id: "default" },
      update: {
        shop_name: shopName,
        shop_name_ta: shopNameTa,
        phone,
        owner_whatsapp: ownerWhatsApp,
        upi_id: upiId,
        address,
        access_password: accessPassword || undefined,
        enable_auto_digest: enableAutoDigest ?? true,
      },
      create: {
        id: "default",
        shop_name: shopName,
        shop_name_ta: shopNameTa,
        phone,
        owner_whatsapp: ownerWhatsApp,
        upi_id: upiId,
        address,
        access_password: accessPassword || 'RX135',
        enable_auto_digest: enableAutoDigest ?? true,
      },
    });

    return NextResponse.json(saved);
  } catch (error: any) {
    console.error("Error saving settings:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
