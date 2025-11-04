import mongoose, { Schema } from "mongoose";

const nearbyCitySchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
  },
  { timestamps: true }
);

export default mongoose.models.NearbyCity || mongoose.model("NearbyCity", nearbyCitySchema);
