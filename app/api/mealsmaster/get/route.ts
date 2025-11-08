import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import mealsmasterModel from "@/model/mealsmaster.model";


export async function GET(req: Request) {
    try {
      await dbConnect();
  
      const mealsmaster = await mealsmasterModel.find()
  
      return NextResponse.json({ status: true, data: mealsmaster });
    } catch (error) {
      console.error("API Error:", error);
      return NextResponse.json({ status: false, error: (error as Error).message });
    }
  }
  