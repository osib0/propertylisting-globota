import dbConnect from "@/lib/db";
import propertyPhotosModel from "@/model/propertyPhotos.model";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: any) { 
 
    const { id } = await params
  try {
    await dbConnect();

    const propertiesPhotos = await propertyPhotosModel.find({property_id: id});

    return NextResponse.json({
      status: true,
      data: propertiesPhotos,
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
