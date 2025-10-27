import mongoose from "mongoose";

const bedTypeSchema = new mongoose.Schema(
  {
     title: {
      type: String,
      required: true,
      unique:true,
      lowercase:true
    },
    size: {
       type: String,
      required: true,
      unique:true,
      lowercase:true
    },
    status:{
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    }
  },
  { timestamps: true }
);

export default mongoose.models.bedTypeMaster || mongoose.model("bedTypeMaster", bedTypeSchema);