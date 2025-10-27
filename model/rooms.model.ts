import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    room_name: { type: String, required: true },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    files: [
      {
        url: { type: String },
      },
    ],
  },
  {
    timestamps: true

  });





export default mongoose.models.Room || mongoose.model("Room", roomSchema);
