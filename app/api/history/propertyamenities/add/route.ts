import dbConnect from "@/lib/db";
import PropertyModel from "@/model/property.model";
import PropertyAmenitiesHistory from "@/model/propertyamenitieshistory.model";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { propertyId, userId, newAmenities } = await req.json();

    if (!propertyId || !userId || !Array.isArray(newAmenities)) {
      return NextResponse.json({
        status: false,
        message: "Missing or invalid fields",
      });
    }

    const existingProperty = await PropertyModel.findById(propertyId);
    if (!existingProperty) {
      return NextResponse.json({
        status: false,
        message: "Property not found",
      });
    }

    const oldAmenities = existingProperty.property_amenities || [];
    const changes: any[] = [];

    if (JSON.stringify(oldAmenities) !== JSON.stringify(newAmenities)) {
      changes.push({
        field: "property_amenities",
        oldValue: oldAmenities,
        newValue: newAmenities,
      });
    }

    if (changes.length === 0) {
      return NextResponse.json({
        status: false,
        message: "No changes detected",
      });
    }

    const existingPending = await PropertyAmenitiesHistory.findOne({
      propertyId,
      userId,
      status: "pending",
    });

    let history;

    if (existingPending) {
      existingPending.changes = changes;
      existingPending.updatedAt = new Date();
      history = await existingPending.save();
    } else {
      history = await PropertyAmenitiesHistory.create({
        propertyId,
        userId,
        changes,
        status: "pending",
      });
    }

    return NextResponse.json({
      status: true,
      message: existingPending
        ? "Pending amenities update modified"
        : "Amenities update submitted for approval",
      data: history,
    });
  } catch (err) {
    console.error("Error creating amenities history:", err);
    return NextResponse.json({
      status: false,
      message: "Error creating amenities history",
    });
  }
}
