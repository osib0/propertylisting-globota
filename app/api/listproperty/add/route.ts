import dbConnect from "@/lib/db";
import listpropertyModel from "@/model/listproperty.model";
import { NextResponse } from "next/server";

// ✅ Transform room_amenities before saving
const formatRoomAmenities = (data: any) => {
  if (!data || typeof data !== "object") return [];

  const formatted = [];

  for (const [category, amenities] of Object.entries(data)) {
    const formattedAmenities = Object.entries(amenities).map(([title, value]) => ({
      title,
      value,
    }));

    formatted.push({
      category,
      amenities: formattedAmenities,
    });
  }

  return formatted;
};

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const ownerId = searchParams.get("ownerId");
    const body = await req.json();

    if (body.room_amenities) {
      body.room_amenities = formatRoomAmenities(body.room_amenities);
    }

    if (ownerId) {
      const updated = await listpropertyModel.findOneAndUpdate(
        { ownerId },
        { $set: body },
        { new: true }
      );

      if (!updated) {
        return NextResponse.json(
          { success: false, error: "Property not found for given ownerId" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: "Property updated successfully",
          data: updated,
        },
        { status: 200 }
      );
    }

    const listProperty = await listpropertyModel.create(body);
    return NextResponse.json(
      {
        success: true,
        message: "Property created successfully",
        data: listProperty,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error in POST /listproperty:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
