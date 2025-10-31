import dbConnect from "@/lib/db";
import UserModel from "@/model/user.model";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { status: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await UserModel.findById(id);

    if (!user) {
      return NextResponse.json(
        { status: false, error: "User not found" },
        { status: 404 }
      );
    }

    console.log("User fetched:", user);

    return NextResponse.json({
      status: true,
      data: user,
    });
  } catch (error: any) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { status: false, error: error.message || "Failed to fetch user" },
      { status: 500 }
    );
  }
}
