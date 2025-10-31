import dbConnect from "@/lib/db";
import localityModel from "@/model/locality.model";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
    }

    // unset all previous defaults
    await localityModel.updateMany({ is_default: true }, { $set: { is_default: false } });

    // set new default (no need to use doc._id in response)
    const updated = await localityModel.findByIdAndUpdate(
      id,
      { $set: { is_default: true } },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    // return the id we just set as default
    return NextResponse.json({ success: true, data: { _id: id } });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "Server error" }, { status: 500 });
  }
}
