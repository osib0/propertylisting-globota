import dbConnect from "@/lib/db";
import planModel from "@/model/plan.model";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: any) {
    
  const { id } = params;
  try {
    await dbConnect();

    const properties = await planModel.findById(id);

    return NextResponse.json({
      status: true,
      data: properties,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: false,
        error: error.message || "Failed to fetch properties",
      },
      { status: 500 }
    );
  }
}
