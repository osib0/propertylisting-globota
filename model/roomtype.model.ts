import mongoose, { Schema } from "mongoose";

const roomtypeSchema = new Schema(
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

export default mongoose.models.RoomType || mongoose.model("RoomType", roomtypeSchema);
