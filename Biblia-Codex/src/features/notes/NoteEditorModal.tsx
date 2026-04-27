/**
 * NoteEditorModal - Popup de edição de notas avançada
 * Inclui: fechar, maximizar, minimizar, TTS, tags, toolbar rica, parsing de versículos
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Minus, Maximize2, Minimize2, Volume2, VolumeX, Pin, PinOff,
  Save, Tag as TagIcon, Download, Share2, Trash2, Sparkles, Play, Pause,
  Clock, Bold, Italic, Underline, Strikethrough, Heading1, Heading2, Heading3,
  List, ListOrdered, CheckSquare, Link2, Palette, Highlighter, Code, Quote,
  AlignLeft, AlignCenter, AlignRight, Undo, Redo, Link, BookOpen,
  ExternalLink, Copy, Trash
} from 'lucide-react';
import { Note, Tag } from '../types';
import { storage } from '../StorageService';
import { speakText, stopSpeaking, isTTSSupported, isCurrentlySpeaking } from '../services/ttsService';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | boolean | undefined)[]) {
  return twMerge(clsx(inputs));
}

interface VerseRef {
  book: string;
  chapter: number;
  verses: string;
  startVerse: number;
  endVerse: number;
  full: string;
}

const BIBLE_BOOKS = [
  'Gênesis', 'Êxodo', 'Levítico', 'Números', 'Deuteronômio', 'Josué', 'Juízes', 'Rute',
  '1 Samuel', '2 Samuel', '1 Reis', '2 Reis', '1 Crônicas', '2 Crônicas', 'Esdras', 'Neemias',
  'Ester', 'Jó', 'Salmos', 'Provérbios', 'Eclesiastes', 'Cânticos', 'Isaías', 'Jeremias',
  'Lamentações', 'Ezequiel', 'Daniel', 'Oséias', 'Joel', 'Amós', 'Obadias', 'Jonas', 'Miquéias',
  'Naum', 'Habacuque', 'Sofonias', 'Ageu', 'Zacarias', 'Malaquias', 'Mateus', 'Marcos',
  'Lucas', 'João', 'Atos', 'Romanos', '1 Coríntios', '2 Coríntios', 'Gálatas', 'Efésios',
  'Filipenses', 'Colossenses', '1 Tessalonicenses', '2 Tessalonicenses', '1 Timóteo', '2 Timóteo',
  'Tito', 'Filemom', 'Hebreus', 'Tiago', '1 Pedro', '2 Pedro', '1 João', '2 João',
  '3 João', 'Judas', 'Apocalipse'
];

const BOOK_ABBREVS: Record<string, string> = {
  'gn': 'Gênesis', 'gen': 'Gênesis', 'ex': 'Êxodo', 'lv': 'Levítico', 'nm': 'Números',
  'dt': 'Deuteronômio', 'js': 'Josué', 'jz': 'Juízes', 'rt': 'Rute', '1sm': '1 Samuel',
  '2sm': '2 Samuel', '1rs': '1 Reis', '2rs': '2 Reis', '1cr': '1 Crônicas', '2cr': '2 Crônicas',
  'ed': 'Esdras', 'ne': 'Neemias', 'et': 'Ester', 'job': 'Jó', 'sl': 'Salmos', 'sal': 'Salmos',
  'pv': 'Provérbios', 'ec': 'Eclesiastes', 'ct': 'Cânticos', 'is': 'Isaías', 'jr': 'Jeremias',
  'lm': 'Lamentações', 'ez': 'Ezequiel', 'dn': 'Daniel', 'os': 'Oséias', 'jl': 'Joel',
  'am': 'Amós', 'ob': 'Obadias', 'jn': 'Jonas', 'mq': 'Miquéias', 'na': 'Naum',
  'hc': 'Habacuque', 'sf': 'Sofonias', 'ag': 'Ageu', 'zc': 'Zacarias', 'ml': 'Malaquias',
  'mt': 'Mateus', 'mc': 'Marcos', 'lc': 'Lucas', 'jo': 'João', 'at': 'Atos', 'rm': 'Romanos',
  '1co': '1 Coríntios', '2co': '2 Coríntios', 'gl': 'Gálatas', 'ef': 'Efésios', 'fp': 'Filipenses',
  'cl': 'Colossenses', '1ts': '1 Tessalonicenses', '2ts': '2 Tessalonicenses', '1tm': '1 Timóteo',
  '2tm': '2 Timóteo', 'tt': 'Tito', 'fm': 'Filemom', 'hb': 'Hebreus', 'tg': 'Tiago',
  '1pe': '1 Pedro', '2pe': '2 Pedro', '1jo': '1 João', '2jo': '2 João', '3jo': '3 João',
  'jd': 'Judas', 'ap': 'Apocalipse'
};

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
  const [htmlContent, setHtmlContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [pinned, setPinned] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'tts'>('edit');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const [selectedVerse, setSelectedVerse] = useState<VerseRef | null>(null);
  const [showVersePopup, setShowVersePopup] = useState(false);
  const [versePopupPos, setVersePopupPos] = useState({ x: 0, y: 0 });
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const colorPaletteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setHtmlContent(note.content || '');
      setSelectedTags(note.tags || []);
      setPinned(note.pinned || false);
      setLastSaved(note.updatedAt ? new Date(note.updatedAt) : null);
    } else {
      setTitle('');
      setContent('');
      setHtmlContent('');
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (colorPaletteRef.current && !colorPaletteRef.current.contains(e.target as Node)) {
        setShowColorPicker(false);
      }
    };
    if (showColorPicker) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showColorPicker]);

  const parseVerseRef = (text: string): VerseRef | null => {
    const patterns = [
      /^([A-Za-zãéíóúâêôûáéíóú]+)\s*(\d+):(\d+)(?:-(\d+))?$/i,
      /^([A-Za-zãéíóúâêôûáéíóú]+)\s+(\d+):(\d+)(?:-(\d+))?$/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        let bookName = match[1].toLowerCase();
        
        if (BOOK_ABBREVS[bookName]) {
          bookName = BOOK_ABBREVS[bookName];
        } else {
          const found = BIBLE_BOOKS.find(b => b.toLowerCase().startsWith(bookName));
          if (found) bookName = found;
          else continue;
        }
        
        const chapter = parseInt(match[2]);
        const startVerse = parseInt(match[3]);
        const endVerse = match[4] ? parseInt(match[4]) : startVerse;
        
        let verses = `${startVerse}`;
        if (endVerse > startVerse) verses += `-${endVerse}`;
        
        return {
          book: bookName,
          chapter,
          verses,
          startVerse,
          endVerse,
          full: `${bookName} ${chapter}:${verses}`
        };
      }
    }
    return null;
  };

  const findVersesInText = useCallback((text: string): VerseRef[] => {
    const verses: VerseRef[] = [];
    const wordRegex = /\b([A-Za-zãéíóúâêôûáéíóú]+)\s*(\d+):(\d+)(?:-(\d+))?\b/g;
    let match;
    
    while ((match = wordRegex.exec(text)) !== null) {
      const verse = parseVerseRef(match[0]);
      if (verse) verses.push(verse);
    }
    
    return verses;
  }, []);

  const handleEditorClick = (e: React.MouseEvent) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    
    const selectedText = selection.toString().trim();
    if (selectedText) {
      const verse = parseVerseRef(selectedText);
      if (verse) {
        const rect = selection.getRangeAt(0).getBoundingClientRect();
        setVersePopupPos({ x: rect.left + rect.width / 2, y: rect.top - 10 });
        setSelectedVerse(verse);
        setShowVersePopup(true);
        return;
      }
    }
    
    setShowVersePopup(false);
    setSelectedVerse(null);
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleBold = () => execCommand('bold');
  const handleItalic = () => execCommand('italic');
  const handleUnderline = () => execCommand('underline');
  const handleStrikethrough = () => execCommand('strikethrough');
  
  const handleHeading = (level: 1 | 2 | 3) => {
    execCommand('formatBlock', `h${level}`);
  };
  
  const handleList = (ordered: boolean) => {
    execCommand(ordered ? 'insertOrderedList' : 'insertUnorderedList');
  };
  
  const handleCheckbox = () => {
    const checkbox = document.createElement('div');
    checkbox.innerHTML = '<input type="checkbox" style="margin-right: 8px;">';
    execCommand('insertHTML', checkbox.innerHTML);
  };
  
  const handleLink = () => {
    const url = prompt('Digite a URL:');
    if (url) execCommand('createLink', url);
  };

  const handleColor = (color: string) => {
    execCommand('foreColor', color);
    setShowColorPicker(false);
  };

  const handleHighlight = (color: string) => {
    execCommand('backColor', color);
  };

  const handleCode = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('code');
      span.style.backgroundColor = 'var(--surface-3)';
      span.style.padding = '2px 4px';
      span.style.borderRadius = '4px';
      span.style.fontFamily = 'monospace';
      try {
        range.surroundContents(span);
      } catch {
        const wrapper = document.createElement('span');
        wrapper.style.backgroundColor = 'var(--surface-3)';
        wrapper.style.padding = '2px 4px';
        wrapper.style.borderRadius = '4px';
        wrapper.style.fontFamily = 'monospace';
        range.cloneContents().querySelectorAll('*').forEach(el => wrapper.appendChild(el));
        range.deleteContents();
        wrapper.textContent = selection.toString();
        range.insertNode(wrapper);
      }
    }
  };

  const handleQuote = () => {
    execCommand('formatBlock', 'blockquote');
  };

  const handleAlign = (align: string) => {
    execCommand(`justify${align}`);
  };

  const handleUndo = () => execCommand('undo');
  const handleRedo = () => execCommand('redo');

  const handleSave = async () => {
    if (!note) return;
    
    const contentText = editorRef.current?.innerText || content;
    
    setIsSaving(true);
    try {
      const updatedNote: Note = {
        ...note,
        title: title || 'Sem título',
        content: contentText,
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
    
    const contentText = editorRef.current?.innerText || content;
    
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      try {
        const textToRead = title ? `${title}. ${contentText}` : contentText;
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

  const handleDelete = () => {
    if (onDelete && note && confirm('Tem certeza que deseja excluir esta nota?')) {
      onDelete(note.id);
      handleClose();
    }
  };

  const handleExport = () => {
    const contentText = editorRef.current?.innerText || content;
    const blob = new Blob([contentText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'nota'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const isMaximized = windowState === 'maximized';
  const isMinimized = windowState === 'minimized';

  const colors = ['#000000', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
  const highlightColors = ['#fff59d', '#ffcc80', '#ef9a9a', '#ce93d8', '#90caf9', '#80deea', '#a5d6a7', '#ffab91'];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
        
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
              <button onClick={toggleMinimize} className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors" title="Minimizar">
                <Minus className="w-4 h-4 text-[var(--text-bible-muted)]" />
              </button>
              <button onClick={toggleMaximize} className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors" title={isMaximized ? "Restaurar" : "Maximizar"}>
                {isMaximized ? <Minimize2 className="w-4 h-4 text-[var(--text-bible-muted)]" /> : <Maximize2 className="w-4 h-4 text-[var(--text-bible-muted)]" />}
              </button>
              <button onClick={handleClose} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Fechar">
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1 px-4 py-2 bg-[var(--surface-1)] border-b border-[var(--border-bible)]">
            <button
              onClick={() => setActiveTab('edit')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
                activeTab === 'edit' ? "bg-[var(--accent-bible)] text-white" : "bg-[var(--surface-2)] text-[var(--text-bible-muted)] hover:bg-[var(--surface-3)]"
              )}
            >
              Editar
            </button>
            <button
              onClick={() => setActiveTab('tts')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2",
                activeTab === 'tts' ? "bg-[var(--accent-bible)] text-white" : "bg-[var(--surface-2)] text-[var(--text-bible-muted)] hover:bg-[var(--surface-3)]"
              )}
            >
              <Volume2 className="w-4 h-4" />
              TTS
            </button>
          </div>

          {!isMinimized && (
            <>
              {activeTab === 'edit' ? (
                <>
                  <div className="flex items-center justify-between px-2 py-2 bg-[var(--surface-1)] border-b border-[var(--border-bible)]">
                    <div className="flex items-center gap-1 flex-wrap">
                      <button onClick={handleUndo} className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors" title="Desfazer">
                        <Undo className="w-4 h-4 text-[var(--text-bible-muted)]" />
                      </button>
                      <button onClick={handleRedo} className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors" title="Refazer">
                        <Redo className="w-4 h-4 text-[var(--text-bible-muted)]" />
                      </button>
                      
                      <div className="w-px h-6 bg-[var(--border-bible)] mx-1" />
                      
                      <button onClick={handleBold} className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors" title="Negrito (Ctrl+B)">
                        <Bold className="w-4 h-4 text-[var(--text-bible-muted)]" />
                      </button>
                      <button onClick={handleItalic} className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors" title="Itálico (Ctrl+I)">
                        <Italic className="w-4 h-4 text-[var(--text-bible-muted)]" />
                      </button>
                      <button onClick={handleUnderline} className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors" title="Sublinhado (Ctrl+U)">
                        <Underline className="w-4 h-4 text-[var(--text-bible-muted)]" />
                      </button>
                      <button onClick={handleStrikethrough} className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors" title="Tachado">
                        <Strikethrough className="w-4 h-4 text-[var(--text-bible-muted)]" />
                      </button>
                      
                      <div className="w-px h-6 bg-[var(--border-bible)] mx-1" />
                      
                      <button onClick={() => handleHeading(1)} className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors" title="Título 1">
                        <Heading1 className="w-4 h-4 text-[var(--text-bible-muted)]" />
                      </button>
                      <button onClick={() => handleHeading(2)} className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors" title="Título 2">
                        <Heading2 className="w-4 h-4 text-[var(--text-bible-muted)]" />
                      </button>
                      <button onClick={() => handleHeading(3)} className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors" title="Título 3">
                        <Heading3 className="w-4 h-4 text-[var(--text-bible-muted)]" />
                      </button>
                      
                      <div className="w-px h-6 bg-[var(--border-bible)] mx-1" />
                      
                      <button onClick={() => handleList(false)} className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors" title="Lista">
                        <List className="w-4 h-4 text-[var(--text-bible-muted)]" />
                      </button>
                      <button onClick={() => handleList(true)} className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors" title="Lista numerada">
                        <ListOrdered className="w-4 h-4 text-[var(--text-bible-muted)]" />
                      </button>
                      <button onClick={handleCheckbox} className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors" title="Checkbox">
                        <CheckSquare className="w-4 h-4 text-[var(--text-bible-muted)]" />
                      </button>
                      
                      <div className="w-px h-6 bg-[var(--border-bible)] mx-1" />
                      
                      <button onClick={handleLink} className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors" title="Inserir link">
                        <Link2 className="w-4 h-4 text-[var(--text-bible-muted)]" />
                      </button>
                      
                      <div ref={colorPaletteRef} className="relative">
                        <button onClick={() => setShowColorPicker(!showColorPicker)} className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors" title="Cor do texto">
                          <Palette className="w-4 h-4 text-[var(--text-bible-muted)]" />
                        </button>
                        {showColorPicker && (
                          <div className="absolute top-full left-0 mt-1 p-2 bg-[var(--surface-0)] border border-[var(--border-bible)] rounded-lg shadow-xl z-50">
                            <div className="grid grid-cols-8 gap-1 mb-2">
                              {colors.map(color => (
                                <button
                                  key={color}
                                  onClick={() => handleColor(color)}
                                  className="w-6 h-6 rounded hover:scale-110 transition-transform"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                            <div className="text-xs text-[var(--text-bible-muted)] mb-1">Highlight:</div>
                            <div className="grid grid-cols-4 gap-1">
                              {highlightColors.map(color => (
                                <button
                                  key={color}
                                  onClick={() => handleHighlight(color)}
                                  className="w-6 h-6 rounded hover:scale-110 transition-transform border border-[var(--border-bible)]"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <button onClick={handleCode} className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors" title="Código">
                        <Code className="w-4 h-4 text-[var(--text-bible-muted)]" />
                      </button>
                      <button onClick={handleQuote} className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors" title="Citação">
                        <Quote className="w-4 h-4 text-[var(--text-bible-muted)]" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPinned(!pinned)}
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          pinned ? "bg-[var(--accent-bible)]/10 text-[var(--accent-bible)]" : "hover:bg-[var(--surface-2)] text-[var(--text-bible-muted)]"
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
                              onClick={() => setSelectedTags(prev => prev.includes(tag.id) ? prev.filter(t => t !== tag.id) : [...prev, tag.id])}
                              className={cn(
                                "px-2 py-1 rounded-full text-xs font-semibold transition-all",
                                selectedTags.includes(tag.id) ? "ring-2 ring-offset-1" : "opacity-60 hover:opacity-100"
                              )}
                              style={{ backgroundColor: tag.background, color: tag.textColor }}
                            >
                              {tag.name}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {isTTSSupported && (
                        <button
                          onClick={toggleTTS}
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            isSpeaking ? "bg-orange-100 dark:bg-orange-900/30 text-orange-500" : "hover:bg-[var(--surface-2)] text-[var(--text-bible-muted)]"
                          )}
                          title={isSpeaking ? "Parar" : "Ouvir nota"}
                        >
                          {isSpeaking ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                      )}
                      
                      <button onClick={handleExport} className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors" title="Exportar">
                        <Download className="w-4 h-4 text-[var(--text-bible-muted)]" />
                      </button>
                      
                      {onDelete && (
                        <button onClick={handleDelete} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Excluir">
                          <Trash2 className="w-4 h-4 text-red-500" />
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

                  <div className="flex-1 overflow-hidden p-4">
                    <div
                      ref={editorRef}
                      contentEditable
                      suppressContentEditableWarning
                      onClick={handleEditorClick}
                      className="w-full h-full bg-transparent text-[var(--text-bible)] placeholder:text-[var(--text-bible-muted)] focus:outline-none text-base leading-relaxed overflow-y-auto"
                      style={{ minHeight: '200px' }}
                      dangerouslySetInnerHTML={{ __html: note?.content || '' }}
                    />
                  </div>
                </>
              ) : (
                <div className="flex-1 overflow-auto p-6">
                  <div className="max-w-md mx-auto space-y-6">
                    <div className="text-center p-8 rounded-2xl bg-[var(--surface-1)] border border-[var(--border-bible)]">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[var(--accent-bible)]/10 flex items-center justify-center">
                        <Volume2 className="w-10 h-10 text-[var(--accent-bible)]" />
                      </div>
                      <h3 className="text-lg font-bold text-[var(--text-bible)] mb-2">Text-to-Speech</h3>
                      <p className="text-sm text-[var(--text-bible-muted)] mb-4">Ouça sua nota sendo lida em voz alta</p>
                      <button
                        onClick={toggleTTS}
                        disabled={!isTTSSupported || !content}
                        className={cn(
                          "w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all",
                          isSpeaking ? "bg-red-500 text-white hover:bg-red-600" : "bg-[var(--accent-bible)] text-white hover:bg-[var(--accent-bible-strong)]",
                          (!isTTSSupported || !content) && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {isSpeaking ? <><Pause className="w-5 h-5" /> Parar</> : <><Play className="w-5 h-5" /> Ouvir Nota</>}
                      </button>
                      {!isTTSSupported && <p className="text-xs text-red-500 mt-2">TTS não disponível neste navegador</p>}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {isMinimized && (
            <div className="flex items-center justify-between px-4">
              <span className="text-sm font-semibold text-[var(--text-bible)] truncate">{title || 'Nota'}</span>
              <div className="flex items-center gap-2">
                {isSpeaking && <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />}
                <button onClick={toggleMaximize} className="p-1 hover:bg-[var(--surface-2)] rounded transition-colors">
                  <Maximize2 className="w-4 h-4 text-[var(--text-bible-muted)]" />
                </button>
              </div>
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {showVersePopup && selectedVerse && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute z-[100] bg-[var(--surface-0)] border border-[var(--border-bible)] rounded-xl shadow-2xl p-4 min-w-[300px]"
              style={{ left: versePopupPos.x, top: versePopupPos.y, transform: 'translate(-50%, -100%)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[var(--accent-bible)]" />
                  <span className="font-bold text-[var(--text-bible)]">{selectedVerse.full}</span>
                </div>
                <button onClick={() => setShowVersePopup(false)} className="p-1 hover:bg-[var(--surface-2)] rounded">
                  <X className="w-4 h-4 text-[var(--text-bible-muted)]" />
                </button>
              </div>
              <p className="text-sm text-[var(--text-bible-muted)] mb-3">Clique para abrir este versículo na Bíblia</p>
              <button
                onClick={() => {
                  setShowVersePopup(false);
                  alert(`Abrir ${selectedVerse.full} no leitor... (Funcionalidade em breve)`);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[var(--accent-bible)] text-white rounded-lg font-semibold hover:bg-[var(--accent-bible-strong)] transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Abrir na Bíblia
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};