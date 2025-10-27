import dbConnect from "@/lib/db";
import propertytypeModel from "@/model/propertyamenities.model";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    const amenities = await propertytypeModel.find().populate("categoryId", "title"); 
    console.log('Fetched amenities:', amenities);
    return NextResponse.json({ success: true, data: amenities });
  } catch (error:any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}