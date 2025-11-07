import dbConnect from "@/lib/db";
import roomModel from "@/model/rooms.model";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");

    if (!propertyId) {
      return NextResponse.json(
        { success: false, error: "Property ID is required" },
        { status: 400 }
      );
    }

    const rooms = await roomModel.find({ propertyId }).lean();

    return NextResponse.json({ success: true, data: rooms });
  } catch (error: any) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
