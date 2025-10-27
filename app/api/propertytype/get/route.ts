import dbConnect from "@/lib/db";
import propertytypeModel from "@/model/propertytype.model";
import { NextResponse } from "next/server";


export async function GET(){
    try {
        await dbConnect();
        const propertyTypes = await propertytypeModel.find();
        return NextResponse.json({success:true,data:propertyTypes});
        
    } catch (error) {
        console.error(error)
        return NextResponse.json({success:false,error})
    }
}