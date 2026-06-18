import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Layers, Brain, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import dashboardService from '../services/dashboardService';
import StatCard from '../components/dashboard/StatCard';
import { StatSkeleton } from '../components/ui/Skeleton';
import { formatDateTime } from '../utils/formatters';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await dashboardService.getOverview();
      const data = res.data || res;
      
      if (data) {
        setStats(data.stats);
        
        const docsActivity = (data.recentDocuments || []).map((doc) => ({
          id: doc._id || doc.id,
          type: 'document',
          description: `Accessed Document: ${doc.title}`,
          createdAt: doc.createdAt,
        }));
        
        const quizActivity = (data.recentQuizResults || []).map((result) => ({
          id: result._id || result.id,
          type: 'quiz',
          description: `Completed Quiz: ${result.quiz?.title || 'Document Quiz'}`,
          createdAt: result.createdAt,
          score: result.score,
        }));
        
        const combined = [...docsActivity, ...quizActivity].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        setActivity(combined);
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Documents', value: stats?.totalDocuments || 0, icon: FileText, color: 'primary' },
    { title: 'Total Flashcards', value: stats?.totalFlashcards || 0, icon: Layers, color: 'secondary' },
    { title: 'Total Quizzes', value: stats?.totalQuizzes || 0, icon: Brain, color: 'accent' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 min-w-0"
    >
      {/* Welcome */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-slate-900 leading-tight tracking-tight">Dashboard</h1>
        <p className="text-slate-500 text-[15px]">Track your learning progress and activity</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-w-0">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <StatSkeleton key={i} />)
          : statCards.map((stat, index) => (
              <StatCard key={stat.title} {...stat} index={index} />
            ))}
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm min-w-0"
      >
        <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-5">
          <Clock className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
        </div>

        <div className="space-y-6">
          {activity.length > 0 ? (
            activity.slice(0, 5).map((item, index) => (
              <div
                key={item.id || index}
                className="flex items-center justify-between group p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    item.type === 'document' ? 'bg-[#24A0ED]/10 text-[#24A0ED]' : 'bg-[#00B69B]/10 text-[#00B69B]'
                  }`}>
                    {item.type === 'document' ? <FileText className="w-5 h-5" /> : <Brain className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0 flex-1 pr-4">
                    <p className="text-[15px] font-bold text-slate-900 group-hover:text-primary transition-colors truncate">
                      {item.description}
                    </p>
                    <p className="text-[13px] text-slate-500 mt-0.5">
                      {formatDateTime(item.createdAt)}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    if (item.type === 'document') {
                      navigate(`/documents/${item.id}`);
                    } else {
                      navigate(`/quiz/result/${item.id}`);
                    }
                  }}
                  className="px-4 py-2 text-sm font-bold text-primary hover:text-white bg-primary/10 hover:bg-primary rounded-xl transition-all cursor-pointer shrink-0"
                >
                  View
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Clock className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-base font-bold text-slate-900">No recent activity found.</p>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">Upload a PDF document to begin generating flashcards and quizzes!</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardPage;
