import express from "express";
import { getOverview } from "../controllers/dashboardController.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.get("/overview", auth, getOverview);

export default router;
