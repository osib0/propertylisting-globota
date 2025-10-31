import dbConnect from "@/lib/db";
import propertyPhotosModel from "@/model/propertyPhotos.model";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const { property_id, photos } = body;

    if (!property_id || !Array.isArray(photos)) {
      return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
    }

    const updatePromises = photos.map((photo: any) => {
      const updateFields: any = {};

      if (typeof photo.photo_sort_id !== "undefined") {
        updateFields.photo_sort_id = photo.photo_sort_id;
      }

      if (Array.isArray(photo.photo_tag)) {
        updateFields.photo_tag = photo.photo_tag;
      }

      return propertyPhotosModel.findByIdAndUpdate(photo._id, updateFields);
    });

    await Promise.all(updatePromises);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Update error:", err);
    return NextResponse.json({ success: false, error: err.message });
  }
}
