


import mongoose, { Schema } from "mongoose";

const roomPhotoSchema = new Schema(
  {
    roomId: {
      type: mongoose.Types.ObjectId,
      ref:'RoomCategory',
      required: true,
    },
    photo_name: {
      type: String,
      required: true,
    },
    property_id: {
      type: mongoose.Types.ObjectId,
      ref:'Property',
      required: true,
    },
    photo_sort_id: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.RoomPhoto ||
  mongoose.model("RoomPhoto", roomPhotoSchema);
