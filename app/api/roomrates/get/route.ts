import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import roomratesModel from "@/model/roomrates.model";

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

    const startDateStr = searchParams.get("startDate"); // "YYYY-MM-DD"
    const endDateStr   = searchParams.get("endDate");   // "YYYY-MM-DD" (grid ka LAST day)
    const propertyId   = searchParams.get("propertyId");
    const roomId       = searchParams.get("roomId");     // optional
    const type         = searchParams.get("type");       // "b2c" | "b2b"
    const rateplanRaw  = searchParams.get("rateplan_id");// optional: "id1,id2"

    // ---- Validate requireds ----
    if (!startDateStr || !endDateStr) {
      return NextResponse.json(
        { success: false, error: "startDate and endDate are required (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    const query: any = {};

    // Cast ObjectIds if provided
    if (propertyId) {
      if (!mongoose.Types.ObjectId.isValid(propertyId)) {
        return NextResponse.json({ success: false, error: "Invalid propertyId" }, { status: 400 });
      }
      query.property_id = oid(propertyId);
    }
    if (roomId && roomId !== "all") {
      if (!mongoose.Types.ObjectId.isValid(roomId)) {
        return NextResponse.json({ success: false, error: "Invalid roomId" }, { status: 400 });
      }
      query.room_id = oid(roomId);
    }
    if (type) query.type = type;

    // Support single/multiple rateplan ids: "id1,id2,id3"
    if (rateplanRaw) {
      const ids = rateplanRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (ids.length > 0) {
        for (const id of ids) {
          if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, error: `Invalid rateplan_id: ${id}` }, { status: 400 });
          }
        }
        query.rateplan_id = ids.length === 1 ? oid(ids[0]) : { $in: ids.map(oid) };
      }
    }

    // ---- Date range (INCLUSIVE end) ----
    // Grid me jo LAST day dikh raha (e.g., Saturday), usko include karne ke liye:
    // [start, end+1day) pe query karte hain.
    const startUTC = parseYMD_UTC(startDateStr);
    const endExclusiveUTC = addDaysUTC(parseYMD_UTC(endDateStr), 1);

    query.date = { $gte: startUTC, $lt: endExclusiveUTC };

    const docs = await roomratesModel
      .find(query)
      .sort({ date: 1, room_id: 1, rateplan_id: 1 })
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
    console.error("Error fetching rates:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch rates" },
      { status: 500 }
    );
  }
}
