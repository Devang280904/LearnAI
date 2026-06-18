import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import QuizResult from "../models/QuizResult.js";
import ChatHistory from "../models/ChatHistory.js";
import extractTextFromPDF from "../utils/pdfExtractor.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// POST /api/documents/upload
export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF file.",
      });
    }

    const { originalname, filename, size, path: filePath } = req.file;

    let extractedText = "";
    try {
      extractedText = await extractTextFromPDF(filePath);
    } catch (extractError) {
      // Clean up uploaded file if text extraction fails
      fs.unlinkSync(filePath);
      return res.status(422).json({
        success: false,
        message: `Could not extract text from PDF: ${extractError.message}`,
      });
    }

    const title = req.body.title || originalname.replace(/\.pdf$/i, "");

    const document = await Document.create({
      title,
      filename,
      filesize: size,
      pdfUrl: `/uploads/${filename}`,
      extractedText,
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Document uploaded successfully.",
      data: {
        id: document._id,
        title: document.title,
        filename: document.filename,
        filesize: document.filesize,
        pdfUrl: document.pdfUrl,
        createdAt: document.createdAt,
        textLength: extractedText.length,
      },
    });
  } catch (error) {
    // Clean up file on error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error("Failed to clean up uploaded file:", unlinkError.message);
      }
    }
    next(error);
  }
};

// GET /api/documents
export const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ user: req.user._id })
      .select("-extractedText")
      .sort({ createdAt: -1 });

    const populatedDocs = await Promise.all(
      documents.map(async (doc) => {
        const [flashcardCount, quizCount] = await Promise.all([
          Flashcard.countDocuments({ document: doc._id }),
          Quiz.countDocuments({ document: doc._id }),
        ]);
        return {
          ...doc.toObject(),
          flashcardCount,
          quizCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: populatedDocs.length,
      data: populatedDocs,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/documents/:id
export const getDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/documents/:id
export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found.",
      });
    }

    // Delete the physical file
    const filePath = path.join(__dirname, "..", "uploads", document.filename);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fileError) {
      console.error("Failed to delete file:", fileError.message);
    }

    // Delete all related data
    await Promise.all([
      Flashcard.deleteMany({ document: document._id }),
      Quiz.deleteMany({ document: document._id }),
      QuizResult.deleteMany({
        quiz: {
          $in: await Quiz.find({ document: document._id }).distinct("_id"),
        },
      }),
      ChatHistory.deleteMany({ document: document._id }),
    ]);

    await Document.findByIdAndDelete(document._id);

    res.status(200).json({
      success: true,
      message: "Document and all related data deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
