import React, { useRef, useCallback, useState, useEffect } from 'react';
import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, CheckSquare,
  Code, Minus, Table, Link, Quote,
  Undo, Redo, Superscript, Subscript,
  Palette, Highlighter, Indent, Outdent,
  RemoveFormatting, MessageSquare, AlertTriangle, CheckCircle,
  Eye, EyeOff, Footprints,
} from 'lucide-react';

interface RichTextEditorProps {
  title?: string;
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
  content,
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
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  // Atualiza o editor quando o conteúdo muda externamente
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      isUpdatingFromProp.current = true;
      editorRef.current.innerHTML = content;
      setTimeout(() => { isUpdatingFromProp.current = false; }, 0);
    }
  }, [content]);

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
    onFontSizeChange(size);
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
  const sepClass = isDark ? 'bg-bible-accent/20' : 'bg-gray-300';
  const btnBase = `flex items-center justify-center w-7 h-7 rounded transition-colors ${isDark ? 'hover:bg-bible-accent/20 text-white/70 hover:text-white' : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'}`;
  const btnActive = isDark ? 'bg-bible-accent/30 text-bible-accent' : 'bg-blue-100 text-blue-700';
  const selectClass = `h-7 rounded border px-2 text-xs cursor-pointer outline-none transition-colors ${isDark ? 'border-bible-accent/20 bg-bible-surface text-white focus:border-bible-accent' : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500'}`;
  const modalBg = isDark ? 'bg-[#1F1D24] border-[#373450]' : 'bg-white border-gray-200';
  const inputClass = `w-full h-9 px-3 rounded border text-sm outline-none ${isDark ? 'border-bible-accent/20 bg-bible-surface text-white focus:border-bible-accent' : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500'}`;

  return (
    <div className={`flex h-full flex-col ${isDark ? 'bg-bible-surface/30' : 'bg-white'}`}>
      {/* Toolbar */}
      <div className={`flex flex-wrap items-center gap-0.5 border-b p-1.5 ${isDark ? 'border-bible-accent/10' : 'border-gray-200'}`}>
        {/* Undo/Redo */}
        <button onClick={() => execCmd('undo')} className={btnBase} title="Desfazer (Ctrl+Z)"><Undo size={14} /></button>
        <button onClick={() => execCmd('redo')} className={btnBase} title="Refazer (Ctrl+Y)"><Redo size={14} /></button>
        <div className={`mx-1 h-5 w-px ${sepClass}`} />

        {/* Font */}
        <select value={fontFamily} onChange={(e) => onFontFamilyChange(e.target.value)} className={selectClass} title="Fonte">
          {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <input type="number" value={fontSize} min={8} max={96} onChange={(e) => handleFontSizeInput(e.target.value)} className={`w-14 text-center ${selectClass}`} title="Tamanho (px)" />
        <div className={`mx-1 h-5 w-px ${sepClass}`} />

        {/* Block format */}
        <select onChange={(e) => setBlockFormat(e.target.value)} className={selectClass} defaultValue="p">
          <option value="p">Parágrafo</option>
          <option value="h1">Título H1</option>
          <option value="h2">Título H2</option>
          <option value="h3">Título H3</option>
          <option value="pre">Código bloco</option>
          <option value="blockquote">Citação</option>
        </select>
        <div className={`mx-1 h-5 w-px ${sepClass}`} />

        {/* Inline formatting */}
        <button onClick={() => execCmd('bold')} className={btnBase} title="Negrito (Ctrl+B)"><Bold size={14} /></button>
        <button onClick={() => execCmd('italic')} className={btnBase} title="Itálico (Ctrl+I)"><Italic size={14} /></button>
        <button onClick={() => execCmd('underline')} className={btnBase} title="Sublinhado (Ctrl+U)"><Underline size={14} /></button>
        <button onClick={() => execCmd('strikeThrough')} className={btnBase} title="Tachado"><Strikethrough size={14} /></button>
        <button onClick={() => execCmd('superscript')} className={btnBase} title="Sobrescrito"><Superscript size={14} /></button>
        <button onClick={() => execCmd('subscript')} className={btnBase} title="Subscrito"><Subscript size={14} /></button>
        <div className={`mx-1 h-5 w-px ${sepClass}`} />

        {/* Colors */}
        <div className="relative">
          <button onClick={() => { saveSelection(); }} className={btnBase} title="Cor do texto">
            <Palette size={14} />
            <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-3 h-1 rounded-full" style={{ background: fgColor }} />
          </button>
          <input type="color" value={fgColor} onChange={(e) => applyFgColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
        </div>
        <div className="relative">
          <button onClick={() => { saveSelection(); setShowHlPalette(!showHlPalette); }} className={btnBase} title="Destaque">
            <Highlighter size={14} />
          </button>
          {showHlPalette && (
            <div className={`absolute top-full left-0 mt-1 p-2 rounded-lg border shadow-lg z-50 flex gap-1.5 ${modalBg}`}>
              {HIGHLIGHT_COLORS.map(hl => (
                <button key={hl.cls} onClick={() => applyHighlight(hl.cls)}
                  className="w-5 h-5 rounded transition-transform hover:scale-110 border"
                  style={{ background: hl.color === 'transparent' ? (isDark ? '#272530' : '#f0f0f0') : hl.color + '55', borderColor: hl.color === 'transparent' ? (isDark ? '#373450' : '#ddd') : hl.color }}
                  title={hl.name} />
              ))}
            </div>
          )}
        </div>
        <div className={`mx-1 h-5 w-px ${sepClass}`} />

        {/* Alignment */}
        <button onClick={() => execCmd('justifyLeft')} className={btnBase} title="Alinhar à esquerda"><AlignLeft size={14} /></button>
        <button onClick={() => execCmd('justifyCenter')} className={btnBase} title="Centralizar"><AlignCenter size={14} /></button>
        <button onClick={() => execCmd('justifyRight')} className={btnBase} title="Alinhar à direita"><AlignRight size={14} /></button>
        <button onClick={() => execCmd('justifyFull')} className={btnBase} title="Justificar"><AlignJustify size={14} /></button>
        <div className={`mx-1 h-5 w-px ${sepClass}`} />

        {/* Lists */}
        <button onClick={() => execCmd('insertUnorderedList')} className={btnBase} title="Lista com marcadores"><List size={14} /></button>
        <button onClick={() => execCmd('insertOrderedList')} className={btnBase} title="Lista numerada"><ListOrdered size={14} /></button>
        <button onClick={insertChecklist} className={btnBase} title="Checklist"><CheckSquare size={14} /></button>
        <div className={`mx-1 h-5 w-px ${sepClass}`} />

        {/* Insertions */}
        <button onClick={insertCodeInline} className={btnBase} title="Código inline"><Code size={14} /></button>
        <button onClick={() => execCmd('insertHorizontalRule')} className={btnBase} title="Linha horizontal"><Minus size={14} /></button>
        <button onClick={() => { saveSelection(); setShowTableModal(true); }} className={btnBase} title="Tabela"><Table size={14} /></button>
        <button onClick={() => { saveSelection(); setShowLinkModal(true); }} className={btnBase} title="Link (Ctrl+K)"><Link size={14} /></button>
        <div className={`mx-1 h-5 w-px ${sepClass}`} />

        {/* Callouts */}
        <button onClick={() => insertCallout('note', 'ℹ️', 'callout-note')} className={btnBase} title="Callout - Nota"><MessageSquare size={14} /></button>
        <button onClick={() => insertCallout('warn', '⚠️', 'callout-warn')} className={btnBase} title="Callout - Aviso"><AlertTriangle size={14} /></button>
        <button onClick={() => insertCallout('ok', '✅', 'callout-ok')} className={btnBase} title="Callout - Sucesso"><CheckCircle size={14} /></button>
        <div className={`mx-1 h-5 w-px ${sepClass}`} />

        {/* Extras */}
        <button onClick={insertSpoiler} className={btnBase} title="Spoiler"><Eye size={14} /></button>
        <button onClick={insertFootnote} className={btnBase} title="Rodapé"><Footprints size={14} /></button>
        <button onClick={() => execCmd('indent')} className={btnBase} title="Aumentar recuo"><Indent size={14} /></button>
        <button onClick={() => execCmd('outdent')} className={btnBase} title="Diminuir recuo"><Outdent size={14} /></button>
        <button onClick={() => execCmd('removeFormat')} className={btnBase} title="Limpar formatação"><RemoveFormatting size={14} /></button>

        <div className="ml-auto">
          <button onClick={() => onThemeChange(isDark ? 'light' : 'dark')} className={btnBase} title={isDark ? 'Modo claro' : 'Modo escuro'}>
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onClick={() => setShowHlPalette(false)}
        className={`flex-1 overflow-y-auto p-6 outline-none ${isDark ? 'text-white' : 'text-gray-900'}`}
        style={{ fontFamily, fontSize: `${fontSize}px`, lineHeight: '1.8', minHeight: '200px', caretColor: isDark ? '#BCA0F5' : '#7C5FC8' }}
        data-placeholder="Escreva sua nota aqui..."
        suppressContentEditableWarning
      />

      {/* Styles */}
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: ${isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'};
          pointer-events: none;
        }
        .hl-yellow { background: #E5C07B33; border-radius: 3px; padding: 0 2px; }
        .hl-green { background: #6FC49A33; border-radius: 3px; padding: 0 2px; }
        .hl-blue { background: #61AFEF33; border-radius: 3px; padding: 0 2px; }
        .hl-pink { background: #E06C7533; border-radius: 3px; padding: 0 2px; }
        .hl-purple { background: #BCA0F533; border-radius: 3px; padding: 0 2px; }
        .spoiler {
          background: ${isDark ? '#E2DEEE' : '#2A2520'};
          color: ${isDark ? '#E2DEEE' : '#2A2520'};
          border-radius: 3px;
          padding: 0 3px;
          cursor: pointer;
          user-select: none;
          transition: all 0.2s;
        }
        .spoiler:hover, .spoiler.revealed {
          background: ${isDark ? '#272530' : '#f0f0f0'};
          color: ${isDark ? '#E2DEEE' : '#2A2520'};
        }
        .callout {
          display: flex;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 8px;
          margin: 12px 0;
          font-size: 0.93em;
          align-items: flex-start;
        }
        .callout-note { background: rgba(97,175,239,0.1); border: 1px solid rgba(97,175,239,0.3); }
        .callout-warn { background: rgba(229,192,123,0.1); border: 1px solid rgba(229,192,123,0.3); }
        .callout-ok { background: rgba(111,196,154,0.1); border: 1px solid rgba(111,196,154,0.3); }
        .callout-icon { font-size: 1em; flex-shrink: 0; margin-top: 1px; }
        .checklist { list-style: none; padding-left: 4px; }
        .checklist li { display: flex; align-items: flex-start; gap: 8px; margin: 4px 0; cursor: pointer; }
        .checklist li input[type=checkbox] { margin-top: 4px; flex-shrink: 0; accent-color: #BCA0F5; width: 15px; height: 15px; cursor: pointer; }
        .checklist li.done span { text-decoration: line-through; color: ${isDark ? '#5F5C78' : '#999'}; }
        .footnote-ref { color: #BCA0F5; cursor: pointer; }
        .footnote-text { font-size: 0.8em; color: ${isDark ? '#9895B0' : '#666'}; border-top: 1px solid ${isDark ? '#373450' : '#ddd'}; padding-top: 6px; margin-top: 16px; }
        code { font-family: 'JetBrains Mono', monospace; font-size: 0.85em; background: ${isDark ? '#272530' : '#f0f0f0'}; border: 1px solid ${isDark ? '#373450' : '#ddd'}; border-radius: 4px; padding: 1px 5px; color: ${isDark ? '#BCA0F5' : '#7C5FC8'}; }
        table { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 0.9em; }
        th { background: ${isDark ? '#272530' : '#f0f0f0'}; border: 1px solid ${isDark ? '#373450' : '#ddd'}; padding: 8px 12px; text-align: left; font-weight: 600; }
        td { border: 1px solid ${isDark ? '#373450' : '#ddd'}; padding: 7px 12px; }
        blockquote { border-left: 3px solid #BCA0F5; margin: 12px 0; padding: 10px 18px; background: rgba(188,160,245,0.08); border-radius: 0 6px 6px 0; color: ${isDark ? '#9895B0' : '#666'}; font-style: italic; }
        pre { font-family: 'JetBrains Mono', monospace; font-size: 0.85em; background: ${isDark ? '#272530' : '#f0f0f0'}; border: 1px solid ${isDark ? '#373450' : '#ddd'}; border-left: 3px solid #BCA0F5; border-radius: 6px; padding: 14px 18px; margin: 12px 0; overflow-x: auto; white-space: pre-wrap; }
        hr { border: none; border-top: 1px solid ${isDark ? '#373450' : '#ddd'}; margin: 20px 0; }
        a { color: #61AFEF; text-decoration: underline; text-underline-offset: 3px; }
      `}</style>

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowLinkModal(false)}>
          <div className={`rounded-lg border p-6 w-80 shadow-xl ${modalBg}`} onClick={e => e.stopPropagation()}>
            <h3 className={`text-sm font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Inserir link</h3>
            <input type="text" value={linkText} onChange={e => setLinkText(e.target.value)} placeholder="Texto do link" className={`mb-3 ${inputClass}`} />
            <input type="url" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://..." className={`mb-4 ${inputClass}`} />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowLinkModal(false)} className={`h-8 px-3 rounded border text-xs ${isDark ? 'border-bible-accent/20 text-white/70 hover:bg-bible-accent/10' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}>Cancelar</button>
              <button onClick={insertLink} className="h-8 px-4 rounded bg-bible-accent text-bible-bg text-xs font-bold hover:opacity-90">Inserir</button>
            </div>
          </div>
        </div>
      )}

      {/* Table Modal */}
      {showTableModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowTableModal(false)}>
          <div className={`rounded-lg border p-6 w-80 shadow-xl ${modalBg}`} onClick={e => e.stopPropagation()}>
            <h3 className={`text-sm font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Inserir tabela</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className={`block text-xs mb-1 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>Colunas</label>
                <input type="number" value={tableCols} min={1} max={10} onChange={e => setTableCols(parseInt(e.target.value) || 3)} className={inputClass} />
              </div>
              <div>
                <label className={`block text-xs mb-1 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>Linhas</label>
                <input type="number" value={tableRows} min={1} max={20} onChange={e => setTableRows(parseInt(e.target.value) || 3)} className={inputClass} />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowTableModal(false)} className={`h-8 px-3 rounded border text-xs ${isDark ? 'border-bible-accent/20 text-white/70 hover:bg-bible-accent/10' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}>Cancelar</button>
              <button onClick={insertTable} className="h-8 px-4 rounded bg-bible-accent text-bible-bg text-xs font-bold hover:opacity-90">Inserir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
