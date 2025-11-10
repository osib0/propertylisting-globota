import dbConnect from "@/lib/db";
import HistoryModel from "@/model/infohistory.model";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get("propertyId");

  try {
    await dbConnect();

    const pending = await HistoryModel.findOne({
      propertyId,
      section: "basicInfo",
      status: "pending",
    }).sort({ createdAt: -1 }); 

    if (pending) {
      return NextResponse.json({ status: true, data: pending });
    } else {
      return NextResponse.json({ status: false, message: "No pending record" });
    }
  } catch (error) {
    return NextResponse.json({ status: false, message: "Error checking history" });
  }
}
