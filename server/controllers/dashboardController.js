import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import QuizResult from "../models/QuizResult.js";
import ChatHistory from "../models/ChatHistory.js";

// GET /api/dashboard/overview
export const getOverview = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [
      totalDocuments,
      totalFlashcards,
      favoriteFlashcards,
      totalQuizzes,
      quizResults,
      totalChats,
      recentDocuments,
      recentQuizResults,
    ] = await Promise.all([
      Document.countDocuments({ user: userId }),
      Flashcard.countDocuments({ user: userId }),
      Flashcard.countDocuments({ user: userId, favorite: true }),
      Quiz.countDocuments({ user: userId }),
      QuizResult.find({ user: userId }).select("score totalQuestions"),
      ChatHistory.countDocuments({ user: userId }),
      Document.find({ user: userId })
        .select("title createdAt filesize")
        .sort({ createdAt: -1 })
        .limit(5),
      QuizResult.find({ user: userId })
        .populate({
          path: "quiz",
          select: "title",
          populate: { path: "document", select: "title" },
        })
        .select("score totalQuestions timeTaken createdAt")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    // Calculate quiz statistics
    let averageScore = 0;
    let totalAttempts = quizResults.length;

    if (totalAttempts > 0) {
      const totalPercentage = quizResults.reduce((sum, result) => {
        return sum + (result.score / result.totalQuestions) * 100;
      }, 0);
      averageScore = Math.round(totalPercentage / totalAttempts);
    }

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalDocuments,
          totalFlashcards,
          favoriteFlashcards,
          totalQuizzes,
          totalQuizAttempts: totalAttempts,
          averageQuizScore: averageScore,
          totalChats,
        },
        recentDocuments,
        recentQuizResults,
      },
    });
  } catch (error) {
    next(error);
  }
};
