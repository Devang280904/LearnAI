import express from "express";
import {
  uploadDocument,
  getDocuments,
  getDocument,
  deleteDocument,
} from "../controllers/documentController.js";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.post("/upload", auth, upload.single("document"), uploadDocument);
router.get("/", auth, getDocuments);
router.get("/:id", auth, getDocument);
router.delete("/:id", auth, deleteDocument);

export default router;
