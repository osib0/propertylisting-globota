import dbConnect from "@/lib/db";
import propertyModel from "@/model/property.model";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: any) {

  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('propertyId')
    const properties = await propertyModel.findById(id)

    return NextResponse.json({
      status: true,
      data: properties,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: false,
        error: error.message || "Failed to fetch properties",
      },
      { status: 500 }
    );
  }
}
