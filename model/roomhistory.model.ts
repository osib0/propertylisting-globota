import mongoose, { Schema } from "mongoose";

const roomHistorySchema = new Schema(
  {
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    changes: [
      {
        field: { type: String, required: true },
        oldValue: Schema.Types.Mixed,
        newValue: Schema.Types.Mixed,
      },
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.models.RoomHistory ||
  mongoose.model("RoomHistory", roomHistorySchema);
