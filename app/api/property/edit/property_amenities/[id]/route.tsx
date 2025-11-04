import dbConnect from "@/lib/db";
import propertyModel from "@/model/property.model";
import mongoose from "mongoose";
import { NextResponse } from 'next/server';


export async function POST(req: Request, { params }: any) {


    const id = new mongoose.Types.ObjectId(params.id);

    try {

        const body = await req.json();


        const { amenities } = body;



        await dbConnect();
        const update = {
            property_amenities: amenities
        };

        const property_amenities = await propertyModel.findByIdAndUpdate({ _id: id }, update);



        return NextResponse.json(property_amenities, { status: 200 });

    } catch (error) {

        return NextResponse.json({ error: 'Failed to save location' }, { status: 500 });
    }
}
