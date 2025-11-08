import dbConnect from "@/lib/db";
import planModel from "@/model/plan.model";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: any) {
    try {
      await dbConnect();
  
      const { id } = params;
      const body = await req.json();
  
      const updatedRole = await planModel.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true,
      });
  
      if (!updatedRole) {
        return NextResponse.json({ status: false, message: "Role not found" }, { status: 404 });
      }
  
      return NextResponse.json({ status: true, data: updatedRole });
    } catch (error) {
      return NextResponse.json(
        { status: false, message: "Error updating role", error: error instanceof Error ? error.message : error },
        { status: 500 }
      );
    }
  }
  