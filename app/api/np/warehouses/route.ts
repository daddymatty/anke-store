import { NextRequest, NextResponse } from "next/server";
import { getWarehouses, type NpWarehouseType } from "@/lib/integrations/novaposhta";

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get("city") ?? "";
  const type = (req.nextUrl.searchParams.get("type") ?? "warehouse") as NpWarehouseType;
  if (!city) return NextResponse.json({ warehouses: [] });
  try {
    const warehouses = await getWarehouses(city, type === "postomat" ? "postomat" : "warehouse");
    return NextResponse.json({ warehouses });
  } catch {
    return NextResponse.json({ warehouses: [] }, { status: 200 });
  }
}
