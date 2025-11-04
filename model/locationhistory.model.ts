import mongoose, { Schema, Document } from "mongoose";

interface LocationChange {
  field: string;           
  oldValue?: any;
  newValue?: any;
}

export interface ILocationHistory extends Document {
  propertyId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  changes: LocationChange[];
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const changeSchema = new Schema<LocationChange>(
  {
    field: { type: String, required: true },
    oldValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const locationHistorySchema = new Schema<ILocationHistory>(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    changes: { type: [changeSchema], default: [] },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.models.LocationHistory ||
  mongoose.model<ILocationHistory>("LocationHistory", locationHistorySchema);
