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
import { getThemePreset } from '../theme/presets';
import { getStoredGoogleAccessToken, loginWithGoogle } from '../firebase';
import { exportNoteToGoogleDocs } from '../services/googleDocsService';
import { exportNote, type ExportFormat } from '../services/ExportService';
import { TagService, PALETTE } from '../services/TagService';
import { NoteEditorModal } from './NoteEditorModal';

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
let hueIdx = 0;

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
  const h = (base + (((hueIdx * 7) % 30) - 15) + 360) % 360;
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

const ActionButton = ({ icon: Icon, active, onClick, label, disabled }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "p-2.5 rounded-xl transition-all group relative flex items-center justify-center",
      active ? "bg-bible-accent text-white shadow-lg shadow-bible-accent/20" : "text-bible-text-muted hover:bg-bible-surface hover:text-bible-text disabled:opacity-50"
    )}
  >
    <Icon className="w-4 h-4" />
    <span className="absolute -bottom-8 bg-bible-bg border border-bible-border/50 text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
      {label}
    </span>
  </button>
);

interface NotesProps {
  isActive?: boolean;
}

export const Notes: React.FC<NotesProps> = ({ isActive = true }) => {
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
  const [autoColor, setAutoColor] = useState(() => ({ color: '#8b5cf6', background: '#f3e8ff', textColor: '#7c3aed' }));
  const [selectedPaletteIdx, setSelectedPaletteIdx] = useState(0);
  const [showTagCreator, setShowTagCreator] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('notes');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [googleDocsState, setGoogleDocsState] = useState<GoogleDocsState>('idle');
  const [googleDocsError, setGoogleDocsError] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const autosaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirtyRef = useRef(false);
  const { user, config } = useAppContext();

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
    setEditingNote(newNote);
    setIsEditorModalOpen(true);
    setTagInput('');
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsEditorModalOpen(true);
  };

  const handleModalSave = (note: Note) => {
    // Update the note in the list
    setNotes(prev => prev.map(n => n.id === note.id ? note : n));
    // If it was a new note, add it to the list
    if (!notes.find(n => n.id === note.id)) {
      setNotes(prev => [note, ...prev]);
    }
  };

  const handleModalDelete = (noteId: string) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));
    setIsEditorModalOpen(false);
    setEditingNote(null);
  };

  const handleModalClose = () => {
    setIsEditorModalOpen(false);
    setEditingNote(null);
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

      if (!token) {
        throw new Error('Token de acesso não disponível');
      }

      await exportNoteToGoogleDocs(draftNote, token);
      console.log('Google Docs export successful');
      setGoogleDocsState('success');
      setShowExportMenu(false);
      setTimeout(() => setGoogleDocsState('idle'), 3000);
    } catch (error: any) {
      console.error('Google Docs export error:', error);
      const msg = error.message || 'Erro ao exportar para Google Docs';
      setGoogleDocsError(msg);
      setGoogleDocsState('error');
      alert(`Falha na exportação para o Google Drive:\n\n${msg}\n\n(Verifique se o Firebase está configurado)`);
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
    <>
      <div className={cn("h-full overflow-hidden", !isActive && "hidden")}>
        <div className="grid h-full grid-cols-1 xl:grid-cols-[340px_1fr] overflow-hidden">
        {/* Sidebar Premium */}
        <aside className="shrink-0 border-r border-bible-border/50 bg-bible-bg/50 flex flex-col">
          {/* Header Dashboard Style */}
          <div className="shrink-0 px-6 py-8">
            <div className="flex items-start justify-between mb-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-bible-accent/10">
                    <Edit3 className="w-4 h-4 text-bible-accent" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-bible-accent">Studio</span>
                </div>
                <h1 className="text-3xl font-black text-bible-text tracking-tighter">Caderno</h1>
                <p className="text-[10px] font-bold text-bible-text-muted uppercase tracking-widest mt-1 opacity-60">
                  {notes.length} {notes.length === 1 ? 'Nota' : 'Notas'}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCreateNote}
                className="w-12 h-12 rounded-2xl bg-bible-accent text-white flex items-center justify-center shadow-xl shadow-bible-accent/20 transition-transform active:scale-90"
              >
                <Plus className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Search Input Pro Max */}
            <div className="relative group">
              <div className="absolute inset-0 bg-bible-accent/5 rounded-[20px] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-bible-text-muted group-focus-within:text-bible-accent transition-colors z-10" />
              <input
                type="text"
                placeholder="Pesquisar em suas notas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-12 pr-4 rounded-[20px] bg-bible-surface border border-bible-border/50 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-bible-accent/10 focus:border-bible-accent transition-all relative z-10"
              />
            </div>

            {/* Filter Tabs Premium */}
            <div className="flex gap-2 p-1 bg-bible-surface/50 border border-bible-border/30 rounded-2xl mt-6">
              {([
                { id: 'all' as const, label: 'Todas', icon: FolderOpen },
                { id: 'pinned' as const, label: 'Favoritas', icon: Pin },
              ]).map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFilter(tab.id)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                    filter === tab.id
                      ? 'bg-white text-bible-text shadow-sm ring-1 ring-black/5'
                      : 'text-bible-text-muted hover:text-bible-text'
                  )}
                >
                  <tab.icon className={cn("w-3.5 h-3.5", filter === tab.id ? "text-bible-accent" : "")} />
                  {tab.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Lista de Notas Pro Max */}
          <div className="flex-1 overflow-y-auto px-4 pb-12 custom-scrollbar">
            {filteredNotes.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 rounded-3xl bg-bible-surface flex items-center justify-center mx-auto mb-4 border border-bible-border/50">
                  <FileText className="w-7 h-7 text-bible-text-muted/30" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-bible-text-muted opacity-50">Vazio</h3>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {filteredNotes.map((note, i) => (
                  <motion.button
                    key={note.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleEditNote(note)}
                    className={cn(
                      'w-full text-left p-5 rounded-[28px] transition-all relative overflow-hidden group',
                      draftNote?.id === note.id
                        ? 'bg-bible-accent text-white shadow-2xl shadow-bible-accent/20'
                        : 'bg-bible-surface border border-bible-border/50 hover:bg-bible-surface-strong'
                    )}
                  >
                    {/* Active Accent Line */}
                    {draftNote?.id === note.id && (
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-3xl rounded-full -mr-12 -mt-12" />
                    )}

                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        {note.pinned && <Pin className={cn("w-3.5 h-3.5", draftNote?.id === note.id ? "text-white" : "text-bible-accent")} />}
                        <h3 className={cn(
                          "text-sm font-black tracking-tight truncate",
                          draftNote?.id === note.id ? "text-white" : "text-bible-text"
                        )}>
                          {note.title || 'Nova Anotação'}
                        </h3>
                      </div>
                      
                      <p className={cn(
                        "text-xs line-clamp-2 mb-4 leading-relaxed",
                        draftNote?.id === note.id ? "text-white/70" : "text-bible-text-muted"
                      )}>
                        {buildExcerpt(note)}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {note.tags.slice(0, 3).map(tagId => {
                            const tag = allTags.find(t => t.id === tagId);
                            if (!tag) return null;
                            return (
                              <div
                                key={tagId}
                                className="w-2.5 h-2.5 rounded-full border-2 border-current shadow-sm"
                                style={{ backgroundColor: tag.color, color: draftNote?.id === note.id ? '#fff' : tag.background }}
                                title={tag.name}
                              />
                            );
                          })}
                        </div>
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-widest opacity-40",
                          draftNote?.id === note.id ? "text-white" : "text-bible-text-muted"
                        )}>
                          {format(note.updatedAt, 'dd MMM', { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Editor Premium */}
        <section className="min-w-0 flex flex-col bg-bible-bg relative">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-bible-accent/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />

          {draftNote ? (
            <>
              {/* Header do Editor Pro Max */}
              <div className="shrink-0 flex items-center gap-6 border-b border-bible-border/30 bg-bible-bg/40 px-10 py-8 backdrop-blur-xl relative z-10">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={cn(
                      'px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all shadow-sm',
                      saveState === 'saved' && 'bg-emerald-500 text-white',
                      saveState === 'saving' && 'bg-amber-500 text-white animate-pulse',
                      saveState === 'unsaved' && 'bg-red-500 text-white'
                    )}>
                      {saveState === 'saved' ? 'Sincronizado' : saveState === 'saving' ? 'Salvando...' : 'Não salvo'}
                    </div>
                    <span className="text-[10px] font-bold text-bible-text-muted opacity-50 uppercase tracking-tighter">
                      Última edição: {format(draftNote.updatedAt, "HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={draftNote.title}
                    onChange={(e) =>
                      setDraftNote((prev) => (prev ? { ...prev, title: e.target.value } : null))
                    }
                    className="w-full bg-transparent text-4xl font-black outline-none placeholder:opacity-10 text-bible-text tracking-tighter"
                    placeholder="Título da anotação..."
                  />
                </div>

                {/* Ações de Topo Pro Max */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-bible-surface/80 border border-bible-border/50 rounded-2xl p-1 gap-1">
                    <ActionButton icon={Pin} active={draftNote.pinned} onClick={() => setDraftNote(prev => prev ? { ...prev, pinned: !prev.pinned } : null)} label={draftNote.pinned ? "Fixado" : "Fixar"} />
                    <ActionButton icon={Copy} onClick={handleCopyContent} label="Copiar" />
                    
                    {/* Export Trigger */}
                    <div className="relative" ref={exportMenuRef}>
                      <ActionButton 
                        icon={Download} 
                        active={showExportMenu} 
                        onClick={() => setShowExportMenu(!showExportMenu)} 
                        label="Exportar" 
                      />
                      <AnimatePresence>
                        {showExportMenu && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 top-full mt-3 w-72 bg-bible-surface border border-bible-border/50 rounded-[24px] shadow-2xl p-3 z-50 overflow-hidden"
                          >
                            <div className="px-4 py-3 mb-2">
                              <span className="text-[10px] font-black uppercase tracking-widest text-bible-text-muted opacity-50">Opções de Exportação</span>
                            </div>
                            
                            {/* Google Docs */}
                            <button
                              onClick={handleExportToGoogleDocs}
                              disabled={googleDocsState === 'exporting'}
                              className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-bible-accent/10 transition-all text-left group mb-2"
                            >
                              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Globe className="w-5 h-5 text-blue-500" />
                              </div>
                              <div className="flex-1">
                                <div className="text-xs font-bold text-bible-text">Google Docs</div>
                                <div className="text-[10px] text-bible-text-muted">Nuvem do Google</div>
                              </div>
                              {googleDocsState === 'success' && <Check className="w-4 h-4 text-green-500" />}
                            </button>

                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { format: 'pdf' as ExportFormat, icon: FileText, label: 'PDF', color: 'text-red-500' },
                                { format: 'docx' as ExportFormat, icon: FileSpreadsheet, label: 'Word', color: 'text-blue-600' },
                                { format: 'doc' as ExportFormat, icon: File, label: 'RTF', color: 'text-blue-400' },
                                { format: 'html' as ExportFormat, icon: Globe, label: 'Web', color: 'text-emerald-500' },
                              ].map(({ format, icon: Icon, label, color }) => (
                                <button
                                  key={format}
                                  onClick={() => handleExport(format)}
                                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-bible-surface-strong border border-transparent hover:border-bible-border/50 transition-all"
                                >
                                  <Icon className={cn("w-5 h-5", color)} />
                                  <span className="text-[10px] font-bold text-bible-text">{label}</span>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDeleteNote}
                    className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/5"
                  >
                    <Trash2 className="w-5 h-5" />
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
                    theme={
                      (config?.mode === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) || 
                      (config?.mode !== 'system' && getThemePreset(config?.mode || 'default').family === 'dark') 
                        ? 'dark' : 'light'
                    }
                    html={draftNote.content}
                    onChange={(html) => {
                      setDraftNote((prev) => (prev ? { ...prev, content: html } : null));
                      dirtyRef.current = true;
                    }}
                    height="100%"
                  />
                </motion.div>
              </div>

              {/* Footer Pro Max com Tags */}
              <div className="shrink-0 border-t border-bible-border/30 bg-bible-bg/40 px-10 py-6 backdrop-blur-xl relative z-10">
                <div className="flex items-center gap-8">
                  {/* Stats Pro Max */}
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-bible-text-muted opacity-40 mb-1">Palavras</span>
                      <span className="text-sm font-bold text-bible-text">{stats.words}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-bible-text-muted opacity-40 mb-1">Caracteres</span>
                      <span className="text-sm font-bold text-bible-text">{stats.chars}</span>
                    </div>
                  </div>

                  <div className="h-10 w-px bg-bible-border/30" />

                  {/* Tags Area Pro Max */}
                  <div className="flex-1 flex items-center gap-4 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 flex-1">
                      {draftNote.tags.map(tagId => {
                        const tag = allTags.find(t => t.id === tagId);
                        if (!tag) return null;
                        return (
                          <motion.span
                            key={tagId}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="pl-3 pr-2 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-2 group shadow-sm border border-black/5"
                            style={{ backgroundColor: tag.background, color: tag.textColor }}
                          >
                            {tag.name}
                            <button
                              onClick={() => handleRemoveTagFromNote(tagId)}
                              className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-colors"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </motion.span>
                        );
                      })}
                      
                      <div className="relative flex-1 min-w-[120px]">
                        <TagIcon className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-bible-text-muted opacity-40" />
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
                          placeholder="Adicionar etiquetas (separadas por vírgula)..."
                          className="w-full pl-6 bg-transparent text-xs font-medium outline-none placeholder:opacity-30 text-bible-text"
                        />
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowTagCreator(!showTagCreator)}
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-bible-accent/5",
                        showTagCreator ? "bg-bible-accent text-white" : "bg-bible-surface text-bible-accent hover:bg-bible-accent/10"
                      )}
                    >
                      <Plus className={cn("w-5 h-5 transition-transform", showTagCreator && "rotate-45")} />
                    </motion.button>
                  </div>
                </div>

                {/* Tag Creator Panel Pro Max */}
                <AnimatePresence>
                  {showTagCreator && (
                    <motion.div
                      initial={{ height: 0, opacity: 0, y: 20 }}
                      animate={{ height: 'auto', opacity: 1, y: 0 }}
                      exit={{ height: 0, opacity: 0, y: 20 }}
                      className="overflow-hidden mt-6"
                    >
                      <div className="premium-card-strong p-6 rounded-[32px] border border-bible-border/50 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-bible-accent/10 flex items-center justify-center">
                              <TagIcon className="w-4 h-4 text-bible-accent" />
                            </div>
                            <span className="text-sm font-black uppercase tracking-widest text-bible-text">Biblioteca de Etiquetas</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={newTagName}
                              onChange={(e) => setNewTagName(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
                              placeholder="Nova etiqueta..."
                              className="h-10 px-4 bg-bible-bg border border-bible-border/50 rounded-xl text-xs font-bold outline-none focus:border-bible-accent transition-colors"
                            />
                            <button
                              onClick={handleCreateTag}
                              disabled={!newTagName.trim()}
                              className="h-10 px-6 bg-bible-accent text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                            >
                              Criar
                            </button>
                          </div>
                        </div>

                        {/* Tag Categories Pro Max */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                          {TAG_CATEGORIES.map((cat) => (
                            <div key={cat.id} className="p-4 rounded-2xl bg-bible-bg/50 border border-bible-border/30 hover:border-bible-accent/30 transition-colors">
                              <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-bible-text opacity-70">{cat.label}</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-bible-accent/30" />
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {cat.tagIds.map(tagId => {
                                  const tag = allTags.find(t => t.id === tagId);
                                  if (!tag) return null;
                                  const isSelected = draftNote?.tags.includes(tagId);
                                  return (
                                    <button
                                      key={tagId}
                                      onClick={() => isSelected ? handleRemoveTagFromNote(tagId) : handleAddTagToNote(tagId)}
                                      className={cn(
                                        "px-3 py-1.5 rounded-xl text-[9px] font-bold transition-all border border-transparent",
                                        isSelected ? "ring-2 ring-bible-accent shadow-lg scale-105" : "opacity-80 hover:opacity-100 hover:scale-105"
                                      )}
                                      style={{ backgroundColor: tag.background, color: tag.textColor, borderColor: isSelected ? 'transparent' : 'rgba(0,0,0,0.05)' }}
                                    >
                                      {tag.name}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            /* Empty State Premium */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex h-full flex-col items-center justify-center px-10 text-center relative z-10"
            >
              <div className="relative mb-10">
                <div className="absolute inset-0 bg-bible-accent/20 blur-3xl rounded-full" />
                <div className="w-40 h-40 rounded-[40px] bg-bible-surface border border-bible-border/50 flex items-center justify-center relative z-10 shadow-2xl">
                  <BookOpen className="w-20 h-20 text-bible-accent opacity-20" />
                </div>
                <motion.div 
                  animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-4 -right-4 w-12 h-12 rounded-2xl bg-bible-accent flex items-center justify-center shadow-xl shadow-bible-accent/20 z-20"
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </motion.div>
              </div>
              
              <h2 className="text-4xl font-black text-bible-text mb-4 tracking-tighter">Seu Espaço de Estudo</h2>
              <p className="text-sm text-bible-text-muted max-w-sm mb-12 leading-relaxed opacity-70">
                Capture revelações, organize seus temas teológicos e crie um acervo pessoal de conhecimento bíblico.
              </p>
              
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateNote}
                className="h-16 px-10 bg-bible-accent text-white rounded-[20px] inline-flex items-center gap-3 text-sm font-black uppercase tracking-widest shadow-2xl shadow-bible-accent/20"
              >
                <Plus className="w-6 h-6" />
                Começar Jornada
              </motion.button>
            </motion.div>
          )}
        </section>
      </div>
      </div>

      {/* Note Editor Modal */}
      <NoteEditorModal
        note={editingNote}
        isOpen={isEditorModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        onDelete={handleModalDelete}
        availableTags={allTags}
      />
    </>
  );
};
