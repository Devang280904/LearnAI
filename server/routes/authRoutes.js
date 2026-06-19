import express from "express";
import {
  register,
  login,
  getProfile,
  updatePassword,
  forgotPassword,
  verifyOTP,
  resetPassword,
} from "../controllers/authController.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);
router.get("/profile", auth, getProfile);
router.put("/password", auth, updatePassword);

export default router;
