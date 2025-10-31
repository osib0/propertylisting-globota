import mongoose, { Schema } from "mongoose";

const localitySchema = new Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "inactive" },
    sort_id: { type: Number, required: true },
    photo: { type: String, trim: true },
    site_seen: { type: [String], default: [] },

    is_default: { type: Boolean, default: false },
  },
  { timestamps: true }
);

localitySchema.index(
  { is_default: 1 },
  { unique: true, partialFilterExpression: { is_default: true } }
);

export default mongoose.models.Locality ||
  mongoose.model("Locality", localitySchema);
