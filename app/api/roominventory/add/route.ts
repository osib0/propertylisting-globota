import dbConnect from "@/lib/db";
import roominventoryModel from "@/model/roominventory.model";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { inventory } = body;

    if (!Array.isArray(inventory) || inventory.length === 0) {
      return NextResponse.json(
        { success: false, error: "Inventory array is required and cannot be empty" },
        { status: 400 }
      );
    }

    // Prepare bulk operations for upsert
    const bulkOperations = inventory.map((item) => ({
      updateOne: {
        filter: {
          room_id: item.room_id,
          property_id: item.property_id,
          date: item.date, 
          type: item.type,
        },
        update: {
          $set: {
            available_rooms: item.available_rooms,
            status: item.status,
            updatedAt: new Date(), 
          }
        },
        upsert: true, // Creates a new document if no match is found
      },
    }));

    // Execute bulk write
    const result = await roominventoryModel.bulkWrite(bulkOperations);

    // Fetch the updated/inserted documents to return
    const updatedInventory = await roominventoryModel
      .find({
        room_id: { $in: inventory.map((item) => item.room_id) },
        property_id: { $in: inventory.map((item) => item.property_id) },
        date: { $in: inventory.map((item) => item.date) },
      })
      .lean();

    return NextResponse.json({ success: true, data: updatedInventory });
  } catch (error) {
    console.error("Error in inventory update/create:", error);
    return NextResponse.json({ success: false, error: "Failed to create or update inventory" }, { status: 500 });
  }
}