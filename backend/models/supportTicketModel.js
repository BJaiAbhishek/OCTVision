import mongoose from "mongoose";

const supportTicketSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    category: { type: String, enum: ["website", "result"], required: true },
    subject: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, trim: true, maxlength: 4000 },
    diagnosisId: { type: mongoose.Schema.Types.ObjectId, ref: "Diagnosis" },
    status: { type: String, enum: ["open", "closed"], default: "open" },
  },
  { timestamps: true },
);

export const SupportTicket = mongoose.model("SupportTicket", supportTicketSchema);
