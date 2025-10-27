import dbConnect from "@/lib/db";
import listpropertyModel from "@/model/listproperty.model";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();

        const listProperty = await listpropertyModel.create(body);

        return NextResponse.json({ success: true, data: listProperty }, { status: 201 });
    } catch (error: any) {
        console.error(error);

        return NextResponse.json(
            { success: false, error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
