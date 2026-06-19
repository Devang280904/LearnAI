import Document from "../models/Document.js";
import ChatHistory from "../models/ChatHistory.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import {
  chatWithDocument,
  generateSummary,
  explainTopic,
  generateFlashcards,
  generateQuiz,
} from "../services/aiService.js";

// POST /api/ai/chat
export const chat = async (req, res, next) => {
  try {
    const { documentId, question } = req.body;

    if (!documentId || !question) {
      return res.status(400).json({
        success: false,
        message: "Please provide documentId and question.",
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      user: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found.",
      });
    }

    if (!document.extractedText) {
      return res.status(422).json({
        success: false,
        message: "No text content available for this document.",
      });
    }

    const answer = await chatWithDocument(document.extractedText, question);

    await ChatHistory.create({
      question,
      answer,
      document: document._id,
      user: req.user._id,
    });

    res.status(200).json({
      success: true,
      data: {
        question,
        answer,
        documentId: document._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/ai/summary
export const summary = async (req, res, next) => {
  try {
    const { documentId } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        message: "Please provide documentId.",
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      user: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found.",
      });
    }

    if (!document.extractedText) {
      return res.status(422).json({
        success: false,
        message: "No text content available for this document.",
      });
    }

    const summaryData = await generateSummary(document.extractedText);

    res.status(200).json({
      success: true,
      data: summaryData,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/ai/explain
export const explain = async (req, res, next) => {
  try {
    const { topic, documentId } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: "Please provide a topic to explain.",
      });
    }

    let documentText = null;

    if (documentId) {
      const document = await Document.findOne({
        _id: documentId,
        user: req.user._id,
      });

      if (!document) {
        return res.status(404).json({
          success: false,
          message: "Document not found.",
        });
      }

      documentText = document.extractedText;
    }

    const explanation = await explainTopic(topic, documentText);

    res.status(200).json({
      success: true,
      data: explanation,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/ai/flashcards
export const flashcards = async (req, res, next) => {
  try {
    const { documentId } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        message: "Please provide documentId.",
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      user: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found.",
      });
    }

    if (!document.extractedText) {
      return res.status(422).json({
        success: false,
        message: "No text content available for this document.",
      });
    }

    const flashcardData = await generateFlashcards(document.extractedText);

    // Save flashcards to database
    const savedFlashcards = await Flashcard.insertMany(
      flashcardData.map((card) => ({
        question: card.question,
        answer: card.answer,
        difficulty: card.difficulty || "medium",
        document: document._id,
        user: req.user._id,
      }))
    );

    res.status(201).json({
      success: true,
      message: `${savedFlashcards.length} flashcards generated and saved.`,
      data: savedFlashcards,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/ai/quiz
export const quiz = async (req, res, next) => {
  try {
    const { documentId, count } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        message: "Please provide documentId.",
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      user: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found.",
      });
    }

    if (!document.extractedText) {
      return res.status(422).json({
        success: false,
        message: "No text content available for this document.",
      });
    }

    const questionCount = count || 5;
    const quizQuestions = await generateQuiz(
      document.extractedText,
      questionCount
    );

    const savedQuiz = await Quiz.create({
      title: `Quiz: ${document.title}`,
      questions: quizQuestions,
      document: document._id,
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: `Quiz with ${savedQuiz.questions.length} questions generated.`,
      data: savedQuiz,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/ai/history/:documentId
export const getChatHistory = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findOne({
      _id: documentId,
      user: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found.",
      });
    }

    const history = await ChatHistory.find({
      document: documentId,
      user: req.user._id,
    }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};
