import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    room_name: { type: String, required: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    description: { type: String, default: "" },
    room_area: { type: String },
    unit: { type: String, enum: ["sqft", "sqm"], default: "sqft" },
    room_quantity: { type: Number, required: true },
    room_type: { type: String },
    room_view: { type: String },
    bedTypes: [
      {
        type: { type: String, required: true },
        count: { type: Number, required: true },
      },
    ],
    alternateBed: { type: String, enum: ["yes", "no"], default: "no" },
    extraBed: { type: String, enum: ["yes", "no"], default: "no" },
    occupancy: {
      baseAdults: { type: Number, required: true },
      maxAdults: { type: Number, required: true },
      maxChildren: { type: Number, required: true },
      maxOccupancy: { type: Number, required: true },
    },
    bathroomCount: { type: Number, default: 1 },
    room_amenities: [
      {
        _id: false,
        category_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "RoomamenitiesType",
          required: true,
        },
        item: [
          {
            _id: false, 
            id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "RoomAmenities",
              required: true,
            },
            featured: { type: Boolean, default: false },
          },
        ],
      },
    ],

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
