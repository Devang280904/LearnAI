import Flashcard from "../models/Flashcard.js";

// GET /api/flashcards
export const getFlashcards = async (req, res, next) => {
  try {
    const flashcards = await Flashcard.find({ user: req.user._id })
      .populate("document", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: flashcards.length,
      data: flashcards,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/flashcards/document/:documentId
export const getFlashcardsByDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    const flashcards = await Flashcard.find({
      document: documentId,
      user: req.user._id,
    })
      .populate("document", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: flashcards.length,
      data: flashcards,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/flashcards/favorite/:id
export const toggleFavorite = async (req, res, next) => {
  try {
    const flashcard = await Flashcard.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: "Flashcard not found.",
      });
    }

    flashcard.favorite = !flashcard.favorite;
    flashcard.reviewCount += 1;
    await flashcard.save();

    res.status(200).json({
      success: true,
      message: flashcard.favorite
        ? "Flashcard added to favorites."
        : "Flashcard removed from favorites.",
      data: flashcard,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/flashcards/:id
export const deleteFlashcard = async (req, res, next) => {
  try {
    const flashcard = await Flashcard.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: "Flashcard not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Flashcard deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
