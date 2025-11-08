import dbConnect from "@/lib/db";
import roomrateplanModel from "@/model/roomrateplan.model";
import { NextResponse, NextRequest } from "next/server";
import { Types } from "mongoose";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }  
) {
  const { id } = await params;
  try {
    await dbConnect();
    const body = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "rateplan id is required for update." },
        { status: 400 }
      );
    }

    // if turning this plan into Super, clear any other Super in SAME PROPERTY
    if (body?.isSuperPackage === true) {
      const current = await roomrateplanModel
        .findById(id)
        .select({ property_id: 1 })
        .lean<{ _id: Types.ObjectId; property_id: Types.ObjectId } | null>();

      if (current?.property_id) {
        await roomrateplanModel.updateMany(
          { property_id: current.property_id, isSuperPackage: true, _id: { $ne: id } },
          { $set: { isSuperPackage: false } }
        );
      }
    }

    const updatedRatePlan = await roomrateplanModel.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedRatePlan) {
      return NextResponse.json({ success: false, message: "Rateplan not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedRatePlan });
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
    return NextResponse.json({ success: false, error: error?.message || "Unknown error" }, { status: 500 });
  }
}