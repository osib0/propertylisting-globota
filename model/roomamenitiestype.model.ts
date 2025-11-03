import mongoose, { Schema } from "mongoose";

const roomamenitiestypeSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.models.RoomamenitiesType || mongoose.model("RoomamenitiesType", roomamenitiestypeSchema);
