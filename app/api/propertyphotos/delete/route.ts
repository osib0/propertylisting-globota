import dbConnect from "@/lib/db";
import PropertyPhoto from "@/model/propertyPhotos.model";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const { photoId } = await req.json();

    if (!photoId) {
      return NextResponse.json({ success: false, error: "Photo ID missing" });
    }

    await PropertyPhoto.deleteOne({ _id: photoId });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
