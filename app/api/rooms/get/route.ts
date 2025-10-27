import dbConnect from "@/lib/db";
import roomModel from "@/model/rooms.model";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();

   const rooms = await roomModel.find()

    return NextResponse.json({ success: true, data: rooms });
  } catch (error) {
    return NextResponse.json({ success: false, error: error });
  }
}
