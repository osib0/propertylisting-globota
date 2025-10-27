import UserModel from "@/model/user.model";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        await dbConnect();
        const data = await req.json();

        const user = await UserModel.findById({ _id: data.id });


        if (!user) {
            return NextResponse.json({ status: false, msg: "User Not Found" });
        }

        if (!user.mobile_verify) {
            return NextResponse.json({ status: false, msg: "Mobile Not Verified" });
        }

        const existingEmailUser = await UserModel.findOne({ email: data.email });

        if (existingEmailUser) {
            return NextResponse.json({ status: false, msg: "Email Already in Use" });
        }
        // Hash password if it's present

        data.password = await bcrypt.hash(data.password, 10);


        // Update allowed fields only
        const updatedFields = {
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            password: await bcrypt.hash(data.password, 10),
            otp: null,
            otpExpires: null
        };


        const datauser = await UserModel.findByIdAndUpdate({ _id: data.id }, updatedFields, {
            new: true,
            runValidators: true,
        });

        return NextResponse.json({ status: true, msg: "User updated successfully", data: datauser });

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
