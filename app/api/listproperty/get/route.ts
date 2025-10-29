import dbConnect from "@/lib/db";
import listpropertyModel from "@/model/listproperty.model";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const ownerId = searchParams.get("ownerId");

    let query: any = {};
    if (ownerId) query.ownerId = ownerId;

    const listProperty = await listpropertyModel.find(query);

    return NextResponse.json({ success: true, data: listProperty }, { status: 200 });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
