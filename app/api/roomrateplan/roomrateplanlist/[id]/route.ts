import dbConnect from "@/lib/db";
import roomrateplanModel from "@/model/roomrateplan.model";
import mongoose from "mongoose";
import { NextResponse,NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // 👈 promise type (no union)
) {
 const { id } = await params;

  try {
    await dbConnect();
    
    const rooms = await roomrateplanModel.aggregate([

       {
        $match: {
          roomId: new mongoose.Types.ObjectId(id), 
        },
      },
        {
          $lookup: {
            from: "roomrateplans", // Assuming the collection name for RoomRatePlan is "roomrateplans"
            localField: "_id",
            foreignField: "roomId",
            as: "ratePlans"
          }
        }
      ]);


    return NextResponse.json({ success: true, data: rooms });
  } catch (error) {
    return NextResponse.json({ success: false, error: error });
  }
}

