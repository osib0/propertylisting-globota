import mongoose, { Schema } from "mongoose";

const propertySchema = new Schema(
  {
    type: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
    },
  },
  { timestamps: true }
);

export default mongoose.models.PropertyType ||
  mongoose.model("PropertyType", propertySchema);
