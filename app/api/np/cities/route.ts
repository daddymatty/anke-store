import { NextRequest, NextResponse } from "next/server";
import { searchCities } from "@/lib/integrations/novaposhta";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  try {
    const cities = await searchCities(q);
    return NextResponse.json({ cities });
  } catch {
    return NextResponse.json({ cities: [] }, { status: 200 });
  }
}
