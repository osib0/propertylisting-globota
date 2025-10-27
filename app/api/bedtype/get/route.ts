

import dbConnect from "@/lib/db";
import bedtypeModel from "@/model/bedtype.model";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();

    const plan = await bedtypeModel.find();

    return NextResponse.json({
      status: true,
      data: plan,
    });
  } catch (error: any) {
    // Generic fallback error
    return NextResponse.json(
      {
        status: false,
        error: error.message || "Something went wrong",
      },
      { status: 500 }
    );
  }
}
