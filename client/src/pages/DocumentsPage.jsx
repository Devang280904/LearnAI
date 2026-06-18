import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Upload, FileText, Trash2,
  Brain, X, CloudUpload,
  BookOpen, Plus, Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import documentService from '../services/documentService';
import useDebounce from '../hooks/useDebounce';
import Modal from '../components/ui/Modal';
import { CardSkeleton } from '../components/ui/Skeleton';
import { formatFileSize, formatRelativeTime } from '../utils/formatters';

const DocumentsPage = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentTitle, setDocumentTitle] = useState('');
  const fileInputRef = useRef(null);
  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (debouncedSearch) {
      handleSearch(debouncedSearch);
    } else {
      fetchDocuments();
    }
  }, [debouncedSearch]);

  const fetchDocuments = async () => {
    try {
      const res = await documentService.getAll();
      setDocuments(res.data || res.documents || res || []);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    try {
      setLoading(true);
      const res = await documentService.search(query);
      setDocuments(res.data || res.documents || res || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files?.[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be under 50MB');
      return;
    }
    setSelectedFile(file);
    setDocumentTitle(file.name.replace(/\.pdf$/i, ''));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('document', selectedFile);
    formData.append('title', documentTitle);

    try {
      await documentService.upload(formData, (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(progress);
      });
      toast.success('Document uploaded successfully!');
      setShowUpload(false);
      setSelectedFile(null);
      setUploadProgress(0);
      fetchDocuments();
    } catch (error) {
      const message = error.response?.data?.message || 'Upload failed';
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await documentService.delete(id);
      toast.success('Document deleted');
      setDocuments(documents.filter((d) => (d._id || d.id) !== id));
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 min-w-0"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 min-w-0">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-slate-900 leading-tight tracking-tight">My Documents</h1>
          <p className="text-slate-500 text-[15px] mt-1">
            Manage and organize your learning materials
          </p>
        </div>
        <button 
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-primary/20 shrink-0 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Upload Document
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative min-w-0">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8 min-w-0">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-24 bg-white border border-slate-200 rounded-3xl min-w-0"
        >
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-[#24A0ED]/10 rounded-2xl flex items-center justify-center border border-[#24A0ED]/20">
              <FileText className="w-10 h-10 text-[#24A0ED]" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {searchQuery ? 'No results found' : 'No documents yet'}
          </h3>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">
            {searchQuery
              ? 'Try a different search term or clear the search filter'
              : 'Upload your first PDF to start extracting knowledge and generating quizzes!'}
          </p>
          {!searchQuery && (
            <button 
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-sm shadow-primary/20 mx-auto cursor-pointer"
            >
              <Upload className="w-5 h-5" />
              Upload Your First Document
            </button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 min-w-0">
          <AnimatePresence>
            {documents.map((doc, index) => {
              const docId = doc._id || doc.id;
              return (
                <motion.div
                  key={docId}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.04 }}
                  className="bg-white border border-slate-200 rounded-3xl p-6 hover:border-[#24A0ED]/50 hover:shadow-lg transition-all duration-300 group relative flex flex-col justify-between min-w-0"
                >
                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Are you sure you want to delete this document?')) {
                        handleDelete(docId);
                      }
                    }}
                    className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div
                    className="cursor-pointer flex flex-col h-full justify-between"
                    onClick={() => navigate(`/documents/${docId}`)}
                  >
                    <div>
                      {/* Icon */}
                      <div className="flex items-center justify-center w-12 h-12 bg-[#24A0ED] rounded-xl mb-5 text-white shrink-0 shadow-sm shadow-[#24A0ED]/30">
                        <FileText className="w-6 h-6 text-white" />
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-slate-900 text-[17px] mb-1.5 line-clamp-2 leading-tight">
                        {doc.title || 'Untitled Document'}
                      </h3>

                      {/* Meta File Size */}
                      <p className="text-[13px] font-medium text-slate-500 mb-6">
                        {formatFileSize(doc.filesize || doc.fileSize || doc.size)}
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Count Badges */}
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold bg-slate-100 text-slate-600 rounded-lg border border-slate-200">
                          <BookOpen className="w-3.5 h-3.5" />
                          {doc.flashcardCount || 0} Flashcards
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold bg-[#E6FAF5] text-[#00B69B] rounded-lg border border-[#B3F0E1]">
                          <Brain className="w-3.5 h-3.5" />
                          {doc.quizCount || 0} Quizzes
                        </span>
                      </div>

                      {/* Relative Upload Time */}
                      <div className="flex items-center justify-between text-[13px] text-slate-500 border-t border-slate-100 pt-4">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>{formatRelativeTime(doc.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Upload Modal */}
      <Modal isOpen={showUpload} onClose={() => { setShowUpload(false); setSelectedFile(null); setUploadProgress(0); }} title="Upload New Document">
        <div className="space-y-6">
          {/* Document Title input */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Document Title
            </label>
            <input
              type="text"
              placeholder="Enter document title"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[15px]"
            />
          </div>

          {/* Dotted upload zone */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              PDF File
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200
                ${dragActive
                  ? 'border-primary bg-primary/10'
                  : 'border-[#00B69B]/40 bg-[#E6FAF5]/30 hover:border-primary hover:bg-primary/5'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />
              <div className="w-16 h-16 bg-white text-[#00B69B] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm shadow-black/5">
                <CloudUpload className="w-8 h-8 text-[#00B69B]" />
              </div>
              <p className="text-slate-900 text-sm font-bold">
                {selectedFile ? selectedFile.name : (dragActive ? 'Drop your PDF here' : 'Select PDF file')}
              </p>
              <p className="text-xs text-slate-400 mt-1">PDF up to 50MB</p>
            </div>
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-slate-500">Uploading...</span>
                <span className="text-primary">{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
            <button
              onClick={() => { setShowUpload(false); setSelectedFile(null); setUploadProgress(0); }}
              className="flex-1 py-3 px-4 bg-white border border-slate-200 rounded-xl text-[15px] font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="flex-1 py-3 px-4 bg-primary hover:bg-primary-dark text-white rounded-xl text-[15px] font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-sm shadow-primary/20"
            >
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default DocumentsPage;
