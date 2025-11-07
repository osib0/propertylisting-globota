import dbConnect from "@/lib/db";
import RoomModel from "@/model/rooms.model";
import RoomHistoryModel from "@/model/roomhistory.model";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { propertyId, userId, newData } = await req.json();

    if (!propertyId || !userId || !newData) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // 🔹 Fetch existing room (if any)
    const existingRoom = await RoomModel.findOne({ propertyId }).lean();

    // ✅ Recursive difference finder (handles nested keys)
    function findDifferences(
      oldData: Record<string, any> = {},
      newData: Record<string, any> = {},
      parentKey = ""
    ): { field: string; oldValue: any; newValue: any }[] {
      const changes: { field: string; oldValue: any; newValue: any }[] = [];
      const allKeys = new Set([
        ...Object.keys(oldData || {}),
        ...Object.keys(newData || {}),
      ]);

      for (const key of allKeys) {
        const fullKey = parentKey ? `${parentKey}.${key}` : key;
        const oldValue = oldData?.[key];
        const newValue = newData?.[key];

        if (oldValue === undefined && newValue === undefined) continue;

        if (
          typeof oldValue === "object" &&
          typeof newValue === "object" &&
          oldValue !== null &&
          newValue !== null &&
          !Array.isArray(oldValue) &&
          !Array.isArray(newValue)
        ) {
          // Recursive call for nested fields
          const nested = findDifferences(oldValue, newValue, fullKey);
          changes.push(...nested);
          continue;
        }

        if (Array.isArray(oldValue) || Array.isArray(newValue)) {
          if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
            changes.push({ field: fullKey, oldValue, newValue });
          }
          continue;
        }

        if (oldValue !== newValue) {
          changes.push({ field: fullKey, oldValue, newValue });
        }
      }

      return changes;
    }

    // ✅ Compare
    let changes: any[] = [];

    if (existingRoom) {
      // If room exists → compare old vs new
      changes = findDifferences(existingRoom, newData);
    } else {
      // If room does not exist → flatten entire newData recursively
      const flattenNewData = (obj: Record<string, any>, parentKey = ""): any[] => {
        const allChanges: any[] = [];
        for (const key in obj) {
          const fullKey = parentKey ? `${parentKey}.${key}` : key;
          const value = obj[key];
          if (typeof value === "object" && value !== null && !Array.isArray(value)) {
            allChanges.push(...flattenNewData(value, fullKey));
          } else {
            allChanges.push({
              field: fullKey,
              oldValue: null,
              newValue: value,
            });
          }
        }
        return allChanges;
      };
      changes = flattenNewData(newData);
    }

    if (changes.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No changes detected",
      });
    }

    // ✅ Check pending record
    const existingPending = await RoomHistoryModel.findOne({
      propertyId,
      userId,
      status: "pending",
    });

    let history;
    if (existingPending) {
      existingPending.changes = changes;
      existingPending.updatedAt = new Date();
      history = await existingPending.save();

      return NextResponse.json({
        success: true,
        message: "Pending room history updated successfully.",
        data: history,
      });
    } else {
      history = await RoomHistoryModel.create({
        propertyId,
        userId,
        changes,
        status: "pending",
      });

      return NextResponse.json({
        success: true,
        message: "Room history created successfully.",
        data: history,
      });
    }
  } catch (err) {
    console.error("Error saving room history:", err);
    return NextResponse.json(
      { success: false, message: "Error saving room history" },
      { status: 500 }
    );
  }
}
