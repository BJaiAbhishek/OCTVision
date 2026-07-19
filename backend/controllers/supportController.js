import mongoose from "mongoose";
import { SupportTicket } from "../models/supportTicketModel.js";
import { Diagnosis } from "../models/diagnosisModel.js";

export async function createSupportTicket(req, res) {
  try {
    const { category, subject, description, diagnosisId } = req.body;
    if (!['website', 'result'].includes(category) || !subject?.trim() || !description?.trim()) {
      return res.status(400).json({ error: "Category, subject, and a description are required" });
    }

    if (diagnosisId) {
      if (!mongoose.isValidObjectId(diagnosisId)) return res.status(400).json({ error: "Invalid OCT report reference" });
      const diagnosis = await Diagnosis.exists({ _id: diagnosisId, userId: req.user.id });
      if (!diagnosis) return res.status(404).json({ error: "OCT report not found" });
    }

    const ticket = await SupportTicket.create({ userId: req.user.id, category, subject, description, diagnosisId: diagnosisId || undefined });
    return res.status(201).json({ id: ticket._id, status: ticket.status });
  } catch (error) {
    console.error("Create support ticket error:", error);
    return res.status(500).json({ error: "Unable to submit the support request" });
  }
}
