// import dbConnect from "@/lib/db";
// import roomModel from "@/model/room/room.model";
// import mongoose from "mongoose";
// import { NextResponse } from "next/server";

// export async function GET(request: Request, { params }: any) {
//   const { id } = params;

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return NextResponse.json({ success: false, error: "Invalid property ID" });
//   }

//   try {
//     await dbConnect();

//     const room = await roomModel.aggregate([
//       {
//         $match: {
//           propertyId: new mongoose.Types.ObjectId(id), 
//         },
//       },
//       {
//         $lookup: {
//           from: "roomrateplans",
//           localField: "_id",
//           foreignField: "roomId",
//           as: "ratePlans",
//         },
//       },
//     ]);

//     console.log("Fetched Room Data:", room);

//     return NextResponse.json({ success: true, data: room });
//   } catch (error) {
//     console.error("Error:", error);
//     return NextResponse.json({ success: false, error: error });
//   }
// }

import dbConnect from "@/lib/db";
import roomModel from "@/model/rooms.model";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: any) {
  const { id } =await params
  console.log(id,'room id');
  
  try {
    await dbConnect();
    const room = await roomModel.findById(id);
    return NextResponse.json({ success: true, data: room });
  } catch (error) {
    return NextResponse.json({ success: false, error: error });
  }
}

