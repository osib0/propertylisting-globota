import dbConnect from "@/lib/db";
import listpropertyModel from "@/model/listproperty.model";
import propertyModel from "@/model/property.model";
import propertyPhotoModel from "@/model/propertyPhotos.model";
import UserModel from "@/model/user.model";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const ownerId = searchParams.get("ownerId");

    if (!ownerId) {
      return NextResponse.json(
        { success: false, error: "ownerId required" },
        { status: 400 }
      );
    }

    // 🔹 Step 1: Fetch property data from listing table
    const listProp = await listpropertyModel.findOne({ ownerId });
    if (!listProp) {
      return NextResponse.json(
        { success: false, error: "Property not found in listing" },
        { status: 404 }
      );
    }

    // 🔹 Step 2: Create property record
    const propertyData = {
      property_name: listProp.property_detail?.propertyTitle || "",
      display_name: listProp.property_detail?.propertyTitle || "",
      email: listProp.property_detail?.email || "",
      phone: listProp.owner_details?.ownerPhone || "",
      landline_number: listProp.owner_details?.ownerAltPhone || "",
      property_type: listProp.property_detail?.propertyType || "",
      property_build: listProp.property_detail?.propertyBuildYear || "",
      accepting_booking_since:
        listProp.property_detail?.bookingSinceYear || "",
      description: listProp.property_detail?.description || "",
      city: listProp.location?.city || "",
      landmark: listProp.location?.landmark || "",
      address:
        `${listProp.location?.addressLine1 || ""}, ${
          listProp.location?.addressLine2 || ""
        }`.trim(),
      pincode: listProp.location?.pincode || "",
      state: listProp.location?.stateName || "",
      country: listProp.location?.country || "",
      property_amenities:
        listProp.property_amenities?.amenities?.map((item: any) => ({
          category_id: item._id || null,
          item: [
            {
              id: item._id || null,
              featured: item.value === "yes",
            },
          ],
        })) || [],
    };

    const newProperty = await propertyModel.create(propertyData);

    // 🔹 Step 3: Insert Property Photos from listing
    if (Array.isArray(listProp.property_photos) && listProp.property_photos.length > 0) {
      const propertyPhotos = listProp.property_photos.map((photo: any, index: number) => ({
        photo_name: photo.url || "", // store URL directly
        property_id: newProperty._id,
        photo_sort_id: index + 1,
        photo_tag: ["default"], 
      }));

      await propertyPhotoModel.create(propertyPhotos);
    }

    // 🔹 Step 4: Update listing and user record
    await listpropertyModel.updateOne(
      { ownerId },
      { $set: { approved: true } }
    );

    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: ownerId },
      { $set: { propertyId: newProperty._id } },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Property approved successfully with photos",
      data: {
        property: newProperty,
        photosInserted: listProp.property_photos?.length || 0,
        user: updatedUser,
      },
    });
  } catch (error: any) {
    console.error("Error approving property:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
