import mongoose, { Schema } from "mongoose";

const DocumentFileSchema = new Schema(
  {
    fileName: { type: String, },
    url: { type: String, },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);



const RoomSchema = new Schema(
  {
    roomName: { type: String },
    roomType: { type: String },
    numRooms: { type: Number },
    roomView: { type: String },
    roomSize: { type: String },
    numBathrooms: { type: Number },
    description: { type: String },
  },
  { _id: false }
);

const RoomPhotoSchema = new Schema({
  category: { type: String, required: true },
  photos: [
    {
      url: { type: String },
      fileName: { type: String, default: "unknown" },
      isCover: { type: Boolean, default: false },
    },
  ],
  coverPhotoIndex: { type: Number, default: 0 },
}, { _id: false });

const BedTypeSchema = new Schema(
  {
    type: { type: String },
    count: { type: Number, default: 0 },
  },
  { _id: false }
);

const OccupancySchema = new Schema(
  {
    baseAdults: { type: Number, default: 0 },
    maxAdults: { type: Number, default: 0 },
    maxChildren: { type: Number, default: 0 },
    maxOccupancy: { type: Number, default: 0 },
  },
  { _id: false }
);

const SleepingArrangementSchema = new Schema(
  {
    bedTypes: [BedTypeSchema],
    extraBed: { type: String, enum: ["yes", "no"], default: "no" },
    alternateBed: { type: String, enum: ["yes", "no"], default: "no" },
    occupancy: OccupancySchema,
  },
  { _id: false }
);


const DocumentsSchema = new Schema(
  {
    docGST: { type: DocumentFileSchema },
    docPan: { type: DocumentFileSchema },
    docAadhar: { type: DocumentFileSchema },
    docPropertyDeed: { type: DocumentFileSchema },
    docFireSafety: { type: DocumentFileSchema },
    docNoc: { type: DocumentFileSchema },
    docOther: { type: DocumentFileSchema },
    docNotes: { type: String },
  },
  { _id: false }
);
const CategoryPhotosSchema = new Schema(
  {
    url: { type: String },
    file: { type: Schema.Types.Mixed, default: null },
  },
  { _id: false }
);



const ListSchema = new Schema(
  {
    ownerId: {
      type: String,
      required: true
    },
    property_detail: {
      propertyTitle: { type: String, },
      propertyType: { type: String, },
      propertyBuildYear: { type: String, },
      bookingSinceYear: { type: String, },
      description: { type: String, },
      email: { type: String, },
    },

    location: {
      addressLine1: String,
      addressLine2: String,
      landmark: String,
      locality: String,
      city: String,
      stateName: String,
      country: { type: String, default: "India" },
      pincode: String,
      lat: Number,
      lng: Number,
    },

    property_amenities: {
      amenities: [
        {
          title: String,
          value: { type: String, enum: ["yes", "no", null], default: null },
        }
      ]
    },
    property_photos: [{
      url: { type: String },
      file: { type: Schema.Types.Mixed, default: null },
    }],


    room_detail: [RoomSchema],
    sleepingArrangement: SleepingArrangementSchema,
    room_amenities: [
      {
        category: { type: String, required: true },
        amenities: [
          {
            title: String,
            value: { type: String, enum: ["yes", "no", null], default: null },
          },
        ],
      },
    ],


    room_photos: [RoomPhotoSchema],
    documents: DocumentsSchema,

    owner_details: {
      ownerName: String,
      ownerPhone: String,
      ownerAltPhone: String,
      ownerEmail: String,
      ownerCompany: String,
      ownerGstin: String,
      ownerWebsite: String,
    },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);


export default mongoose.models.ListProperty ||
  mongoose.model("ListProperty", ListSchema);
