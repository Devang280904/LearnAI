import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Check, X, BookOpen, ArrowLeft, RotateCcw, Target, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import quizService from '../services/quizService';
import Button from '../components/ui/Button';
import { CardSkeleton } from '../components/ui/Skeleton';

const QuizResultPage = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchResult = async () => {
    try {
      const res = await quizService.getResult(resultId);
      setResult(res.data || res.result || res);
    } catch (error) {
      console.error('Failed to fetch result:', error);
      toast.error('Failed to load quiz results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResult();
  }, [resultId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const score = result?.percentage !== undefined ? result.percentage : Math.round(((result?.score || 0) / (result?.totalQuestions || 1)) * 100);
  const totalQuestions = result?.totalQuestions || result?.quiz?.questions?.length || 0;
  const correctAnswers = result?.score !== undefined ? result.score : Math.round((score / 100) * totalQuestions);
  const wrongAnswers = totalQuestions - correctAnswers;
  const questions = result?.quiz?.questions || [];
  const documentTitle = result?.quiz?.document?.title || 'Document';
  const documentId = result?.quiz?.document?._id || result?.quiz?.document || '';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto space-y-8"
    >
      {/* Back Button */}
      <button
        onClick={() => navigate(documentId ? `/documents/${documentId}` : '/documents')}
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 cursor-pointer mb-2"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Document
      </button>

      {/* Page Title */}
      <h1 className="text-2xl font-bold text-slate-900">
        {documentTitle} - Quiz Results
      </h1>

      {/* Results Overview Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm relative overflow-hidden">
        {/* Trophy icon */}
        <div className="w-14 h-14 bg-[#E6FAF5] rounded-2xl flex items-center justify-center text-[#00B69B] mx-auto mb-4 shadow-sm shadow-[#00B69B]/10">
          <Trophy className="w-7 h-7 stroke-[2]" />
        </div>

        {/* Score and label */}
        <p className="text-xs font-bold text-slate-400 mb-1 tracking-wider">YOUR SCORE</p>
        <h2 className="text-5xl font-extrabold text-[#EF4444] mb-2">
          {score}%
        </h2>
        <p className="text-sm font-semibold text-slate-500">
          {score >= 80 ? 'Excellent job!' : score >= 60 ? 'Good effort!' : 'Keep practicing!'}
        </p>

        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-3 justify-center mt-6">
          {/* Total Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-slate-500 text-xs font-bold">
            <Target className="w-3.5 h-3.5" />
            {totalQuestions} Total
          </div>

          {/* Correct Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#B3F0E1] bg-[#E6FAF5] text-[#00B69B] text-xs font-bold">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            {correctAnswers} Correct
          </div>

          {/* Incorrect Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-red-200 bg-red-50 text-red-500 text-xs font-bold">
            <X className="w-3.5 h-3.5 stroke-[3]" />
            {wrongAnswers} Incorrect
          </div>
        </div>
      </div>

      {/* Detailed Review Section */}
      <div>
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-slate-500" /> Detailed Review
        </h3>

        <div className="space-y-6">
          {questions.map((q, idx) => {
            const userAnswerObj = result?.answers?.find(a => a.questionIndex === idx);
            const selectedAnswer = userAnswerObj ? userAnswerObj.selectedAnswer : -1;
            const isCorrect = userAnswerObj ? userAnswerObj.isCorrect : (selectedAnswer === q.correctAnswer);

            return (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm relative"
              >
                {/* Question Badge Top Left */}
                <div className="flex items-center px-2.5 py-1 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-xs font-bold w-fit mb-4">
                  Question {idx + 1}
                </div>

                {/* State Indicator Icon Top Right */}
                <div className="absolute top-6 right-6">
                  {isCorrect ? (
                    <div className="w-6 h-6 rounded-full bg-[#E6FAF5] border border-[#B3F0E1] flex items-center justify-center text-[#00B69B] shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-500 shrink-0">
                      <X className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Question text */}
                <h4 className="text-base font-bold text-slate-900 mb-4 pr-8">
                  {q.question || q.text || `Question ${idx + 1}`}
                </h4>

                {/* Options list */}
                <div className="space-y-2">
                  {q.options.map((option, optIdx) => {
                    const optionText = typeof option === 'string' ? option : option.text || option.label;
                    const isSelected = selectedAnswer === optIdx;
                    const isCorrectOption = q.correctAnswer === optIdx;

                    let optionClass = 'border-slate-200 bg-white text-slate-500';
                    let radioCircleClass = 'border-slate-200';
                    let radioCircleContent = null;

                    if (isCorrectOption) {
                      optionClass = 'border-[#00B69B] bg-[#E6FAF5]/30 text-[#00B69B]';
                      radioCircleClass = 'border-[#00B69B]';
                      radioCircleContent = <div className="w-2 h-2 rounded-full bg-[#00B69B]" />;
                    } else if (isSelected) {
                      optionClass = 'border-red-200 bg-red-50/60 text-red-500';
                      radioCircleClass = 'border-red-500';
                      radioCircleContent = <div className="w-2 h-2 rounded-full bg-red-500" />;
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`w-full px-4 py-3 rounded-xl border-2 flex items-center justify-between transition-all duration-200 ${optionClass}`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Radio Circle */}
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${radioCircleClass}`}>
                            {radioCircleContent}
                          </div>
                          <span className="text-sm font-medium">{optionText}</span>
                        </div>

                        {/* Right tags */}
                        {isCorrectOption && (
                          <div className="w-fit flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#E6FAF5] border border-[#B3F0E1] text-[#00B69B] text-xs font-semibold">
                            <Check className="w-3 h-3 stroke-[3]" />
                            Correct
                          </div>
                        )}
                        {!isCorrectOption && isSelected && (
                          <div className="w-fit flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-50 border border-red-200 text-red-500 text-xs font-semibold">
                            <X className="w-3 h-3 stroke-[3]" />
                            Your Answer
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Block */}
                {q.explanation && (
                  <div className="flex items-start gap-3 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl mt-5 shadow-sm">
                    <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 shrink-0 shadow-sm">
                      <BookOpen className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-400 mb-1 tracking-wider">EXPLANATION</p>
                      <p className="text-sm text-slate-500 leading-relaxed">{q.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Retake and Back Actions */}
      <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4 pb-6">
        <Button
          variant="outline"
          onClick={() => navigate(documentId ? `/documents/${documentId}` : '/documents')}
          icon={ArrowLeft}
          className="rounded-xl px-5 py-2.5 text-sm font-semibold"
        >
          Back to Document
        </Button>
        <Button
          onClick={() => navigate(`/quiz/${result?.quiz?._id}`)}
          icon={RotateCcw}
          className="bg-[#00B69B] hover:bg-[#009982] text-white rounded-xl px-5 py-2.5 text-sm font-semibold"
        >
          Retake Quiz
        </Button>
      </div>
    </motion.div>
  );
};



export default QuizResultPage;

