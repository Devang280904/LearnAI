import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import OpenAI from "openai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Initialize OpenRouter
const openRouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.CLIENT_URL || "http://localhost:5173",
    "X-Title": "LearnAI Summer Project",
  }
});

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

/**
 * Executes a prompt with a multi-provider fallback.
 * 1. Gemini
 * 2. Groq
 * 3. OpenRouter
 */
const executeWithFallback = async (prompt, isJson = false) => {
  // 1. Try Gemini
  try {
    console.log("[AI Orchestrator] Attempting Gemini...");
    const result = await geminiModel.generateContent(
      isJson 
        ? { contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } }
        : prompt
    );
    const text = result.response.text();
    return isJson ? JSON.parse(text) : text;
  } catch (error) {
    console.warn("[AI Orchestrator] Gemini failed:", error.message);
  }

  // 2. Try Groq
  try {
    console.log("[AI Orchestrator] Attempting Groq (llama-3.3-70b-versatile)...");
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      // We rely on safeJSONParse instead of strict json_object format because some 
      // of our prompts request JSON arrays, which json_object mode rejects.
    });
    const text = completion.choices[0].message.content;
    return isJson ? safeJSONParse(text) : text;
  } catch (error) {
    console.warn("[AI Orchestrator] Groq failed:", error.message);
  }

  // 3. Try OpenRouter
  try {
    console.log("[AI Orchestrator] Attempting OpenRouter (meta-llama/llama-3-8b-instruct:free)...");
    const completion = await openRouter.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "meta-llama/llama-3-8b-instruct:free",
    });
    const text = completion.choices[0].message.content;
    return isJson ? safeJSONParse(text) : text;
  } catch (error) {
    console.error("[AI Orchestrator] All AI providers failed!", error.message);
    throw new Error("All AI providers failed to generate content.");
  }
};

export const chatWithDocument = async (documentText, question) => {
  const prompt = `You are an intelligent learning assistant. You have been provided with the content of a document. Answer the user's question based on the document content. If the question is not directly related to the document, you can still provide a helpful answer but mention that it may not be from the document.

DOCUMENT CONTENT:
${documentText.substring(0, 30000)}

USER QUESTION:
${question}

Provide a clear, comprehensive, and helpful answer. Use examples where appropriate. Format your response in a readable way with proper paragraphs.`;

  try {
    return await executeWithFallback(prompt, false);
  } catch (error) {
    console.warn("ALL AI providers failed, using local fallback for chat...");
    return "I'm sorry, but all my AI engines are currently unavailable or have exceeded their quotas. Please ensure your environment variables are set correctly or try again later.";
  }
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

  try {
    return await executeWithFallback(prompt, true);
  } catch (error) {
    console.warn("ALL AI providers failed, using local fallback for summary...");
    const sentences = documentText.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20);
    const overview = sentences.slice(0, 3).join(". ") + (sentences.length > 0 ? "." : "");
    const keyPoints = sentences.slice(3, 8).map(s => s + ".");
    
    return {
      title: "Document Summary (Fallback Mode)",
      overview: overview || "Overview not available.",
      keyPoints: keyPoints.length > 0 ? keyPoints : ["Not enough text for key points."],
      importantTopics: [{ topic: "Extracted Content", description: "Local extraction used because AI quotas were exceeded." }],
      quickRevisionNotes: ["Please try again later when AI quotas reset."],
      conclusion: "End of fallback summary."
    };
  }
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

  try {
    return await executeWithFallback(prompt, true);
  } catch (error) {
    console.warn("ALL AI providers failed, using local fallback for explainTopic...");
    return {
      topic: topic,
      beginner: "AI providers are currently unavailable due to quota limits. Please try again later.",
      intermediate: "We cannot generate a detailed explanation at this time.",
      advanced: "API limits exceeded. Please ensure your environment variables have the correct API keys.",
      realWorldExample: "N/A",
      interviewPerspective: "N/A"
    };
  }
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

  try {
    return await executeWithFallback(prompt, true);
  } catch (error) {
    console.warn("ALL AI providers failed, using local fallback for flashcards...");
    const sentences = documentText.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 40 && s.length < 150);
    const fallbackFlashcards = [];
    const count = Math.min(10, Math.max(5, Math.floor(sentences.length / 2)));
    
    for (let i = 0; i < count; i++) {
      const sentence = sentences[i] || "Fallback content";
      const words = sentence.split(' ').filter(w => w.length > 5);
      const answerWord = words.length > 0 ? words[Math.floor(Math.random() * words.length)] : "concept";
      const questionText = sentence.replace(new RegExp(`\\b${answerWord}\\b`, 'i'), '_______');
      
      fallbackFlashcards.push({
        question: `Fill in the blank: "${questionText}"`,
        answer: answerWord,
        difficulty: "medium"
      });
    }
    
    return fallbackFlashcards.length > 0 ? fallbackFlashcards : [{ question: "AI Quota Exceeded", answer: "Please try again later", difficulty: "easy" }];
  }
};

export const generateQuiz = async (documentText, count = 5) => {
  const validCounts = [5, 10, 15, 20];
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

  try {
    return await executeWithFallback(prompt, true);
  } catch (error) {
    // If absolutely ALL AI providers fail, we STILL use our local fallback so the user is never blocked!
    console.warn("ALL AI providers failed, using local document extractor fallback...");
    
    const sentences = documentText
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 40 && s.length < 150);
      
    if (sentences.length < questionCount) {
      for (let i = 0; i < questionCount; i++) {
        sentences.push(`This is a key concept discussed in the document section ${i + 1}`);
      }
    }

    const fallbackQuiz = [];
    for (let i = 0; i < questionCount; i++) {
      const sentenceIndex = Math.floor((i / questionCount) * sentences.length);
      const sentence = sentences[sentenceIndex] || sentences[0];
      const words = sentence.split(' ').filter(w => w.length > 5);
      const answerWord = words.length > 0 ? words[Math.floor(Math.random() * words.length)] : "concept";
      const questionText = sentence.replace(new RegExp(`\\b${answerWord}\\b`, 'i'), '_______');
      
      fallbackQuiz.push({
        question: `Fill in the blank from the text: "${questionText}"`,
        options: [
          answerWord,
          "Alternative " + (i + 1),
          "Analysis " + (i + 2),
          "Methodology " + (i + 3)
        ].sort(() => Math.random() - 0.5),
        correctAnswer: answerWord,
        explanation: `This is directly extracted from your document as a fallback because all AI quotas were exceeded.`
      });
    }
    
    return fallbackQuiz;
  }
};

export default {
  chatWithDocument,
  generateSummary,
  explainTopic,
  generateFlashcards,
  generateQuiz,
};
