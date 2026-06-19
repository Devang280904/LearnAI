import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, Heart, Trash2, ChevronLeft, ChevronRight,
  RotateCcw, Shuffle, Search, X, BookOpen, Star, Trash
} from 'lucide-react';
import toast from 'react-hot-toast';
import flashcardService from '../services/flashcardService';
import Button from '../components/ui/Button';
import { CardSkeleton } from '../components/ui/Skeleton';
import useDebounce from '../hooks/useDebounce';

// Sparkles icon for Study button
const Sparkles = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5 5 3Z" />
    <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z" />
  </svg>
);

// TrendUp icon for Progress Badge
const TrendUp = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

// Study flip card component
const StudyCard = ({ card, onFavorite }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset flip when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [card]);

  const cardId = card._id || card.id;
  const isStarred = card.favorite === true;

  return (
    <div
      className="perspective-1000 w-full h-[320px] cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 150 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front Side */}
        <div
          className="absolute inset-0 bg-white border border-slate-200 rounded-3xl p-8 flex flex-col justify-between shadow-sm"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 bg-[#F8FAFC] border border-slate-200 px-3 py-1.5 rounded-xl uppercase tracking-wider">
              {card.difficulty || 'MEDIUM'}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFavorite(cardId);
              }}
              className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-warning transition-colors"
            >
              <Star className={`w-5 h-5 ${isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center py-4">
            <p className="text-slate-900 text-lg font-bold text-center leading-relaxed">
              {card.question}
            </p>
          </div>

          <p className="text-xs font-semibold text-slate-400 text-center">
            Click to reveal answer
          </p>
        </div>

        {/* Back Side */}
        <div
          className="absolute inset-0 bg-[#00B69B] rounded-3xl p-8 flex flex-col justify-between shadow-md text-white"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white/90 bg-white/20 border border-white/10 px-3 py-1.5 rounded-xl tracking-wider">
              ANSWER
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center py-4">
            <p className="text-white text-lg font-bold text-center leading-relaxed">
              {card.answer}
            </p>
          </div>

          <p className="text-xs font-semibold text-white/80 text-center">
            Click to flip back
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const FlashcardsPage = () => {
  const navigate = useNavigate();
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSetKey, setActiveSetKey] = useState(null);
  const [studyIndex, setStudyIndex] = useState(0);
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    fetchFlashcards();
  }, []);

  const fetchFlashcards = async () => {
    try {
      const res = await flashcardService.getAll();
      setFlashcards(res.data || res.flashcards || res || []);
    } catch (error) {
      console.error('Failed to fetch flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async (id) => {
    try {
      await flashcardService.toggleFavorite(id);
      setFlashcards(prev => prev.map((card) => {
        const cardId = card._id || card.id;
        return cardId === id ? { ...card, favorite: !card.favorite } : card;
      }));
      toast.success('Updated favorite!');
    } catch (error) {
      toast.error('Failed to update favorite');
    }
  };

  const handleDeleteSet = async (setKey) => {
    if (!confirm('Are you sure you want to delete this flashcard set?')) return;
    const setToDelete = getFlashcardSets().find(s => s.key === setKey);
    if (!setToDelete) return;
    try {
      await Promise.all(setToDelete.cards.map(c => flashcardService.delete(c._id || c.id)));
      toast.success('Flashcard set deleted');
      setFlashcards(prev => prev.filter(c => {
        const key = new Date(c.createdAt).toISOString().slice(0, 16);
        return key !== setKey;
      }));
      if (activeSetKey === setKey) {
        setActiveSetKey(null);
      }
    } catch (error) {
      toast.error('Failed to delete flashcard set');
    }
  };

  // Group all flashcards by creation minute
  const getFlashcardSets = () => {
    const sets = {};
    flashcards.forEach((card) => {
      // Group by YYYY-MM-DDTHH:MM
      const key = new Date(card.createdAt).toISOString().slice(0, 16);
      if (!sets[key]) {
        sets[key] = [];
      }
      sets[key].push(card);
    });

    return Object.keys(sets).map((key) => {
      const cards = sets[key];
      const reviewedCount = cards.filter(c => (c.reviewCount || 0) > 0).length;
      return {
        key,
        date: new Date(cards[0].createdAt),
        cards,
        reviewedCount,
        documentTitle: cards[0]?.document?.title || 'Document',
        documentId: cards[0]?.document?._id || cards[0]?.document || '',
      };
    }).sort((a, b) => b.date - a.date);
  };

  const getRelativeTimeString = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'CREATED JUST NOW';
    if (diffMins < 60) return `CREATED ${diffMins} MINUTES ${diffMins === 1 ? 'AGO' : 'AGO'}`;
    if (diffHours < 24) return `CREATED ${diffHours} HOURS ${diffHours === 1 ? 'AGO' : 'AGO'}`;
    if (diffDays < 7) return `CREATED ${diffDays} DAYS ${diffDays === 1 ? 'AGO' : 'AGO'}`;
    return `CREATED ON ${date.toLocaleDateString().toUpperCase()}`;
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-shimmer h-8 w-48 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  const flashcardSets = getFlashcardSets();
  const activeSet = flashcardSets.find(s => s.key === activeSetKey);
  const activeSetCards = activeSet ? activeSet.cards : [];

  // Filter sets based on debounced search query
  const filteredSets = flashcardSets.filter((set) => {
    if (!debouncedSearch) return true;
    const q = debouncedSearch.toLowerCase();
    return (
      set.documentTitle.toLowerCase().includes(q) ||
      set.cards.some(c => (c.question || '').toLowerCase().includes(q) || (c.answer || '').toLowerCase().includes(q))
    );
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <AnimatePresence mode="wait">
        {!activeSetKey ? (
          /* Grid of Flashcard Sets */
          <motion.div
            key="grid-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-slate-900">All Flashcard Sets</h1>
              <p className="text-slate-500 text-sm mt-1">
                {flashcardSets.length} set{flashcardSets.length !== 1 ? 's' : ''} available in your library
              </p>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by document name or card contents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm shadow-sm"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {filteredSets.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl shadow-sm">
                <div className="p-4 bg-[#E6FAF5] rounded-full w-fit mx-auto mb-4">
                  <BookOpen className="w-10 h-10 text-[#00B69B]" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  No Flashcard Sets Yet
                </h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
                  {searchQuery ? 'No sets match your search terms.' : 'Please generate flashcards first by opening a document and selecting the Flashcards tab.'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => navigate('/documents')} className="bg-[#00B69B] hover:bg-[#009982] text-white">
                    Generate Flashcards
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredSets.map((set, index) => {
                  const progressPercentage = Math.round((set.reviewedCount / set.cards.length) * 100);

                  return (
                    <motion.div
                      key={set.key}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white border border-slate-200 rounded-3xl p-5 hover:border-[#00B69B]/40 hover:shadow-md transition-all duration-300 relative group"
                    >
                      {/* Set book icon and details */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="p-2.5 bg-[#E6FAF5] text-[#00B69B] rounded-xl shrink-0">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug">
                            {set.documentTitle}
                          </h3>
                          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                            {getRelativeTimeString(set.date)}
                          </p>
                        </div>
                      </div>

                      {/* Badges row */}
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span className="px-2.5 py-1 text-[10px] font-bold text-slate-500 bg-[#F8FAFC] border border-slate-200 rounded-lg">
                          {set.cards.length} Cards
                        </span>
                        {set.reviewedCount > 0 && (
                          <span className="flex items-center gap-0.5 px-2.5 py-1 rounded-lg bg-[#E6FAF5] border border-[#B3F0E1] text-[#00B69B] text-[10px] font-extrabold">
                            <TrendUp className="w-3 h-3" />
                            {progressPercentage}%
                          </span>
                        )}
                      </div>

                      {/* Progress bar info */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                          <span className="text-slate-400">Progress</span>
                          <span>{set.reviewedCount}/{set.cards.length} reviewed</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#00B69B] rounded-full"
                            style={{ width: `${(set.reviewedCount / set.cards.length) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Study button */}
                      <button
                        onClick={() => {
                          setActiveSetKey(set.key);
                          setStudyIndex(0);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 mt-5 bg-[#E6FAF5] hover:bg-[#D1F7EC] text-[#00B69B] rounded-xl text-xs font-bold border border-[#B3F0E1]/40 transition-all duration-200 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#00B69B]" /> Study Now
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : (
          /* Single Set Study Mode */
          <motion.div
            key="study-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-5 max-w-xl mx-auto"
          >
            {/* Header controls */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActiveSetKey(null)}
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Back to Sets
              </button>
              <Button
                onClick={() => handleDeleteSet(activeSetKey)}
                variant="danger"
                size="sm"
                icon={Trash2}
                className="px-3 py-1.5 text-xs font-bold rounded-xl"
              >
                Delete Set
              </Button>
            </div>

            {/* Set document Title */}
            <h2 className="text-xl font-bold text-slate-900">
              {activeSet?.documentTitle}
            </h2>

            {/* Progress status */}
            <div className="text-center text-sm font-semibold text-slate-500">
              {studyIndex + 1} of {activeSetCards.length}
            </div>

            {/* Study Flipping Card */}
            <div className="py-2">
              {activeSetCards.length > 0 && (
                <StudyCard
                  card={activeSetCards[studyIndex]}
                  onFavorite={handleFavorite}
                />
              )}
            </div>

            {/* Navigation button controls */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                onClick={() => setStudyIndex(prev => Math.max(0, prev - 1))}
                disabled={studyIndex === 0}
                icon={ChevronLeft}
                className="rounded-xl px-5 py-2"
              >
                Previous
              </Button>

              <Button
                variant="outline"
                onClick={() => setStudyIndex(prev => Math.min(activeSetCards.length - 1, prev + 1))}
                disabled={studyIndex === activeSetCards.length - 1}
                icon={ChevronRight}
                iconPosition="right"
                className="rounded-xl px-5 py-2"
              >
                Next
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FlashcardsPage;

