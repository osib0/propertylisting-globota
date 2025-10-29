import dbConnect from "@/lib/db";
import roomratesModel from "@/model/roomrates.model";
import propertyModel from "@/model/property.model";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

interface Rate {
  type: string;
  property_id: string;
  room_id: string;
  rateplan_id: string;
  date: string;
  base_rate: number;
  extra_rate: number;
  paid_child_rate: number;
  extra_adult_charge: number;
}

interface RequestBody {
  rates: Rate[];
}

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body: RequestBody = await req.json();
    const { rates } = body;

    if (!Array.isArray(rates) || rates.length === 0) {
      return NextResponse.json(
        { success: false, error: "Rates data is required." },
        { status: 400 }
      );
    }

    // <-- 2. NEW: Property se boost_rate fetch karein (sirf ek baar)
    const propertyId = rates[0].property_id;
    const property = await propertyModel.findById(propertyId).select('boost_rate').lean() as { boost_rate?: number } | null;
    const boostRatePercentage = property?.boost_rate ?? 0;


    const bulkOperations = rates.map((item) => {
      // <-- 3. NEW: Boosted values calculate karein
      const calculateBoost = (rate: number) => {
        if (!rate || rate <= 0) return 0;
        return rate + (rate * (boostRatePercentage / 100));
      };

      const base_rate_boost = calculateBoost(item.base_rate);
      const extra_rate_boost = calculateBoost(item.extra_rate);
      const paid_child_rate_boost = calculateBoost(item.paid_child_rate);
      const extra_adult_charge_boost = calculateBoost(item.extra_adult_charge);

      return {
        updateOne: {
          filter: {
            room_id: new mongoose.Types.ObjectId(item.room_id),
            rateplan_id: new mongoose.Types.ObjectId(item.rateplan_id),
            property_id: new mongoose.Types.ObjectId(item.property_id),
            date: new Date(item.date),
            type: item.type,
          },
          // <-- 4. MODIFIED: Calculated values ko $set mein add karein
          update: {
            $set: {
              base_rate: item.base_rate || 0,
              extra_rate: item.extra_rate || 0,
              paid_child_rate: item.paid_child_rate || 0,
              extra_adult_charge: item.extra_adult_charge || 0,
              base_rate_boost,
              extra_rate_boost,
              paid_child_rate_boost,
              extra_adult_charge_boost,
              updatedAt: new Date(),
            },
          },
          upsert: true,
        },
      };
    });

    await roomratesModel.bulkWrite(bulkOperations);

    const updatedDocs = await roomratesModel.find({
      property_id: new mongoose.Types.ObjectId(propertyId),
      date: { $gte: new Date(rates[0].date) }
    }).lean();

    return NextResponse.json(
      { success: true, data: updatedDocs },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error saving room rates:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}