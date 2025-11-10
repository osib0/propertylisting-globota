import dbConnect from "@/lib/db";
import InfoHistory from "@/model/infohistory.model";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");
    const userId = searchParams.get("userId");

    if (!propertyId) {
      return NextResponse.json({
        status: false,
        message: "propertyId is required",
      });
    }

    // 🔹 Find pending request for 'location' section
    const pending = await InfoHistory.findOne({
      propertyId,
      userId,
      section: "location",
      status: "pending",
    });

    if (!pending) {
      return NextResponse.json({
        status: false,
        message: "No pending location request found",
      });
    }

    return NextResponse.json({
      status: true,
      message: "Pending location edit request found",
      data: pending,
    });
  } catch (err: any) {
    console.error("❌ Error fetching pending location:", err);
    return NextResponse.json({
      status: false,
      message: "Error fetching pending location",
      error: err.message,
    });
  }
}
