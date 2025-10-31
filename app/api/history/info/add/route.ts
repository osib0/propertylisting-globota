import dbConnect from "@/lib/db";
import PropertyModel from "@/model/property.model";
import historyModel from "@/model/infohistory.model";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { propertyId, userId, newData } = await req.json();

    const existing = await PropertyModel.findById(propertyId);
    if (!existing) {
      return NextResponse.json({ status: false, message: "Property not found" });
    }
    const changes: any[] = [];
    Object.keys(newData).forEach((key) => {
      const oldValue = existing[key];
      const newValue = newData[key];
      if (String(oldValue) !== String(newValue)) {
        changes.push({ field: key, oldValue, newValue });
      }
    });

    if (changes.length === 0) {
      return NextResponse.json({ status: false, message: "No changes detected" });
    }

    // Save to property history
    const history = await historyModel.create({
      propertyId,
      userId,
      changes,
      status: "pending",
    });

    return NextResponse.json({
      status: true,
      message: "Changes submitted for approval",
      data: history,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: false, message: "Error saving history" });
  }
}
