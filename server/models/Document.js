import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Document title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    filename: {
      type: String,
      required: [true, "Filename is required"],
    },
    filesize: {
      type: Number,
      required: [true, "File size is required"],
    },
    pdfUrl: {
      type: String,
      required: [true, "PDF URL is required"],
    },
    extractedText: {
      type: String,
      default: "",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const Document = mongoose.model("Document", documentSchema);

export default Document;
