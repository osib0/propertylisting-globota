import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { uploadToPublic } from "@/lib/s3";
import activitymasterModel from "@/model/activitymaster.model";


export async function POST(req: Request) {
  try {
    await dbConnect();

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const status = formData.get("status") as string;
    const file = formData.get("photo") as File | null;
    const items = formData.get("items") as string;

    let parsedItems: any[] = [];
    if (items) {
      try {
        parsedItems = JSON.parse(items);
      } catch (err) {
        return NextResponse.json({ error: "Invalid items format" }, { status: 400 });
      }
    }

    const value: any = {
      title: title,
      status: status,
      photo: "",
      items: parsedItems
    };

    // File validation + upload
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File must be less than 20MB" },
          { status: 400 }
        );
      }

      if (
        ![
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/svg+xml",
          "image/webp",
          "image/jpg"
        ].includes(file.type)
      ) {
        return NextResponse.json(
          { error: "File must be JPEG, PNG, GIF, SVG, or WebP" },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const randomNum = Math.floor(Math.random() * 10000);
      const timestamp = Date.now();
      const fileExtension = file.name.split(".").pop() || "jpg";
      const filename = `activity/${timestamp}-${randomNum}.${fileExtension}`;
      const uploadfileKey = filename;

      const uploadResult = await uploadToPublic(buffer, uploadfileKey, file.type);
      const photoUrl = uploadResult.Location;

      value.photo = photoUrl;
    }

    const activitymaster = await activitymasterModel.create(value);

    return NextResponse.json({ status: true, data: activitymaster });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ status: false, error: (error as Error).message });
  }
}
