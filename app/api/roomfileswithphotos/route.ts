import dbConnect from "@/lib/db";
import roomcategoryModel from "@/model/rooms.model";
// import roomphotosModel from "@/model/roomphotos/roomphotos.model";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    const roomWithPhotos = await roomcategoryModel.aggregate([
  {
    $lookup: {
      from: "roomphotos", // Must match actual MongoDB collection name
      localField: "_id",
      foreignField: "roomId",
      as: "photos",
    },
  },
]);
     

    return NextResponse.json({ success: true, data: roomWithPhotos });
  } catch (error) {
    return NextResponse.json({ success: false, error: error });
  }
}
