/**
 * NoteEditorModal - Popup de edição de notas com todas as funcionalidades
 * Inclui: fechar, maximizar, minimizar, TTS, tags, export
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Minus,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Pin,
  PinOff,
  Save,
  Tag as TagIcon,
  Download,
  Share2,
  Trash2,
  Sparkles,
  Play,
  Pause,
  Square,
  RotateCcw,
  Clock
} from 'lucide-react';
import { Note, Tag } from '../types';
import { storage } from '../StorageService';
import { speakText, stopSpeaking, isTTSSupported, isCurrentlySpeaking } from '../services/ttsService';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | boolean | undefined)[]) {
  return twMerge(clsx(inputs));
}

interface NoteEditorModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Note) => void;
  onDelete?: (noteId: string) => void;
  availableTags?: Tag[];
}

type WindowState = 'normal' | 'maximized' | 'minimized';

export const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  note,
  isOpen,
  onClose,
  onSave,
  onDelete,
  availableTags = []
}) => {
  const [windowState, setWindowState] = useState<WindowState>('normal');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [pinned, setPinned] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'tts'>('edit');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setSelectedTags(note.tags || []);
      setPinned(note.pinned || false);
      setLastSaved(note.updatedAt ? new Date(note.updatedAt) : null);
    } else {
      setTitle('');
      setContent('');
      setSelectedTags([]);
      setPinned(false);
      setLastSaved(null);
    }
    setWindowState('normal');
  }, [note]);

  useEffect(() => {
    if (isOpen && editorRef.current) {
      editorRef.current.focus();
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!note) return;
    
    setIsSaving(true);
    try {
      const updatedNote: Note = {
        ...note,
        title: title || 'Sem título',
        content,
        tags: selectedTags,
        pinned,
        updatedAt: Date.now()
      };
      await storage.saveNote(updatedNote);
      onSave(updatedNote);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (isCurrentlySpeaking()) {
      stopSpeaking();
      setIsSpeaking(false);
    }
    onClose();
  };

  const toggleMaximize = () => {
    setWindowState(prev => prev === 'maximized' ? 'normal' : 'maximized');
  };

  const toggleMinimize = () => {
    setWindowState(prev => prev === 'minimized' ? 'normal' : 'minimized');
  };

  const toggleTTS = async () => {
    if (!isTTSSupported) return;
    
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      try {
        const textToRead = title ? `${title}. ${content}` : content;
        await speakText(textToRead, { rate: 0.85, lang: 'pt-BR' });
      } catch (e) {
        console.error('TTS erro:', e);
      } finally {
        setIsSpeaking(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
    if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  if (!isOpen) return null;

  const isMaximized = windowState === 'maximized';
  const isMinimized = windowState === 'minimized';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />
        
        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ 
            scale: isMinimized ? 0.5 : 1, 
            opacity: 1,
            x: isMinimized ? '100vw' : 0,
            y: isMinimized ? '100vh' : 0
          }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={cn(
            "relative bg-[var(--bg-bible)] rounded-2xl shadow-2xl overflow-hidden flex flex-col",
            "transition-all duration-300",
            isMaximized ? "w-screen h-screen rounded-none" : "w-[90vw] h-[85vh] max-w-5xl",
            isMinimized ? "fixed bottom-4 right-4 w-80 h-12 rounded-xl" : "fixed"
          )}
          onKeyDown={handleKeyDown}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[var(--surface-1)] border-b border-[var(--border-bible)]">
            <div className="flex items-center gap-3 flex-1">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título da nota..."
                className="flex-1 bg-transparent text-lg font-semibold text-[var(--text-bible)] placeholder:text-[var(--text-bible-muted)] focus:outline-none"
              />
              {lastSaved && (
                <span className="text-xs text-[var(--text-bible-muted)] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {lastSaved.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {/* Minimize */}
              <button
                onClick={toggleMinimize}
                className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors"
                title="Minimizar"
              >
                <Minus className="w-4 h-4 text-[var(--text-bible-muted)]" />
              </button>
              
              {/* Maximize */}
              <button
                onClick={toggleMaximize}
                className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors"
                title={isMaximized ? "Restaurar" : "Maximizar"}
              >
                {isMaximized ? (
                  <Minimize2 className="w-4 h-4 text-[var(--text-bible-muted)]" />
                ) : (
                  <Maximize2 className="w-4 h-4 text-[var(--text-bible-muted)]" />
                )}
              </button>
              
              {/* Close */}
              <button
                onClick={handleClose}
                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                title="Fechar"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 px-4 py-2 bg-[var(--surface-1)] border-b border-[var(--border-bible)]">
            <button
              onClick={() => setActiveTab('edit')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
                activeTab === 'edit' 
                  ? "bg-[var(--accent-bible)] text-white" 
                  : "bg-[var(--surface-2)] text-[var(--text-bible-muted)] hover:bg-[var(--surface-3)]"
              )}
            >
              Editar
            </button>
            <button
              onClick={() => setActiveTab('tts')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2",
                activeTab === 'tts' 
                  ? "bg-[var(--accent-bible)] text-white" 
                  : "bg-[var(--surface-2)] text-[var(--text-bible-muted)] hover:bg-[var(--surface-3)]"
              )}
            >
              <Volume2 className="w-4 h-4" />
              TTS
            </button>
          </div>

          {/* Content */}
          {!isMinimized && (
            <>
              {activeTab === 'edit' ? (
                <>
                  {/* Toolbar */}
                  <div className="flex items-center justify-between px-4 py-2 bg-[var(--surface-1)] border-b border-[var(--border-bible)]">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPinned(!pinned)}
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          pinned 
                            ? "bg-[var(--accent-bible)]/10 text-[var(--accent-bible)]" 
                            : "hover:bg-[var(--surface-2)] text-[var(--text-bible-muted)]"
                        )}
                        title={pinned ? "Desafixar" : "Fixar"}
                      >
                        {pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                      </button>
                      
                      {availableTags.length > 0 && (
                        <div className="flex items-center gap-1 ml-2">
                          <TagIcon className="w-4 h-4 text-[var(--text-bible-muted)]" />
                          {availableTags.slice(0, 5).map(tag => (
                            <button
                              key={tag.id}
                              onClick={() => {
                                setSelectedTags(prev => 
                                  prev.includes(tag.id) 
                                    ? prev.filter(t => t !== tag.id)
                                    : [...prev, tag.id]
                                );
                              }}
                              className={cn(
                                "px-2 py-1 rounded-full text-xs font-semibold transition-all",
                                selectedTags.includes(tag.id)
                                  ? "ring-2 ring-offset-1"
                                  : "opacity-60 hover:opacity-100"
                              )}
                              style={{
                                backgroundColor: tag.background,
                                color: tag.textColor
                              }}
                            >
                              {tag.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {isTTSSupported && (
                        <button
                          onClick={toggleTTS}
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            isSpeaking 
                              ? "bg-orange-100 dark:bg-orange-900/30 text-orange-500" 
                              : "hover:bg-[var(--surface-2)] text-[var(--text-bible-muted)]"
                          )}
                          title={isSpeaking ? "Parar" : "Ouvir nota"}
                        >
                          {isSpeaking ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-3 py-2 bg-[var(--accent-bible)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--accent-bible-strong)] transition-colors disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        {isSaving ? 'Salvando...' : 'Salvar'}
                      </button>
                    </div>
                  </div>

                  {/* Editor */}
                  <div className="flex-1 overflow-hidden p-4">
                    <textarea
                      ref={editorRef}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Escreva sua nota aqui..."
                      className="w-full h-full bg-transparent text-[var(--text-bible)] placeholder:text-[var(--text-bible-muted)] resize-none focus:outline-none text-base leading-relaxed"
                    />
                  </div>
                </>
              ) : (
                /* TTS Tab */
                <div className="flex-1 overflow-auto p-6">
                  <div className="max-w-md mx-auto space-y-6">
                    <div className="text-center p-8 rounded-2xl bg-[var(--surface-1)] border border-[var(--border-bible)]">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[var(--accent-bible)]/10 flex items-center justify-center">
                        <Volume2 className="w-10 h-10 text-[var(--accent-bible)]" />
                      </div>
                      <h3 className="text-lg font-bold text-[var(--text-bible)] mb-2">
                        Text-to-Speech
                      </h3>
                      <p className="text-sm text-[var(--text-bible-muted)] mb-4">
                        Ouça sua nota sendo lida em voz alta
                      </p>
                      <button
                        onClick={toggleTTS}
                        disabled={!isTTSSupported || !content}
                        className={cn(
                          "w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all",
                          isSpeaking 
                            ? "bg-red-500 text-white hover:bg-red-600"
                            : "bg-[var(--accent-bible)] text-white hover:bg-[var(--accent-bible-strong)]",
                          (!isTTSSupported || !content) && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {isSpeaking ? (
                          <>
                            <Pause className="w-5 h-5" />
                            Parar
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5" />
                            Ouvir Nota
                          </>
                        )}
                      </button>
                      {!isTTSSupported && (
                        <p className="text-xs text-red-500 mt-2">
                          TTS não disponível neste navegador
                        </p>
                      )}
                    </div>

                    {/* Preview */}
                    {content && (
                      <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border-bible)]">
                        <h4 className="text-sm font-semibold text-[var(--text-bible)] mb-2">Prévia:</h4>
                        <p className="text-sm text-[var(--text-bible-muted)] line-clamp-3">
                          {title && <strong>{title}. </strong>}
                          {content.substring(0, 200)}
                          {content.length > 200 && '...'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Footer quando minimizado */}
          {isMinimized && (
            <div className="flex items-center justify-between px-4">
              <span className="text-sm font-semibold text-[var(--text-bible)] truncate">
                {title || 'Nota'}
              </span>
              <div className="flex items-center gap-2">
                {isSpeaking && (
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                )}
                <button
                  onClick={toggleMaximize}
                  className="p-1 hover:bg-[var(--surface-2)] rounded transition-colors"
                >
                  <Maximize2 className="w-4 h-4 text-[var(--text-bible-muted)]" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};