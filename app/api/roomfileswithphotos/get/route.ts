import dbConnect from "@/lib/db";
import roomcategoryModel from "@/model/rooms.model";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await dbConnect();

    // Extract room category ID from query params
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("id");

    if (!roomId) {
      return NextResponse.json({ success: false, error: "Missing room category ID (id)" });
    }

    // MongoDB aggregate to fetch 1 roomcategory + its photos
    const roomWithPhotos = await roomcategoryModel.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(roomId),
        },
      },
      {
        $lookup: {
          from: "roomphotos",
          localField: "_id",
          foreignField: "roomId",
          as: "photos",
        },
      },
    ]);

    // Return first result or null
    return NextResponse.json({ success: true, data: roomWithPhotos || null });
  } catch (error:any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}