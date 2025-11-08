// /app/api/property/delete/[id]/route.ts

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import planModel from "@/model/plan.model";

export async function DELETE(req: Request, { params }: { params:any }) {
  try {
    await dbConnect();
    const deleted = await planModel.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ status: false, error: "Property not found" });
    }
    return NextResponse.json({ status: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: false, error: "Server error" });
  }
}
