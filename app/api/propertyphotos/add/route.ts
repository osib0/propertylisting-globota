import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import PropertyPhoto from "@/model/propertyPhotos.model"; 

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const formData = await req.formData(); 
    const property_id = formData.get("property_id")
    const filename = formData.get("filename") as string;

    const count = await PropertyPhoto.countDocuments();
    let photo_sort_id = count + 1;

  
    const photo = await PropertyPhoto.create({
      property_id,
      photo_name: filename,
      photo_sort_id,
    });

    return NextResponse.json({ success: true, data: photo });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
  }
}
