import dbConnect from "@/lib/db";
import roomrateplanModel from "@/model/roomrateplan.model";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const { property_id, isSuperPackage } = body || {};
    if (!property_id) {
      return NextResponse.json(
        { success: false, message: "property_id is required" },
        { status: 400 }
      );
    }

    // property-wide single Super Package
    if (isSuperPackage === true) {
      await roomrateplanModel.updateMany(
        { property_id, isSuperPackage: true },
        { $set: { isSuperPackage: false } }
      );
    }

    const created = await roomrateplanModel.create(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only one Super Package is allowed per property. Another plan is already marked as super.",
        },
        { status: 409 }
      );
    }
    return NextResponse.json({ success: false, error: error?.message || error }, { status: 500 });
  }
}