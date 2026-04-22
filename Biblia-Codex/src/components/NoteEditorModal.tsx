import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Palette,
  Pin,
  PinOff,
  Plus,
  Save,
  Search,
  Share2,
  Trash2,
  BookOpen,
  Sparkles,
  Edit3,
  Clock,
  Hash,
  FolderOpen,
  ArrowRight,
  X,
  Check,
  Printer,
  FileSpreadsheet,
  Globe,
  File,
  Tag as TagIcon,
  ChevronRight,
  Maximize2,
  Minimize2,
  Expand,
  Shrink
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Note, Tag } from '../../types';
import { storage } from '../../StorageService';
import { RichTextEditor } from './RichTextEditor';
import { useAppContext } from '../../AppContext';
import { getStoredGoogleAccessToken, loginWithGoogle } from '../../firebase';
import { exportNoteToGoogleDocs } from '../../services/googleDocsService';
import { exportNote, type ExportFormat } from '../../services/ExportService';
import { TagService, PALETTE } from '../../services/TagService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NoteEditorModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Note) => void;
  onDelete: (noteId: string) => void;
  availableTags: Tag[];
}

export const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  note,
  isOpen,
  onClose,
  onSave,
  onDelete,
  availableTags
}) => {
  const { user } = useAppContext();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'dirty'>('saved');
  const [tagInput, setTagInput] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [stats, setStats] = useState({ words: 0, chars: 0, lines: 0 });
  const dirtyRef = useRef(false);

  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  useEffect(() => {
    if (note) {
      setTagInput('');
      dirtyRef.current = false;
      setSaveState('saved');

      const text = stripHtml(note.content);
      setStats({
        words: text ? text.split(/\s+/).length : 0,
        chars: text.length,
        lines: (note.content.match(/<br\/?>/g) || []).length + 1,
      });
    }
  }, [note]);

  const handleAutoSave = async (noteToSave: Note) => {
    if (!noteToSave || !dirtyRef.current) return;

    setSaveState('saving');
    try {
      await storage.saveNote(noteToSave);
      setSaveState('saved');
      dirtyRef.current = false;
      onSave(noteToSave);
    } catch (error) {
      console.error('Error saving note:', error);
      setSaveState('dirty');
    }
  };

  const handleContentChange = (html: string) => {
    if (!note) return;

    dirtyRef.current = true;
    setSaveState('dirty');
    const updatedNote = { ...note, content: html, updatedAt: Date.now() };

    // Update stats
    const text = stripHtml(html);
    setStats({
      words: text ? text.split(/\s+/).length : 0,
      chars: text.length,
      lines: (html.match(/<br\/?>/g) || []).length + 1,
    });
  };

  const handleTitleChange = (title: string) => {
    if (!note) return;

    dirtyRef.current = true;
    setSaveState('dirty');
    const updatedNote = { ...note, title, updatedAt: Date.now() };
  };

  const handleManualSave = async () => {
    if (!note) return;

    await handleAutoSave(note);
  };

  const handleDelete = async () => {
    if (!note) return;
    if (!window.confirm('Excluir esta nota permanentemente?')) return;

    try {
      await storage.deleteNote(note.id);
      onDelete(note.id);
      onClose();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleExport = async (format: ExportFormat) => {
    if (!note) return;

    try {
      await exportNote(note.title, note.content, format);
    } catch (error) {
      console.error('Error exporting note:', error);
    }
  };

  const handleGoogleExport = async () => {
    if (!note || !user) return;

    try {
      const token = await getStoredGoogleAccessToken();
      if (!token) {
        await loginWithGoogle();
        return;
      }
      await exportNoteToGoogleDocs(note, token);
    } catch (error) {
      console.error('Error exporting to Google Docs:', error);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      setIsMaximized(false);
    }
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const filteredTags = useMemo(() => {
    if (!tagInput.trim()) return availableTags;
    return availableTags.filter(tag =>
      tag.name.toLowerCase().includes(tagInput.toLowerCase())
    );
  }, [availableTags, tagInput]);

  const addTag = (tagId: string) => {
    if (!note) return;

    const updatedNote = { ...note, tags: [...new Set([...note.tags, tagId])] };
    dirtyRef.current = true;
    setSaveState('dirty');
  };

  const removeTag = (tagId: string) => {
    if (!note) return;

    const updatedNote = { ...note, tags: note.tags.filter(t => t !== tagId) };
    dirtyRef.current = true;
    setSaveState('dirty');
  };

  if (!note) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center p-4",
            "bg-black/50 backdrop-blur-sm"
          )}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{
              scale: isFullscreen ? 1 : isMaximized ? 0.95 : 0.8,
              opacity: 1
            }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl",
              "border border-gray-200 dark:border-gray-700",
              "flex flex-col",
              isFullscreen
                ? "w-screen h-screen max-w-none max-h-none rounded-none"
                : isMaximized
                ? "w-[95vw] h-[95vh]"
                : "w-full max-w-6xl h-[90vh]"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-t-2xl">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Editor de Notas</span>
                </div>
                <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
                <input
                  type="text"
                  value={note.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="flex-1 bg-transparent border-0 outline-none text-xl font-bold text-gray-900 dark:text-white placeholder-gray-500"
                  placeholder="Título da nota..."
                />
              </div>

              <div className="flex items-center gap-2">
                {/* Save Status */}
                <div className="flex items-center gap-2 text-xs">
                  {saveState === 'saving' && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span>Salvando...</span>
                    </div>
                  )}
                  {saveState === 'saved' && (
                    <div className="flex items-center gap-1 text-green-600">
                      <Check className="w-3 h-3" />
                      <span>Salvo</span>
                    </div>
                  )}
                  {saveState === 'dirty' && (
                    <div className="flex items-center gap-1 text-orange-600">
                      <Clock className="w-3 h-3" />
                      <span>Não salvo</span>
                    </div>
                  )}
                </div>

                {/* Window Controls */}
                <button
                  onClick={toggleMaximize}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title={isMaximized ? "Restaurar" : "Maximizar"}
                >
                  {isMaximized ? <Shrink className="w-4 h-4" /> : <Expand className="w-4 h-4" />}
                </button>

                <button
                  onClick={toggleFullscreen}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title={isFullscreen ? "Sair do fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={onClose}
                  className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500 hover:text-red-600" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar */}
              <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
                {/* Stats */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Estatísticas</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Palavras:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{stats.words}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Caracteres:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{stats.chars}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Linhas:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{stats.lines}</span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Etiquetas</h3>

                  {/* Current Tags */}
                  <div className="space-y-2 mb-4">
                    {note.tags.map(tagId => {
                      const tag = availableTags.find(t => t.id === tagId);
                      if (!tag) return null;
                      return (
                        <div key={tagId} className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: tag.background, color: tag.textColor }}>
                          <span className="text-xs font-medium">{tag.name}</span>
                          <button
                            onClick={() => removeTag(tagId)}
                            className="w-4 h-4 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center"
                          >
                            <X className="w-2 h-2" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Tag */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Adicionar etiqueta..."
                      value={tagInput}
                      onChange={(e) => {
                        setTagInput(e.target.value);
                        setShowTagDropdown(true);
                      }}
                      onFocus={() => setShowTagDropdown(true)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    {showTagDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                        {filteredTags.map(tag => (
                          <button
                            key={tag.id}
                            onClick={() => {
                              addTag(tag.id);
                              setTagInput('');
                              setShowTagDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm"
                            style={{ color: tag.textColor }}
                          >
                            {tag.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Ações</h3>

                  <button
                    onClick={handleManualSave}
                    disabled={saveState === 'saving'}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    Salvar Agora
                  </button>

                  <button
                    onClick={() => handleExport('pdf')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Download className="w-4 h-4" />
                    Exportar PDF
                  </button>

                  <button
                    onClick={() => handleExport('docx')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <FileText className="w-4 h-4" />
                    Exportar DOCX
                  </button>

                  {user && (
                    <button
                      onClick={handleGoogleExport}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      <Globe className="w-4 h-4" />
                      Google Docs
                    </button>
                  )}

                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir Nota
                  </button>
                </div>
              </div>

              {/* Editor */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 p-6 overflow-y-auto">
                  <RichTextEditor
                    value={note.content}
                    onChange={handleContentChange}
                    placeholder="Comece a escrever sua nota..."
                    theme={note.theme}
                    fontFamily={note.fontFamily}
                    fontSize={note.fontSize}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};