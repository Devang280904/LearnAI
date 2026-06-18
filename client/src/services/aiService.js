import api from './api';

const aiService = {
  chat: async (documentId, message) => {
    const response = await api.post('/ai/chat', { documentId, question: message });
    return response.data;
  },

  getChatHistory: async (documentId) => {
    const response = await api.get(`/ai/history/${documentId}`);
    return response.data;
  },

  summarize: async (documentId) => {
    const response = await api.post('/ai/summary', { documentId });
    return response.data;
  },

  explain: async (documentId, text) => {
    const response = await api.post('/ai/explain', { documentId, topic: text });
    return response.data;
  },

  generateFlashcards: async (documentId, options = {}) => {
    const response = await api.post('/ai/flashcards', { documentId, ...options });
    return response.data;
  },

  generateQuiz: async (documentId, options = {}) => {
    const response = await api.post('/ai/quiz', { documentId, ...options });
    return response.data;
  },
};

export default aiService;
