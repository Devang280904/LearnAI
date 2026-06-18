import api from './api';

const quizService = {
  getAll: async (params = {}) => {
    const response = await api.get('/quizzes', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/quizzes/${id}`);
    return response.data;
  },

  submit: async (quizId, answers, timeTaken = 0) => {
    const response = await api.post('/quizzes/submit', { quizId, answers, timeTaken });
    return response.data;
  },

  getResult: async (resultId) => {
    const response = await api.get(`/quizzes/result/${resultId}`);
    return response.data;
  },

  getResults: async (params = {}) => {
    const response = await api.get('/quizzes/results', { params });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/quizzes/${id}`);
    return response.data;
  },
};

export default quizService;
