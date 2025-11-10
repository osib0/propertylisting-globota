import dbConnect from "@/lib/db";
import PropertyModel from "@/model/property.model";
import InfoHistoryModel from "@/model/infohistory.model";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const { propertyId, userId, section, newData, changes } = body;

    if (!propertyId || !userId || !section) {
      return NextResponse.json({
        status: false,
        message: "Missing required fields (propertyId, userId, or section)",
      });
    }

    // 🔹 Validate Property
    const existing = await PropertyModel.findById(propertyId);
    if (!existing) {
      return NextResponse.json({
        status: false,
        message: "Property not found",
      });
    }

    let finalChanges = [];

    // ✅ 1️⃣ If frontend sends manual `changes`, use that directly
    if (Array.isArray(changes) && changes.length > 0) {
      finalChanges = changes;
    }
    // ✅ 2️⃣ Otherwise, compute diffs normally for newData
    else if (newData && typeof newData === "object") {
      Object.keys(newData).forEach((key) => {
        const oldValue = existing[key];
        const newValue = newData[key];

        // Handle nested arrays or objects by comparing JSON strings
        if (JSON.stringify(oldValue ?? "") !== JSON.stringify(newValue ?? "")) {
          finalChanges.push({ field: key, oldValue, newValue });
        }
      });
    }

    if (finalChanges.length === 0) {
      return NextResponse.json({
        status: false,
        message: "No changes detected",
      });
    }

    // 🔹 Check for existing pending record in same section
    const existingHistory = await InfoHistoryModel.findOne({
      propertyId,
      userId,
      section,
      status: "pending",
    });

    let history;

    if (existingHistory) {
      // ✅ Update existing pending request
      existingHistory.changes = finalChanges;
      existingHistory.updatedAt = new Date();
      history = await existingHistory.save();

      return NextResponse.json({
        status: true,
        message: `Updated existing pending ${section} request.`,
        data: history,
      });
    }

    // ✅ Otherwise create new
    history = await InfoHistoryModel.create({
      propertyId,
      userId,
      section,
      changes: finalChanges,
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
