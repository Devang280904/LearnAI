export const API_URL = `${import.meta.env.VITE_API_URL}/api`;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  DOCUMENTS: '/documents',
  DOCUMENT_VIEW: '/documents/:id',
  CHAT: '/chat/:documentId',
  FLASHCARDS: '/flashcards',
  FAVORITES: '/favorites',
  QUIZ: '/quiz/:quizId',
  QUIZ_RESULT: '/quiz/result/:resultId',
  PROFILE: '/profile',
};

export const COLORS = {
  primary: '#00B69B',
  primaryLight: '#00D3B4',
  primaryDark: '#009982',
  secondary: '#8B5CF6',
  secondaryLight: '#A78BFA',
  accent: '#06B6D4',
  accentLight: '#22D3EE',
  success: '#10B981',
  successLight: '#34D399',
  danger: '#EF4444',
  dangerLight: '#F87171',
  warning: '#F59E0B',
  bgPrimary: '#F8FAFC',
  bgSecondary: '#FFFFFF',
  textPrimary: '#1E293B',
  textSecondary: '#475569',
  border: '#E2E8F0',
};

export const SIDEBAR_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Documents', path: '/documents', icon: 'FileText' },
  { label: 'Flashcards', path: '/flashcards', icon: 'Layers' },
  { label: 'Favorites', path: '/favorites', icon: 'Heart' },
  { label: 'Profile', path: '/profile', icon: 'User' },
];

export const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
};

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const QUIZ_TIME_LIMITS = {
  easy: 30,
  medium: 45,
  hard: 60,
};

export const CHART_COLORS = ['#6366F1', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];
