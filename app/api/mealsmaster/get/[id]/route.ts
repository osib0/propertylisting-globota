import dbConnect from "@/lib/db";
import mealsmasterModel from "@/model/mealsmaster.model";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


export async function GET(req: NextRequest, { params }: any) {
  const { id } = params;
  try {
    await dbConnect();

    const mealsmaster = await mealsmasterModel.findById(id);


    return NextResponse.json({ status: true, data: mealsmaster });
  } catch (error) {
    return NextResponse.json(
      { status: false, message: "Error fetching role", error: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}