import dbConnect from "@/lib/db";
import { uploadToPublic } from "@/lib/s3";
import localityModel from "@/model/locality.model";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const formData = await request.formData();

    const title = formData.get("title") as string;
    const subtitle = formData.get("subtitle") as string;
    const status = formData.get("status") as string;
    const file = formData.get("photo") as File | null;

    // Get multiple values from "site_seen[]"
    const siteSeenRaw = formData.getAll("site_seen[]");
    const site_seen: string[] = siteSeenRaw
      .filter((v) => typeof v === "string" && v.trim() !== "")
      .map((v) => v as string);

    const count = await localityModel.countDocuments();
    const sort_id = count + 1;

    const value: {
      title: string;
      subtitle: string;
      status: string;
      photo?: string;
      sort_id: number;
      site_seen: string[];
    } = {
      title,
      subtitle,
      status,
      sort_id,
      site_seen, // Include it here
    };

    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File must be less than 20MB" },
          { status: 400 }
        );
      }

      if (!["image/jpeg", "image/png", "image/gif", "image/svg+xml", "image/webp","image/jpg"].includes(file.type)) {
        return NextResponse.json(
          { error: "File must be JPEG, PNG, SVG, WebP or GIF" },
          { status: 400 }
        );
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

    const newCity = await localityModel.create(value);

    return NextResponse.json({ success: true, data: newCity });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
