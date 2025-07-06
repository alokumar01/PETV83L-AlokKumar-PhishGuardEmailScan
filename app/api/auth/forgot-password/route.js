import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { Resend } from "resend";

export async function POST(req) {
  try {
    await connectDB();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // ✅ Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP and expiry (recommended)
    user.resetOtp = otp;
    user.resetOtpExpiry = Date.now() + 10 * 60 * 1000; // expires in 10 mins
    await user.save();

    // ✅ Send email using Resend
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
      from: 'support@mail.whoisalok.tech', // your verified Resend domain
      to: email,
      subject: 'Your PhishGuard Password Reset Code',
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background: linear-gradient(90deg, #3b82f6, #6366f1); padding: 20px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 24px;">PhishGuard by Alok</h1>
          </div>
          <div style="padding: 30px; color: #333333;">
            <p style="font-size: 16px;">Hi there,</p>
            <p style="font-size: 16px; margin-top: 10px;">
              You recently requested to reset your password. Please use the following code to complete the process:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="display: inline-block; background: #f3f4f6; color: #111827; font-weight: bold; font-size: 28px; letter-spacing: 4px; padding: 14px 28px; border-radius: 6px; border: 1px solid #d1d5db;">
                ${otp}
              </span>
            </div>
            <p style="font-size: 16px; color: #6b7280;">
              ⚠️ This code will expire in <strong>10 minutes</strong>. If you didn’t request a password reset, you can safely ignore this email.
            </p>
            <p style="margin-top: 30px; font-size: 14px; color: #9ca3af;">
              Thanks,<br/>
              The PhishGuard Team
            </p>
          </div>
          <div style="background: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
            © ${new Date().getFullYear()} PhishGuard by Alok. All rights reserved.
          </div>
        </div>
      `
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ message: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
