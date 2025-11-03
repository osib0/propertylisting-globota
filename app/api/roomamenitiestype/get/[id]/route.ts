import dbConnect from "@/lib/db";
import roomamenitiestypeModel from "@/model/roomamenitiestype.model";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: any) {
  const { id } = params;
  try {
    await dbConnect();
    const room = await roomamenitiestypeModel.findById(id);
    return NextResponse.json({ status: true, data: room });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, error: error.message },
      { status: 500 }
    );
  }
}
