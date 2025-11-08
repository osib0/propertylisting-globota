
import mongoose, { Schema } from "mongoose";

const planSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active", 
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Plan ||
  mongoose.model("Plan", planSchema);

