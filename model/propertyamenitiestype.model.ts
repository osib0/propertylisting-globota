import mongoose, { Schema } from "mongoose";

const propertyTypeSchema = new Schema(
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

export default mongoose.models.PropertyAmenitiesType || mongoose.model("PropertyAmenitiesType", propertyTypeSchema);
