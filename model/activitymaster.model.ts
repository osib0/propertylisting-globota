import mongoose from "mongoose";

const ActivityMasterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
     items: {
          type: [
            {
              itemsId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: "ItemMaster",
              },
              title: { type: String, required: true },
            },
          ],
          required: true,
        },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    photo: {
      type: String, 
      default: "",    },
  },
  { timestamps: true }
);

export default mongoose.models.ActivityMaster || mongoose.model("ActivityMaster", ActivityMasterSchema);
