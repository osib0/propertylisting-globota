import mongoose, { Schema } from "mongoose";

const propertyPhotoSchema = new Schema(
  {
    photo_name: {
      type: String,
      required: true,
    },
    property_id: {
      type: mongoose.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    photo_sort_id: {
      type: Number,
      required: true,
    },
    photo_tag: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.models.PropertyPhoto ||
  mongoose.model("PropertyPhoto", propertyPhotoSchema);
