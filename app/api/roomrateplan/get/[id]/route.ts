import dbConnect from "@/lib/db";
import roomrateplanModel from "@/model/roomrateplan.model";
import { NextResponse } from "next/server";

export async function GET(req: Request,{params}:any) {
    const {id} =await params
  try {
    await dbConnect();
    const roomRatePlan = await roomrateplanModel.findById(id);

    return NextResponse.json({ success: true, data: roomRatePlan });
  } catch (error) {
    return NextResponse.json({ success: false, error: error });
  }
}
