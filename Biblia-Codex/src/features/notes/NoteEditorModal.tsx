import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Minus, Maximize2, Minimize2, Pin, PinOff,
  Save, Download, Trash2, Clock, Bold, Italic, Underline, Strikethrough, Heading1, Heading2, Heading3,
  List, ListOrdered, CheckSquare, Link2, Palette, Highlighter, Code, Quote,
  Undo, Redo, BookOpen, ExternalLink, Edit3
} from 'lucide-react';
import { Note } from '../../types';
import { storage } from '../../StorageService';
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
}

type WindowState = 'normal' | 'maximized' | 'minimized';

export const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  note,
  isOpen,
  onClose,
  onSave,
  onDelete
}) => {
  const [windowState, setWindowState] = useState<WindowState>('normal');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pinned, setPinned] = useState(false);
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
      setPinned(note.pinned || false);
      setLastSaved(note.updatedAt ? new Date(note.updatedAt) : null);
    } else {
      setTitle('');
      setContent('');
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
  const handleHeading = (level: 1 | 2 | 3) => execCommand('formatBlock', `h${level}`);
  const handleList = (ordered: boolean) => execCommand(ordered ? 'insertOrderedList' : 'insertUnorderedList');
  const handleLink = () => {
    const url = prompt('Digite a URL:');
    if (url) execCommand('createLink', url);
  };
  const handleColor = (color: string) => {
    execCommand('foreColor', color);
    setShowColorPicker(false);
  };
  const handleHighlight = (color: string) => execCommand('backColor', color);
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
        range.deleteContents();
        wrapper.textContent = selection.toString();
        range.insertNode(wrapper);
      }
    }
  };
  const handleQuote = () => execCommand('formatBlock', 'blockquote');
  const handleUndo = () => execCommand('undo');
  const handleRedo = () => execCommand('redo');

  const handleSave = async () => {
    if (!note) return;
    const contentHtml = editorRef.current?.innerHTML || content || '';
    setIsSaving(true);
    try {
      const updatedNote: Note = {
        ...note,
        title: title || 'Sem título',
        content: contentHtml,
        tags: [],
        pinned,
        updatedAt: Date.now()
      };
      onSave(updatedNote);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleMaximize = () => setWindowState(prev => prev === 'maximized' ? 'normal' : 'maximized');
  const toggleMinimize = () => setWindowState(prev => prev === 'minimized' ? 'normal' : 'minimized');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  const handleDelete = () => {
    if (onDelete && note && confirm('Tem certeza que deseja excluir esta nota?')) {
      onDelete(note.id);
      onClose();
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
        className={cn("fixed inset-0 z-50 flex items-center justify-center", isMinimized ? "pointer-events-none" : "")}
      >
        <div className={cn("absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity", isMinimized ? "opacity-0" : "opacity-100")} onClick={onClose} />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={cn(
            "relative rounded-2xl overflow-hidden flex flex-col",
            "transition-all duration-300 pointer-events-auto",
            isMaximized ? "w-screen h-screen rounded-none" : "w-screen h-[100dvh] rounded-none sm:w-[92vw] sm:h-[88dvh] sm:max-w-5xl sm:rounded-2xl",
            isMinimized ? "fixed bottom-24 right-6 w-14 h-14 rounded-full bg-[var(--accent)] shadow-xl cursor-pointer hover:scale-110 z-50 text-white flex items-center justify-center" : "fixed bg-[var(--bg)] shadow-2xl"
          )}
          onKeyDown={handleKeyDown}
        >
          {!isMinimized && (
            <>
              <div className="flex items-center justify-between gap-2 px-3 py-2 bg-[var(--surface-1)] border-b border-[var(--border)] shrink-0">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Título da nota..."
                    className="min-w-0 flex-1 bg-transparent text-base sm:text-lg font-semibold text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none truncate"
                  />
                  {lastSaved && !isMaximized && (
                    <span className="hidden sm:flex text-[10px] text-[var(--text-muted)] items-center gap-1 whitespace-nowrap">
                      <Clock className="w-3 h-3" />
                      {lastSaved.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={toggleMinimize} className="grid h-10 w-10 place-items-center rounded-lg hover:bg-[var(--surface-2)] transition-colors sm:h-9 sm:w-9" title="Minimizar">
                    <Minus className="w-4 h-4 text-[var(--text-muted)]" />
                  </button>
                  <button onClick={toggleMaximize} className="hidden h-9 w-9 place-items-center rounded-lg hover:bg-[var(--surface-2)] transition-colors sm:grid" title={isMaximized ? "Restaurar" : "Maximizar"}>
                    {isMaximized ? <Minimize2 className="w-4 h-4 text-[var(--text-muted)]" /> : <Maximize2 className="w-4 h-4 text-[var(--text-muted)]" />}
                  </button>
                  <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors sm:h-9 sm:w-9" title="Fechar">
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1 px-3 py-2 bg-[var(--surface-1)] border-b border-[var(--border)] shrink-0 sm:px-4">
                <button
                  className="min-h-9 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--accent)] text-white"
                >
                  Editar
                </button>
              </div>

              <div className="flex flex-col bg-[var(--surface-1)] border-b border-[var(--border)] overflow-hidden sm:flex-row sm:items-stretch">
                <div className="flex flex-1 items-center gap-1 overflow-x-auto no-scrollbar px-2 py-2 sm:px-3 [&>button]:grid [&>button]:h-11 [&>button]:w-11 [&>button]:shrink-0 [&>button]:place-items-center [&>button]:sm:h-10 [&>button]:sm:w-10">
                  <button onClick={handleUndo} className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors shrink-0" title="Desfazer">
                    <Undo className="w-4 h-4 text-[var(--text-muted)]" />
                  </button>
                  <button onClick={handleRedo} className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors shrink-0" title="Refazer">
                    <Redo className="w-4 h-4 text-[var(--text-muted)]" />
                  </button>
                  <div className="w-px h-6 bg-[var(--border)] mx-1 shrink-0" />
                  <button onClick={handleBold} className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors shrink-0" title="Negrito">
                    <Bold className="w-4 h-4 text-[var(--text-muted)]" />
                  </button>
                  <button onClick={handleItalic} className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors shrink-0" title="Itálico">
                    <Italic className="w-4 h-4 text-[var(--text-muted)]" />
                  </button>
                  <button onClick={handleUnderline} className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors shrink-0" title="Sublinhado">
                    <Underline className="w-4 h-4 text-[var(--text-muted)]" />
                  </button>
                  <button onClick={handleStrikethrough} className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors shrink-0" title="Tachado">
                    <Strikethrough className="w-4 h-4 text-[var(--text-muted)]" />
                  </button>
                  <div className="w-px h-6 bg-[var(--border)] mx-1 shrink-0" />
                  <button onClick={() => handleHeading(1)} className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors shrink-0" title="Título 1">
                    <Heading1 className="w-4 h-4 text-[var(--text-muted)]" />
                  </button>
                  <button onClick={() => handleHeading(2)} className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors shrink-0" title="Título 2">
                    <Heading2 className="w-4 h-4 text-[var(--text-muted)]" />
                  </button>
                  <button onClick={() => handleHeading(3)} className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors shrink-0" title="Título 3">
                    <Heading3 className="w-4 h-4 text-[var(--text-muted)]" />
                  </button>
                  <div className="w-px h-6 bg-[var(--border)] mx-1 shrink-0" />
                  <button onClick={() => handleList(false)} className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors shrink-0" title="Lista">
                    <List className="w-4 h-4 text-[var(--text-muted)]" />
                  </button>
                  <button onClick={() => handleList(true)} className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors shrink-0" title="Lista numerada">
                    <ListOrdered className="w-4 h-4 text-[var(--text-muted)]" />
                  </button>
                  <button onClick={() => execCommand('insertUnorderedList')} className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors shrink-0" title="Checkbox">
                    <CheckSquare className="w-4 h-4 text-[var(--text-muted)]" />
                  </button>
                  <div className="w-px h-6 bg-[var(--border)] mx-1 shrink-0" />
                  <button onClick={handleLink} className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors shrink-0" title="Inserir link">
                    <Link2 className="w-4 h-4 text-[var(--text-muted)]" />
                  </button>
                  <div ref={colorPaletteRef} className="relative shrink-0">
                    <button onClick={() => setShowColorPicker(!showColorPicker)} className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors" title="Cor do texto">
                      <Palette className="w-4 h-4 text-[var(--text-muted)]" />
                    </button>
                    {showColorPicker && (
                      <div className="absolute top-full left-0 mt-1 p-2 bg-[var(--surface-0)] border border-[var(--border)] rounded-lg shadow-xl z-50">
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
                        <div className="text-xs text-[var(--text-muted)] mb-1">Highlight:</div>
                        <div className="grid grid-cols-4 gap-1">
                          {highlightColors.map(color => (
                            <button
                              key={color}
                              onClick={() => handleHighlight(color)}
                              className="w-6 h-6 rounded hover:scale-110 transition-transform border border-[var(--border)]"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <button onClick={handleCode} className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors shrink-0" title="Código">
                    <Code className="w-4 h-4 text-[var(--text-muted)]" />
                  </button>
                  <button onClick={handleQuote} className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors shrink-0" title="Citação">
                    <Quote className="w-4 h-4 text-[var(--text-muted)]" />
                  </button>
                </div>
                
                <div className="flex items-center gap-1 overflow-x-auto border-t border-[var(--border)] bg-[var(--surface-1)] px-2 py-2 sm:border-l sm:border-t-0 sm:px-3">
                  <button
                    onClick={() => setPinned(!pinned)}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      pinned ? "bg-[var(--accent)]/10 text-[var(--accent)]" : "hover:bg-[var(--surface-2)] text-[var(--text-muted)]"
                    )}
                    title={pinned ? "Desafixar" : "Fixar"}
                  >
                    {pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                  </button>
                  <button onClick={handleExport} className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors" title="Exportar">
                    <Download className="w-4 h-4 text-[var(--text-muted)]" />
                  </button>
                  {onDelete && (
                    <button onClick={handleDelete} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Excluir">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="ml-auto flex h-11 min-w-[7rem] shrink-0 items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-3 text-sm font-semibold text-white hover:opacity-90 transition-colors disabled:opacity-50 sm:h-10"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-hidden p-3 sm:p-4">
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onClick={handleEditorClick}
                  className="w-full h-full bg-transparent text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none text-base leading-relaxed overflow-y-auto"
                  style={{ minHeight: '200px' }}
                  dangerouslySetInnerHTML={{ __html: note?.content || '' }}
                />
              </div>
            </>
          )}

          {isMinimized && (
            <div
              className="w-full h-full flex items-center justify-center"
              onClick={toggleMaximize}
              title={title || 'Nota Minimizada'}
            >
              <Edit3 className="w-6 h-6 text-white" />
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {showVersePopup && selectedVerse && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute z-[100] bg-[var(--surface-0)] border border-[var(--border)] rounded-xl shadow-2xl p-4 min-w-[300px]"
              style={{ left: versePopupPos.x, top: versePopupPos.y, transform: 'translate(-50%, -100%)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[var(--accent)]" />
                  <span className="font-bold text-[var(--text)]">{selectedVerse.full}</span>
                </div>
                <button onClick={() => setShowVersePopup(false)} className="p-1 hover:bg-[var(--surface-2)] rounded">
                  <X className="w-4 h-4 text-[var(--text-muted)]" />
                </button>
              </div>
              <p className="text-sm text-[var(--text-muted)] mb-3">Clique para abrir este versículo na Bíblia</p>
              <button
                onClick={() => {
                  setShowVersePopup(false);
                  alert(`Abrir ${selectedVerse.full} no leitor...`);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg font-semibold hover:opacity-90 transition-colors"
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