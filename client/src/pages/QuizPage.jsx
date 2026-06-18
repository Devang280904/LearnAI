import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronRight, ChevronLeft, Check, CheckCircle, AlertCircle, Brain } from 'lucide-react';
import toast from 'react-hot-toast';
import quizService from '../services/quizService';
import Button from '../components/ui/Button';
import { CardSkeleton } from '../components/ui/Skeleton';

const QuizPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const questions = quiz?.questions || [];
      const formattedAnswers = questions.map((question, i) => {
        const optIndex = answers[i] !== undefined ? answers[i] : -1;
        let selectedText = "";
        if (optIndex !== -1 && question.options) {
          const option = question.options[optIndex];
          selectedText = typeof option === 'string' ? option : option.text || option.label;
        }
        return {
          questionIndex: i,
          selectedAnswer: selectedText,
        };
      });
      const totalTime = questions.length * 30;
      const timeTaken = timeLeft !== null ? totalTime - timeLeft : 0;
      
      const res = await quizService.submit(quizId, formattedAnswers, timeTaken);
      const resultId = res.data?.id || res.id || res.data?._id || res._id || quizId;
      toast.success('Quiz submitted!');
      navigate(`/quiz/result/${resultId}`);
    } catch (error) {
      toast.error('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!quizStarted || timeLeft === null || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [quizStarted, timeLeft]);

  const fetchQuiz = async () => {
    try {
      const res = await quizService.getById(quizId);
      const quizData = res.data || res.quiz || res;
      setQuiz(quizData);
      const questions = quizData.questions || [];
      const totalTime = questions.length * 30; // 30 seconds per question
      setTimeLeft(totalTime);
    } catch (error) {
      toast.error('Failed to load quiz');
      navigate('/documents');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (questionIndex, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  };



  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const questions = quiz?.questions || [];

  if (!quizStarted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto text-center py-12"
      >
        <div className="p-6 bg-[#E6FAF5] rounded-3xl w-fit mx-auto mb-6">
          <Brain className="w-16 h-16 text-[#00B69B]" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          {quiz?.title || 'Quiz'}
        </h1>
        <p className="text-slate-500 mb-8">
          {questions.length} questions • {formatTime(timeLeft || 0)} time limit
        </p>

        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-left space-y-5 mb-8">
          <h3 className="font-semibold text-slate-900">Before you begin:</h3>
          <ul className="space-y-2 text-sm text-slate-500">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#00B69B] mt-0.5 shrink-0" />
              Select one answer per question
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#00B69B] mt-0.5 shrink-0" />
              You can navigate between questions
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
              The timer starts when you begin
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
              Quiz auto-submits when time runs out
            </li>
          </ul>
        </div>

        <Button size="lg" onClick={() => setQuizStarted(true)} icon={ChevronRight} iconPosition="right">
          Start Quiz
        </Button>
      </motion.div>
    );
  }

  const question = questions[currentQuestion];
  const totalAnswered = Object.keys(answers).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto space-y-8"
    >
      {/* Title */}
      <h1 className="text-2xl font-bold text-slate-900">
        {quiz?.title || 'Quiz'} - Quiz
      </h1>

      {/* Subheader counts */}
      <div className="flex items-center justify-between text-sm font-semibold text-slate-500">
        <div>
          Question {currentQuestion + 1} of {questions.length}
        </div>
        <div className="text-slate-400">
          {totalAnswered} answered
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-[6px] bg-[#E2E8F0] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[#00B69B] rounded-full"
          animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        {/* Capsule Badge top-left */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#B3F0E1] bg-[#E6FAF5] text-[#00B69B] text-xs font-semibold w-fit mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00B69B]" />
          Question {currentQuestion + 1}
        </div>

        {/* Question Text */}
        <h2 className="text-lg font-bold text-slate-900 mb-6">
          {question?.question || question?.text || `Question ${currentQuestion + 1}`}
        </h2>

        {/* Options */}
        <div className="space-y-3">
          {(question?.options || []).map((option, optIndex) => {
            const isSelected = answers[currentQuestion] === optIndex;
            const optionText = typeof option === 'string' ? option : option.text || option.label;

            return (
              <button
                key={optIndex}
                onClick={() => handleSelectAnswer(currentQuestion, optIndex)}
                className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'border-[#00B69B] bg-[#E6FAF5]/40 text-slate-900'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-[#00B69B]/30 hover:bg-[#E6FAF5]/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Radio circle */}
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    isSelected ? 'border-[#00B69B]' : 'border-slate-200'
                  }`}>
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#00B69B]" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{optionText}</span>
                </div>

                {/* Selected Checkmark right */}
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-[#E6FAF5] border border-[#B3F0E1] flex items-center justify-center text-[#00B69B] shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          className={`flex items-center gap-1 text-sm font-semibold cursor-pointer ${
            currentQuestion === 0 ? 'text-slate-400 cursor-not-allowed opacity-50' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        {currentQuestion === questions.length - 1 ? (
          <Button
            onClick={handleSubmit}
            isLoading={submitting}
            className="bg-[#00B69B] hover:bg-[#009982] text-white px-5 py-2.5 rounded-xl font-medium"
          >
            Submit Quiz
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
            className="bg-[#00B69B] hover:bg-[#009982] text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-1"
          >
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Pagination Numbers Bottom Center */}
      <div className="flex gap-2 justify-center pt-4">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentQuestion(i)}
            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              i === currentQuestion
                ? 'bg-[#00B69B] text-white shadow-sm shadow-[#00B69B]/30'
                : 'text-slate-400 hover:bg-slate-50'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default QuizPage;

