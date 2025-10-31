import dbConnect from "@/lib/db";
import propertyTypeModel from "@/model/propertytype.model";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function DELETE(req: NextRequest, { params }: any) {
    try {
      await dbConnect();
      const { id } = params;
     
      
  
      const deletedRole = await propertyTypeModel.findByIdAndDelete(id);
  
      if (!deletedRole) {
        return NextResponse.json({ status: false, message: "Role not found" }, { status: 404 });
      }
  
      return NextResponse.json({ status: true, data: deletedRole });
    } catch (error) {
      return NextResponse.json(
        { status: false, message: "Error deleting role", error: error instanceof Error ? error.message : "Something went wrong" },
        { status: 500 }
      );
    }
  }
  