import fs from "fs";
import pdf from "pdf-parse-new";

const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);

    if (!data.text || data.text.trim().length === 0) {
      throw new Error("No text content could be extracted from the PDF.");
    }

    return data.text.trim();
  } catch (error) {
    if (error.message.includes("No text content")) {
      throw error;
    }
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};

export default extractTextFromPDF;
