import express from "express";
import {
  signup,
  login,
  me,
  googleLogin,
  updatePassword,
} from "../controllers/authController.js";
import authenticate from "../middlewares/authenticate.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/password", authenticate, updatePassword);
router.get("/me", authenticate, me);

export default router;
