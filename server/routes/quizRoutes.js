import express from "express";
import {
  getQuizzes,
  getQuiz,
  submitQuiz,
  getQuizResult,
  deleteQuiz,
} from "../controllers/quizController.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.get("/", auth, getQuizzes);
router.get("/:id", auth, getQuiz);
router.post("/submit", auth, submitQuiz);
router.get("/result/:id", auth, getQuizResult);
router.delete("/:id", auth, deleteQuiz);

export default router;
