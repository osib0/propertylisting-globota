import mongoose, { Schema } from "mongoose";

const infoHistorySchema = new Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  changes: [
    {
      field: String,
      oldValue: Schema.Types.Mixed,
      newValue: Schema.Types.Mixed,
    },
  ],
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.infoHistorySchema ||
  mongoose.model("InfoHistory", infoHistorySchema);
