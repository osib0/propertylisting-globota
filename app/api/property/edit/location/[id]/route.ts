import dbConnect from "@/lib/db";
import propertyModel from "@/model/property.model";
import { NextResponse } from 'next/server';

// GET: Fetch the latest location
export async function GET(req: Request, { params }: any) {
  try {
    const { id } = await params
    await dbConnect();

    const location = await propertyModel.findById(id)
    if (!location) {
      return NextResponse.json({ message: 'No location found' }, { status: 404 });
    }
    return NextResponse.json(location, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch location' }, { status: 500 });
  }
}

// POST: Save or update location
export async function POST(req: Request, { params }: any) {


  const { id } = params

  try {

    const body = await req.json();


    const { address, pincode, city, lat, lng, landmark } = body;

    // Validation
    if (!address || !pincode || !city || !lat || !lng || !landmark) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    await dbConnect();
    const update = {
      address: address,
      pincode: pincode,
      city: city,
      landmark: landmark,
      lat: lat,
      lng: lng
    };

    const existingLocation = await propertyModel.findByIdAndUpdate({ _id: id }, update);



    return NextResponse.json(existingLocation, { status: 200 });

  } catch (error) {

    return NextResponse.json({ error: 'Failed to save location' }, { status: 500 });
  }
}
