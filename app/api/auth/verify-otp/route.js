import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectDB();
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ message: "Email and OTP are required" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user || !user.resetOtp) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    if (user.resetOtp !== otp) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    if (user.resetOtpExpiry < Date.now()) {
      return NextResponse.json({ message: "OTP expired" }, { status: 400 });
    }

    // Clear OTP and expiry to prevent reuse
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    await user.save();

    return NextResponse.json({ message: "OTP verified" });
  } catch (err) {
    console.error("Verify OTP error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
