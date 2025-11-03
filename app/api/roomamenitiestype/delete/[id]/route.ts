import dbConnect from "@/lib/db";
import roomamenitiestypeModel from "@/model/roomamenitiestype.model";
import { NextResponse } from "next/server";


export async function DELETE(_: Request, { params }: any) {

    const {id}  =  params
  try {
    await dbConnect();
    const deletedCity = await roomamenitiestypeModel.findByIdAndDelete(id);
    if (!deletedCity) {
      return NextResponse.json({ status: false, error: "City not found" }, { status: 404 });
    }
    return NextResponse.json({ status: true, message: "City deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ status: false, error: error.message }, { status: 500 });
  }
}