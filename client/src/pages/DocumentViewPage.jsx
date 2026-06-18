import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, BookOpen, Lightbulb, Layers, Brain,
  ArrowLeft, Send, Loader2, Copy, Check, RefreshCw,
  X, Clock, Trash2, Play, CheckCircle, ExternalLink,
  ChevronRight, Plus, Award, ChevronLeft, Star
} from 'lucide-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import documentService from '../services/documentService';
import aiService from '../services/aiService';
import flashcardService from '../services/flashcardService';
import quizService from '../services/quizService';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { CardSkeleton } from '../components/ui/Skeleton';
import { formatDate, formatFileSize } from '../utils/formatters';

const tabs = [
  { id: 'content', label: 'Content', icon: BookOpen },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'actions', label: 'AI Actions', icon: Lightbulb },
  { id: 'flashcards', label: 'Flashcards', icon: Layers },
  { id: 'quizzes', label: 'Quizzes', icon: Brain },
];

const DocumentViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content');

  // Chat state
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Summary state
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  // Explain state
  const [explainText, setExplainText] = useState('');
  const [explanation, setExplanation] = useState('');
  const [explainLoading, setExplainLoading] = useState(false);

  // Flashcards state
  const [flashcards, setFlashcards] = useState([]);
  const [flashcardsLoading, setFlashcardsLoading] = useState(false);
  const [activeSetKey, setActiveSetKey] = useState(null);
  const [studyIndex, setStudyIndex] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [genLoading, setGenLoading] = useState(false);

  // Quizzes state
  const [quizzes, setQuizzes] = useState([]);
  const [quizzesLoading, setQuizzesLoading] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizQuestionsCount, setQuizQuestionsCount] = useState(5);

  // Copied helper
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchDocument();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'chat') {
      fetchChatHistory();
    } else if (activeTab === 'flashcards') {
      fetchFlashcards();
    } else if (activeTab === 'quizzes') {
      fetchQuizzes();
    }
  }, [activeTab]);

  const fetchDocument = async () => {
    try {
      const res = await documentService.getById(id);
      setDocument(res.data || res.document || res);
    } catch (error) {
      toast.error('Failed to load document');
      navigate('/documents');
    } finally {
      setLoading(false);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const res = await aiService.getChatHistory(id);
      const history = res.data || res.messages || res || [];
      if (Array.isArray(history)) setMessages(history);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const fetchFlashcards = async () => {
    setFlashcardsLoading(true);
    try {
      const res = await flashcardService.getByDocument(id);
      setFlashcards(res.data || res.flashcards || res || []);
    } catch (error) {
      console.error('Failed to fetch flashcards:', error);
    } finally {
      setFlashcardsLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    setQuizzesLoading(true);
    try {
      const res = await quizService.getAll({ documentId: id });
      setQuizzes(res.data || res.quizzes || res || []);
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
    } finally {
      setQuizzesLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMessage = { role: 'user', content: chatInput };
    setMessages((prev) => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await aiService.chat(id, userMessage.content);
      const aiResponse = res.data || res;
      setMessages((prev) => [...prev, { role: 'assistant', content: aiResponse.answer || aiResponse.response || aiResponse.message || aiResponse.content || 'No response' }]);
    } catch (error) {
      toast.error('Failed to get AI response');
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setChatLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (summaryLoading) return;
    setSummaryLoading(true);
    try {
      const res = await aiService.summarize(id);
      const data = res.data || res;
      
      let sumText = '';
      if (data.title) {
        sumText += `# ${data.title}\n\n`;
        sumText += `**Overview:** ${data.overview}\n\n`;
        sumText += `### Key Points\n`;
        data.keyPoints?.forEach(pt => sumText += `- ${pt}\n`);
        sumText += `\n### Important Topics\n`;
        data.importantTopics?.forEach(topic => sumText += `- **${topic.topic}:** ${topic.description}\n`);
        sumText += `\n### Quick Revision Notes\n`;
        data.quickRevisionNotes?.forEach(note => sumText += `- ${note}\n`);
        sumText += `\n**Conclusion:** ${data.conclusion}`;
      } else {
        sumText = typeof data === 'string' ? data : data.summary || data.content || 'Summary generated.';
      }

      setSummary(sumText);
      setShowSummaryModal(true);
      toast.success('Summary generated!');
    } catch (error) {
      toast.error('Failed to generate summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleExplain = async () => {
    if (!explainText.trim() || explainLoading) return;
    setExplainLoading(true);
    try {
      const res = await aiService.explain(id, explainText);
      const data = res.data || res;
      
      let expText = '';
      if (data.topic && data.beginner) {
        expText += `# Topic: ${data.topic}\n\n`;
        expText += `### 🌱 Beginner\n${data.beginner}\n\n`;
        expText += `### 📈 Intermediate\n${data.intermediate}\n\n`;
        expText += `### 🚀 Advanced\n${data.advanced}\n\n`;
        expText += `### 🌍 Real World Example\n${data.realWorldExample}\n\n`;
        expText += `### 💼 Interview Perspective\n${data.interviewPerspective}`;
      } else {
        expText = typeof data === 'string' ? data : data.explanation || data.content || 'Explanation generated.';
      }

      setExplanation(expText);
      toast.success('Explanation generated!');
    } catch (error) {
      toast.error('Failed to generate explanation');
    } finally {
      setExplainLoading(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (genLoading) return;
    setGenLoading(true);
    try {
      await aiService.generateFlashcards(id);
      toast.success('Flashcards generated successfully!');
      fetchFlashcards();
    } catch (error) {
      toast.error('Failed to generate flashcards');
    } finally {
      setGenLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (genLoading) return;
    setShowQuizModal(false);
    setGenLoading(true);
    try {
      await aiService.generateQuiz(id, quizQuestionsCount);
      toast.success('Quiz generated successfully!');
      fetchQuizzes();
    } catch (error) {
      toast.error('Failed to generate quiz');
    } finally {
      setGenLoading(false);
    }
  };

  const handleToggleFavoriteCard = async (cardId) => {
    try {
      await flashcardService.toggleFavorite(cardId);
      setFlashcards(prev =>
        prev.map(c => ((c._id || c.id) === cardId ? { ...c, favorite: !c.favorite } : c))
      );
      toast.success('Favorite updated!');
    } catch (error) {
      toast.error('Failed to update favorite');
    }
  };

  const handleDeleteFlashcardSet = async (setKey) => {
    if (!confirm('Are you sure you want to delete this flashcard set? This action cannot be undone and all cards will be permanently removed.')) {
      return;
    }
    const setToDelete = getFlashcardSets().find(s => s.key === setKey);
    if (!setToDelete) return;
    
    setGenLoading(true);
    try {
      await Promise.all(setToDelete.cards.map(card => flashcardService.delete(card._id || card.id)));
      toast.success('Flashcard set deleted');
      setFlashcards(prev => prev.filter(c => !setToDelete.cards.some(tc => (tc._id || tc.id) === (c._id || c.id))));
      if (activeSetKey === setKey) {
        setActiveSetKey(null);
      }
    } catch (error) {
      toast.error('Failed to delete flashcard set');
    } finally {
      setGenLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    try {
      await quizService.delete(quizId);
      toast.success('Quiz deleted');
      setQuizzes(prev => prev.filter(q => (q._id || q.id) !== quizId));
    } catch (error) {
      toast.error('Failed to delete quiz');
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Group flashcards by creation minute
  const getFlashcardSets = () => {
    const sets = {};
    flashcards.forEach((card) => {
      const key = new Date(card.createdAt).toISOString().slice(0, 16);
      if (!sets[key]) {
        sets[key] = [];
      }
      sets[key].push(card);
    });

    return Object.keys(sets).map((key) => {
      const cards = sets[key];
      return {
        key,
        date: new Date(cards[0].createdAt),
        cards,
        reviewedCount: cards.filter(c => (c.reviewCount || 0) > 0).length,
      };
    }).sort((a, b) => b.date - a.date);
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-7xl mx-auto">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const flashcardSets = getFlashcardSets();
  const activeSet = flashcardSets.find(s => s.key === activeSetKey);
  const activeSetCards = activeSet ? activeSet.cards : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="flex flex-col gap-2">
        <button
          onClick={() => navigate('/documents')}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-primary transition-colors cursor-pointer w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Documents
        </button>
        <h1 className="text-2xl font-bold text-slate-900">
          {document?.title || 'Document Viewer'}
        </h1>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'text-primary border-primary'
                  : 'text-slate-400 border-transparent hover:text-slate-600'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Panels */}
      <div className="w-full">
        {/* Content/Viewer Tab */}
        {activeTab === 'content' && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-base">Document Viewer</h2>
              {document?.pdfUrl && (
                <a
                  href={`http://localhost:5000${document.pdfUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors cursor-pointer"
                >
                  <span>Open in new tab</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            <div className="h-[600px] lg:h-[calc(100vh-280px)] bg-slate-100 flex items-center justify-center">
              {document?.pdfUrl ? (
                <iframe
                  src={`http://localhost:5000${document.pdfUrl}`}
                  className="w-full h-full border-0"
                  title="PDF Document Viewer"
                />
              ) : (
                <div className="text-center p-6 text-slate-400">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="font-medium">PDF preview not available</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col h-[650px] shadow-sm">
            {/* Message History */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-100/40">
              {messages.length === 0 ? (
                <div className="text-center py-20 max-w-sm mx-auto text-slate-400">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 border border-primary/20">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">AI Chat</h3>
                  <p className="text-sm">Ask any questions about the content of this document and get accurate contextual explanations.</p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* Bot Avatar Left */}
                    {msg.role === 'assistant' && (
                      <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-sm shadow-primary/20 mt-1">
                        <Brain className="w-4.5 h-4.5" />
                      </div>
                    )}

                    {/* Chat Bubble */}
                    <div className={`p-4 rounded-2xl max-w-[80%] text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary text-white font-medium rounded-br-none shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-900 rounded-bl-none shadow-sm'
                    }`}>
                      {msg.role === 'assistant' ? (
                        <div className="prose-light">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p>{msg.content}</p>
                      )}
                    </div>

                    {/* User Avatar Right */}
                    {msg.role === 'user' && (
                      <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-900 flex items-center justify-center shrink-0 border border-slate-200 font-bold text-sm mt-1">
                        <span>A</span>
                      </div>
                    )}
                  </div>
                ))
              )}
              {chatLoading && (
                <div className="flex justify-start items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-sm shadow-primary/20">
                    <Brain className="w-4.5 h-4.5" />
                  </div>
                  <div className="bg-white border border-slate-200 px-5 py-3.5 rounded-2xl rounded-bl-none shadow-sm">
                    <div className="flex gap-1.5 items-center">
                      {[0, 1, 2].map((dot) => (
                        <motion.div
                          key={dot}
                          className="w-2 h-2 bg-primary rounded-full"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: dot * 0.15 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input Bar */}
            <div className="p-4 border-t border-slate-200 bg-white flex items-center gap-3">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask a follow-up question..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                disabled={chatLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!chatInput.trim() || chatLoading}
                className="w-12 h-12 rounded-xl bg-primary hover:bg-primary-dark text-white flex items-center justify-center shadow-md shadow-primary/20 transition-all shrink-0 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        )}

        {/* AI Actions Tab */}
        {activeTab === 'actions' && (
          <div className="space-y-8">
            {/* AI Assistant Banner */}
            <div className="bg-[#E6F8F5] border border-primary/20 p-5 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-primary text-white rounded-xl shadow-md shadow-primary/20">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">AI Assistant</h3>
                <p className="text-xs text-slate-600">Powered by advanced AI models to simplify your study materials</p>
              </div>
            </div>

            {/* Summarizer Action Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <BookOpen className="w-5 h-5" />
                  <span>Generate Summary</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Get a concise summary of the entire document instantly.
                </p>
              </div>
              <Button
                onClick={handleSummarize}
                isLoading={summaryLoading}
                icon={BookOpen}
                className="shrink-0"
              >
                Generate Summary
              </Button>
            </div>

            {/* Explainer Action Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 shadow-sm">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Lightbulb className="w-5 h-5" />
                <span>Explain a Concept</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter a topic or concept from the document to get a detailed explanation (beginner, intermediate, advanced level views).
              </p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={explainText}
                  onChange={(e) => setExplainText(e.target.value)}
                  placeholder="e.g. 'React Hooks'"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
                <Button
                  onClick={handleExplain}
                  isLoading={explainLoading}
                  variant="primary"
                  icon={Lightbulb}
                >
                  Explain
                </Button>
              </div>

              {explanation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-50 border border-slate-200 p-6 rounded-xl prose-light text-sm"
                >
                  <ReactMarkdown>{explanation}</ReactMarkdown>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* Flashcards Tab */}
        {activeTab === 'flashcards' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 min-h-[400px] shadow-sm flex flex-col justify-between">
            {flashcardsLoading ? (
              <div className="py-20 flex justify-center items-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : !activeSetKey ? (
              /* Flashcard Sets List View */
              <div>
                {flashcardSets.length === 0 ? (
                  /* Empty state */
                  <div className="text-center py-16 max-w-sm mx-auto text-slate-400">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 border border-primary/20">
                      <Brain className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">No Flashcards Yet</h3>
                    <p className="text-sm mb-6">Generate flashcards from your document to start learning and reinforce your knowledge.</p>
                    <Button onClick={handleGenerateFlashcards} isLoading={genLoading} icon={Layers}>
                      Generate Flashcards
                    </Button>
                  </div>
                ) : (
                  /* Sets List */
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">Your Flashcard Sets</h2>
                        <p className="text-xs text-slate-400 mt-1">{flashcardSets.length} set{flashcardSets.length !== 1 ? 's' : ''} available</p>
                      </div>
                      <Button onClick={handleGenerateFlashcards} isLoading={genLoading} icon={Plus} size="sm">
                        Generate New Set
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {flashcardSets.map((set) => (
                        <div
                          key={set.key}
                          onClick={() => {
                            setActiveSetKey(set.key);
                            setStudyIndex(0);
                            setCardFlipped(false);
                          }}
                          className="bg-slate-50 border border-slate-200 rounded-3xl p-6 hover:border-primary/30 transition-all duration-300 group cursor-pointer relative flex flex-col justify-between"
                        >
                          {/* Delete */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFlashcardSet(set.key);
                            }}
                            className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-danger hover:bg-danger/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div>
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4 shrink-0">
                              <Layers className="w-5 h-5" />
                            </div>
                            <h4 className="font-bold text-slate-900 text-base">Flashcard Set</h4>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">CREATED {formatDate(set.date)}</p>
                          </div>

                          <div className="mt-4 pt-4 border-t border-slate-200/40 flex items-center justify-between">
                            <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100/30">
                              {set.cards.length} cards
                            </span>
                            
                            {/* Progress bar */}
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                              <span>{set.reviewedCount}/{set.cards.length} reviewed</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Studying Mode View */
              <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <button
                    onClick={() => setActiveSetKey(null)}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-primary transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Back to Sets
                  </button>

                  <Button
                    onClick={() => handleDeleteFlashcardSet(activeSetKey)}
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                  >
                    Delete Set
                  </Button>
                </div>

                <div className="max-w-xl mx-auto space-y-8 py-4">
                  {/* Progress info */}
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Card {studyIndex + 1} of {activeSetCards.length}</span>
                    <span>{cardFlipped ? 'Answer View' : 'Question View'}</span>
                  </div>

                  {/* 3D Flip Card */}
                  <div
                    className="perspective-1000 h-64 cursor-pointer relative"
                    onClick={() => setCardFlipped(!cardFlipped)}
                  >
                    <motion.div
                      className="w-full h-full relative"
                      animate={{ rotateY: cardFlipped ? 180 : 0 }}
                      transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {/* Front Card (Question) */}
                      <div
                        className="absolute inset-0 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between"
                        style={{ backfaceVisibility: 'hidden' }}
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {activeSetCards[studyIndex]?.difficulty || 'medium'}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavoriteCard(activeSetCards[studyIndex]?._id || activeSetCards[studyIndex]?.id);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-yellow-500 hover:bg-yellow-500/10 transition-colors"
                          >
                            <Star className={`w-4 h-4 ${activeSetCards[studyIndex]?.favorite ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                          </button>
                        </div>
                        
                        <p className="text-slate-900 text-center font-semibold text-lg max-w-md mx-auto leading-relaxed">
                          {activeSetCards[studyIndex]?.question}
                        </p>

                        <p className="text-xs text-slate-400 text-center italic mt-2">Click to reveal answer</p>
                      </div>

                      {/* Back Card (Answer) */}
                      <div
                        className="absolute inset-0 bg-primary text-white border border-primary rounded-2xl p-6 flex flex-col justify-between"
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/20 text-white">
                            Answer
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavoriteCard(activeSetCards[studyIndex]?._id || activeSetCards[studyIndex]?.id);
                            }}
                            className="p-1.5 rounded-lg text-white/80 hover:text-white"
                          >
                            <Star className={`w-4 h-4 ${activeSetCards[studyIndex]?.favorite ? 'text-white fill-white' : ''}`} />
                          </button>
                        </div>

                        <p className="text-center font-bold text-lg max-w-md mx-auto leading-relaxed">
                          {activeSetCards[studyIndex]?.answer}
                        </p>

                        <p className="text-xs text-white/75 text-center italic mt-2">Click to see question</p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between max-w-xs mx-auto pt-4">
                    <button
                      onClick={() => {
                        setStudyIndex(prev => Math.max(0, prev - 1));
                        setCardFlipped(false);
                      }}
                      disabled={studyIndex === 0}
                      className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    <span className="text-xs font-semibold text-slate-400">{studyIndex + 1} / {activeSetCards.length}</span>
                    <button
                      onClick={() => {
                        // Mark card reviewed as they go next
                        const card = activeSetCards[studyIndex];
                        if (card && (card.reviewCount || 0) === 0) {
                          flashcardService.toggleFavorite(card._id || card.id); // increments reviewCount
                          setFlashcards(prev =>
                            prev.map(c => ((c._id || c.id) === (card._id || card.id) ? { ...c, reviewCount: 1 } : c))
                          );
                        }
                        
                        setStudyIndex(prev => Math.min(activeSetCards.length - 1, prev + 1));
                        setCardFlipped(false);
                      }}
                      disabled={studyIndex === activeSetCards.length - 1}
                      className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quizzes Tab */}
        {activeTab === 'quizzes' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 min-h-[400px] shadow-sm flex flex-col justify-between">
            {quizzesLoading ? (
              <div className="py-20 flex justify-center items-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Quizzes</h2>
                    <p className="text-xs text-slate-400 mt-1">{quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''} generated</p>
                  </div>
                  <Button onClick={() => setShowQuizModal(true)} isLoading={genLoading} icon={Plus} size="sm">
                    Generate Quiz
                  </Button>
                </div>

                {quizzes.length === 0 ? (
                  /* Empty state */
                  <div className="text-center py-16 max-w-sm mx-auto text-slate-400">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 border border-primary/20">
                      <Brain className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">No Quizzes Yet</h3>
                    <p className="text-sm mb-6">Generate multiple-choice quizzes to test your understanding of the document.</p>
                    <Button onClick={() => setShowQuizModal(true)} icon={Plus}>
                      Generate First Quiz
                    </Button>
                  </div>
                ) : (
                  /* Quizzes Grid */
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {quizzes.map((quiz) => {
                      const quizId = quiz._id || quiz.id;
                      return (
                        <div
                          key={quizId}
                          className="bg-slate-50 border border-slate-200 rounded-3xl p-6 hover:border-primary/30 transition-all duration-300 group relative flex flex-col justify-between"
                        >
                          {/* Delete */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteQuiz(quizId);
                            }}
                            className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-danger hover:bg-danger/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div>
                            <div className="flex justify-between items-start mb-4">
                              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                                <Brain className="w-5 h-5" />
                              </div>
                              {quiz.isCompleted && (
                                <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-lg border border-primary/20">
                                  Score: {quiz.score}/{quiz.totalQuestions}
                                </span>
                              )}
                            </div>
                            <h4 className="font-bold text-slate-900 text-base leading-tight pr-6">{quiz.title}</h4>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-2">CREATED {formatDate(quiz.createdAt)}</p>
                          </div>

                          <div className="mt-6 pt-4 border-t border-slate-200/40 flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-600">
                              {quiz.totalQuestions} Questions
                            </span>
                            
                            {quiz.isCompleted ? (
                              <button
                                onClick={() => navigate(`/quiz/result/${quiz.resultId}`)}
                                className="px-4 py-2 border border-slate-200 hover:border-primary text-slate-600 hover:text-primary bg-transparent hover:bg-primary/5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                              >
                                View Results
                              </button>
                            ) : (
                              <button
                                onClick={() => navigate(`/quiz/${quizId}`)}
                                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-semibold shadow-md shadow-primary/20 transition-all cursor-pointer"
                              >
                                Start Quiz
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary Modal Popup */}
      <Modal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        title="Generated Summary"
      >
        <div className="space-y-4">
          <div className="prose-light text-sm max-h-[450px] overflow-y-auto pr-2">
            <ReactMarkdown>{summary}</ReactMarkdown>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <Button variant="outline" size="sm" onClick={() => handleCopy(summary)}>
              Copy to Clipboard
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowSummaryModal(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Quiz Modal Popup */}
      <Modal
        isOpen={showQuizModal}
        onClose={() => setShowQuizModal(false)}
        title="Generate New Quiz"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Number of Questions</label>
            <input
              type="number"
              min="5"
              max="20"
              value={quizQuestionsCount}
              onChange={(e) => setQuizQuestionsCount(parseInt(e.target.value) || 5)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-semibold"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={() => setShowQuizModal(false)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateQuiz}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white shadow-md shadow-primary/20 transition-all text-xs font-semibold cursor-pointer"
            >
              Generate
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default DocumentViewPage;

