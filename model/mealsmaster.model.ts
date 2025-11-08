import mongoose from "mongoose";

const mealsMasterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
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
    photo: {
      type: String, 
      required: false,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    }
  },
  { timestamps: true }
);

export default mongoose.models.MealsMaster ||
  mongoose.model("MealsMaster", mealsMasterSchema);
