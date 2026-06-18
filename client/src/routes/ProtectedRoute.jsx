import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

const LoadingScreen = () => (
  <div className="min-h-screen bg-bg-primary flex items-center justify-center">
    <motion.div
      className="flex flex-col items-center gap-4"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="p-4 bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-lg shadow-primary/30"
      >
        <Brain className="w-8 h-8 text-white" />
      </motion.div>
      <p className="text-text-secondary text-sm">Loading...</p>
    </motion.div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
