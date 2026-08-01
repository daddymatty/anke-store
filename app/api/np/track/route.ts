import { NextRequest, NextResponse } from "next/server";
import { trackWaybill } from "@/lib/integrations/novaposhta";

export async function GET(req: NextRequest) {
  const ttn = req.nextUrl.searchParams.get("ttn") ?? "";
  if (!/^\d{10,16}$/.test(ttn) && !ttn.startsWith("dev")) {
    return NextResponse.json({ status: null });
  }
  try {
    const res = await trackWaybill(ttn);
    return NextResponse.json({ status: res?.status ?? null });
  } catch {
    return NextResponse.json({ status: null });
  }
}
