import dbConnect from "@/lib/db";
import listpropertyModel from "@/model/listproperty.model";
import propertyModel from "@/model/property.model";
import roomModel from "@/model/rooms.model";
import propertyPhotoModel from "@/model/propertyPhotos.model";
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

    // 🔹 Get property from temp table
    const listProp = await listpropertyModel.findOne({ ownerId });
    if (!listProp) {
      return NextResponse.json(
        { success: false, error: "Property not found" },
        { status: 404 }
      );
    }

    // 🔹 Prepare data for main property collection
    const propertyData = {
      property_id: listProp._id.toString(),
      property_name: listProp.property_detail?.propertyTitle || "",
      display_name: listProp.property_detail?.propertyTitle || "",
      email: listProp.property_detail?.email || "",
      phone: listProp.owner_details?.ownerPhone || "",
      property_type: listProp.property_detail?.propertyType || "",
      property_build: listProp.property_detail?.propertyBuildYear || "",
      accepting_booking_since: listProp.property_detail?.bookingSinceYear || "",
      description: listProp.property_detail?.description || "",
      city: listProp.location?.city || "",
      landmark: listProp.location?.landmark || "",
      address:
        `${listProp.location?.addressLine1 || ""}, ${listProp.location?.addressLine2 || ""}`.trim(),
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

    // 🔹 Save to main Property collection
    const newProperty = await propertyModel.create(propertyData);

    // 🔹 Save room details
    if (Array.isArray(listProp.room_detail) && listProp.room_detail.length > 0) {
      const roomsToInsert = listProp.room_detail.map((room: any) => ({
        room_name: room.roomName || "",
        propertyId: newProperty._id,
        description: room.description || "",
        room_area: "",
        unit: "sqft",
        room_quantity: room.numRooms || 1,
        room_type: room.roomType || "",
        room_view: room.roomView || "",
        bedTypes: listProp.sleepingArrangement?.bedTypes || [],
        alternateBed: listProp.sleepingArrangement?.alternateBed || "no",
        extraBed: listProp.sleepingArrangement?.extraBed || "no",
        occupancy:
          listProp.sleepingArrangement?.occupancy || {
            baseAdults: 2,
            maxAdults: 3,
            maxChildren: 2,
            maxOccupancy: 4,
          },
        bathroomCount: room.numBathrooms || 1,
        room_amenities:
          listProp.room_amenities?.amenities?.map((item: any) => ({
            category_id: item._id || null,
            item: [
              {
                id: item._id || null,
                featured: item.value === "yes",
              },
            ],
          })) || [],
        files:
          listProp.room_photos?.find((rp: any) => rp.category === room.roomName)
            ?.photos || [],
      }));

      await roomModel.insertMany(roomsToInsert);
    }

    // 🔹 Save property photos (safe handling)
    const photoData: any[] = [];
    const propPhotos = listProp.property_photos || {};

    for (const [category, photos] of Object.entries(propPhotos)) {
      if (Array.isArray(photos) && photos.length > 0) {
        photos.forEach((photo: any, index: number) => {
          photoData.push({
            photo_name: typeof photo === "string" ? photo : JSON.stringify(photo),
            property_id: newProperty._id,
            photo_sort_id: index + 1,
            photo_tag: [category],
          });
        });
      }
    }

    if (photoData.length > 0) {
      await propertyPhotoModel.insertMany(photoData);
    }

    // 🔹 Mark approved
    await listpropertyModel.updateOne(
      { ownerId },
      { $set: { approved: true } }
    );

    return NextResponse.json({
      success: true,
      message: "✅ Property approved & moved successfully",
      data: newProperty,
    });
  } catch (error: any) {
    console.error("Error approving property:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
