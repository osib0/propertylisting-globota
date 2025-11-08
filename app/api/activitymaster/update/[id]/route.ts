import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { uploadToPublic } from "@/lib/s3";
import activitymasterModel from "@/model/activitymaster.model";

export async function PUT(req: Request, { params }: any) {
  try {
    await dbConnect();

    const id = params.id;
    const formData = await req.formData();

    const title = (formData.get("title") as string)?.trim();
    const status = formData.get("status") as string;
    const roomId = formData.get("roomId") as string;
    const itemsRaw = formData.get("items") as string; // JSON string
    const file = formData.get("photo") as File | null;

    if (!title) {
      return NextResponse.json({ status: false, message: "Title is required" }, { status: 400 });
    }

    if (!itemsRaw) {
      return NextResponse.json({ status: false, message: "Items are required" }, { status: 400 });
    }

    let parsedItems: { itemsId: string; title: string }[] = [];
    try {
      parsedItems = JSON.parse(itemsRaw);
      if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
        throw new Error("Items array is empty");
      }
    } catch (err) {
      return NextResponse.json({ status: false, message: "Invalid items format" }, { status: 400 });
    }

    // Find existing activity
    const existingActivity = await activitymasterModel.findById(id);
    if (!existingActivity) {
      return NextResponse.json({ status: false, message: "Activity not found" }, { status: 404 });
    }

    // Handle photo upload
    let photoUrl = existingActivity.photo || "";
    if (file && file.size > 0) {
      if (file.size > 50 * 1024 * 1024) {
        return NextResponse.json({ status: false, message: "File must be less than 50MB" }, { status: 400 });
      }

      if (
        ![
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/svg+xml",
          "image/webp",
          "image/jpg",
        ].includes(file.type)
      ) {
        return NextResponse.json({ status: false, message: "Invalid image type" }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const randomNum = Math.floor(Math.random() * 10000);
      const timestamp = Date.now();
      const fileExtension = file.name.split(".").pop() || "jpg";
      const filename = `activity/${timestamp}-${randomNum}.${fileExtension}`;

      const uploadResult = await uploadToPublic(buffer, filename, file.type);
      photoUrl = uploadResult.Location;
    }

    // Update activity
    existingActivity.title = title;
    existingActivity.status = status;
    existingActivity.roomId = roomId; // update roomId
    existingActivity.items = parsedItems;
    existingActivity.photo = photoUrl;

    await existingActivity.save();

    return NextResponse.json({ status: true, data: existingActivity });
  } catch (error) {
    console.error("Update API error:", error);
    return NextResponse.json({ status: false, message: (error as Error).message || "Server error" }, { status: 500 });
  }
}
