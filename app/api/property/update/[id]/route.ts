import dbConnect from "@/lib/db";
import propertyModel from "@/model/property.model";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: any) {
  const { id } = params;

  try {
    await dbConnect();

    const body = await req.json();

    // Ensure default values if not provided
    const updateData = {
      ...body,
      property_status: body.property_status || "1", // Default: Property Not Verified
      listing_status: body.listing_status || "2",   // Default: Inactive
      //  property_amenities: Array.isArray(body.property_amenities) ? body.property_amenities : [],
    };

    const updatedProperty = await propertyModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedProperty) {
      return NextResponse.json(
        { status: false, error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: true,
      message: "Property updated successfully",
      data: updatedProperty,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: false,
        error: error.message || "Failed to update property",
      },
      { status: 500 }
    );
  }
}
