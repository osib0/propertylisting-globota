
import mongoose from 'mongoose';

const RoomInventorySchema = new mongoose.Schema({
  type:{
      type:String,
      required: true,
  },
  room_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
  },
  property_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  available_rooms: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['block', 'unblock'],
    default: 'unblock',
  },
}, {
  timestamps: true,
});

export default mongoose.models.RoomInventory || mongoose.model('RoomInventory', RoomInventorySchema);