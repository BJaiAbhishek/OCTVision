import fs from "fs/promises";
import path from "path";
import { Diagnosis } from "../models/diagnosisModel.js";

const ML_SERVICE_URL = (process.env.ML_SERVICE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

function publicDiagnosis(diagnosis) {
  return {
    ...diagnosis,
    id: diagnosis._id.toString(),
  };
}

async function requestPrediction(file) {
  const contents = await fs.readFile(file.path);
  const form = new FormData();
  form.append("image", new Blob([contents], { type: file.mimetype }), file.filename);

  const response = await fetch(`${ML_SERVICE_URL}/predict`, {
    method: "POST",
    body: form,
    signal: AbortSignal.timeout(60_000),
  });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.detail || "The AI service could not analyze this image");
  }
  if (!body.result || !Number.isFinite(body.confidence)) {
    throw new Error("The AI service returned an invalid prediction");
  }
  return body;
}

export async function createDiagnosis(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: "An X-ray image is required" });
  }

  try {
    const prediction = await requestPrediction(req.file);
    const diagnosis = await Diagnosis.create({
      userId: req.user.id,
      imagePath: `/uploads/${path.basename(req.file.path)}`,
      result: prediction.result,
      confidence: prediction.confidence,
      findings: Array.isArray(prediction.findings) ? prediction.findings : [],
      scores: Array.isArray(prediction.scores) ? prediction.scores : [],
    });
    return res.status(201).json(publicDiagnosis(diagnosis.toObject()));
  } catch (error) {
    await fs.unlink(req.file.path).catch(() => {});
    console.error("Diagnosis error:", error);
    return res.status(502).json({ error: error.message || "Unable to analyze the X-ray" });
  }
}

export async function listDiagnoses(req, res) {
  try {
    const diagnoses = await Diagnosis.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
    return res.json(diagnoses.map(publicDiagnosis));
  } catch (error) {
    console.error("List diagnoses error:", error);
    return res.status(500).json({ error: "Unable to load diagnosis history" });
  }
}

export async function getDiagnosis(req, res) {
  try {
    const diagnosis = await Diagnosis.findOne({ _id: req.params.id, userId: req.user.id }).lean();
    if (!diagnosis) return res.status(404).json({ error: "Diagnosis not found" });
    return res.json(publicDiagnosis(diagnosis));
  } catch (error) {
    if (error.name === "CastError") return res.status(404).json({ error: "Diagnosis not found" });
    console.error("Get diagnosis error:", error);
    return res.status(500).json({ error: "Unable to load diagnosis" });
  }
}

export async function deleteDiagnoses(req, res) {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
  if (!ids.length || ids.some((id) => !/^[a-f\d]{24}$/i.test(id))) {
    return res.status(400).json({ error: "Select one or more valid OCT reports to delete" });
  }

  try {
    const diagnoses = await Diagnosis.find({ _id: { $in: ids }, userId: req.user.id }).select("imagePath").lean();
    await Diagnosis.deleteMany({ _id: { $in: diagnoses.map((diagnosis) => diagnosis._id) }, userId: req.user.id });
    await Promise.all(diagnoses.map((diagnosis) => fs.unlink(path.resolve("uploads", path.basename(diagnosis.imagePath))).catch(() => {})));
    return res.json({ deleted: diagnoses.length });
  } catch (error) {
    console.error("Delete diagnoses error:", error);
    return res.status(500).json({ error: "Unable to delete OCT reports" });
  }
}
