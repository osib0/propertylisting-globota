import { Schema, model, models, Types  } from 'mongoose';
import '@/model/propertyamenitiestype.model';

const PropertyAmenitiesSchema = new Schema({
  title: {
    type: String,
    required:true,
    trim: true,
  },
   categoryId: {
      type: Types.ObjectId,
      ref: 'PropertyAmenitiesType',
      required: true,
    },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  photo: {
    type: String,
    
    trim: true,
  },
}, {
  timestamps: true,
});

export default models.PropertyAmenities || model('PropertyAmenities', PropertyAmenitiesSchema);
