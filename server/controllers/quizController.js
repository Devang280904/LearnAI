import Quiz from "../models/Quiz.js";
import QuizResult from "../models/QuizResult.js";

// GET /api/quizzes
export const getQuizzes = async (req, res, next) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.documentId) {
      filter.document = req.query.documentId;
    }
    const quizzes = await Quiz.find(filter)
      .populate("document", "title")
      .sort({ createdAt: -1 });

    const populatedQuizzes = await Promise.all(
      quizzes.map(async (quiz) => {
        const result = await QuizResult.findOne({ quiz: quiz._id, user: req.user._id })
          .sort({ createdAt: -1 });
        
        // Remove questions field from list view for efficiency
        const quizObj = quiz.toObject();
        delete quizObj.questions;
        
        return {
          ...quizObj,
          score: result ? result.score : null,
          totalQuestions: result ? result.totalQuestions : (quiz.questions ? quiz.questions.length : 0),
          resultId: result ? result._id : null,
          isCompleted: !!result,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: populatedQuizzes.length,
      data: populatedQuizzes,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/quizzes/:id
export const getQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("document", "title");

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/quizzes/submit
export const submitQuiz = async (req, res, next) => {
  try {
    const { quizId, answers, timeTaken } = req.body;

    if (!quizId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "Please provide quizId and answers array.",
      });
    }

    if (timeTaken === undefined || timeTaken === null) {
      return res.status(400).json({
        success: false,
        message: "Please provide timeTaken.",
      });
    }

    const quiz = await Quiz.findOne({
      _id: quizId,
      user: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found.",
      });
    }

    // Grade the quiz
    let score = 0;
    const gradedAnswers = answers.map((answer) => {
      const question = quiz.questions[answer.questionIndex];
      if (!question) {
        return {
          questionIndex: answer.questionIndex,
          selectedAnswer: answer.selectedAnswer,
          isCorrect: false,
        };
      }

      const isCorrect = answer.selectedAnswer === question.correctAnswer;
      if (isCorrect) score++;

      return {
        questionIndex: answer.questionIndex,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
      };
    });

    const quizResult = await QuizResult.create({
      quiz: quiz._id,
      user: req.user._id,
      score,
      totalQuestions: quiz.questions.length,
      answers: gradedAnswers,
      timeTaken,
    });

    res.status(201).json({
      success: true,
      message: "Quiz submitted successfully.",
      data: {
        id: quizResult._id,
        score: quizResult.score,
        totalQuestions: quizResult.totalQuestions,
        percentage: Math.round(
          (quizResult.score / quizResult.totalQuestions) * 100
        ),
        timeTaken: quizResult.timeTaken,
        answers: quizResult.answers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/quizzes/result/:id
export const getQuizResult = async (req, res, next) => {
  try {
    const result = await QuizResult.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate({
      path: "quiz",
      select: "title questions",
      populate: {
        path: "document",
        select: "title",
      },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Quiz result not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: result._id,
        score: result.score,
        totalQuestions: result.totalQuestions,
        percentage: Math.round(
          (result.score / result.totalQuestions) * 100
        ),
        timeTaken: result.timeTaken,
        answers: result.answers,
        quiz: result.quiz,
        createdAt: result.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/quizzes/:id
export const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found.",
      });
    }

    // Delete associated results
    await QuizResult.deleteMany({ quiz: quiz._id });

    await Quiz.findByIdAndDelete(quiz._id);

    res.status(200).json({
      success: true,
      message: "Quiz and associated results deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
