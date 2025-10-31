import dbConnect from "@/lib/db";
import propertyModel from "@/model/property.model";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ success: false, error: "Email required" }, { status: 400 });
    }

    const property = await propertyModel.findOne({ email });

    if (!property) {
      return NextResponse.json({ success: false, error: "No property found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: property });
  } catch (error: any) {
    console.error("Fetch Property Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
