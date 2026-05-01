import React, { useRef, useCallback, useState, useEffect } from 'react';
import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, CheckSquare,
  Code, Minus, Table, Link, Quote,
  Undo, Redo, Superscript, Subscript,
  Palette, Highlighter, Indent, Outdent,
  RemoveFormatting, MessageSquare, AlertTriangle, CheckCircle,
  Eye, EyeOff, Footprints, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface RichTextEditorProps {
  title?: string;
  onTitleChange?: (title: string) => void;
  content?: string;
  html?: string;
  onChange?: (content: string) => void;
  onStatsChange?: (stats: { words: number; chars: number; lines: number }) => void;
  theme?: 'light' | 'dark';
  onThemeChange?: (theme: 'light' | 'dark') => void;
  fontFamily?: string;
  onFontFamilyChange?: (fontFamily: string) => void;
  fontSize?: number;
  onFontSizeChange?: (fontSize: number) => void;
  height?: string;
}

const HIGHLIGHT_COLORS = [
  { name: 'Remover', cls: '', color: 'transparent' },
  { name: 'Amarelo', cls: 'hl-yellow', color: '#E5C07B' },
  { name: 'Verde', cls: 'hl-green', color: '#6FC49A' },
  { name: 'Azul', cls: 'hl-blue', color: '#61AFEF' },
  { name: 'Rosa', cls: 'hl-pink', color: '#E06C75' },
  { name: 'Roxo', cls: 'hl-purple', color: '#BCA0F5' },
];

const FONTS = [
  { label: 'Lora', value: '"Lora", serif' },
  { label: 'Crimson Pro', value: '"Crimson Pro", serif' },
  { label: 'Playfair Display', value: '"Playfair Display", serif' },
  { label: 'DM Sans', value: '"DM Sans", sans-serif' },
  { label: 'Outfit', value: '"Outfit", sans-serif' },
  { label: 'JetBrains Mono', value: '"JetBrains Mono", monospace' },
];

export function RichTextEditor({
  title,
  onTitleChange,
  content,
  html,
  onChange,
  onStatsChange,
  theme,
  onThemeChange,
  fontFamily,
  onFontFamilyChange,
  fontSize,
  onFontSizeChange,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingFromProp = useRef(false);
  const [showHlPalette, setShowHlPalette] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('https://');
  const [linkText, setLinkText] = useState('');
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [fgColor, setFgColor] = useState('#BCA0F5');
  const [fnCount, setFnCount] = useState(0);
  const savedRangeRef = useRef<Range | null>(null);

  const isDark = theme === 'dark';
  const currentFontFamily = fontFamily ?? '"Lora", serif';
  const currentFontSize = fontSize ?? 16;

  // Atualiza stats quando o conteúdo muda
  useEffect(() => {
    if (onStatsChange && editorRef.current) {
      const text = editorRef.current.innerText || '';
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const chars = text.length;
      const lines = text.split('\n').filter((l) => l.trim()).length || 1;
      onStatsChange({ words, chars, lines });
    }
  }, [content, onStatsChange]);

  // ExecCommand wrapper
  const execCmd = useCallback((command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    handleInput();
  }, []);

  const handleInput = useCallback(() => {
    if (isUpdatingFromProp.current) return;
    const editor = editorRef.current;
    if (editor && onChange) {
      onChange(editor.innerHTML);
    }
  }, [onChange]);

  // Atualiza o editor quando o conteúdo muda externamente
  useEffect(() => {
    const editor = editorRef.current;
    const val = html ?? content ?? '';
    if (editor && editor.innerHTML !== val) {
      isUpdatingFromProp.current = true;
      editor.innerHTML = val;
      setTimeout(() => { isUpdatingFromProp.current = false; }, 0);
    }
  }, [content, html]);

  // Save selection
  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  // Restore selection
  const restoreSelection = useCallback(() => {
    if (savedRangeRef.current) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(savedRangeRef.current);
    }
  }, []);

  // Text color
  const applyFgColor = useCallback((color: string) => {
    setFgColor(color);
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand('foreColor', false, color);
    handleInput();
  }, [restoreSelection, handleInput]);

  // Highlight
  const applyHighlight = useCallback((cls: string) => {
    setShowHlPalette(false);
    editorRef.current?.focus();
    restoreSelection();
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) return;
    if (!cls) { document.execCommand('removeFormat'); return; }
    const range = sel.getRangeAt(0);
    const span = document.createElement('span');
    span.className = cls;
    try { range.surroundContents(span); } catch { /* partial selection */ }
    handleInput();
  }, [restoreSelection, handleInput]);

  // Insert link
  const insertLink = useCallback(() => {
    setShowLinkModal(false);
    editorRef.current?.focus();
    restoreSelection();
    if (linkText) {
      const a = document.createElement('a');
      a.href = linkUrl;
      a.textContent = linkText;
      a.target = '_blank';
      if (savedRangeRef.current) {
        savedRangeRef.current.deleteContents();
        savedRangeRef.current.insertNode(a);
      }
    } else {
      document.execCommand('createLink', false, linkUrl);
    }
    handleInput();
    setLinkText('');
    setLinkUrl('https://');
  }, [linkUrl, linkText, restoreSelection, handleInput]);

  // Insert table
  const insertTable = useCallback(() => {
    setShowTableModal(false);
    editorRef.current?.focus();
    restoreSelection();
    let html = '<table><thead><tr>';
    for (let c = 0; c < tableCols; c++) html += `<th>Coluna ${c + 1}</th>`;
    html += '</tr></thead><tbody>';
    for (let r = 0; r < tableRows; r++) {
      html += '<tr>';
      for (let c = 0; c < tableCols; c++) html += '<td>&nbsp;</td>';
      html += '</tr>';
    }
    html += '</tbody></table><p><br></p>';
    document.execCommand('insertHTML', false, html);
    handleInput();
  }, [tableRows, tableCols, restoreSelection, handleInput]);

  // Insert checklist
  const insertChecklist = useCallback(() => {
    editorRef.current?.focus();
    const ul = document.createElement('ul');
    ul.className = 'checklist';
    const li = document.createElement('li');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.addEventListener('change', function () {
      this.parentElement?.classList.toggle('done', this.checked);
    });
    const sp = document.createElement('span');
    sp.textContent = 'Item da lista';
    li.appendChild(cb);
    li.appendChild(sp);
    ul.appendChild(li);
    const sel = window.getSelection();
    if (sel && sel.rangeCount) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(ul);
    }
    handleInput();
  }, [handleInput]);

  // Insert code inline
  const insertCodeInline = useCallback(() => {
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    const selected = range.toString();
    const code = document.createElement('code');
    code.textContent = selected || 'código';
    range.deleteContents();
    range.insertNode(code);
    handleInput();
  }, [handleInput]);

  // Insert callout
  const insertCallout = useCallback((type: string, icon: string, cls: string) => {
    editorRef.current?.focus();
    const div = document.createElement('div');
    div.className = 'callout ' + cls;
    const ispan = document.createElement('span');
    ispan.className = 'callout-icon';
    ispan.textContent = icon;
    const contentDiv = document.createElement('div');
    contentDiv.contentEditable = 'true';
    contentDiv.style.flex = '1';
    contentDiv.textContent = 'Digite aqui...';
    div.appendChild(ispan);
    div.appendChild(contentDiv);
    const sel = window.getSelection();
    if (sel && sel.rangeCount) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(div);
    }
    contentDiv.focus();
    handleInput();
  }, [handleInput]);

  // Insert spoiler
  const insertSpoiler = useCallback(() => {
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    const selected = range.toString();
    const span = document.createElement('span');
    span.className = 'spoiler';
    span.title = 'Clique para revelar';
    span.textContent = selected || 'texto oculto';
    range.deleteContents();
    range.insertNode(span);
    handleInput();
  }, [handleInput]);

  // Insert footnote
  const insertFootnote = useCallback(() => {
    const newCount = fnCount + 1;
    setFnCount(newCount);
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    const sup = document.createElement('sup');
    sup.className = 'footnote-ref';
    sup.title = 'Nota de rodapé ' + newCount;
    sup.textContent = '[' + newCount + ']';
    range.collapse(false);
    range.insertNode(sup);
    const p = document.createElement('p');
    p.className = 'footnote-text';
    p.textContent = '[' + newCount + '] ';
    editorRef.current?.appendChild(p);
    handleInput();
  }, [fnCount, handleInput]);

  // Block format
  const setBlockFormat = useCallback((val: string) => {
    editorRef.current?.focus();
    document.execCommand('formatBlock', false, val);
    handleInput();
  }, [handleInput]);

  // Font size input
  const handleFontSizeInput = useCallback((val: string) => {
    const size = Math.min(96, Math.max(8, parseInt(val) || 16));
    onFontSizeChange?.(size);
  }, [onFontSizeChange]);

  // Handle keydown
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Tab indent
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) execCmd('outdent');
      else execCmd('indent');
    }
    // Ctrl+K link
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      saveSelection();
      setShowLinkModal(true);
    }
    // Markdown shortcuts
    if (e.key === ' ') {
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return;
      const range = sel.getRangeAt(0);
      const node = range.startContainer;
      if (node.nodeType !== 3) return;
      const text = node.textContent?.substring(0, range.startOffset) || '';
      if (text === '#' || text === '##' || text === '###') {
        e.preventDefault();
        node.textContent = (node.textContent || '').substring(text.length);
        document.execCommand('formatBlock', false, { '#': 'h1', '##': 'h2', '###': 'h3' }[text]);
      } else if (text === '>') {
        e.preventDefault();
        node.textContent = (node.textContent || '').substring(1);
        document.execCommand('formatBlock', false, 'blockquote');
      } else if (text === '-') {
        e.preventDefault();
        node.textContent = (node.textContent || '').substring(1);
        document.execCommand('insertUnorderedList');
      } else if (text === '1.') {
        e.preventDefault();
        node.textContent = (node.textContent || '').substring(2);
        document.execCommand('insertOrderedList');
      }
    }
    // --- → hr
    if (e.key === 'Enter') {
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return;
      const node = sel.getRangeAt(0).startContainer;
      if (node.nodeType === 3 && node.textContent?.trim() === '---') {
        e.preventDefault();
        node.textContent = '';
        document.execCommand('insertHorizontalRule');
      }
    }
  }, [execCmd, saveSelection]);

  // Handle paste - strip styles
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }, []);

  // Theme classes
  const btnBase = `flex items-center justify-center h-8 px-2 rounded-lg transition-all duration-200 ${isDark ? 'hover:bg-bible-accent/20 text-bible-text-muted hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'}`;
  const btnActive = isDark ? 'bg-bible-accent text-white shadow-lg shadow-bible-accent/20' : 'bg-gray-200 text-gray-900 font-bold';
  const selectClass = `h-8 rounded-lg border px-3 text-[11px] font-bold cursor-pointer outline-none transition-all ${isDark ? 'border-bible-border/50 bg-bible-surface text-white focus:border-bible-accent' : 'border-gray-200 bg-white text-gray-700 focus:border-blue-500 shadow-sm'}`;
  const modalBg = isDark ? 'bg-bible-surface border-bible-border/50' : 'bg-white border-gray-200';
  const inputClass = `w-full h-10 px-4 rounded-xl border text-sm outline-none transition-all ${isDark ? 'border-bible-border/50 bg-bible-bg text-white focus:border-bible-accent' : 'border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20'}`;

  return (
    <div className={`flex h-full flex-col ${isDark ? 'bg-bible-bg' : 'bg-[#F8F9FA]'}`}>
      {/* Toolbar - Google Docs Style */}
      <div className={cn(
        "shrink-0 z-30 flex items-center border-b sticky top-0 backdrop-blur-xl",
        isDark ? "bg-bible-surface/90 border-bible-border/30" : "bg-white/90 border-gray-200 shadow-sm"
      )}>
        <div className="flex items-center gap-1 w-full overflow-x-auto no-scrollbar px-2 py-1.5 min-h-[48px]">
          
          {/* History Group */}
          <div className="flex items-center gap-0.5 pr-2 border-r border-bible-border/30">
            <button onClick={() => execCmd('undo')} className={btnBase} title="Desfazer (Ctrl+Z)"><Undo size={16} /></button>
            <button onClick={() => execCmd('redo')} className={btnBase} title="Refazer (Ctrl+Y)"><Redo size={16} /></button>
          </div>

          {/* Typography Group */}
          <div className="flex items-center gap-2 px-2 border-r border-bible-border/30">
            <select value={currentFontFamily} onChange={(e) => onFontFamilyChange?.(e.target.value)} className={cn(selectClass, "min-w-[120px]")}>
              {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
            <div className="flex items-center bg-bible-surface/50 border border-bible-border/30 rounded-lg p-0.5">
              <button onClick={() => handleFontSizeInput((currentFontSize - 1).toString())} className="w-6 h-6 flex items-center justify-center hover:bg-bible-accent/10 rounded-md text-bible-text-muted"><Minus size={12} /></button>
              <input type="number" value={currentFontSize} onChange={(e) => handleFontSizeInput(e.target.value)} className="w-10 text-center bg-transparent text-[11px] font-black outline-none" />
              <button onClick={() => handleFontSizeInput((currentFontSize + 1).toString())} className="w-6 h-6 flex items-center justify-center hover:bg-bible-accent/10 rounded-md text-bible-text-muted"><Plus size={12} /></button>
            </div>
          </div>

          {/* Formatting Group */}
          <div className="flex items-center gap-0.5 px-2 border-r border-bible-border/30">
            <button onClick={() => execCmd('bold')} className={btnBase} title="Negrito"><Bold size={16} /></button>
            <button onClick={() => execCmd('italic')} className={btnBase} title="Itálico"><Italic size={16} /></button>
            <button onClick={() => execCmd('underline')} className={btnBase} title="Sublinhado"><Underline size={16} /></button>
            
            <div className="relative mx-1">
              <button onClick={() => { saveSelection(); }} className={btnBase} title="Cor do texto">
                <div className="flex flex-col items-center">
                  <Palette size={16} />
                  <div className="w-3.5 h-1 rounded-full mt-0.5" style={{ background: fgColor }} />
                </div>
              </button>
              <input type="color" value={fgColor} onChange={(e) => applyFgColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>

            <div className="relative">
              <button onClick={() => { saveSelection(); setShowHlPalette(!showHlPalette); }} className={cn(btnBase, showHlPalette && btnActive)} title="Destaque">
                <Highlighter size={16} />
              </button>
              <AnimatePresence>
                {showHlPalette && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`absolute top-full left-0 mt-2 p-3 rounded-2xl border shadow-2xl z-50 flex gap-2 ${modalBg}`}
                  >
                    {HIGHLIGHT_COLORS.map(hl => (
                      <button key={hl.cls} onClick={() => applyHighlight(hl.cls)}
                        className="w-6 h-6 rounded-lg transition-transform hover:scale-110 border border-white/10"
                        style={{ background: hl.color === 'transparent' ? (isDark ? '#272530' : '#f0f0f0') : hl.color, borderColor: hl.color === 'transparent' ? (isDark ? '#373450' : '#ddd') : 'transparent' }}
                        title={hl.name} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Alignment Group */}
          <div className="flex items-center gap-0.5 px-2 border-r border-bible-border/30">
            <button onClick={() => execCmd('justifyLeft')} className={btnBase}><AlignLeft size={16} /></button>
            <button onClick={() => execCmd('justifyCenter')} className={btnBase}><AlignCenter size={16} /></button>
            <button onClick={() => execCmd('justifyRight')} className={btnBase}><AlignRight size={16} /></button>
          </div>

          {/* Lists Group */}
          <div className="flex items-center gap-0.5 px-2 border-r border-bible-border/30">
            <button onClick={() => execCmd('insertUnorderedList')} className={btnBase}><List size={16} /></button>
            <button onClick={() => execCmd('insertOrderedList')} className={btnBase}><ListOrdered size={16} /></button>
          </div>

          {/* Insertions Group */}
          <div className="flex items-center gap-0.5 pl-2">
            <button onClick={() => { saveSelection(); setShowLinkModal(true); }} className={btnBase} title="Link"><Link size={16} /></button>
            <button onClick={() => { saveSelection(); setShowTableModal(true); }} className={btnBase} title="Tabela"><Table size={16} /></button>
            <button onClick={insertChecklist} className={btnBase} title="Checklist"><CheckSquare size={16} /></button>
            <button onClick={() => execCmd('removeFormat')} className={btnBase} title="Limpar Formatação"><RemoveFormatting size={16} /></button>
          </div>
        </div>
      </div>

      {/* Editor Canvas - The "Paper" Experience */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 sm:p-6 lg:p-10 flex flex-col items-center bg-inherit">
        <div 
          className={cn(
            "w-full max-w-[850px] min-h-[1056px] shadow-2xl rounded-lg p-6 sm:p-12 lg:p-[80px] transition-all duration-500 flex flex-col",
            isDark ? "bg-[#1E1E1E] shadow-black/40 ring-1 ring-white/5" : "bg-white shadow-gray-200 ring-1 ring-gray-100"
          )}
          style={{ 
            fontFamily: currentFontFamily, 
            fontSize: `${currentFontSize}px`,
            lineHeight: '1.6',
          }}
        >
          {/* Document Title - Studio Style */}
          <div className="flex flex-col mb-12 w-full shrink-0">
            <input 
              type="text"
              value={title}
              onChange={(e) => onTitleChange?.(e.target.value)}
              className="bg-transparent text-5xl font-black text-bible-text outline-none placeholder:opacity-10 mb-4 tracking-tighter"
              placeholder="Documento sem título"
            />
            <div className="h-[2px] w-20 bg-bible-accent/30 rounded-full" />
          </div>

          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onClick={() => setShowHlPalette(false)}
            className="outline-none min-h-full"
            style={{ caretColor: isDark ? '#BCA0F5' : '#4285F4' }}
            data-placeholder="Comece a escrever seu documento..."
            suppressContentEditableWarning
          />
        </div>

        {/* Floating Page Status */}
        <div className="mt-8 px-4 py-2 rounded-full bg-bible-surface/30 border border-bible-border/30 backdrop-blur-md text-[10px] font-bold text-bible-text-muted tracking-widest uppercase opacity-40 hover:opacity-100 transition-opacity mb-20">
          Visualização de Impressão • A4 • {currentFontFamily.split(',')[0].replace(/"/g, '')}
        </div>
      </div>

      {/* Styles */}
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'};
          pointer-events: none;
        }
        .hl-yellow { background: #E5C07B; color: #000; border-radius: 2px; }
        .hl-green { background: #6FC49A; color: #000; border-radius: 2px; }
        .hl-blue { background: #61AFEF; color: #000; border-radius: 2px; }
        .hl-pink { background: #E06C75; color: #fff; border-radius: 2px; }
        .hl-purple { background: #BCA0F5; color: #000; border-radius: 2px; }
        
        table { border-collapse: collapse; width: 100%; margin: 24px 0; border: 1px solid ${isDark ? '#333' : '#eee'}; }
        th { background: ${isDark ? '#2a2a2a' : '#f8f9fa'}; padding: 12px; border: 1px solid ${isDark ? '#333' : '#eee'}; text-align: left; }
        td { padding: 10px; border: 1px solid ${isDark ? '#333' : '#eee'}; }
        
        blockquote { border-left: 4px solid #BCA0F5; margin: 24px 0; padding: 12px 24px; background: ${isDark ? '#252525' : '#f9f9f9'}; font-style: italic; color: ${isDark ? '#aaa' : '#555'}; }
        pre { font-family: 'JetBrains Mono', monospace; background: ${isDark ? '#1a1a1a' : '#f4f4f4'}; padding: 16px; border-radius: 8px; margin: 20px 0; overflow-x: auto; font-size: 0.9em; }
        code { font-family: 'JetBrains Mono', monospace; background: ${isDark ? '#333' : '#eee'}; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
        
        .checklist { list-style: none; padding-left: 0; }
        .checklist li { display: flex; gap: 12px; margin: 8px 0; }
        .checklist li input[type=checkbox] { width: 18px; height: 18px; margin-top: 3px; accent-color: #BCA0F5; }
        
        .footnote-ref { color: #BCA0F5; font-size: 0.7em; vertical-align: super; margin-left: 2px; }
        .footnote-text { font-size: 0.85em; border-top: 1px solid ${isDark ? '#333' : '#eee'}; padding-top: 12px; margin-top: 32px; color: ${isDark ? '#888' : '#666'}; }
        
        a { color: #4285F4; text-decoration: underline; }
        hr { border: none; border-top: 1px solid ${isDark ? '#333' : '#eee'}; margin: 32px 0; }
      `}</style>

      {/* Modals Pro Max */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowLinkModal(false)}>
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`rounded-[32px] border p-8 w-full max-w-md shadow-2xl ${modalBg}`} 
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xl font-black text-bible-text mb-6 tracking-tighter">Inserir Hiperlink</h3>
            <div className="space-y-4 mb-8">
              <input type="text" value={linkText} onChange={e => setLinkText(e.target.value)} placeholder="Texto para exibição" className={inputClass} />
              <input type="url" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="Endereço (https://...)" className={inputClass} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowLinkModal(false)} className="flex-1 h-12 rounded-2xl border border-bible-border/50 text-sm font-bold text-bible-text-muted hover:bg-bible-surface transition-all">Cancelar</button>
              <button onClick={insertLink} className="flex-1 h-12 rounded-2xl bg-bible-accent text-white shadow-lg shadow-bible-accent/20 text-sm font-bold">Aplicar Link</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Table Modal Pro Max */}
      {showTableModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowTableModal(false)}>
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`rounded-[32px] border p-8 w-full max-w-md shadow-2xl ${modalBg}`} 
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xl font-black text-bible-text mb-6 tracking-tighter">Configurar Tabela</h3>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-bible-text-muted pl-1">Colunas</label>
                <input type="number" value={tableCols} min={1} max={10} onChange={e => setTableCols(parseInt(e.target.value) || 3)} className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-bible-text-muted pl-1">Linhas</label>
                <input type="number" value={tableRows} min={1} max={20} onChange={e => setTableRows(parseInt(e.target.value) || 3)} className={inputClass} />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowTableModal(false)} className="flex-1 h-12 rounded-2xl border border-bible-border/50 text-sm font-bold text-bible-text-muted hover:bg-bible-surface transition-all">Cancelar</button>
              <button onClick={insertTable} className="flex-1 h-12 rounded-2xl bg-bible-accent text-white shadow-lg shadow-bible-accent/20 text-sm font-bold">Criar Tabela</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
