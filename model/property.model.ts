import mongoose, { Schema } from "mongoose";

const propertySchema = new Schema(
  {
    property_id: {
      type: String,
      required: true,
    },
    property_name: {
      type: String,
      required: true,
    },
    display_name: { type: String },


    email: {
      type: String,
      required: true,
      unique: true,
    },

    phone: {
      type: Number,
      require: true,
    },
    property_type: {
      type: String,
    },

    landline_number: Number,
    property_status: {
      type: String,
      enum: ["1", "2", "3"],
      default: "1",
    },
    listing_status: {
      type: String,
      enum: ["1", "2"],
      default: "2",
    },
    star_rating: { type: String },
    property_build: { type: String },
    accepting_booking_since: { type: String },
    booking_status: { type: String, enum: ["1", "2"], default: "1" }, // 1 = active
    city: { type: String },
    landmark: { type: String },
    address: { type: String },
    pincode: { type: String },
    lat: { type: String },
    lng: { type: String },
    distance_from: [
      { city: { type: String }, distance: { type: String }, isEditing: { type: Boolean, default: false } }
    ],
      
    property_amenities: [
      {
        _id: false,
        category_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "PropertyAmenitiesType",
        },
        item: [
          {
            _id: false, // Disable auto-generated _id for items
            id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "PropertyAmenities",
            },
            featured: { type: Boolean, default: false },
          },
        ],
      },
    ],
    locality: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Locality",
      index: true,
    },
    
     description: {
      type: String,
      trim: true,
    },

    boost_rate: {
      type: Number,
      default: 25,
    },
  },
  { timestamps: true }
);


export default mongoose.models.Property ||
  mongoose.model("Property", propertySchema);
