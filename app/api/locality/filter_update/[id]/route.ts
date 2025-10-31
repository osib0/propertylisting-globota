import dbConnect from "@/lib/db"; 
import localityModel from "@/model/locality.model";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: any) {
  try {
    const { id } = params;
    await dbConnect();
    const formData = await req.formData();

    const sort_id_raw = formData.get("sort_id"); 
    const sort_id = parseInt(sort_id_raw as string, 10);

    const updated = await localityModel.findByIdAndUpdate(
      id,
      { sort_id },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json({ status: false, error: "City not found" }, { status: 404 });
    }

    return NextResponse.json({ status: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ status: false, error: error.message }, { status: 500 });
  }
}
