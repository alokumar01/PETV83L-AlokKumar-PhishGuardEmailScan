import mongoose from "mongoose";

const ScanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    riskScore: Number,
    status: String,
    suspiciousUrls: [String],
    suspiciousKeywords: [String],
    emailPreview: String,
    scanDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Scan || mongoose.model("Scan", ScanSchema);
