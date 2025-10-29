import mongoose, { Schema } from "mongoose";

const mealOrActivityItemSchema = new Schema(
  {
    itemsId: {
      type: mongoose.Types.ObjectId,
      ref: "ItemsMaster",
      required: true,
    },
    title: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const roomRatePlanSchema = new Schema(
  {
    property_id: {
      type: mongoose.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },
    rateplan_name: {
      type: String,
      required: true,
      trim: true,
    },
    roomId: {
      type: mongoose.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },

    // ⬇️ NOW OPTIONAL (can be blank)
    mealplan_name: {
      type: String,
      trim: true,
      default: "", // allow blank
    },
    mealplan: {
      type: [mealOrActivityItemSchema],
      default: [], // allow empty
    },

    // ⬇️ NOW OPTIONAL (can be blank)
    activities_name: {
      type: String,
      trim: true,
      default: "", // allow blank
    },
    activities: {
      type: [mealOrActivityItemSchema],
      default: [], // allow empty
    },

    cancellation_policy: {
      type: String,
      enum: ["free_cancellation", "non_refundable"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      required: true,
      index: true,
    },

    // Property-wide Super Package flag
    isSuperPackage: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// UNIQUE across the whole PROPERTY (not per room) when isSuperPackage === true
roomRatePlanSchema.index(
  { property_id: 1, isSuperPackage: 1 },
  { unique: true, partialFilterExpression: { isSuperPackage: true } }
);

export default mongoose.models.RoomRatePlan ||
  mongoose.model("RoomRatePlan", roomRatePlanSchema);
