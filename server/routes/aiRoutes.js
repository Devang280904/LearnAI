import express from "express";
import {
  chat,
  summary,
  explain,
  flashcards,
  quiz,
  getChatHistory,
} from "../controllers/aiController.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.post("/chat", auth, chat);
router.post("/summary", auth, summary);
router.post("/explain", auth, explain);
router.post("/flashcards", auth, flashcards);
router.post("/quiz", auth, quiz);
router.get("/history/:documentId", auth, getChatHistory);

export default router;
