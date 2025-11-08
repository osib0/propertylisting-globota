import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { uploadToPublic } from "@/lib/s3";
import mealsmasterModel from "@/model/mealsmaster.model";

export async function PUT(req: Request, { params }: any) {
  try {
    await dbConnect();
    const id = params.id;
    const formData = await req.formData();

    const title = (formData.get("title") as string)?.trim();
    const status = (formData.get("status") as string) || "active";
    const itemsJson = formData.get("items") as string; // frontend sends JSON string
    const file = formData.get("photo") as File | null;

    // Parse items JSON
    let items: { _id: string; title: string }[] = [];
    try {
      items = JSON.parse(itemsJson);
      if (!Array.isArray(items)) throw new Error();
    } catch {
      return NextResponse.json({ status: false, message: "Invalid items format" }, { status: 400 });
    }

    // Find existing meal
    const existingMeal = await mealsmasterModel.findById(id);
    if (!existingMeal) {
      return NextResponse.json({ status: false, message: "Meal not found" }, { status: 404 });
    }

    // Validation
    if (!title || !items.length) {
      return NextResponse.json({ status: false, message: "Title and items are required" }, { status: 400 });
    }

    let photoUrl = existingMeal.photo || "";

    // Handle file upload if new file is provided
    if (file && file.size > 0) {
      if (file.size > 20 * 1024 * 1024) {
        return NextResponse.json({ status: false, message: "File must be less than 20MB" }, { status: 400 });
      }

      if (
        !["image/jpeg","image/png","image/gif","image/svg+xml","image/webp","image/jpg"].includes(file.type)
      ) {
        return NextResponse.json({ status: false, message: "Invalid image type" }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const randomNum = Math.floor(Math.random() * 10000);
      const timestamp = Date.now();
      const fileExtension = file.name.split(".").pop() || "jpg";
      const filename = `meals/${timestamp}-${randomNum}.${fileExtension}`;

      const uploadResult = await uploadToPublic(buffer, filename, file.type);
      photoUrl = uploadResult.Location;
    }

    // Update meal
    existingMeal.title = title;
    existingMeal.status = status;
    existingMeal.items = items; // now correctly as array of objects
    existingMeal.photo = photoUrl;

    await existingMeal.save();

    return NextResponse.json({ status: true, data: existingMeal });
  } catch (error) {
    console.error("Update API error:", error);
    return NextResponse.json(
      { status: false, message: (error as Error).message || "Server error" },
      { status: 500 }
    );
  }
}
