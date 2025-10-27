import mongoose, { Schema, model, models } from 'mongoose';


const RoomAmenitiesSchema = new Schema({
  title: {
    type: String,
    required:true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  parentCategory:{
    type:mongoose.Types.ObjectId,
    require:true,
    ref:'RoomamenitiesType'
  },
  photo: {
    type: String,
    
    trim: true,
  },
}, {
  timestamps: true,
});

export default models.RoomAmenities || model('RoomAmenities', RoomAmenitiesSchema);
