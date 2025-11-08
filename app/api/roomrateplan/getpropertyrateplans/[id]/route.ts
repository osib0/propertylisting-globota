import dbConnect from "@/lib/db";
import roomrateplanModel from "@/model/roomrateplan.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
  try {
    await dbConnect();
    const roomRatePlan = await roomrateplanModel.findById({property:id});

    return NextResponse.json({ success: true, data: roomRatePlan });
  } catch (error) {
    return NextResponse.json({ success: false, error: error });
  }
}
