/**
 * Notes Component - Premium Visual Design + Full Functionality
 * Caderno de Estudo com TODAS as funcionalidades: exportação, tags, Google Docs, etc.
 */

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
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Note, Tag } from '../types';
import { storage } from '../StorageService';
import { RichTextEditor } from './RichTextEditor';
import { useAppContext } from '../AppContext';
import { getStoredGoogleAccessToken, loginWithGoogle } from '../firebase';
import { exportNoteToGoogleDocs } from '../services/googleDocsService';
import { exportNote, type ExportFormat } from '../services/ExportService';
import { TagService, PALETTE } from '../services/TagService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type SaveState = 'saved' | 'saving' | 'unsaved';
type NoteFilter = 'all' | 'pinned';
type GoogleDocsState = 'idle' | 'exporting' | 'success' | 'error';
type TagColorMode = 'auto' | 'manual';
type SidebarTab = 'notes' | 'tags';

interface NoteStats {
  words: number;
  chars: number;
  lines: number;
}

const HUE_STEPS = [210, 140, 270, 25, 330, 185, 45, 90, 310, 0, 160, 240];
let hueIdx = Math.floor(Math.random() * HUE_STEPS.length);

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c).toString(16).padStart(2, '0');
  };
  return '#' + f(0) + f(8) + f(4);
}

function genAutoColor(): { color: string; background: string; textColor: string } {
  const base = HUE_STEPS[hueIdx % HUE_STEPS.length];
  hueIdx++;
  const h = (base + Math.floor(Math.random() * 30) - 15 + 360) % 360;
  return {
    color: hslToHex(h, 62, 38),
    background: hslToHex(h, 80, 94),
    textColor: hslToHex(h, 62, 25),
  };
}

// 65 etiquetas teológicas organizadas em 10 categorias
const DEFAULT_THEOLOGICAL_TAGS: Omit<Tag, 'createdAt'>[] = [
  // Atributos de Deus (8)
  { id: 'soberania', name: 'Soberania', color: '#1e3a8a', background: '#dbeafe', textColor: '#1e40af' },
  { id: 'onipotencia', name: 'Onipotência', color: '#1d4ed8', background: '#eff6ff', textColor: '#1e40af' },
  { id: 'fidelidade', name: 'Fidelidade', color: '#0369a1', background: '#e0f2fe', textColor: '#075985' },
  { id: 'misericordia', name: 'Misericórdia', color: '#0891b2', background: '#cffafe', textColor: '#0e7490' },
  { id: 'gloria', name: 'Glória de Deus', color: '#1e40af', background: '#e0e7ff', textColor: '#1e3a8a' },
  { id: 'onipresenca', name: 'Onipresença', color: '#075985', background: '#e0f2fe', textColor: '#0c4a6e' },
  { id: 'santidadeDeus', name: 'Santidade', color: '#1a1a1a', background: '#f0f0ee', textColor: '#1a1a1a' },
  { id: 'eternidade', name: 'Eternidade', color: '#334155', background: '#f1f5f9', textColor: '#1e293b' },
  // Salvação (8)
  { id: 'graca', name: 'Graça', color: '#7c3aed', background: '#ede9fe', textColor: '#6d28d9' },
  { id: 'redencao', name: 'Redenção', color: '#b91c1c', background: '#fee2e2', textColor: '#991b1b' },
  { id: 'justificacao', name: 'Justificação', color: '#9333ea', background: '#f3e8ff', textColor: '#7e22ce' },
  { id: 'santificacao', name: 'Santificação', color: '#6d28d9', background: '#f5f3ff', textColor: '#5b21b6' },
  { id: 'arrependimento', name: 'Arrependimento', color: '#dc2626', background: '#fff1f2', textColor: '#b91c1c' },
  { id: 'conversao', name: 'Conversão', color: '#16a34a', background: '#dcfce7', textColor: '#15803d' },
  { id: 'novaCriatura', name: 'Nova Criatura', color: '#059669', background: '#d1fae5', textColor: '#047857' },
  { id: 'perdao', name: 'Perdão', color: '#d946ef', background: '#fae8ff', textColor: '#a21caf' },
  // Espírito Santo (6)
  { id: 'batismoEsp', name: 'Batismo no Espírito', color: '#f59e0b', background: '#fef3c7', textColor: '#b45309' },
  { id: 'linguas', name: 'Línguas', color: '#d97706', background: '#fef9c3', textColor: '#92400e' },
  { id: 'donsEsp', name: 'Dons do Espírito', color: '#ea580c', background: '#ffedd5', textColor: '#c2410c' },
  { id: 'frutosEsp', name: 'Frutos do Espírito', color: '#65a30d', background: '#ecfccb', textColor: '#3f6212' },
  { id: 'uncao', name: 'Unção', color: '#ca8a04', background: '#fef9c3', textColor: '#854d0e' },
  { id: 'profecia', name: 'Profecia', color: '#b45309', background: '#fef3c7', textColor: '#92400e' },
  // Vida Cristã (12)
  { id: 'oracao', name: 'Oração', color: '#0e7490', background: '#cffafe', textColor: '#155e75' },
  { id: 'jejum', name: 'Jejum', color: '#4b5563', background: '#f3f4f6', textColor: '#374151' },
  { id: 'adoracao', name: 'Adoração', color: '#be185d', background: '#fce7f3', textColor: '#9d174d' },
  { id: 'fe', name: 'Fé', color: '#15803d', background: '#dcfce7', textColor: '#166534' },
  { id: 'esperanca', name: 'Esperança', color: '#1e40af', background: '#e0e7ff', textColor: '#1e3a8a' },
  { id: 'amor', name: 'Amor', color: '#be185d', background: '#fce7f3', textColor: '#9d174d' },
  { id: 'humildade', name: 'Humildade', color: '#854d0e', background: '#fef9c3', textColor: '#713f12' },
  { id: 'paciencia', name: 'Paciência', color: '#6b7280', background: '#f9fafb', textColor: '#374151' },
  { id: 'perseveranca', name: 'Perseverança', color: '#1d4ed8', background: '#dbeafe', textColor: '#1e40af' },
  { id: 'obediencia', name: 'Obediência', color: '#065f46', background: '#d1fae5', textColor: '#064e3b' },
  { id: 'mordomia', name: 'Mordomia', color: '#92400e', background: '#fef3c7', textColor: '#78350f' },
  { id: 'discipulado', name: 'Discipulado', color: '#0f766e', background: '#ccfbf1', textColor: '#134e4a' },
  // Conflito Espiritual (4)
  { id: 'guerraEsp', name: 'Guerra Espiritual', color: '#7f1d1d', background: '#fee2e2', textColor: '#991b1b' },
  { id: 'tentacao', name: 'Tentação', color: '#9f1239', background: '#ffe4e6', textColor: '#be123c' },
  { id: 'vitoria', name: 'Vitória', color: '#1d4ed8', background: '#dbeafe', textColor: '#1e40af' },
  { id: 'protecao', name: 'Proteção', color: '#155e75', background: '#cffafe', textColor: '#0e7490' },
  // Igreja e Missão (7)
  { id: 'igreja', name: 'Igreja', color: '#1e3a8a', background: '#dbeafe', textColor: '#1e40af' },
  { id: 'evangelismo', name: 'Evangelismo', color: '#15803d', background: '#dcfce7', textColor: '#166534' },
  { id: 'missoes', name: 'Missões', color: '#0369a1', background: '#e0f2fe', textColor: '#075985' },
  { id: 'batismoAgua', name: 'Batismo (água)', color: '#0891b2', background: '#cffafe', textColor: '#0e7490' },
  { id: 'ceia', name: 'Ceia do Senhor', color: '#7c3aed', background: '#ede9fe', textColor: '#6d28d9' },
  { id: 'lideranca', name: 'Liderança', color: '#1a1a1a', background: '#f0f0ee', textColor: '#1a1a1a' },
  { id: 'comunidade', name: 'Comunidade', color: '#059669', background: '#d1fae5', textColor: '#047857' },
  // Escatologia (6)
  { id: 'segundaVinda', name: 'Segunda Vinda', color: '#7c3aed', background: '#ede9fe', textColor: '#6d28d9' },
  { id: 'arrebatamento', name: 'Arrebatamento', color: '#6d28d9', background: '#f5f3ff', textColor: '#5b21b6' },
  { id: 'milenio', name: 'Milênio', color: '#4338ca', background: '#e0e7ff', textColor: '#3730a3' },
  { id: 'julgamento', name: 'Juízo Final', color: '#b91c1c', background: '#fee2e2', textColor: '#991b1b' },
  { id: 'novaJerusalem', name: 'Nova Jerusalém', color: '#0369a1', background: '#e0f2fe', textColor: '#075985' },
  { id: 'ressurreicao', name: 'Ressurreição', color: '#1d4ed8', background: '#dbeafe', textColor: '#1e40af' },
  // Cura e Promessas (5)
  { id: 'curaDivina', name: 'Cura Divina', color: '#16a34a', background: '#dcfce7', textColor: '#15803d' },
  { id: 'provisao', name: 'Provisão', color: '#ca8a04', background: '#fef9c3', textColor: '#854d0e' },
  { id: 'bencao', name: 'Bênção', color: '#d97706', background: '#fef3c7', textColor: '#b45309' },
  { id: 'paz', name: 'Paz', color: '#0f766e', background: '#ccfbf1', textColor: '#134e4a' },
  { id: 'forca', name: 'Força', color: '#1d4ed8', background: '#dbeafe', textColor: '#1e40af' },
  // Teologia Bíblica (6)
  { id: 'criacao', name: 'Criação', color: '#065f46', background: '#d1fae5', textColor: '#064e3b' },
  { id: 'alianca', name: 'Aliança', color: '#92400e', background: '#fef9c3', textColor: '#78350f' },
  { id: 'leiGraca', name: 'Lei e Graça', color: '#7c3aed', background: '#ede9fe', textColor: '#6d28d9' },
  { id: 'proposito', name: 'Propósito', color: '#b45309', background: '#fef3c7', textColor: '#92400e' },
  { id: 'sabedoria', name: 'Sabedoria', color: '#854d0e', background: '#fef9c3', textColor: '#713f12' },
  { id: 'identidade', name: 'Identidade', color: '#0369a1', background: '#e0f2fe', textColor: '#075985' },
  // Família (3)
  { id: 'familia', name: 'Família', color: '#be185d', background: '#fce7f3', textColor: '#9d174d' },
  { id: 'casamento', name: 'Casamento', color: '#db2777', background: '#fce7f3', textColor: '#9d174d' },
  { id: 'filhos', name: 'Filhos', color: '#16a34a', background: '#dcfce7', textColor: '#15803d' },
];

const TAG_CATEGORIES = [
  { id: 'atributos', label: 'Atributos de Deus', tagIds: ['soberania', 'onipotencia', 'fidelidade', 'misericordia', 'gloria', 'onipresenca', 'santidadeDeus', 'eternidade'] },
  { id: 'salvacao', label: 'Salvação', tagIds: ['graca', 'redencao', 'justificacao', 'santificacao', 'arrependimento', 'conversao', 'novaCriatura', 'perdao'] },
  { id: 'espirito', label: 'Espírito Santo', tagIds: ['batismoEsp', 'linguas', 'donsEsp', 'frutosEsp', 'uncao', 'profecia'] },
  { id: 'vida', label: 'Vida Cristã', tagIds: ['oracao', 'jejum', 'adoracao', 'fe', 'esperanca', 'amor', 'humildade', 'paciencia', 'perseveranca', 'obediencia', 'mordomia', 'discipulado'] },
  { id: 'conflito', label: 'Conflito Espiritual', tagIds: ['guerraEsp', 'tentacao', 'vitoria', 'protecao'] },
  { id: 'igreja', label: 'Igreja e Missão', tagIds: ['igreja', 'evangelismo', 'missoes', 'batismoAgua', 'ceia', 'lideranca', 'comunidade'] },
  { id: 'escato', label: 'Escatologia', tagIds: ['segundaVinda', 'arrebatamento', 'milenio', 'julgamento', 'novaJerusalem', 'ressurreicao'] },
  { id: 'cura', label: 'Cura e Promessas', tagIds: ['curaDivina', 'provisao', 'bencao', 'paz', 'forca'] },
  { id: 'teologia', label: 'Teologia Bíblica', tagIds: ['criacao', 'alianca', 'leiGraca', 'proposito', 'sabedoria', 'identidade'] },
  { id: 'familia', label: 'Família', tagIds: ['familia', 'casamento', 'filhos'] },
];

const sortNotes = (entries: Note[]) =>
  [...entries].sort((a, b) => {
    if (Boolean(b.pinned) !== Boolean(a.pinned)) {
      return Number(Boolean(b.pinned)) - Number(Boolean(a.pinned));
    }
    return b.updatedAt - a.updatedAt;
  });

const stripHtml = (value: string) => value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const buildExcerpt = (note: Note) => {
  const text = stripHtml(note.content);
  return text ? text.slice(0, 120) : 'Sem conteudo ainda';
};

export const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [draftNote, setDraftNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<NoteFilter>('all');
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const [stats, setStats] = useState<NoteStats>({ words: 0, chars: 0, lines: 1 });
  const [tagInput, setTagInput] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [tagColorMode, setTagColorMode] = useState<TagColorMode>('auto');
  const [autoColor, setAutoColor] = useState(genAutoColor());
  const [selectedPaletteIdx, setSelectedPaletteIdx] = useState(0);
  const [showTagCreator, setShowTagCreator] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('notes');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [googleDocsState, setGoogleDocsState] = useState<GoogleDocsState>('idle');
  const [googleDocsError, setGoogleDocsError] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const autosaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirtyRef = useRef(false);
  const { user } = useAppContext();

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      const [notesData, tagsData] = await Promise.all([
        storage.getNotes(),
        storage.getTags(),
      ]);
      const sorted = sortNotes(notesData);
      setNotes(sorted);

      if (tagsData.length === 0) {
        const now = Date.now();
        const seedTags: Tag[] = DEFAULT_THEOLOGICAL_TAGS.map((t, i) => ({
          ...t,
          createdAt: now + i,
        }));
        await Promise.all(seedTags.map(t => storage.saveTag(t)));
        setAllTags(seedTags);
      } else {
        setAllTags(tagsData);
      }

      if (sorted.length > 0) {
        setDraftNote(sorted[0]);
        setTagInput(sorted[0].tags.join(', '));
      }
    };

    fetchData();
  }, []);

  // Click outside to close export menu
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    if (showExportMenu) {
      document.addEventListener('mousedown', handler);
    }
    return () => document.removeEventListener('mousedown', handler);
  }, [showExportMenu]);

  // Reset Google Docs state on note change
  useEffect(() => {
    setGoogleDocsState('idle');
    setGoogleDocsError(null);
  }, [draftNote?.id]);

  // Autosave
  useEffect(() => {
    if (!draftNote || !dirtyRef.current) return;

    if (autosaveRef.current) clearTimeout(autosaveRef.current);
    setSaveState('saving');

    autosaveRef.current = setTimeout(async () => {
      await persistNote(draftNote);
    }, 1000);

    return () => {
      if (autosaveRef.current) clearTimeout(autosaveRef.current);
    };
  }, [draftNote]);

  const normalizeNote = (note: Note): Note => ({
    ...note,
    title: note.title.trim() || 'Sem titulo',
    updatedAt: Date.now(),
  });

  const persistNote = async (note: Note) => {
    const noteToSave = normalizeNote(note);
    await storage.saveNote(noteToSave);
    setNotes((prev) => sortNotes([noteToSave, ...prev.filter((entry) => entry.id !== noteToSave.id)]));
    setDraftNote(noteToSave);
    setSaveState('saved');
    dirtyRef.current = false;

    const text = stripHtml(noteToSave.content);
    setStats({
      words: text ? text.split(/\s+/).length : 0,
      chars: text.length,
      lines: (noteToSave.content.match(/<br\/?>/g) || []).length + 1,
    });
  };

  const handleCreateNote = () => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: 'Nova Anotação',
      content: '',
      tags: [],
      theme: draftNote?.theme || 'light',
      fontFamily: draftNote?.fontFamily || '"Lora", serif',
      fontSize: draftNote?.fontSize || 16,
      pinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setDraftNote(newNote);
    setNotes(prev => [newNote, ...prev]);
    setTagInput('');
  };

  const handleDeleteNote = async () => {
    if (!draftNote) return;
    if (!window.confirm('Excluir esta nota permanentemente?')) return;
    await storage.deleteNote(draftNote.id);
    setNotes(prev => prev.filter(n => n.id !== draftNote.id));
    setDraftNote(notes.filter(n => n.id !== draftNote.id)[0] || null);
  };

  const handleCopyContent = () => {
    if (!draftNote) return;
    navigator.clipboard.writeText(stripHtml(draftNote.content));
  };

  const handleExport = async (format: ExportFormat) => {
    if (!draftNote) {
      console.error('No draft note to export');
      return;
    }
    console.log('Exporting note:', draftNote.title, 'Format:', format);
    try {
      await exportNote(draftNote.title, draftNote.content, format);
      console.log('Export successful');
      setShowExportMenu(false);
    } catch (error) {
      console.error('Export error:', error);
      alert('Erro ao exportir: ' + (error as Error).message);
    }
  };

  const handleExportToGoogleDocs = async () => {
    if (!draftNote) {
      console.error('No draft note to export to Google Docs');
      return;
    }
    console.log('Exporting to Google Docs:', draftNote.title);
    setGoogleDocsState('exporting');
    setGoogleDocsError(null);

    try {
      let token = await getStoredGoogleAccessToken();
      console.log('Google token obtained:', token ? 'Yes' : 'No');
      if (!token) {
        console.log('Requesting Google login...');
        await loginWithGoogle();
        token = await getStoredGoogleAccessToken();
      }

      await exportNoteToGoogleDocs(draftNote, token);
      console.log('Google Docs export successful');
      setGoogleDocsState('success');
      setShowExportMenu(false);
      setTimeout(() => setGoogleDocsState('idle'), 3000);
    } catch (error: any) {
      console.error('Google Docs export error:', error);
      setGoogleDocsError(error.message || 'Erro ao exportar para Google Docs');
      setGoogleDocsState('error');
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    const paletteColor = PALETTE[selectedPaletteIdx];
    const colors = tagColorMode === 'auto' 
      ? { dot: autoColor.color, bg: autoColor.background, tc: autoColor.textColor }
      : { dot: paletteColor.dot, bg: paletteColor.bg, tc: paletteColor.tc };
    const tag = await TagService.createTag(newTagName, colors);
    setAllTags(prev => [...prev, tag]);
    setNewTagName('');
    if (tagColorMode === 'auto') setAutoColor(genAutoColor());
  };

  const handleAddTagToNote = (tagId: string) => {
    if (!draftNote) return;
    const updated = { ...draftNote, tags: [...new Set([...draftNote.tags, tagId])] };
    setDraftNote(updated);
    setTagInput(updated.tags.join(', '));
  };

  const handleRemoveTagFromNote = (tagId: string) => {
    if (!draftNote) return;
    const updated = { ...draftNote, tags: draftNote.tags.filter(t => t !== tagId) };
    setDraftNote(updated);
    setTagInput(updated.tags.join(', '));
  };

  const filteredNotes = useMemo(() => {
    let result = notes;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          stripHtml(n.content).toLowerCase().includes(q)
      );
    }
    if (filter === 'pinned') result = result.filter((n) => n.pinned);
    return result;
  }, [notes, searchQuery, filter]);

  // RENDERIZAÇÃO COM VISUAL PREMIUM + TODAS FUNCIONALIDADES
  return (
    <div className="h-full overflow-hidden">
      <div className="grid h-full grid-cols-1 xl:grid-cols-[340px_1fr] overflow-hidden">
        {/* Sidebar Premium */}
        <aside className="shrink-0 border-r border-bible-border/50 bg-bible-bg/50 flex flex-col">
          {/* Header Premium */}
          <div className="shrink-0 px-5 py-5 border-b border-bible-border/50">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Edit3 className="w-4 h-4 text-bible-accent" />
                  <span className="premium-kicker">Caderno de Estudo</span>
                </div>
                <h1 className="text-xl font-bold text-bible-text">Minhas Notas</h1>
                <p className="text-xs text-bible-text-muted mt-0.5">
                  {notes.length} {notes.length === 1 ? 'anotação' : 'anotações'}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCreateNote}
                className="premium-button p-2.5 shadow-lg"
              >
                <Plus className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-bible-text-muted" />
              <input
                type="text"
                placeholder="Buscar notas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="premium-input pl-9 py-2.5 text-sm"
              />
            </div>

            {/* Filter Tabs Premium */}
            <div className="flex gap-1.5 p-1 bg-bible-surface rounded-xl">
              {([
                { id: 'all' as const, label: 'Todas', icon: FolderOpen },
                { id: 'pinned' as const, label: 'Fixadas', icon: Pin },
              ]).map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFilter(tab.id)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all',
                    filter === tab.id
                      ? 'bg-gradient-to-r from-bible-accent to-bible-accent-strong text-white shadow-md'
                      : 'text-bible-text-muted hover:text-bible-text'
                  )}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Lista de Notas Premium */}
          <div className="flex-1 overflow-y-auto p-3">
            {filteredNotes.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 px-4"
              >
                <div className="inline-flex p-4 rounded-2xl bg-bible-accent/10 mb-4">
                  <FileText className="w-8 h-8 text-bible-accent" />
                </div>
                <h3 className="text-sm font-bold text-bible-text mb-1">
                  {searchQuery ? 'Nenhuma nota encontrada' : 'Nenhuma nota ainda'}
                </h3>
                <p className="text-xs text-bible-text-muted">
                  {searchQuery ? 'Tente outra busca' : 'Crie sua primeira anotação'}
                </p>
              </motion.div>
            ) : (
              <div className="space-y-2">
                {filteredNotes.map((note, i) => (
                  <motion.button
                    key={note.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.01, x: 2 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      setDraftNote(note);
                      setTagInput(note.tags.join(', '));
                    }}
                    className={cn(
                      'w-full text-left p-4 rounded-xl transition-all group',
                      draftNote?.id === note.id
                        ? 'bg-gradient-to-br from-bible-accent/10 to-bible-accent/5 border-2 border-bible-accent/30 shadow-md'
                        : 'bg-bible-surface hover:bg-bible-surface-strong border-2 border-transparent'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          {note.pinned && <Pin className="w-3.5 h-3.5 text-bible-accent" />}
                          <h3 className="text-sm font-bold text-bible-text truncate">
                            {note.title || 'Sem título'}
                          </h3>
                        </div>
                        <p className="text-xs text-bible-text-muted line-clamp-2 mb-2">
                          {buildExcerpt(note)}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {note.tags.slice(0, 2).map(tagId => {
                            const tag = allTags.find(t => t.id === tagId);
                            if (!tag) return null;
                            return (
                              <span
                                key={tagId}
                                className="px-2 py-0.5 rounded-full text-[9px] font-bold"
                                style={{
                                  backgroundColor: tag.background,
                                  color: tag.textColor,
                                }}
                              >
                                {tag.name}
                              </span>
                            );
                          })}
                          <span className="text-[9px] text-bible-text-muted flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {format(note.updatedAt, 'dd/MM HH:mm', { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-bible-text-muted group-hover:text-bible-accent group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Editor Premium */}
        <section className="min-w-0 flex flex-col bg-bible-bg">
          {draftNote ? (
            <>
              {/* Header do Editor Premium */}
              <div className="shrink-0 flex items-center gap-3 border-b border-bible-border/50 bg-bible-bg/80 px-6 py-4 backdrop-blur-xl">
                <div className="min-w-0 flex-1">
                  <input
                    type="text"
                    value={draftNote.title}
                    onChange={(e) =>
                      setDraftNote((prev) => (prev ? { ...prev, title: e.target.value } : null))
                    }
                    className="min-w-0 flex-1 bg-transparent text-xl font-bold outline-none placeholder:opacity-25 text-bible-text"
                    placeholder="Título da anotação"
                  />
                </div>

                {/* Save State Badge */}
                <div className={cn(
                  'px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all',
                  saveState === 'saved' && 'bg-emerald-500/10 text-emerald-600',
                  saveState === 'saving' && 'bg-amber-500/10 text-amber-600',
                  saveState === 'unsaved' && 'bg-red-500/10 text-red-600'
                )}>
                  {saveState === 'saved' ? 'Salvo' : saveState === 'saving' ? 'Salvando...' : 'Não salvo'}
                </div>

                {/* Ações */}
                <div className="flex items-center gap-1.5 border-l border-bible-border/50 pl-3">
                  {/* Pin */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setDraftNote(prev => prev ? { ...prev, pinned: !prev.pinned } : null)}
                    className="premium-icon-button"
                  >
                    {draftNote.pinned ? <PinOff className="w-4 h-4 text-bible-accent" /> : <Pin className="w-4 h-4" />}
                  </motion.button>

                  {/* Copy */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCopyContent}
                    className="premium-icon-button"
                  >
                    <Copy className="w-4 h-4" />
                  </motion.button>

                  {/* Export Dropdown */}
                  <div className="relative" ref={exportMenuRef}>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowExportMenu(!showExportMenu)}
                      className="premium-icon-button"
                    >
                      <Download className="w-4 h-4" />
                    </motion.button>

                    <AnimatePresence>
                      {showExportMenu && (
                        <>
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40"
                            onClick={() => setShowExportMenu(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.96 }}
                            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                            className="glass-panel absolute right-0 top-full mt-2 w-64 overflow-hidden p-2 shadow-xl z-50"
                          >
                            <div className="text-xs font-bold text-bible-text-muted px-3 py-2 mb-1 border-b border-bible-border/50">
                              Exportar Nota
                            </div>

                            {/* Google Docs */}
                            <motion.button
                              whileHover={{ scale: 1.02, x: 2 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={handleExportToGoogleDocs}
                              disabled={googleDocsState === 'exporting'}
                              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-bible-surface transition-all disabled:opacity-50"
                            >
                              <Globe className="w-4 h-4 text-blue-500" />
                              <div className="flex-1">
                                <div className="text-xs font-semibold text-bible-text">Google Docs</div>
                                <div className="text-[10px] text-bible-text-muted">
                                  {googleDocsState === 'exporting' ? 'Exportando...' :
                                    googleDocsState === 'success' ? 'Exportado com sucesso!' :
                                      googleDocsState === 'error' ? 'Erro na exportação' :
                                        'Abrir no Google Docs'}
                                </div>
                              </div>
                              {googleDocsState === 'success' && <Check className="w-4 h-4 text-green-500" />}
                            </motion.button>

                            <div className="h-px bg-bible-border/50 my-1" />

                            {/* File formats */}
                            {[
                              { format: 'pdf' as ExportFormat, icon: FileText, label: 'PDF', desc: 'Documento PDF' },
                              { format: 'docx' as ExportFormat, icon: FileSpreadsheet, label: 'DOCX', desc: 'Word moderno' },
                              { format: 'doc' as ExportFormat, icon: File, label: 'DOC', desc: 'Word legado (RTF)' },
                              { format: 'html' as ExportFormat, icon: Globe, label: 'HTML', desc: 'Página web' },
                            ].map(({ format, icon: Icon, label, desc }) => (
                              <motion.button
                                key={format}
                                whileHover={{ scale: 1.02, x: 2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleExport(format)}
                                className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-bible-surface transition-all"
                              >
                                <Icon className="w-4 h-4 text-bible-accent" />
                                <div className="flex-1">
                                  <div className="text-xs font-semibold text-bible-text">{label}</div>
                                  <div className="text-[10px] text-bible-text-muted">{desc}</div>
                                </div>
                              </motion.button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Delete */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDeleteNote}
                    className="premium-icon-button text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* Editor Area Premium */}
              <div className="min-h-0 flex-1 overflow-y-auto">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="h-full p-6"
                >
                  <RichTextEditor
                    html={draftNote.content}
                    onChange={(html) => {
                      setDraftNote((prev) => (prev ? { ...prev, content: html } : null));
                      dirtyRef.current = true;
                    }}
                    height="100%"
                  />
                </motion.div>
              </div>

              {/* Footer Premium com Tags */}
              <div className="shrink-0 border-t border-bible-border/50 bg-bible-bg/80 px-6 py-3 backdrop-blur-xl">
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Stats */}
                  <div className="flex items-center gap-3 text-xs text-bible-text-muted">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      {stats.words} palavras
                    </span>
                    <span className="flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5" />
                      {stats.chars} caracteres
                    </span>
                  </div>

                  {/* Tags Input Premium */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0 flex-wrap">
                      {draftNote.tags.map(tagId => {
                        const tag = allTags.find(t => t.id === tagId);
                        const color = tag 
                          ? { color: tag.color, background: tag.background, textColor: tag.textColor }
                          : genAutoColor();
                        return (
                          <motion.span
                            key={tagId}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1"
                            style={{
                              backgroundColor: color.background,
                              color: color.textColor,
                            }}
                          >
                            {tag?.name || 'Tag'}
                            <button
                              onClick={() => handleRemoveTagFromNote(tagId)}
                              className="ml-0.5 hover:opacity-70"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </motion.span>
                        );
                      })}
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => {
                          setTagInput(e.target.value);
                          setDraftNote((prev) =>
                            prev
                              ? {
                                ...prev,
                                tags: e.target.value
                                  .split(',')
                                  .map((t) => t.trim())
                                  .filter(Boolean),
                              }
                              : null
                          );
                        }}
                        placeholder="Adicionar tags..."
                        className="min-w-[80px] flex-1 bg-transparent text-xs outline-none placeholder:opacity-40 text-bible-text"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowTagCreator(!showTagCreator)}
                      className="premium-icon-button"
                    >
                      <TagIcon className="w-4 h-4 text-bible-accent" />
                    </motion.button>
                  </div>
                </div>

                {/* Tag Creator Panel */}
                <AnimatePresence>
                  {showTagCreator && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden border-t border-bible-border/50 mt-3 pt-3"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <TagIcon className="w-4 h-4 text-bible-accent" />
                        <span className="text-xs font-bold text-bible-text">Criar Nova Tag</span>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <input
                          type="text"
                          value={newTagName}
                          onChange={(e) => setNewTagName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
                          placeholder="Nome da tag..."
                          className="premium-input flex-1 py-2 text-sm"
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleCreateTag}
                          className="premium-button px-4 py-2 text-xs font-bold"
                          disabled={!newTagName.trim()}
                        >
                          Criar
                        </motion.button>
                      </div>

                      {/* Tag Categories */}
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {TAG_CATEGORIES.map((cat) => (
                          <div key={cat.id} className="rounded-xl bg-bible-surface overflow-hidden">
                            <button
                              onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
                              className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-bible-surface-strong transition-colors"
                            >
                              <span className="text-xs font-bold text-bible-text">{cat.label}</span>
                              <ChevronRight className={cn(
                                "w-3.5 h-3.5 text-bible-text-muted transition-transform",
                                expandedCategory === cat.id && "rotate-90"
                              )} />
                            </button>
                            <AnimatePresence>
                              {expandedCategory === cat.id && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="px-3 pb-2 flex flex-wrap gap-1.5"
                                >
                                  {cat.tagIds.map(tagId => {
                                    const tag = allTags.find(t => t.id === tagId);
                                    if (!tag) return null;
                                    const isSelected = draftNote?.tags.includes(tagId);
                                    return (
                                      <motion.button
                                        key={tagId}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                          if (isSelected) {
                                            handleRemoveTagFromNote(tagId);
                                          } else {
                                            handleAddTagToNote(tagId);
                                          }
                                        }}
                                        className={cn(
                                          "px-2.5 py-1 rounded-full text-[9px] font-bold transition-all",
                                          isSelected && "ring-2 ring-bible-accent/40 scale-105"
                                        )}
                                        style={{
                                          backgroundColor: tag.background,
                                          color: tag.textColor,
                                        }}
                                      >
                                        {tag.name}
                                      </motion.button>
                                    );
                                  })}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            /* Empty State Premium */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex h-full flex-col items-center justify-center px-6 text-center"
            >
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-bible-accent/10 to-bible-accent/5 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-bible-accent/30" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-bible-accent/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-bible-accent" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-bible-text mb-2">
                Caderno de Estudo
              </h2>
              <p className="text-sm text-bible-text-muted max-w-md mb-8 leading-relaxed">
                Crie anotações, organize suas ideias e aprofunde seu estudo da Palavra
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateNote}
                className="premium-button px-8 py-4 inline-flex items-center gap-2 text-sm font-bold"
              >
                <Plus className="w-5 h-5" />
                Criar primeira anotação
              </motion.button>
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
};
