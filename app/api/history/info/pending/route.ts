import dbConnect from "@/lib/db";
import InfoHistoryModel from "@/model/infohistory.model";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");
    const userId = searchParams.get("userId");
    const section = searchParams.get("section");

    if (!propertyId || !userId || !section) {
      return NextResponse.json({
        status: false,
        message: "Missing propertyId, userId, or section",
      });
    }

    const pendingRequest = await InfoHistoryModel.findOne({
      propertyId,
      userId,
      section,
      status: "pending",
    });

    if (!pendingRequest) {
      return NextResponse.json({
        status: false,
        message: "No pending request found",
      });
    }

    return NextResponse.json({
      status: true,
      message: "Pending request found",
      data: pendingRequest,
    });
  } catch (error: any) {
    console.error("Error fetching pending request:", error);
    return NextResponse.json({
      status: false,
      message: "Failed to fetch pending request",
      error: error.message,
    });
  }
}
