import dbConnect from "@/lib/db";
import { uploadToPublic } from "@/lib/s3";
import localityModel from "@/model/locality.model";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: any) {
  try {
    const { id } = params;
    await dbConnect();
    const formData = await req.formData();

    const title = formData.get("title") as string;
    const subtitle = formData.get("subtitle") as string;
    const status = formData.get("status") as string;
    const file = formData.get("photo") as File | null;

    // ✅ Get array of site_seen[]
    const siteSeenRaw = formData.getAll("site_seen[]");
    const site_seen = siteSeenRaw.filter(Boolean).map((v) => v.toString());

    const value: {
      title: string;
      subtitle: string;
      status: string;
      photo?: string;
      site_seen?: string[];
    } = {
      title,
      subtitle,
      status,
      site_seen,
    };

    if (file && file.size > 0) {
      if (file.size > 20 * 1024 * 1024) {
        return NextResponse.json({ error: "File must be less than 20MB" }, { status: 400 });
      }

      if (!["image/jpeg", "image/png", "image/gif", "image/svg+xml", "image/webp","image/jpg"].includes(file.type)) {
        return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const randomNum = Math.floor(Math.random() * 10000);
      const timestamp = Date.now();
      const fileExtension = file.name.split(".").pop() || "jpg";
      const filename = `locality/${timestamp}-${randomNum}.${fileExtension}`;
      const uploadResult = await uploadToPublic(buffer, filename, file.type);

      value.photo = uploadResult.Location;
    }

    const updatedCity = await localityModel.findByIdAndUpdate(id, value, {
      new: true,
      runValidators: true,
    });

    if (!updatedCity) {
      return NextResponse.json({ status: false, error: "City not found" }, { status: 404 });
    }

    return NextResponse.json({ status: true, data: updatedCity });
  } catch (error: any) {
    return NextResponse.json({ status: false, error: error.message }, { status: 500 });
  }
}
