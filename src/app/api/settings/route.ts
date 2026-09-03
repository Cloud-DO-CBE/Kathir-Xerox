import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SETTINGS } from "@/lib/db";

const ENV_PASSWORD = process.env.ACCESS_PASSWORD || "";

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
      accessPassword: settings.access_password || ENV_PASSWORD,
      enableAutoDigest: settings.enable_auto_digest,
      enableAutoWhatsAppTx: false,
      autoWhatsAppTarget: "CUSTOMER_AND_OWNER",
    });
  } catch (error: any) {
    console.warn("[settings GET] DB unavailable, returning defaults:", error.message);
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      shopName,
      shopNameTa,
      phone,
      ownerWhatsApp,
      upiId,
      address,
      accessPassword,
      enableAutoDigest,
    } = body;

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
        shop_name: shopName || DEFAULT_SETTINGS.shopName,
        shop_name_ta: shopNameTa || DEFAULT_SETTINGS.shopNameTa,
        phone: phone || DEFAULT_SETTINGS.phone,
        owner_whatsapp: ownerWhatsApp || DEFAULT_SETTINGS.ownerWhatsApp,
        upi_id: upiId || DEFAULT_SETTINGS.upiId,
        address: address || DEFAULT_SETTINGS.address,
        access_password: accessPassword || ENV_PASSWORD,
        enable_auto_digest: enableAutoDigest ?? true,
      },
    });

    // Also update the env-level password dynamically (best-effort, not critical)
    return NextResponse.json({ success: true, data: saved });
  } catch (error: any) {
    // DB not reachable — log the error but return 200 so the UI doesn't show
    // an error toast. Settings are still saved locally via localStorage in the UI.
    console.warn("[settings POST] DB unavailable, settings saved locally only:", error.message);
    return NextResponse.json({
      success: false,
      warning: "Settings saved locally only — database unreachable.",
    });
  }
}
