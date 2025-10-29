import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import roominventoryModel from "@/model/roominventory.model";

function parseYMD_UTC(ymd: string) {
  // "YYYY-MM-DD" -> 00:00:00.000Z (no local TZ surprises)
  return new Date(`${ymd}T00:00:00.000Z`);
}
function addDaysUTC(d: Date, n: number) {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}
function oid(id: string) {
  return new mongoose.Types.ObjectId(id);
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);

    // required
    const startDateStr = searchParams.get("startDate"); // "YYYY-MM-DD"
    const endDateStr   = searchParams.get("endDate");   // "YYYY-MM-DD" (grid ka LAST day)
    const propertyId   = searchParams.get("propertyId");

    // optional filters
    const type     = searchParams.get("type");          // "b2c" | "b2b"
    const roomId   = searchParams.get("roomId");        // specific room or "all"
    const status   = searchParams.get("status");        // "block" | "unblock"
    const blockOnly= searchParams.get("blockOnly");     // "1" to show only blocked

    if (!startDateStr || !endDateStr) {
      return NextResponse.json(
        { success: false, error: "startDate and endDate are required (YYYY-MM-DD)" },
        { status: 400 }
      );
    }
    if (!propertyId || !mongoose.Types.ObjectId.isValid(propertyId)) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing propertyId" },
        { status: 400 }
      );
    }

    const query: any = {
      property_id: oid(propertyId),
    };

    if (type) query.type = type;

    if (roomId && roomId !== "all") {
      if (!mongoose.Types.ObjectId.isValid(roomId)) {
        return NextResponse.json({ success: false, error: "Invalid roomId" }, { status: 400 });
      }
      query.room_id = oid(roomId);
    }

    // Date range (INCLUSIVE end): [start, end+1day)
    const startUTC = parseYMD_UTC(startDateStr);
    const endExclusiveUTC = addDaysUTC(parseYMD_UTC(endDateStr), 1);
    query.date = { $gte: startUTC, $lt: endExclusiveUTC };

    // status filters (optional)
    if (blockOnly === "1") {
      query.status = "block";
    } else if (status) {
      query.status = status;
    }

    const docs = await roominventoryModel
      .find(query)
      .sort({ date: 1, room_id: 1 })
      .select("-__v")
      .lean()
      .exec();

    // Normalize date -> "YYYY-MM-DD" (UTC)
    const data = docs.map((item: any) => {
      const d = item.date instanceof Date ? item.date : new Date(item.date);
      return { ...item, date: d.toISOString().slice(0, 10) };
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}
