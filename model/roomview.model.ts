import mongoose, { Schema } from "mongoose";

const roomViewSchema = new Schema(
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

export default mongoose.models.RoomView || mongoose.model("RoomView", roomViewSchema);