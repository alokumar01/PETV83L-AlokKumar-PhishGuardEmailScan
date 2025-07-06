import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    resetOtp: String,
    resetOtpExpiry: Date,
  },
  { timestamps: true }
);

// Avoid model overwrite error in dev:
export default mongoose.models.User || mongoose.model("User", UserSchema);
