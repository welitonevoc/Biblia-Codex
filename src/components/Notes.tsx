import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
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

const PALETTE = [
  { color: '#1a1a1a', background: '#f0f0ee', textColor: '#1a1a1a' },
  { color: '#2563eb', background: '#dbeafe', textColor: '#1d4ed8' },
  { color: '#16a34a', background: '#dcfce7', textColor: '#15803d' },
  { color: '#9333ea', background: '#f3e8ff', textColor: '#7e22ce' },
  { color: '#ea580c', background: '#ffedd5', textColor: '#c2410c' },
  { color: '#db2777', background: '#fce7f3', textColor: '#be185d' },
  { color: '#0891b2', background: '#cffafe', textColor: '#0e7490' },
  { color: '#854d0e', background: '#fef9c3', textColor: '#713f12' },
];

// 65 etiquetas teológicas organizadas em 10 categorias
const DEFAULT_THEOLOGICAL_TAGS: Omit<Tag, 'createdAt'>[] = [
  // Atributos de Deus
  { id: 'soberania', name: 'Soberania', color: '#1e3a8a', background: '#dbeafe', textColor: '#1e40af' },
  { id: 'onipotencia', name: 'Onipotência', color: '#1d4ed8', background: '#eff6ff', textColor: '#1e40af' },
  { id: 'fidelidade', name: 'Fidelidade', color: '#0369a1', background: '#e0f2fe', textColor: '#075985' },
  { id: 'misericordia', name: 'Misericórdia', color: '#0891b2', background: '#cffafe', textColor: '#0e7490' },
  { id: 'gloria', name: 'Glória de Deus', color: '#1e40af', background: '#e0e7ff', textColor: '#1e3a8a' },
  { id: 'onipresenca', name: 'Onipresença', color: '#075985', background: '#e0f2fe', textColor: '#0c4a6e' },
  { id: 'santidadeDeus', name: 'Santidade', color: '#1a1a1a', background: '#f0f0ee', textColor: '#1a1a1a' },
  { id: 'eternidade', name: 'Eternidade', color: '#334155', background: '#f1f5f9', textColor: '#1e293b' },
  // Salvação
  { id: 'graca', name: 'Graça', color: '#7c3aed', background: '#ede9fe', textColor: '#6d28d9' },
  { id: 'redencao', name: 'Redenção', color: '#b91c1c', background: '#fee2e2', textColor: '#991b1b' },
  { id: 'justificacao', name: 'Justificação', color: '#9333ea', background: '#f3e8ff', textColor: '#7e22ce' },
  { id: 'santificacao', name: 'Santificação', color: '#6d28d9', background: '#f5f3ff', textColor: '#5b21b6' },
  { id: 'arrependimento', name: 'Arrependimento', color: '#dc2626', background: '#fff1f2', textColor: '#b91c1c' },
  { id: 'conversao', name: 'Conversão', color: '#16a34a', background: '#dcfce7', textColor: '#15803d' },
  { id: 'novaCriatura', name: 'Nova Criatura', color: '#059669', background: '#d1fae5', textColor: '#047857' },
  { id: 'perdao', name: 'Perdão', color: '#d946ef', background: '#fae8ff', textColor: '#a21caf' },
  // Espírito Santo
  { id: 'batismoEsp', name: 'Batismo no Espírito', color: '#f59e0b', background: '#fef3c7', textColor: '#b45309' },
  { id: 'linguas', name: 'Línguas', color: '#d97706', background: '#fef9c3', textColor: '#92400e' },
  { id: 'donsEsp', name: 'Dons do Espírito', color: '#ea580c', background: '#ffedd5', textColor: '#c2410c' },
  { id: 'frutosEsp', name: 'Frutos do Espírito', color: '#65a30d', background: '#ecfccb', textColor: '#3f6212' },
  { id: 'uncao', name: 'Unção', color: '#ca8a04', background: '#fef9c3', textColor: '#854d0e' },
  { id: 'profecia', name: 'Profecia', color: '#b45309', background: '#fef3c7', textColor: '#92400e' },
  // Vida Cristã
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
  // Conflito Espiritual
  { id: 'guerraEsp', name: 'Guerra Espiritual', color: '#7f1d1d', background: '#fee2e2', textColor: '#991b1b' },
  { id: 'tentacao', name: 'Tentação', color: '#9f1239', background: '#ffe4e6', textColor: '#be123c' },
  { id: 'vitoria', name: 'Vitória', color: '#1d4ed8', background: '#dbeafe', textColor: '#1e40af' },
  { id: 'protecao', name: 'Proteção', color: '#155e75', background: '#cffafe', textColor: '#0e7490' },
  // Igreja e Missão
  { id: 'igreja', name: 'Igreja', color: '#1e3a8a', background: '#dbeafe', textColor: '#1e40af' },
  { id: 'evangelismo', name: 'Evangelismo', color: '#15803d', background: '#dcfce7', textColor: '#166534' },
  { id: 'missoes', name: 'Missões', color: '#0369a1', background: '#e0f2fe', textColor: '#075985' },
  { id: 'batismoAgua', name: 'Batismo (água)', color: '#0891b2', background: '#cffafe', textColor: '#0e7490' },
  { id: 'ceia', name: 'Ceia do Senhor', color: '#7c3aed', background: '#ede9fe', textColor: '#6d28d9' },
  { id: 'lideranca', name: 'Liderança', color: '#1a1a1a', background: '#f0f0ee', textColor: '#1a1a1a' },
  { id: 'comunidade', name: 'Comunidade', color: '#059669', background: '#d1fae5', textColor: '#047857' },
  // Escatologia
  { id: 'segundaVinda', name: 'Segunda Vinda', color: '#7c3aed', background: '#ede9fe', textColor: '#6d28d9' },
  { id: 'arrebatamento', name: 'Arrebatamento', color: '#6d28d9', background: '#f5f3ff', textColor: '#5b21b6' },
  { id: 'milenio', name: 'Milênio', color: '#4338ca', background: '#e0e7ff', textColor: '#3730a3' },
  { id: 'julgamento', name: 'Juízo Final', color: '#b91c1c', background: '#fee2e2', textColor: '#991b1b' },
  { id: 'novaJerusalem', name: 'Nova Jerusalém', color: '#0369a1', background: '#e0f2fe', textColor: '#075985' },
  { id: 'ressurreicao', name: 'Ressurreição', color: '#1d4ed8', background: '#dbeafe', textColor: '#1e40af' },
  // Cura e Promessas
  { id: 'curaDivina', name: 'Cura Divina', color: '#16a34a', background: '#dcfce7', textColor: '#15803d' },
  { id: 'provisao', name: 'Provisão', color: '#ca8a04', background: '#fef9c3', textColor: '#854d0e' },
  { id: 'bencao', name: 'Bênção', color: '#d97706', background: '#fef3c7', textColor: '#b45309' },
  { id: 'paz', name: 'Paz', color: '#0f766e', background: '#ccfbf1', textColor: '#134e4a' },
  { id: 'forca', name: 'Força', color: '#1d4ed8', background: '#dbeafe', textColor: '#1e40af' },
  // Teologia Bíblica
  { id: 'criacao', name: 'Criação', color: '#065f46', background: '#d1fae5', textColor: '#064e3b' },
  { id: 'alianca', name: 'Aliança', color: '#92400e', background: '#fef9c3', textColor: '#78350f' },
  { id: 'leiGraca', name: 'Lei e Graça', color: '#7c3aed', background: '#ede9fe', textColor: '#6d28d9' },
  { id: 'proposito', name: 'Propósito', color: '#b45309', background: '#fef3c7', textColor: '#92400e' },
  { id: 'sabedoria', name: 'Sabedoria', color: '#854d0e', background: '#fef9c3', textColor: '#713f12' },
  { id: 'identidade', name: 'Identidade', color: '#0369a1', background: '#e0f2fe', textColor: '#075985' },
  // Família
  { id: 'familia', name: 'Família', color: '#be185d', background: '#fce7f3', textColor: '#9d174d' },
  { id: 'casamento', name: 'Casamento', color: '#db2777', background: '#fce7f3', textColor: '#9d174d' },
  { id: 'filhos', name: 'Filhos', color: '#16a34a', background: '#dcfce7', textColor: '#15803d' },
];

const TAG_CATEGORIES = [
  { id: 'atributos', label: 'Atributos de Deus', tagIds: ['soberania','onipotencia','fidelidade','misericordia','gloria','onipresenca','santidadeDeus','eternidade'] },
  { id: 'salvacao', label: 'Salvação', tagIds: ['graca','redencao','justificacao','santificacao','arrependimento','conversao','novaCriatura','perdao'] },
  { id: 'espirito', label: 'Espírito Santo', tagIds: ['batismoEsp','linguas','donsEsp','frutosEsp','uncao','profecia'] },
  { id: 'vida', label: 'Vida Cristã', tagIds: ['oracao','jejum','adoracao','fe','esperanca','amor','humildade','paciencia','perseveranca','obediencia','mordomia','discipulado'] },
  { id: 'conflito', label: 'Conflito Espiritual', tagIds: ['guerraEsp','tentacao','vitoria','protecao'] },
  { id: 'igreja', label: 'Igreja e Missão', tagIds: ['igreja','evangelismo','missoes','batismoAgua','ceia','lideranca','comunidade'] },
  { id: 'escato', label: 'Escatologia', tagIds: ['segundaVinda','arrebatamento','milenio','julgamento','novaJerusalem','ressurreicao'] },
  { id: 'cura', label: 'Cura e Promessas', tagIds: ['curaDivina','provisao','bencao','paz','forca'] },
  { id: 'teologia', label: 'Teologia Bíblica', tagIds: ['criacao','alianca','leiGraca','proposito','sabedoria','identidade'] },
  { id: 'familia', label: 'Família', tagIds: ['familia','casamento','filhos'] },
];

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

const DEFAULT_NOTE: Pick<Note, 'title' | 'content' | 'tags' | 'theme' | 'fontFamily' | 'fontSize' | 'pinned'> = {
  title: 'Nova Anotacao',
  content: '',
  tags: [],
  theme: 'dark',
  fontFamily: '"Lora", serif',
  fontSize: 16,
  pinned: false,
};

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

  useEffect(() => {
    const fetchData = async () => {
      const [notesData, tagsData] = await Promise.all([
        storage.getNotes(),
        storage.getTags(),
      ]);
      const sorted = sortNotes(notesData);
      setNotes(sorted);

      // Seed default theological tags if none exist
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

  useEffect(() => {
    setGoogleDocsState('idle');
    setGoogleDocsError(null);
  }, [draftNote?.id]);

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
    createdAt: note.createdAt ?? Date.now(),
  });

  const persistNote = async (note: Note) => {
    const noteToSave = normalizeNote(note);
    await storage.saveNote(noteToSave);
    setNotes((prev) => sortNotes([noteToSave, ...prev.filter((entry) => entry.id !== noteToSave.id)]));
    setDraftNote(noteToSave);
    dirtyRef.current = false;
    setSaveState('saved');
    return noteToSave;
  };

  const updateDraft = (updater: (note: Note) => Note) => {
    setDraftNote((current) => {
      if (!current) return current;
      dirtyRef.current = true;
      setSaveState('unsaved');
      return updater(current);
    });
  };

  const persistImmediately = async () => {
    if (!draftNote) return null;
    if (autosaveRef.current) clearTimeout(autosaveRef.current);
    setSaveState('saving');
    return persistNote(draftNote);
  };

  const getPreparedNote = async () => {
    if (!draftNote) return null;
    const prepared = normalizeNote(draftNote);

    if (dirtyRef.current || saveState !== 'saved') {
      if (autosaveRef.current) clearTimeout(autosaveRef.current);
      setSaveState('saving');
      return persistNote(prepared);
    }

    return prepared;
  };

  const handleCreateNote = () => {
    const freshNote: Note = {
      id: `note-${Date.now()}`,
      ...DEFAULT_NOTE,
      updatedAt: Date.now(),
      createdAt: Date.now(),
    };

    setDraftNote(freshNote);
    setTagInput('');
    dirtyRef.current = true;
    setSaveState('unsaved');
  };

  const handleDuplicateNote = async () => {
    if (!draftNote) return;

    const duplicate: Note = {
      ...draftNote,
      id: `note-${Date.now()}`,
      title: `${draftNote.title} (copia)`,
      updatedAt: Date.now(),
      createdAt: Date.now(),
      pinned: false,
    };

    await storage.saveNote(duplicate);
    const sorted = sortNotes([duplicate, ...notes.filter((note) => note.id !== duplicate.id)]);
    setNotes(sorted);
    setDraftNote(duplicate);
    setTagInput(duplicate.tags.join(', '));
    dirtyRef.current = false;
    setSaveState('saved');
  };

  const handleDeleteNote = async (id: string) => {
    await storage.deleteNote(id);
    const remaining = notes.filter((note) => note.id !== id);
    const sorted = sortNotes(remaining);
    setNotes(sorted);

    if (draftNote?.id === id) {
      setDraftNote(sorted[0] ?? null);
      setTagInput(sorted[0]?.tags.join(', ') ?? '');
      dirtyRef.current = false;
      setSaveState('saved');
    }
  };

  const handleSelectNote = (note: Note) => {
    if (autosaveRef.current) clearTimeout(autosaveRef.current);
    setDraftNote(note);
    setTagInput(note.tags.join(', '));
    dirtyRef.current = false;
    setSaveState('saved');
    setShowExportMenu(false);
  };

  const handleCreateTag = async () => {
    const raw = newTagName.trim().replace(/^#/, '');
    if (!raw) return;
    const id = raw.toLowerCase().replace(/\s+/g, '_').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (allTags.find(t => t.id === id)) return;

    const colors = tagColorMode === 'auto' ? autoColor : PALETTE[selectedPaletteIdx];
    const newTag: Tag = {
      id,
      name: raw,
      color: colors.color,
      background: colors.background,
      textColor: colors.textColor,
      createdAt: Date.now(),
    };

    await storage.saveTag(newTag);
    setAllTags(prev => [...prev, newTag]);
    setNewTagName('');

    if (tagColorMode === 'auto') {
      setAutoColor(genAutoColor());
    }

    // Add tag to current note
    if (draftNote) {
      const newTags = [...draftNote.tags, id];
      updateDraft(n => ({ ...n, tags: newTags }));
      setTagInput(newTags.join(', '));
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    await storage.deleteTag(tagId);
    setAllTags(prev => prev.filter(t => t.id !== tagId));
    // Remove from current note
    if (draftNote && draftNote.tags.includes(tagId)) {
      const newTags = draftNote.tags.filter(t => t !== tagId);
      updateDraft(n => ({ ...n, tags: newTags }));
      setTagInput(newTags.join(', '));
    }
  };

  const toggleTagOnNote = (tagId: string) => {
    if (!draftNote) return;
    const hasTag = draftNote.tags.includes(tagId);
    const newTags = hasTag
      ? draftNote.tags.filter(t => t !== tagId)
      : [...draftNote.tags, tagId];
    updateDraft(n => ({ ...n, tags: newTags }));
    setTagInput(newTags.join(', '));
  };

  const getTagById = (id: string) => allTags.find(t => t.id === id);

  const handleShare = async () => {
    if (!draftNote) return;

    const payload = {
      title: draftNote.title,
      text: stripHtml(draftNote.content),
    };

    if (navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch {
        // fallback para clipboard
      }
    }

    await navigator.clipboard.writeText(`${draftNote.title}\n\n${stripHtml(draftNote.content)}`);
  };

  const handleLocalExport = async (format: ExportFormat) => {
    const currentNote = await getPreparedNote();
    if (!currentNote) return;

    await exportNote(currentNote.title, currentNote.content, format);
    setShowExportMenu(false);
  };

  const handleExportToGoogleDocs = async () => {
    if (!draftNote) return;
    setGoogleDocsError(null);

    if (!user) {
      setGoogleDocsState('error');
      setGoogleDocsError('Faca login com Google para exportar suas notas.');
      return;
    }

    const currentNote = await getPreparedNote();
    if (!currentNote) return;

    const accessToken = getStoredGoogleAccessToken();
    if (!accessToken) {
      setGoogleDocsState('error');
      setGoogleDocsError('Preciso renovar a autorizacao do Google Docs. Faca login novamente e tente mais uma vez.');
      await loginWithGoogle();
      return;
    }

    try {
      setGoogleDocsState('exporting');
      const result = await exportNoteToGoogleDocs(currentNote, accessToken);
      const updatedNote: Note = {
        ...currentNote,
        googleDocId: result.documentId,
        googleDocUrl: result.url,
        googleDocExportedAt: Date.now(),
        updatedAt: Date.now(),
      };

      await storage.saveNote(updatedNote);
      setDraftNote(updatedNote);
      setNotes((prev) => sortNotes([updatedNote, ...prev.filter((note) => note.id !== updatedNote.id)]));
      setGoogleDocsState('success');
      window.open(result.url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Erro ao exportar nota para Google Docs:', error);
      setGoogleDocsState('error');
      setGoogleDocsError('Nao foi possivel exportar para o Google Docs. Verifique as permissoes e tente novamente.');
    }
  };

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesFilter = filter === 'all' || Boolean(note.pinned);
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query.length === 0 ||
        note.title.toLowerCase().includes(query) ||
        stripHtml(note.content).toLowerCase().includes(query) ||
        note.tags.some((tag) => tag.toLowerCase().includes(query));

      return matchesFilter && matchesSearch;
    });
  }, [filter, notes, searchQuery]);

  const noteCountLabel = `${filteredNotes.length} ${filteredNotes.length === 1 ? 'nota' : 'notas'}`;

  return (
    <div className="h-full overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(235,192,141,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent)]">
      <div className="grid h-full grid-cols-1 overflow-hidden xl:grid-cols-[300px_1fr]">
        <aside className="flex flex-col overflow-hidden border-r border-bible-accent/10 bg-bible-accent/5 backdrop-blur-md">
          <div className="shrink-0 border-b border-bible-accent/10 px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="ui-text text-[10px] font-bold uppercase tracking-[0.22em] opacity-35">Caderno de estudo</p>
                <h2 className="mt-1 text-2xl font-display font-bold">Minhas Notas</h2>
              </div>
              <button
                onClick={handleCreateNote}
                className="rounded-2xl bg-bible-accent p-2.5 text-bible-bg shadow-lg shadow-bible-accent/20 transition-transform hover:scale-[1.03]"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 opacity-35" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Buscar por titulo, conteudo ou etiqueta"
                className="ui-text w-full rounded-2xl border border-bible-accent/10 bg-bible-bg/70 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-bible-accent/30 focus:ring-2 focus:ring-bible-accent/10"
              />
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => setSidebarTab('notes')}
                className={cn(
                  'ui-text rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] transition-all',
                  sidebarTab === 'notes'
                    ? 'bg-bible-accent text-bible-bg shadow-md'
                    : 'bg-bible-bg/70 opacity-50 hover:opacity-100'
                )}
              >
                Notas
              </button>
              <button
                onClick={() => setSidebarTab('tags')}
                className={cn(
                  'ui-text rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] transition-all',
                  sidebarTab === 'tags'
                    ? 'bg-bible-accent text-bible-bg shadow-md'
                    : 'bg-bible-bg/70 opacity-50 hover:opacity-100'
                )}
              >
                Etiquetas ({allTags.length})
              </button>
              {sidebarTab === 'notes' && (
                <>
                  {[
                    { id: 'all', label: 'Todas' },
                    { id: 'pinned', label: 'Fixadas' },
                  ].map(({ id, label }) => (
                    <button
                      key={id}
                      onClick={() => setFilter(id as NoteFilter)}
                      className={cn(
                        'ui-text rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] transition-all',
                        filter === id
                          ? 'bg-bible-accent/20 text-bible-accent border border-bible-accent/30'
                          : 'bg-bible-bg/70 opacity-50 hover:opacity-100'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </>
              )}
              <span className="ui-text ml-auto text-[10px] font-bold uppercase tracking-[0.16em] opacity-35">
                {sidebarTab === 'notes' ? noteCountLabel : `${allTags.length} tags`}
              </span>
            </div>
          </div>

          <div className="premium-scroll flex-1 overflow-y-auto p-3">
            {sidebarTab === 'notes' ? (
              <div className="space-y-2">
                {filteredNotes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => handleSelectNote(note)}
                    className={cn(
                      'w-full rounded-2xl border p-3 text-left transition-all',
                      draftNote?.id === note.id
                        ? 'border-bible-accent/25 bg-bible-accent/10 shadow-lg shadow-bible-accent/8'
                        : 'border-transparent bg-bible-bg/60 hover:border-bible-accent/10 hover:bg-bible-accent/6'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-display font-bold">{note.title || 'Sem titulo'}</h3>
                        <p className="ui-text mt-0.5 line-clamp-2 text-[11px] leading-relaxed opacity-45">{buildExcerpt(note)}</p>
                      </div>
                      {note.pinned ? <Pin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-bible-accent" /> : null}
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="flex min-w-0 flex-wrap gap-1">
                        {note.tags.slice(0, 3).map((tagId) => {
                          const tag = getTagById(tagId);
                          return (
                            <span
                              key={tagId}
                              className="ui-text rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em]"
                              style={{
                                background: tag ? tag.background + '60' : 'rgba(188,160,245,0.08)',
                                color: tag ? tag.textColor : 'inherit',
                                opacity: 0.7,
                              }}
                            >
                              {tag ? tag.name : tagId}
                            </span>
                          );
                        })}
                      </div>
                      <span className="ui-text shrink-0 text-[9px] font-bold uppercase tracking-[0.14em] opacity-35">
                        {format(note.updatedAt, 'dd MMM', { locale: ptBR })}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              // Tags view organized by category
              <div className="space-y-3">
                {TAG_CATEGORIES.map((cat) => {
                  const catTags = cat.tagIds.map(id => allTags.find(t => t.id === id)).filter(Boolean) as Tag[];
                  const isExpanded = expandedCategory === cat.id;
                  return (
                    <div key={cat.id} className="rounded-xl border border-bible-accent/10 bg-bible-bg/40 overflow-hidden">
                      <button
                        onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                        className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-bible-accent/5 transition-colors"
                      >
                        <span className="text-xs font-bold">{cat.label}</span>
                        <span className="ui-text text-[10px] opacity-40">{catTags.length}</span>
                      </button>
                      {isExpanded && (
                        <div className="px-3 pb-3 flex flex-wrap gap-1.5">
                          {catTags.map((tag) => (
                            <button
                              key={tag.id}
                              onClick={() => {
                                if (draftNote) toggleTagOnNote(tag.id);
                              }}
                              className={cn(
                                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold transition-all',
                                draftNote?.tags.includes(tag.id)
                                  ? 'ring-2 ring-bible-accent/40 scale-105'
                                  : 'hover:scale-105'
                              )}
                              style={{
                                background: tag.background,
                                color: tag.textColor,
                              }}
                            >
                              <span className="w-2 h-2 rounded-full" style={{ background: tag.color }} />
                              {tag.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        <section className="flex min-h-0 flex-col overflow-hidden">
          {draftNote ? (
            <>
              <div className="shrink-0 flex items-center gap-2 border-b border-bible-accent/10 bg-bible-bg/85 px-4 py-2.5 backdrop-blur-md">
                <input
                  type="text"
                  value={draftNote.title}
                  onChange={(event) => updateDraft((note) => ({ ...note, title: event.target.value }))}
                  placeholder="Sem titulo..."
                  className="min-w-0 flex-1 bg-transparent text-lg font-display font-bold outline-none placeholder:opacity-25"
                />

                <span
                  className={cn(
                    'ui-text shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] transition-all',
                    saveState === 'saved' && 'bg-emerald-500/10 text-emerald-500',
                    saveState === 'saving' && 'bg-amber-500/10 text-amber-500',
                    saveState === 'unsaved' && 'bg-red-500/10 text-red-400'
                  )}
                >
                  {saveState === 'saved' ? 'Salvo' : saveState === 'saving' ? 'Salvando...' : 'Nao salvo'}
                </span>

                <div className="flex items-center gap-0.5 border-l border-bible-accent/10 pl-2">
                  <button
                    onClick={() => updateDraft((note) => ({ ...note, pinned: !note.pinned }))}
                    className="rounded-lg p-1.5 transition-colors hover:bg-bible-accent/10"
                    title={draftNote.pinned ? 'Desafixar' : 'Fixar'}
                  >
                    {draftNote.pinned ? (
                      <PinOff className="h-3.5 w-3.5 text-bible-accent" />
                    ) : (
                      <Pin className="h-3.5 w-3.5 opacity-50" />
                    )}
                  </button>

                  <button
                    onClick={handleDuplicateNote}
                    className="rounded-lg p-1.5 transition-colors hover:bg-bible-accent/10"
                    title="Duplicar"
                  >
                    <Copy className="h-3.5 w-3.5 opacity-50" />
                  </button>

                  <button
                    onClick={handleShare}
                    className="rounded-lg p-1.5 transition-colors hover:bg-bible-accent/10"
                    title="Compartilhar"
                  >
                    <Share2 className="h-3.5 w-3.5 opacity-50" />
                  </button>

                  <button
                    onClick={persistImmediately}
                    className="rounded-lg p-1.5 transition-colors hover:bg-bible-accent/10"
                    title="Salvar agora"
                  >
                    <Save className="h-3.5 w-3.5 opacity-50" />
                  </button>

                  <div ref={exportMenuRef} className="relative">
                    <button
                      onClick={() => setShowExportMenu((value) => !value)}
                      className={cn(
                        'flex items-center gap-0.5 rounded-lg p-1.5 transition-colors hover:bg-bible-accent/10',
                        showExportMenu && 'bg-bible-accent/10'
                      )}
                      title="Exportar nota"
                    >
                      <Download className="h-3.5 w-3.5 opacity-50" />
                      <ChevronDown className={cn('h-3 w-3 opacity-40 transition-transform', showExportMenu && 'rotate-180')} />
                    </button>

                    {showExportMenu ? (
                      <div className="absolute right-0 top-full z-50 mt-1.5 w-48 overflow-hidden rounded-2xl border border-bible-accent/15 bg-bible-bg shadow-xl shadow-black/30 backdrop-blur-md">
                        <div className="border-b border-bible-accent/10 px-3 py-2">
                          <p className="ui-text text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Exportar como</p>
                        </div>

                        {[
                          { label: 'PDF', desc: 'Pronto para imprimir', ext: 'pdf', format: 'pdf' as ExportFormat },
                          { label: 'DOCX', desc: 'Word moderno', ext: 'docx', format: 'docx' as ExportFormat },
                          { label: 'DOC', desc: 'Word / LibreOffice', ext: 'doc', format: 'doc' as ExportFormat },
                          { label: 'HTML', desc: 'Pagina web', ext: 'html', format: 'html' as ExportFormat },
                        ].map(({ label, desc, ext, format: currentFormat }) => (
                          <button
                            key={ext}
                            onClick={() => handleLocalExport(currentFormat)}
                            className="group flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-bible-accent/10"
                          >
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-bible-accent/15 bg-bible-accent/8 text-[9px] font-bold uppercase tracking-wider text-bible-accent">
                              {ext}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold">{label}</p>
                              <p className="ui-text text-[10px] opacity-40">{desc}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <button
                    onClick={handleExportToGoogleDocs}
                    disabled={googleDocsState === 'exporting'}
                    className="rounded-lg p-1.5 transition-colors hover:bg-bible-accent/10 disabled:opacity-40"
                    title="Exportar para Google Docs"
                  >
                    <ExternalLink
                      className={cn(
                        'h-3.5 w-3.5',
                        googleDocsState === 'success' && 'text-emerald-500',
                        googleDocsState === 'error' && 'text-red-400',
                        (googleDocsState === 'idle' || googleDocsState === 'exporting') && 'opacity-50'
                      )}
                    />
                  </button>

                  <button
                    onClick={() => handleDeleteNote(draftNote.id)}
                    className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-500/10"
                    title="Excluir"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-5">
                <motion.div key={draftNote.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="h-full">
                  <RichTextEditor
                    title={draftNote.title}
                    content={draftNote.content}
                    onChange={(content) => updateDraft((note) => ({ ...note, content }))}
                    onStatsChange={setStats}
                    theme={draftNote.theme ?? 'dark'}
                    onThemeChange={(theme) => updateDraft((note) => ({ ...note, theme }))}
                    fontFamily={draftNote.fontFamily ?? DEFAULT_NOTE.fontFamily}
                    onFontFamilyChange={(fontFamily) => updateDraft((note) => ({ ...note, fontFamily }))}
                    fontSize={draftNote.fontSize ?? DEFAULT_NOTE.fontSize}
                    onFontSizeChange={(fontSize) => updateDraft((note) => ({ ...note, fontSize }))}
                  />
                </motion.div>
              </div>

              <div className="shrink-0 border-t border-bible-accent/10 bg-bible-bg/85 px-4 py-2 backdrop-blur-md">
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Stats inline */}
                  <div className="flex items-center gap-3 text-[11px] ui-text">
                    {[
                      { label: 'Palavras', value: stats.words },
                      { label: 'Caracteres', value: stats.chars },
                      { label: 'Linhas', value: stats.lines },
                    ].map(({ label, value }) => (
                      <span key={label} className="opacity-50">
                        <span className="font-bold">{value}</span> {label.toLowerCase()}
                      </span>
                    ))}
                  </div>

                  <div className="h-3 w-px bg-bible-accent/15" />

                  {/* Tags inline with colors */}
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap gap-1 items-center flex-1 min-w-0">
                      {draftNote.tags.map((tagId) => {
                        const tag = getTagById(tagId);
                        return (
                          <span
                            key={tagId}
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-[0.05em]"
                            style={{
                              background: tag ? tag.background + '80' : 'rgba(188,160,245,0.12)',
                              color: tag ? tag.textColor : 'inherit',
                            }}
                          >
                            #{tag ? tag.name : tagId}
                            <button
                              onClick={() => toggleTagOnNote(tagId)}
                              className="opacity-50 hover:opacity-100 ml-0.5"
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}

                      {/* Existing tags dropdown */}
                      {allTags.filter(t => !draftNote.tags.includes(t.id)).length > 0 && (
                        <div className="relative group">
                          <button className="inline-flex items-center rounded-full border border-bible-accent/15 px-1.5 py-0.5 text-[10px] opacity-40 hover:opacity-80 transition-opacity">
                            +
                          </button>
                          <div className="absolute bottom-full left-0 mb-1.5 hidden group-hover:block z-50 min-w-[140px] rounded-lg border border-bible-accent/15 bg-bible-bg shadow-xl shadow-black/30 p-1.5">
                            {allTags.filter(t => !draftNote.tags.includes(t.id)).map(tag => (
                              <button
                                key={tag.id}
                                onClick={() => toggleTagOnNote(tag.id)}
                                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[11px] hover:bg-bible-accent/10 transition-colors"
                              >
                                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: tag.color }} />
                                <span style={{ color: tag.textColor }}>#{tag.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <input
                        type="text"
                        value={tagInput}
                        onChange={(event) => {
                          const value = event.target.value;
                          setTagInput(value);
                        }}
                        onBlur={() => {
                          const tags = tagInput.split(',').map(t => t.trim()).filter(Boolean);
                          updateDraft(note => ({ ...note, tags }));
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            const tags = tagInput.split(',').map(t => t.trim()).filter(Boolean);
                            updateDraft(note => ({ ...note, tags }));
                            setTagInput(tags.join(', ') + (tags.length ? ', ' : ''));
                          }
                        }}
                        placeholder={draftNote.tags.length === 0 ? "Etiqueta..." : ""}
                        className="min-w-[80px] flex-1 bg-transparent text-xs outline-none placeholder:opacity-30"
                      />
                    </div>

                    {/* Tag creator button */}
                    <button
                      onClick={() => setShowTagCreator(!showTagCreator)}
                      className={cn(
                        'shrink-0 rounded-full p-1 transition-colors',
                        showTagCreator ? 'bg-bible-accent/20 text-bible-accent' : 'opacity-30 hover:opacity-60'
                      )}
                      title="Criar etiqueta"
                    >
                      <Palette className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="h-3 w-px bg-bible-accent/15" />

                  {/* Google Docs compact */}
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'ui-text text-[10px] font-medium',
                        googleDocsState === 'success' && 'text-emerald-500',
                        googleDocsState === 'exporting' && 'text-amber-500',
                        googleDocsState === 'error' && 'text-red-400',
                        googleDocsState === 'idle' && 'opacity-40'
                      )}
                    >
                      {googleDocsState === 'idle' && (draftNote.googleDocUrl ? 'Exportado' : 'Google Docs')}
                      {googleDocsState === 'exporting' && 'Exportando...'}
                      {googleDocsState === 'success' && 'Exportado!'}
                      {googleDocsState === 'error' && 'Erro'}
                    </span>
                    {draftNote.googleDocUrl ? (
                      <a
                        href={draftNote.googleDocUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-bible-accent opacity-60 hover:opacity-100 transition-opacity"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : null}
                  </div>
                </div>

                {/* Tag Creator Panel */}
                {showTagCreator && (
                  <div className="mt-2 border-t border-bible-accent/10 pt-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleCreateTag(); }}
                        placeholder="#NomeDaTag"
                        className="flex-1 bg-bible-bg/70 rounded-lg border border-bible-accent/10 px-3 py-1.5 text-xs outline-none focus:border-bible-accent/25"
                      />
                      <button
                        onClick={handleCreateTag}
                        className="rounded-lg bg-bible-accent px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-bible-bg hover:opacity-90 transition-opacity"
                      >
                        Criar
                      </button>
                    </div>

                    {/* Mode toggle */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <button
                        onClick={() => setTagColorMode('auto')}
                        className={cn(
                          'flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors border',
                          tagColorMode === 'auto'
                            ? 'bg-bible-accent/20 border-bible-accent/30 text-bible-accent'
                            : 'border-bible-accent/10 opacity-50 hover:opacity-80'
                        )}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ background: autoColor.color }} />
                        Automático
                      </button>
                      <button
                        onClick={() => setTagColorMode('manual')}
                        className={cn(
                          'flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors border',
                          tagColorMode === 'manual'
                            ? 'bg-bible-accent/20 border-bible-accent/30 text-bible-accent'
                            : 'border-bible-accent/10 opacity-50 hover:opacity-80'
                        )}
                      >
                        Manual
                      </button>
                    </div>

                    {/* Auto preview or Manual palette */}
                    {tagColorMode === 'auto' ? (
                      <div
                        className="mt-2 rounded-lg border px-3 py-2 flex items-center justify-between"
                        style={{ background: autoColor.background, borderColor: autoColor.color + '33' }}
                      >
                        <span
                          className="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                          style={{ background: autoColor.color + '22', color: autoColor.textColor }}
                        >
                          #{newTagName.trim() || 'NomeDaTag'}
                        </span>
                        <button
                          onClick={() => setAutoColor(genAutoColor())}
                          className="text-[10px] opacity-60 hover:opacity-100 transition-opacity"
                          style={{ color: autoColor.textColor }}
                        >
                          Gerar outra cor
                        </button>
                      </div>
                    ) : (
                      <div className="mt-2 flex gap-1.5 flex-wrap">
                        {PALETTE.map((c, i) => (
                          <button
                            key={i}
                            onClick={() => setSelectedPaletteIdx(i)}
                            className={cn(
                              'w-6 h-6 rounded-full transition-transform hover:scale-110 border-2',
                              selectedPaletteIdx === i ? 'border-bible-accent scale-110' : 'border-transparent'
                            )}
                            style={{ background: c.color }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Existing tags list */}
                    {allTags.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-bible-accent/10">
                        <p className="text-[9px] uppercase tracking-widest opacity-30 mb-1.5">Etiquetas existentes</p>
                        <div className="flex flex-wrap gap-1">
                          {allTags.map(tag => (
                            <div
                              key={tag.id}
                              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                              style={{ background: tag.background + '60', color: tag.textColor }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: tag.color }} />
                              #{tag.name}
                              <button
                                onClick={() => handleDeleteTag(tag.id)}
                                className="opacity-40 hover:opacity-100 ml-0.5 text-red-400"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="rounded-[36px] border border-dashed border-bible-accent/25 bg-bible-accent/5 p-8">
                <FileText className="mx-auto h-14 w-14 opacity-25" />
              </div>
              <h3 className="mt-8 text-3xl font-display font-bold">Seu caderno ainda esta vazio</h3>
              <p className="ui-text mt-3 max-w-md text-sm leading-relaxed opacity-45">
                Crie uma nova nota para organizar sermoes, comentarios, devocionais, esbocos e qualquer reflexao do seu estudo biblico.
              </p>
              <button
                onClick={handleCreateNote}
                className="ui-text mt-8 rounded-2xl bg-bible-accent px-8 py-4 text-xs font-bold uppercase tracking-[0.24em] text-bible-bg shadow-lg shadow-bible-accent/20"
              >
                Criar primeira nota
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
