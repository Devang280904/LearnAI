import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const cleanJSONResponse = (text) => {
  let cleaned = text.trim();
  // Remove markdown code fences if present
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
};

const safeJSONParse = (text) => {
  try {
    const cleaned = cleanJSONResponse(text);
    return JSON.parse(cleaned);
  } catch (error) {
    throw new Error(`Failed to parse AI response as JSON: ${error.message}`);
  }
};

export const chatWithDocument = async (documentText, question) => {
  const prompt = `You are an intelligent learning assistant. You have been provided with the content of a document. Answer the user's question based on the document content. If the question is not directly related to the document, you can still provide a helpful answer but mention that it may not be from the document.

DOCUMENT CONTENT:
${documentText.substring(0, 30000)}

USER QUESTION:
${question}

Provide a clear, comprehensive, and helpful answer. Use examples where appropriate. Format your response in a readable way with proper paragraphs.`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
};

export const generateSummary = async (documentText) => {
  const prompt = `You are an expert study assistant. Analyze the following document and create a comprehensive summary.

DOCUMENT CONTENT:
${documentText.substring(0, 30000)}

Return your response as a valid JSON object (no markdown code fences, no extra text) with EXACTLY this structure:
{
  "title": "A concise title for the summary",
  "overview": "A 2-3 sentence overview of the entire document",
  "keyPoints": ["key point 1", "key point 2", "key point 3", ...],
  "importantTopics": [
    {
      "topic": "Topic name",
      "description": "Brief description of this topic"
    }
  ],
  "quickRevisionNotes": ["revision note 1", "revision note 2", "revision note 3", ...],
  "conclusion": "A brief conclusion summarizing the main takeaways"
}

IMPORTANT: Return ONLY the JSON object. No markdown formatting, no code fences, no additional text before or after the JSON.`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  return safeJSONParse(response.text());
};

export const explainTopic = async (topic, documentText) => {
  const prompt = `You are an expert educator. Explain the following topic at multiple levels of complexity. Use the provided document content as context if relevant.

TOPIC: ${topic}

DOCUMENT CONTEXT (if available):
${documentText ? documentText.substring(0, 25000) : "No document context provided."}

Return your response as a valid JSON object (no markdown code fences, no extra text) with EXACTLY this structure:
{
  "topic": "${topic}",
  "beginner": "A clear, simple explanation suitable for complete beginners. Use analogies and simple language.",
  "intermediate": "A more detailed explanation with technical terms explained. Include how concepts relate to each other.",
  "advanced": "An in-depth, technical explanation with nuances, edge cases, and advanced concepts.",
  "realWorldExample": "A practical, real-world example or use case that demonstrates this topic in action.",
  "interviewPerspective": "Key points about this topic that are commonly asked in technical interviews, with sample answers."
}

IMPORTANT: Return ONLY the JSON object. No markdown formatting, no code fences, no additional text before or after the JSON.`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  return safeJSONParse(response.text());
};

export const generateFlashcards = async (documentText) => {
  const prompt = `You are an expert study assistant. Generate flashcards from the following document content. Create flashcards that cover the most important concepts, definitions, and facts.

DOCUMENT CONTENT:
${documentText.substring(0, 30000)}

Return your response as a valid JSON array (no markdown code fences, no extra text) with EXACTLY this structure:
[
  {
    "question": "A clear, specific question",
    "answer": "A comprehensive but concise answer",
    "difficulty": "easy|medium|hard"
  }
]

Generate between 10 and 20 flashcards. Distribute difficulty levels:
- About 30% easy (basic recall and definitions)
- About 50% medium (understanding and application)
- About 20% hard (analysis and synthesis)

IMPORTANT: Return ONLY the JSON array. No markdown formatting, no code fences, no additional text before or after the JSON.`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  return safeJSONParse(response.text());
};

export const generateQuiz = async (documentText, count = 5) => {
  const validCounts = [5, 10, 20];
  const questionCount = validCounts.includes(count) ? count : 5;

  const prompt = `You are an expert quiz creator. Generate a multiple-choice quiz from the following document content.

DOCUMENT CONTENT:
${documentText.substring(0, 30000)}

Generate exactly ${questionCount} multiple-choice questions. Return your response as a valid JSON array (no markdown code fences, no extra text) with EXACTLY this structure:
[
  {
    "question": "A clear, well-formulated question",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "The exact text of the correct option",
    "explanation": "A brief explanation of why this is the correct answer"
  }
]

Guidelines:
- Questions should test understanding, not just memorization
- All 4 options should be plausible
- The correctAnswer must exactly match one of the options
- Vary difficulty across questions
- Cover different sections/topics from the document

IMPORTANT: Return ONLY the JSON array. No markdown formatting, no code fences, no additional text before or after the JSON.`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  return safeJSONParse(response.text());
};

export default {
  chatWithDocument,
  generateSummary,
  explainTopic,
  generateFlashcards,
  generateQuiz,
};
