import express from "express";
import authenticate from "../middlewares/authenticate.js";
import { uploadXray } from "../middlewares/uploadXray.js";
import { createDiagnosis, deleteDiagnoses, getDiagnosis, listDiagnoses } from "../controllers/diagnosisController.js";

const router = express.Router();

router.use(authenticate);
router.post("/", uploadXray.single("image"), createDiagnosis);
router.get("/", listDiagnoses);
router.delete("/", deleteDiagnoses);
router.get("/:id", getDiagnosis);

export default router;
