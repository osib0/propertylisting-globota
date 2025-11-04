import dbConnect from "@/lib/db";
import PropertyModel from "@/model/property.model";
import LocationHistory from "@/model/locationhistory.model";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const { propertyId, userId, newDistances, newLocation } = body;

    const existing = await PropertyModel.findById(propertyId);
    if (!existing) {
      return NextResponse.json({
        status: false,
        message: "Property not found",
      });
    }

    const changes: any[] = [];

    if (Array.isArray(newDistances)) {
      const oldDistances = existing.distance_from || [];
      if (JSON.stringify(oldDistances) !== JSON.stringify(newDistances)) {
        changes.push({
          field: "distance_from",
          action: "updated",
          oldValue: oldDistances,
          newValue: newDistances,
        });
      }
    }

    if (newLocation) {
      const fieldsToCheck = [
        "address",
        "pincode",
        "city",
        "landmark",
        "lat",
        "lng",
      ];

      fieldsToCheck.forEach((field) => {
        if (existing[field] !== newLocation[field]) {
          changes.push({
            field,
            action: "updated",
            oldValue: existing[field],
            newValue: newLocation[field],
          });
        }
      });
    }

    if (changes.length === 0) {
      return NextResponse.json({
        status: false,
        message: "No changes detected",
      });
    }

    const existingPending = await LocationHistory.findOne({
      propertyId,
      userId,
      status: "pending",
    });

    let history;

    if (existingPending) {
      existingPending.changes.push(...changes);
      existingPending.updatedAt = new Date();
      history = await existingPending.save();

      return NextResponse.json({
        status: true,
        message: "Pending changes updated successfully",
        data: history,
      });
    } else {
      history = await LocationHistory.create({
        propertyId,
        userId,
        status: "pending",
        changes,
      });

      return NextResponse.json({
        status: true,
        message: "Changes submitted for approval",
        data: history,
      });
    }
  } catch (err) {
    console.error("Error saving location history:", err);
    return NextResponse.json({
      status: false,
      message: "Error saving history",
    });
  }
}
