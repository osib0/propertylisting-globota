import dbConnect from "@/lib/db";
import propertyModel from "@/model/propertytype.model";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const property = await propertyModel.create(body);
    return NextResponse.json({ status: true, data: property });
  } catch (error: any) {
    console.error("Property Save Error:", error);
    return NextResponse.json({ status: false, error: error.message });
  }
}
