import api from './api';

const flashcardService = {
  getAll: async (params = {}) => {
    const response = await api.get('/flashcards', { params });
    return response.data;
  },

  getByDocument: async (documentId) => {
    const response = await api.get(`/flashcards/document/${documentId}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/flashcards/${id}`);
    return response.data;
  },

  toggleFavorite: async (id) => {
    const response = await api.put(`/flashcards/favorite/${id}`);
    return response.data;
  },

  getFavorites: async () => {
    const response = await api.get('/flashcards');
    const cards = response.data?.data || response.data || [];
    const favorites = cards.filter(c => c.favorite === true);
    return { data: favorites };
  },

  delete: async (id) => {
    const response = await api.delete(`/flashcards/${id}`);
    return response.data;
  },

  updateConfidence: async (id, confidence) => {
    const response = await api.put(`/flashcards/${id}/confidence`, { confidence });
    return response.data;
  },
};

export default flashcardService;
