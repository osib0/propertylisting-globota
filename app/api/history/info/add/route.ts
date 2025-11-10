import dbConnect from "@/lib/db";
import PropertyModel from "@/model/property.model";
import historyModel from "@/model/infohistory.model";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { propertyId, userId, newData, section } = await req.json();

    if (!propertyId || !userId || !section) {
      return NextResponse.json({
        status: false,
        message: "Missing required fields (propertyId, userId, or section)",
      });
    }

    // 🔹 Check property
    const existing = await PropertyModel.findById(propertyId);
    if (!existing) {
      return NextResponse.json({
        status: false,
        message: "Property not found",
      });
    }

    // 🔹 Detect changes
    const changes: any[] = [];
    Object.keys(newData).forEach((key) => {
      const oldValue = existing[key];
      const newValue = newData[key];
      if (String(oldValue ?? "") !== String(newValue ?? "")) {
        changes.push({ field: key, oldValue, newValue });
      }
    });

    if (changes.length === 0) {
      return NextResponse.json({
        status: false,
        message: "No changes detected",
      });
    }

    // 🔹 Check if a pending record already exists for same section
    const existingHistory = await historyModel.findOne({
      propertyId,
      userId,
      section,
      status: "pending",
    });

    let history;

    if (existingHistory) {
      // ✅ Update existing pending request
      existingHistory.changes = changes;
      existingHistory.updatedAt = new Date();
      history = await existingHistory.save();

      return NextResponse.json({
        status: true,
        message: `Updated existing pending ${section} request.`,
        data: history,
      });
    }

    // ✅ Otherwise create a new request
    history = await historyModel.create({
      propertyId,
      userId,
      section,
      changes,
      status: "pending",
    });

    return NextResponse.json({
      status: true,
      message: `New ${section} edit request submitted for approval.`,
      data: history,
    });
  } catch (err: any) {
    console.error("❌ Error saving history:", err);
    return NextResponse.json({
      status: false,
      message: "Error saving history",
      error: err.message,
    });
  }
}
