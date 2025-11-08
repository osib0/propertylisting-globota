import dbConnect from "@/lib/db";
import roomcategoryModel from "@/model/rooms.model";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: any) {
  const { id } =  await  params;
  try {
    await dbConnect();
 
    // MongoDB aggregate to fetch 1 roomcategory + its photos
    const roomWithPhotos = await roomcategoryModel.aggregate([
      {
        $match: {
          propertyId: new Types.ObjectId(id),
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
    return NextResponse.json({ success: true, data: roomWithPhotos });
  } catch (error:any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}