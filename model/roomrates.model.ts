import mongoose, {  Model, Document } from "mongoose";
import "@/model/property.model";
import "@/model/rooms.model";
import "@/model/roomrateplan.model";
interface IRoomRate extends Document {
  type: string;
  property_id: mongoose.Types.ObjectId;
  room_id: mongoose.Types.ObjectId;
  rateplan_id: mongoose.Types.ObjectId;
  date: Date;
  base_rate: number;
  base_rate_boost: number;
  extra_rate: number;
  extra_rate_boost: number;
  paid_child_rate: number;
  paid_child_rate_boost: number;
  extra_adult_charge: number;
  extra_adult_charge_boost: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const RoomRatesSchema = new mongoose.Schema<IRoomRate>(
  {
    type: {
      type: String,
      required: true,
    },
     property_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    room_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    rateplan_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RoomRatePlan",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    base_rate: {
      type: Number,
      default: 0,
    },
    base_rate_boost: {
      type: Number,
      default: 0,
    },
    extra_rate: {
      type: Number,
      default: 0,
    },
    extra_rate_boost: {
      type: Number,
      default: 0,
    },
    paid_child_rate: {
      type: Number,
      default: 0,
    },
    paid_child_rate_boost: {
      type: Number,
      default: 0,
    },
    extra_adult_charge: {
      type: Number,
      default: 0,
    },
    extra_adult_charge_boost: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const roomratesModel: Model<IRoomRate> =
  mongoose.models.RoomRates || mongoose.model<IRoomRate>("RoomRates", RoomRatesSchema);

export default roomratesModel;