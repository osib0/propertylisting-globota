import dbConnect from "@/lib/db";
import propertytypeModel from "@/model/propertyamenities.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('categoryId')
  try {
    await dbConnect();


    const amenities = await propertytypeModel.find({
      categoryId: id,
    });

    return NextResponse.json({ success: true, data: amenities });
  } catch (error: any) {
    console.error("Error fetching amenities:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
