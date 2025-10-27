import dbConnect from "@/lib/db";
import roomviewModel from "@/model/roomview.model";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const newCity = await roomviewModel.find()
    return NextResponse.json({ status: true, data: newCity });
  } catch (error: any) {
    return NextResponse.json({ status: false, error: error.message }, { status: 500 });
  }
}