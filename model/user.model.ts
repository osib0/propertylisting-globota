import mongoose, { Schema, Document, Model,Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  phone: string;
  email?: string;
  otp?: string;
  otpExpires?: Date;
  mobile_verify?: boolean;
  first_name?: string;
  last_name?: string;
  password?: string;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      unique: false, 
      sparse: true,
      trim: true,
    },
    otp: String,
    otpExpires: Date,
    mobile_verify: {
      type: Boolean,
      default: false,
    },
    first_name: String,
    last_name: String,
    password: String,
  },
  { timestamps: true }
);

const Partneruser: Model<IUser> = mongoose.models.Partneruser || mongoose.model<IUser>("Partneruser", UserSchema);

export default Partneruser;
