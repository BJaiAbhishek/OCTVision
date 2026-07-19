import express from "express";
import authenticate from "../middlewares/authenticate.js";
import { createSupportTicket } from "../controllers/supportController.js";

const router = express.Router();

router.use(authenticate);
router.post("/", createSupportTicket);

export default router;
