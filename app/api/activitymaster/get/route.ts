import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import activitymasterModel from "@/model/activitymaster.model";


export async function GET(req: Request) {
    try {
      await dbConnect();
  
      const activity = await activitymasterModel.find()
  
      return NextResponse.json({ status: true, data: activity });
    } catch (error) {
      console.error("API Error:", error);
      return NextResponse.json({ status: false, error: (error as Error).message });
    }
  }
  