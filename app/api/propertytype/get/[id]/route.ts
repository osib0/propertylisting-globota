import dbConnect from "@/lib/db";
import propertyModel from "@/model/propertytype.model";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: any) {
  const { id } = params;
  try {
    await dbConnect();
    const property = await propertyModel.findById(id);
    return NextResponse.json({ status: true, data: property });
  } catch (error: any) {
    console.error("Property Save Error:", error);
    return NextResponse.json({ status: false, error: error.message });
  }
}
