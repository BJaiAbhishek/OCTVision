import mongoose from "mongoose";

const findingSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    severity: {
      type: String,
      enum: ["normal", "low", "moderate", "high"],
      default: "normal",
    },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    description: { type: String, trim: true },
  },
  { _id: false },
);

const scoreSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    confidence: { type: Number, required: true, min: 0, max: 1 },
  },
  { _id: false },
);

const diagnosisSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    imagePath: { type: String, required: true },
    result: { type: String, required: true, trim: true },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    findings: { type: [findingSchema], default: [] },
    scores: { type: [scoreSchema], default: [] },
  },
  { timestamps: true },
);

diagnosisSchema.index({ userId: 1, createdAt: -1 });

export const Diagnosis = mongoose.model("Diagnosis", diagnosisSchema);
