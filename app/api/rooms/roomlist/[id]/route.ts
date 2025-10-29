import dbConnect from "@/lib/db";
import roomModel from "@/model/rooms.model";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req:Request,{params}:any) {
    const {id} = params
  try {
    await dbConnect();
    
    const rooms = await roomModel.aggregate([

       {
        $match: {
          propertyId: new mongoose.Types.ObjectId(id), 
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

