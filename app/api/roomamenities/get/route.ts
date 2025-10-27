import dbConnect from "@/lib/db";
import roomamenitiesModel from "@/model/roomamenities.model";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    const amenities = await roomamenitiesModel.find()
    return NextResponse.json({ success: true, data: amenities });
  } catch (error:any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}