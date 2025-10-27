import UserModel from "@/model/user.model";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";


export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const { otp, id } = body;

    const user = await UserModel.findOne({ _id: id });

    if (user) {
      if (Number(user.otp) === Number(otp)) {
        const userdata = await UserModel.findByIdAndUpdate(
          id,
          { mobile_verify: true },
          { strict: false }
        );

        if (user.email && user.first_name && user.last_name) {
          // @ts-expect-error
          return NextResponse.json({ status: true, register: true, vaild_access: true, data: { id: userdata._id, email: userdata.email, first_name: userdata.first_name, last_name: userdata.last_name, phone: userdata.phone } });
        } else {
          return NextResponse.json({ status: true, register: false, vaild_access: true });
        }
      } else {
        return NextResponse.json({ status: false, msg: "OTP Not Match!", vaild_access: true });
      }
    } else {
      return NextResponse.json({ status: false, msg: "User Not Found!", vaild_access: false });
    }



  } catch (error: any) {
    console.error("POST /api/user/add error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error.message || error,
      },
      { status: 500 }
    );
  }
}
