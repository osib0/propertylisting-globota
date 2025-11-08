

import dbConnect from "@/lib/db";
import planModel from "@/model/plan.model";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const plan = await planModel.create(body);

    return NextResponse.json({
      status: true,
      data: plan,
    });
  } catch (error: any) {
    if (error.code === 11000 && error.keyValue) {
      const duplicateField = Object.keys(error.keyValue)[0];
      return NextResponse.json(
        {
          status: false,
          error: `${duplicateField} already exists`,
        },
        { status: 400 }
      );
    }

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
