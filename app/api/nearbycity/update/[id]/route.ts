import dbConnect from "@/lib/db";
import nearbycityModel from "@/model/nearbycity.model";
import { NextResponse } from "next/server";


export async function PUT(req: Request, { params }: any) {
  const {id} = params
  try {
    await dbConnect();
    const body = await req.json();
    const updatedCity = await nearbycityModel.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!updatedCity) {
      return NextResponse.json({ status: false, error: "City not found" }, { status: 404 });
    }
    return NextResponse.json({ status: true, data: updatedCity });
  } catch (error: any) {
    return NextResponse.json({ status: false, error: error.message }, { status: 500 });
  }
}
