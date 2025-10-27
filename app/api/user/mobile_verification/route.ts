// import UserModel from "@/model/user.model";
// import { NextResponse } from "next/server";
// import { GenerateOTP } from "@/lib/RandomOtp";
// import twilio from "twilio";
// import dbConnect from "@/lib/db";

// export async function POST(req: Request) {
//   try {
//     await dbConnect();

//     const body = await req.json();
//     const { phone } = body;

//     if (!phone) {
//       return NextResponse.json(
//         { success: false, error: "Phone number is required" },
//         { status: 400 }
//       );
//     }

//     const otp = GenerateOTP();
//     const otpExpires = new Date(Date.now() + 2 * 60 * 1000);

//     // Save OTP to DB
//     const user = await UserModel.findOneAndUpdate(
//       { phone },
//       {
//         $set: { phone, otp, otpExpires },
//       },
//       {
//         upsert: true,
//         new: true,
//         setDefaultsOnInsert: true,
//       }
//     );

//     // Twilio client setup
//     const client = twilio(
//       process.env.TWILIO_ACCOUNT_SID!,
//       process.env.TWILIO_AUTH_TOKEN!
//     );

//     // Send OTP via Twilio SMS
//     const message = await client.messages.create({
//       body: `Your OTP code is ${otp}. It will expire in 2 minutes.`,
//       from: process.env.TWILIO_PHONE_NUMBER,
//       to: `+91${phone}`, 
//     });

//     console.log("Twilio Message SID:", message.sid);

//     return NextResponse.json({
//       success: true,
//       data: {
//         id: user._id,
//         otpExpires: user.otpExpires,
//         phone: user.phone,
//         otp: user.otp, // production me OTP return mat karna
//         messageSid: message.sid,
//       },
//     });
//   } catch (error: any) {
//     console.error("POST /api/user/add error:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         error: "Internal server error",
//         details: error.message || error,
//       },
//       { status: 500 }
//     );
//   }
// }

import UserModel from "@/model/user.model";
import { NextResponse } from "next/server";
import { GenerateOTP } from "@/lib/RandomOtp";
import dbConnect from "@/lib/db";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Phone number is required" },
        { status: 400 }
      );
    }

    const otp = GenerateOTP();
    const otpExpires = new Date(Date.now() + 2 * 60 * 1000);
    // save or create
    const user = await UserModel.findOneAndUpdate(
      { phone },
      { $set: { phone, otp, otpExpires } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({
      success: true,
      data: {
        id: user?._id || null,
        otpExpires: user?.otpExpires || otpExpires,
        phone,
        otp,
      },
    });
  } catch (error: any) {
    console.error("POST /api/user/mobile_verification error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
