import dbConnect from "@/lib/db";
import roomModel from "@/model/rooms.model";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id:any = searchParams.get('propertyId')
  try {
    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid propertyId format" },
        { status: 400 }
      );
    }

    const rooms = await roomModel.aggregate([
      {
        $match: { propertyId: new mongoose.Types.ObjectId(id) },
      },
      {
        $lookup: {
          from: "roomrateplans",
          localField: "_id",
          foreignField: "roomId",
          as: "ratePlans",
        },
      },
    ]);

    return NextResponse.json({ success: true, data: rooms });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
