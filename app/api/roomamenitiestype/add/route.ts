import dbConnect from "@/lib/db";
import roomamenitiestypeModel from "@/model/roomamenitiestype.model";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const newCity = await roomamenitiestypeModel.create(body);
    return NextResponse.json({ success: true, data: newCity });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}