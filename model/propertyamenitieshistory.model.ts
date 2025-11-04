import mongoose, { Schema, Document } from "mongoose";

interface AmenityItem {
  id: string;
  featured: boolean;
}

interface AmenityCategory {
  category_id: string;
  item: AmenityItem[];
}

interface AmenityChange {
  field: string;
  oldValue?: any;
  newValue?: any;
}

export interface IPropertyAmenitiesHistory extends Document {
  propertyId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  changes: AmenityChange[];
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const amenityItemSchema = new Schema<AmenityItem>(
  {
    id: { type: String, required: true },
    featured: { type: Boolean, default: false },
  },
  { _id: false }
);

const amenityCategorySchema = new Schema<AmenityCategory>(
  {
    category_id: { type: String, required: true },
    item: { type: [amenityItemSchema], default: [] },
  },
  { _id: false }
);

const changeSchema = new Schema<AmenityChange>(
  {
    field: { type: String, default: "property_amenities" },
    oldValue: { type: [amenityCategorySchema], default: [] },
    newValue: { type: [amenityCategorySchema], default: [] },
  },
  { _id: false }
);

const propertyAmenitiesHistorySchema = new Schema<IPropertyAmenitiesHistory>(
  {
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    changes: { type: [changeSchema], default: [] },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.models.PropertyAmenitiesHistory ||
  mongoose.model<IPropertyAmenitiesHistory>(
    "PropertyAmenitiesHistory",
    propertyAmenitiesHistorySchema
  );
