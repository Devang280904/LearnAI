import express from "express";
import {
  getFlashcards,
  getFlashcardsByDocument,
  toggleFavorite,
  deleteFlashcard,
} from "../controllers/flashcardController.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.get("/", auth, getFlashcards);
router.get("/document/:documentId", auth, getFlashcardsByDocument);
router.put("/favorite/:id", auth, toggleFavorite);
router.delete("/:id", auth, deleteFlashcard);

export default router;
