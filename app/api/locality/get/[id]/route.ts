import dbConnect from "@/lib/db";
import localityModel from "@/model/locality.model";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: any) {
    const { id } = params
    try {
        await dbConnect();
        const newCity = await localityModel.findById(id)
        return NextResponse.json({ status: true, data: newCity });
    } catch (error: any) {
        return NextResponse.json({ status: false, error: error.message }, { status: 500 });
    }
}