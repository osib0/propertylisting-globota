import { NextRequest, NextResponse } from "next/server";
import { uploadToPublic } from "@/lib/s3";

export async function POST(req: NextRequest) {
  try {
    // Form data directly parse
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "property_photos";

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ message: "File must be less than 20MB" }, { status: 400 });
    }

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/svg+xml", "image/webp", "application/pdf","application/octet-stream"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ message: "Invalid file type" }, { status: 400 });
    }

    // File ko buffer me convert karo
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Unique file name
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 10000);
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${folder}/${timestamp}-${randomNum}.${ext}`;

    // Upload to S3
    const uploaded = await uploadToPublic(buffer, fileName, file.type);

    return NextResponse.json({ url: uploaded.Location });
  } catch (err) {
    console.error("Upload failed", err);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}
