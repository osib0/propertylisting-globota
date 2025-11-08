import dbConnect from "@/lib/db";
import mealsmasterModel from "@/model/mealsmaster.model";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function DELETE(req: NextRequest, { params }: any) {
    try {
      await dbConnect();
      const { id } = params;
     
      
  
      const mealsmaster = await mealsmasterModel.findByIdAndDelete(id);
  
      if (!mealsmaster) {
        return NextResponse.json({ status: false, message: "Role not found" }, { status: 404 });
      }
  
      return NextResponse.json({ status: true, data: mealsmaster });
    } catch (error) {
      return NextResponse.json(
        { status: false, message: "Error deleting role", error: error instanceof Error ? error.message : "Something went wrong" },
        { status: 500 }
      );
    }
  }
  