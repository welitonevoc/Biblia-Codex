import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Compass,
  Download,
  Library,
  Pencil,
  Play,
  Plus,
  Search,
  Share2,
  Sparkles,
  Star,
  Target,
  Trash2,
  Upload,
} from 'lucide-react';
import { motion } from 'motion/react';
import { BIBLE_BOOKS } from '../data/bibleMetadata';

type ReadingPlanCategory =
  | 'Todos'
  | 'Biblia Completa'
  | 'Novo Testamento'
  | 'Evangelhos'
  | 'Sabedoria'
  | 'Tematico'
  | 'Calendario';

interface ReadingRef {
  bookId: string;
  chapter: number;
  chapterEnd?: number;
}

interface PlanDay {
  day: number;
  title: string;
  subtitle: string;
  readings: ReadingRef[];
  focus: string;
  minutes: number;
}

interface ReadingPlanDefinition {
  id: string;
  title: string;
  category: Exclude<ReadingPlanCategory, 'Todos'>;
  duration: number;
  badge: string;
  intensity: string;
  description: string;
  tone: string;
  highlights: string[];
  days: PlanDay[];
  isCustom?: boolean;
  shareCode?: string;
}

interface PlanDraftDay {
  id: string;
  title: string;
  subtitle: string;
  readingsText: string;
  focus: string;
  minutes: string;
}

interface PlanBuilderDraft {
  title: string;
  description: string;
  category: Exclude<ReadingPlanCategory, 'Todos'>;
  badge: string;
  intensity: string;
  tone: string;
  highlightsText: string;
  days: PlanDraftDay[];
}

interface ActivePlanState {
  id: string;
  currentDay: number;
  completedDays: number[];
  startedAt: number;
  updatedAt: number;
  reminderTime: string;
}

interface ReadingPlansState {
  savedPlanIds: string[];
  activePlans: ActivePlanState[];
  customPlans: ReadingPlanDefinition[];
}

interface ReadingPlansProps {
  onNavigate: (bookId: string, chapter: number, verse?: number) => void;
}

const STORAGE_KEY = 'kerygma-reading-plans-v1';

function getBook(bookId: string) {
  return BIBLE_BOOKS.find((book) => book.id === bookId);
}

function chaptersFor(bookId: string, start = 1, end?: number): ReadingRef[] {
  const book = getBook(bookId);
  if (!book) return [];
  const limit = Math.min(end ?? book.chapters, book.chapters);
  return Array.from({ length: Math.max(limit - start + 1, 0) }, (_, index) => ({
    bookId,
    chapter: start + index,
  }));
}

function summarizeReadings(readings: ReadingRef[]): string {
  return readings
    .map((reading) => {
      const book = getBook(reading.bookId);
      if (!book) return '';
      return reading.chapterEnd && reading.chapterEnd > reading.chapter
        ? `${book.name} ${reading.chapter}-${reading.chapterEnd}`
        : `${book.name} ${reading.chapter}`;
    })
    .filter(Boolean)
    .join(' • ');
}

function buildDistributedSchedule(
  refs: ReadingRef[],
  duration: number,
  subtitle: string,
  focus: string,
  minutes: number
): PlanDay[] {
  return Array.from({ length: duration }, (_, index) => {
    const start = Math.floor((index * refs.length) / duration);
    const end = Math.floor(((index + 1) * refs.length) / duration);
    const dayReadings = refs.slice(start, Math.max(end, start + 1));

    return {
      day: index + 1,
      title: `Dia ${index + 1}`,
      subtitle,
      readings: dayReadings,
      focus,
      minutes,
    };
  });
}

function buildCuratedSchedule(days: Array<Omit<PlanDay, 'day'>>): PlanDay[] {
  return days.map((day, index) => ({
    day: index + 1,
    ...day,
  }));
}

function loadState(): ReadingPlansState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { savedPlanIds: [], activePlans: [], customPlans: [] };

    const parsed = JSON.parse(raw) as Partial<ReadingPlansState>;
    return {
      savedPlanIds: Array.isArray(parsed.savedPlanIds) ? parsed.savedPlanIds : [],
      activePlans: Array.isArray(parsed.activePlans) ? parsed.activePlans : [],
      customPlans: Array.isArray(parsed.customPlans) ? parsed.customPlans : [],
    };
  } catch {
    return { savedPlanIds: [], activePlans: [], customPlans: [] };
  }
}

function saveState(state: ReadingPlansState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const BOOK_ALIASES = BIBLE_BOOKS.flatMap((book) => {
  const base = [book.id, book.name];
  return base.map((value) => ({
    normalized: normalizeText(value),
    bookId: book.id,
  }));
}).sort((a, b) => b.normalized.length - a.normalized.length);

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function createDraftDay(index: number): PlanDraftDay {
  return {
    id: `draft-day-${Date.now()}-${index}`,
    title: `Dia ${index + 1}`,
    subtitle: '',
    readingsText: '',
    focus: '',
    minutes: '10',
  };
}

function createEmptyDraft(): PlanBuilderDraft {
  return {
    title: '',
    description: '',
    category: 'Tematico',
    badge: 'Seu plano',
    intensity: 'Personalizado',
    tone: 'Criado por voce para a sua rotina de leitura.',
    highlightsText: 'Personalizado, Compartilhavel',
    days: [createDraftDay(0)],
  };
}

function parseReadingToken(token: string): ReadingRef | null {
  const trimmed = token.trim();
  if (!trimmed) return null;

  const match = trimmed.match(/^(.*?)(\d+)(?:\s*-\s*(\d+))?$/);
  if (!match) return null;

  const rawBook = normalizeText(match[1]);
  const chapter = Number(match[2]);
  const chapterEnd = match[3] ? Number(match[3]) : undefined;
  const foundBook = BOOK_ALIASES.find((entry) => entry.normalized === rawBook);

  if (!foundBook || !Number.isFinite(chapter) || chapter < 1) return null;

  const book = getBook(foundBook.bookId);
  if (!book || chapter > book.chapters) return null;

  const safeChapterEnd =
    chapterEnd && Number.isFinite(chapterEnd) && chapterEnd >= chapter
      ? Math.min(chapterEnd, book.chapters)
      : undefined;

  return {
    bookId: foundBook.bookId,
    chapter,
    chapterEnd: safeChapterEnd,
  };
}

function parseReadings(readingsText: string): ReadingRef[] {
  return readingsText
    .split(/[,;\n]+/)
    .map((token) => parseReadingToken(token))
    .filter((reading): reading is ReadingRef => Boolean(reading));
}

function draftToPlan(
  draft: PlanBuilderDraft,
  existingId?: string
): ReadingPlanDefinition | null {
  const normalizedDays = draft.days
    .map((day, index) => {
      const readings = parseReadings(day.readingsText);
      if (!readings.length) return null;

      return {
        day: index + 1,
        title: day.title.trim() || `Dia ${index + 1}`,
        subtitle: day.subtitle.trim() || 'Leitura personalizada',
        readings,
        focus: day.focus.trim() || 'Siga a jornada que voce montou para este dia.',
        minutes: Math.max(1, Number(day.minutes) || 10),
      } satisfies PlanDay;
    })
    .filter((day): day is PlanDay => Boolean(day));

  if (!draft.title.trim() || !draft.description.trim() || !normalizedDays.length) {
    return null;
  }

  const highlights = draft.highlightsText
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);

  return {
    id: existingId ?? `custom-plan-${Date.now()}`,
    title: draft.title.trim(),
    category: draft.category,
    duration: normalizedDays.length,
    badge: draft.badge.trim() || 'Seu plano',
    intensity: draft.intensity.trim() || 'Personalizado',
    description: draft.description.trim(),
    tone: draft.tone.trim() || 'Plano criado por voce.',
    highlights: highlights.length ? highlights : ['Personalizado'],
    days: normalizedDays,
    isCustom: true,
  };
}

function planToDraft(plan: ReadingPlanDefinition): PlanBuilderDraft {
  return {
    title: plan.title,
    description: plan.description,
    category: plan.category,
    badge: plan.badge,
    intensity: plan.intensity,
    tone: plan.tone,
    highlightsText: plan.highlights.join(', '),
    days: plan.days.map((day, index) => ({
      id: `draft-${plan.id}-${index}`,
      title: day.title,
      subtitle: day.subtitle,
      readingsText: summarizeReadings(day.readings).replace(/ • /g, ', '),
      focus: day.focus,
      minutes: String(day.minutes),
    })),
  };
}

function encodePlan(plan: ReadingPlanDefinition) {
  const payload = buildPlanPayload(plan);
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function buildPlanPayload(plan: ReadingPlanDefinition) {
  return {
    app: 'kerygma-reading-plan',
    version: 1,
    exportedAt: new Date().toISOString(),
    plan: {
      ...plan,
      shareCode: undefined,
    },
  };
}

function stringifyPlanFile(plan: ReadingPlanDefinition) {
  return JSON.stringify(buildPlanPayload(plan), null, 2);
}

function parsePlanPayload(raw: string): ReadingPlanDefinition | null {
  try {
    const payload = JSON.parse(raw) as { app?: string; version?: number; plan?: ReadingPlanDefinition };
    if (payload.app !== 'kerygma-reading-plan' || !payload.plan) return null;
    return payload.plan;
  } catch {
    return null;
  }
}

function createImportedPlan(plan: ReadingPlanDefinition, shareCode?: string): ReadingPlanDefinition {
  return {
    ...plan,
    id: `custom-plan-${Date.now()}`,
    isCustom: true,
    shareCode: shareCode ?? encodePlan(plan),
  };
}

function decodePlan(code: string): ReadingPlanDefinition | null {
  try {
    const binary = atob(code.trim());
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const decoded = new TextDecoder().decode(bytes);
    const parsedPlan = parsePlanPayload(decoded);
    if (!parsedPlan) return null;
    return createImportedPlan(parsedPlan, code.trim());
  } catch {
    return null;
  }
}

function decodePlanFile(raw: string): ReadingPlanDefinition | null {
  const parsedPlan = parsePlanPayload(raw);
  if (!parsedPlan) return null;
  return createImportedPlan(parsedPlan);
}

function downloadPlanFile(plan: ReadingPlanDefinition) {
  const blob = new Blob([stringifyPlanFile(plan)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const slug = normalizeText(plan.title).replace(/\s+/g, '-');
  anchor.href = url;
  anchor.download = `${slug || 'plano-kerygma'}.kerygma-plan.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

const defaultReadingPlans: ReadingPlanDefinition[] = [
  {
    id: 'biblia-365',
    title: 'Biblia Completa em 365 Dias',
    category: 'Biblia Completa',
    duration: 365,
    badge: 'Jornada premium',
    intensity: 'Constante',
    description: 'Um ritmo diario para atravessar toda a Escritura com constancia, clareza e sensacao de progresso.',
    tone: 'Inspirado nos apps que priorizam rotina, continuidade e visao de longo prazo.',
    highlights: ['Plano completo', 'Agenda diaria', 'Ideal para o ano inteiro'],
    days: buildDistributedSchedule(
      BIBLE_BOOKS.flatMap((book) => chaptersFor(book.id)),
      365,
      'Panorama continuo da Biblia',
      'Leitura progressiva com equilibrio entre profundidade e consistencia.',
      18
    ),
  },
  {
    id: 'nt-90',
    title: 'Novo Testamento em 90 Dias',
    category: 'Novo Testamento',
    duration: 90,
    badge: 'Foco no essencial',
    intensity: 'Ritmo medio',
    description: 'Uma imersao no Novo Testamento para ganhar visao de Jesus, da Igreja e das cartas apostolicas.',
    tone: 'Ideal para quem quer um arco claro, com inicio rapido e boa sensacao de conclusao.',
    highlights: ['90 dias', 'Cristo e Igreja', 'Otimo para recomeco'],
    days: buildDistributedSchedule(
      BIBLE_BOOKS.filter((book) => book.testament === 'NT').flatMap((book) => chaptersFor(book.id)),
      90,
      'Jesus, Igreja e missao',
      'Passe pelos Evangelhos, Atos e cartas em um fluxo unico.',
      14
    ),
  },
  {
    id: 'evangelhos-40',
    title: 'Os Evangelhos em 40 Dias',
    category: 'Evangelhos',
    duration: 40,
    badge: 'Vida de Jesus',
    intensity: 'Imersivo',
    description: 'Quarenta dias para reencontrar o ministerio de Jesus com ritmo forte e leitura centrada nos Evangelhos.',
    tone: 'Pensado para quem busca proximidade com Cristo e uma experiencia mais contemplativa.',
    highlights: ['Mateus a Joao', 'Boa entrada espiritual', 'Dias mais encorpados'],
    days: buildDistributedSchedule(
      ['MAT', 'MRK', 'LUK', 'JHN'].flatMap((bookId) => chaptersFor(bookId)),
      40,
      'Acompanhe Jesus de perto',
      'Observe encontros, milagres, ensinos e a cruz com mais intencao.',
      16
    ),
  },
  {
    id: 'sabedoria-31',
    title: 'Salmos e Proverbios em 31 Dias',
    category: 'Sabedoria',
    duration: 31,
    badge: 'Sabedoria diaria',
    intensity: 'Leve',
    description: 'Plano curto para devocao diaria, equilibrio emocional e oracao guiada pela Palavra.',
    tone: 'Muito proximo do estilo de apps com jornada curta e repetivel.',
    highlights: ['Oracao e sabedoria', 'Leitura curta', 'Facil de manter'],
    days: buildDistributedSchedule(
      [...chaptersFor('PSA', 1, 31), ...chaptersFor('PRO', 1, 31)],
      31,
      'Sabedoria para a rotina',
      'Comece o dia com adoracao, prudencia e direcao pratica.',
      10
    ),
  },
  {
    id: 'fundamentos-21',
    title: 'Fundamentos da Fe em 21 Dias',
    category: 'Tematico',
    duration: 21,
    badge: 'Essencial',
    intensity: 'Leve',
    description: 'Uma trilha para novos convertidos, recomeços ou discipulado com textos-chave da fe crista.',
    tone: 'Curadoria tematica no formato de apps que apresentam um caminho guiado.',
    highlights: ['Novo comeco', 'Temas essenciais', 'Discipulado simples'],
    days: buildCuratedSchedule([
      { title: 'Quem e Jesus', subtitle: 'Comeco claro', readings: [{ bookId: 'JHN', chapter: 1 }], focus: 'Veja Cristo como Palavra, luz e Salvador.', minutes: 8 },
      { title: 'Novo nascimento', subtitle: 'Vida transformada', readings: [{ bookId: 'JHN', chapter: 3 }], focus: 'A fe comeca por dentro e produz nova vida.', minutes: 8 },
      { title: 'Fe que salva', subtitle: 'Graca', readings: [{ bookId: 'EPH', chapter: 2 }], focus: 'A salvacao e dom, nao desempenho.', minutes: 7 },
      { title: 'Arrependimento', subtitle: 'Retorno ao Pai', readings: [{ bookId: 'LUK', chapter: 15 }], focus: 'Deus recebe de volta com misericordia.', minutes: 9 },
      { title: 'Seguir Jesus', subtitle: 'Discipulado', readings: [{ bookId: 'MRK', chapter: 8 }], focus: 'Negar-se e seguir faz parte do caminho.', minutes: 8 },
      { title: 'Oracao', subtitle: 'Relacao com Deus', readings: [{ bookId: 'MAT', chapter: 6 }], focus: 'Jesus ensina a viver diante do Pai.', minutes: 9 },
      { title: 'Palavra viva', subtitle: 'Base diaria', readings: [{ bookId: 'PSA', chapter: 119 }], focus: 'A Palavra firma o coracao e orienta a vida.', minutes: 12 },
      { title: 'Comunhao', subtitle: 'Igreja', readings: [{ bookId: 'ACT', chapter: 2 }], focus: 'A vida crista floresce em comunhao.', minutes: 9 },
      { title: 'Espirito Santo', subtitle: 'Presenca e poder', readings: [{ bookId: 'ROM', chapter: 8 }], focus: 'O Espirito conduz, consola e fortalece.', minutes: 10 },
      { title: 'Santidade', subtitle: 'Vida separada', readings: [{ bookId: '1PE', chapter: 1 }], focus: 'Graca nao cancela o chamado a santidade.', minutes: 8 },
      { title: 'Amor ao proximo', subtitle: 'Fruto visivel', readings: [{ bookId: '1CO', chapter: 13 }], focus: 'O amor e a marca madura da fe.', minutes: 8 },
      { title: 'Ansiedade e paz', subtitle: 'Descanso', readings: [{ bookId: 'PHP', chapter: 4 }], focus: 'Entregue peso, receba paz e permaneca firme.', minutes: 7 },
      { title: 'Sabedoria pratica', subtitle: 'Vida diaria', readings: [{ bookId: 'JAS', chapter: 1 }], focus: 'A fe madura age com sabedoria.', minutes: 7 },
      { title: 'Perdao', subtitle: 'Reconciliacao', readings: [{ bookId: 'COL', chapter: 3 }], focus: 'Cristo forma um novo coracao para perdoar.', minutes: 7 },
      { title: 'Esperanca', subtitle: 'Olhos no futuro', readings: [{ bookId: '1TH', chapter: 4 }], focus: 'A fe tambem olha para a volta do Senhor.', minutes: 7 },
      { title: 'Missao', subtitle: 'Enviados', readings: [{ bookId: 'MAT', chapter: 28 }], focus: 'Quem encontra Jesus tambem e enviado.', minutes: 7 },
      { title: 'Fruto do Espirito', subtitle: 'Carater transformado', readings: [{ bookId: 'GAL', chapter: 5 }], focus: 'O Espirito produz um novo jeito de viver.', minutes: 7 },
      { title: 'Humildade', subtitle: 'Caminho de Cristo', readings: [{ bookId: 'PHP', chapter: 2 }], focus: 'Jesus redefine grandeza pelo servico.', minutes: 7 },
      { title: 'Confianca', subtitle: 'Seguranca em Deus', readings: [{ bookId: 'PSA', chapter: 23 }], focus: 'O Pastor guia cada etapa da jornada.', minutes: 6 },
      { title: 'Perseveranca', subtitle: 'Nao pare', readings: [{ bookId: 'HEB', chapter: 12 }], focus: 'Corramos com paciencia olhando para Jesus.', minutes: 7 },
      { title: 'Nova criacao', subtitle: 'Vida renovada', readings: [{ bookId: '2CO', chapter: 5 }], focus: 'Em Cristo ha identidade nova e missao nova.', minutes: 7 },
    ]),
  },
  {
    id: 'esperanca-14',
    title: 'Esperanca para 14 Dias',
    category: 'Tematico',
    duration: 14,
    badge: 'Curto e profundo',
    intensity: 'Leve',
    description: 'Uma serie curta para fortalecer a alma em dias de cansaco, luta ou espera.',
    tone: 'Leitura curta com senso de cuidado, muito proxima do formato de series guiadas.',
    highlights: ['14 dias', 'Textos de conforto', 'Otimo para recomeco'],
    days: buildCuratedSchedule([
      { title: 'Deus ve voce', subtitle: 'Presenca', readings: [{ bookId: 'PSA', chapter: 139 }], focus: 'Nao existe distancia que esconda voce do cuidado de Deus.', minutes: 8 },
      { title: 'Paz para hoje', subtitle: 'Descanso', readings: [{ bookId: 'MAT', chapter: 11 }], focus: 'Jesus convida cansados para perto.', minutes: 7 },
      { title: 'Forca no vale', subtitle: 'Coragem', readings: [{ bookId: 'PSA', chapter: 27 }], focus: 'Deus fortalece o coracao no meio do medo.', minutes: 7 },
      { title: 'Deus provem', subtitle: 'Cuidado diario', readings: [{ bookId: 'MAT', chapter: 6 }], focus: 'A ansiedade perde forca diante do Pai.', minutes: 8 },
      { title: 'Nova manha', subtitle: 'Misericordia', readings: [{ bookId: 'LAM', chapter: 3 }], focus: 'As misericordias do Senhor se renovam.', minutes: 7 },
      { title: 'Esperar bem', subtitle: 'Permanecer', readings: [{ bookId: 'ISA', chapter: 40 }], focus: 'Quem espera no Senhor encontra vigor.', minutes: 9 },
      { title: 'Nao temas', subtitle: 'Seguranca', readings: [{ bookId: 'JOS', chapter: 1 }], focus: 'Coragem nasce da presenca de Deus.', minutes: 7 },
      { title: 'Refugio', subtitle: 'Abrigo', readings: [{ bookId: 'PSA', chapter: 91 }], focus: 'Deus continua sendo fortaleza.', minutes: 8 },
      { title: 'Paz que excede', subtitle: 'Interior guardado', readings: [{ bookId: 'PHP', chapter: 4 }], focus: 'Ore, entregue, receba paz.', minutes: 7 },
      { title: 'Esperanca viva', subtitle: 'Futuro', readings: [{ bookId: '1PE', chapter: 1 }], focus: 'Em Cristo a esperanca nao acaba.', minutes: 7 },
      { title: 'Nada separa', subtitle: 'Amor de Deus', readings: [{ bookId: 'ROM', chapter: 8 }], focus: 'Nem tribulacao cancela o amor do Senhor.', minutes: 9 },
      { title: 'Deus restaura', subtitle: 'Recomeco', readings: [{ bookId: 'JOE', chapter: 2 }], focus: 'O Senhor tambem restaura o tempo ferido.', minutes: 7 },
      { title: 'Luz na noite', subtitle: 'Confianca', readings: [{ bookId: 'PSA', chapter: 46 }], focus: 'Ainda que a terra se abale, Deus e nosso refugio.', minutes: 7 },
      { title: 'Fim com esperanca', subtitle: 'Renovacao', readings: [{ bookId: 'REV', chapter: 21 }], focus: 'A historia termina com Deus fazendo novas todas as coisas.', minutes: 8 },
    ]),
  },
  {
    id: 'quaresma-40',
    title: 'Quaresma com Jesus',
    category: 'Calendario',
    duration: 40,
    badge: 'Calendario',
    intensity: 'Contemplativo',
    description: 'Uma trilha de quarenta dias para oracao, arrependimento e proximidade com Cristo.',
    tone: 'Traz a ideia de jornada sazonal comum em apps de devocional premium.',
    highlights: ['Sazonal', 'Ritmo contemplativo', 'Bom para campanhas'],
    days: buildDistributedSchedule(
      [
        ...chaptersFor('MAT', 5, 7),
        ...chaptersFor('LUK', 22, 24),
        ...chaptersFor('JHN', 13, 21),
        ...chaptersFor('ISA', 53, 55),
        ...chaptersFor('PSA', 22, 32),
      ],
      40,
      'Caminho de arrependimento e esperanca',
      'Uma leitura para desacelerar, orar e acompanhar Jesus rumo a cruz e a ressurreicao.',
      12
    ),
  },
];

export const ReadingPlans: React.FC<ReadingPlansProps> = ({ onNavigate }) => {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [state, setState] = useState<ReadingPlansState>(() => loadState());
  const [category, setCategory] = useState<ReadingPlanCategory>('Todos');
  const [query, setQuery] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState(defaultReadingPlans[0]?.id ?? '');
  const [builderOpen, setBuilderOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PlanBuilderDraft>(() => createEmptyDraft());
  const [importCode, setImportCode] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    if (!feedback) return;
    const timeout = window.setTimeout(() => setFeedback(null), 2800);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const allPlans = [...state.customPlans, ...defaultReadingPlans];

  const activePlans = state.activePlans
    .map((activePlan) => ({
      ...activePlan,
      plan: allPlans.find((plan) => plan.id === activePlan.id),
    }))
    .filter((entry) => entry.plan)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const filteredPlans = allPlans.filter((plan) => {
    const matchesCategory = category === 'Todos' || plan.category === category;
    const haystack = `${plan.title} ${plan.description} ${plan.highlights.join(' ')}`.toLowerCase();
    const matchesQuery = haystack.includes(query.trim().toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const selectedPlan =
    allPlans.find((plan) => plan.id === selectedPlanId) ??
    filteredPlans[0] ??
    allPlans[0];

  const selectedActive = state.activePlans.find((entry) => entry.id === selectedPlan?.id);
  const todayPlan = activePlans[0];
  const totalCompletedDays = state.activePlans.reduce((sum, activePlan) => sum + activePlan.completedDays.length, 0);
  const categories: ReadingPlanCategory[] = ['Todos', 'Biblia Completa', 'Novo Testamento', 'Evangelhos', 'Sabedoria', 'Tematico', 'Calendario'];

  const openReading = (plan: ReadingPlanDefinition, dayNumber: number) => {
    const day = plan.days[Math.max(0, Math.min(dayNumber - 1, plan.days.length - 1))];
    const firstReading = day?.readings[0];
    if (firstReading) onNavigate(firstReading.bookId, firstReading.chapter);
  };

  const startPlan = (planId: string) => {
    setState((current) => {
      const existing = current.activePlans.find((plan) => plan.id === planId);
      if (existing) {
        return {
          ...current,
          activePlans: current.activePlans.map((plan) =>
            plan.id === planId
              ? { ...plan, currentDay: 1, completedDays: [], startedAt: Date.now(), updatedAt: Date.now() }
              : plan
          ),
        };
      }

      return {
        ...current,
        savedPlanIds: current.savedPlanIds.includes(planId) ? current.savedPlanIds : [...current.savedPlanIds, planId],
        activePlans: [
          {
            id: planId,
            currentDay: 1,
            completedDays: [],
            startedAt: Date.now(),
            updatedAt: Date.now(),
            reminderTime: '07:00',
          },
          ...current.activePlans,
        ],
      };
    });
  };

  const restartPlan = (planId: string) => {
    setState((current) => ({
      ...current,
      activePlans: current.activePlans.map((plan) =>
        plan.id === planId
          ? { ...plan, currentDay: 1, completedDays: [], startedAt: Date.now(), updatedAt: Date.now() }
          : plan
      ),
    }));
  };

  const completeDay = (planId: string) => {
    const plan = allPlans.find((entry) => entry.id === planId);
    if (!plan) return;

    setState((current) => ({
      ...current,
      activePlans: current.activePlans.map((activePlan) => {
        if (activePlan.id !== planId) return activePlan;

        const completedDays = activePlan.completedDays.includes(activePlan.currentDay)
          ? activePlan.completedDays
          : [...activePlan.completedDays, activePlan.currentDay];

        return {
          ...activePlan,
          completedDays,
          currentDay: Math.min(activePlan.currentDay + 1, plan.duration),
          updatedAt: Date.now(),
        };
      }),
    }));
  };

  const updateReminder = (planId: string, reminderTime: string) => {
    setState((current) => ({
      ...current,
      activePlans: current.activePlans.map((plan) =>
        plan.id === planId ? { ...plan, reminderTime, updatedAt: Date.now() } : plan
      ),
    }));
  };

  const toggleSave = (planId: string) => {
    setState((current) => ({
      ...current,
      savedPlanIds: current.savedPlanIds.includes(planId)
        ? current.savedPlanIds.filter((id) => id !== planId)
        : [...current.savedPlanIds, planId],
    }));
  };

  const jumpToDay = (planId: string, dayNumber: number) => {
    setState((current) => ({
      ...current,
      activePlans: current.activePlans.map((plan) =>
        plan.id === planId ? { ...plan, currentDay: dayNumber, updatedAt: Date.now() } : plan
      ),
    }));
  };

  const openCreateBuilder = () => {
    setEditingPlanId(null);
    setDraft(createEmptyDraft());
    setImportOpen(false);
    setBuilderOpen(true);
  };

  const openEditBuilder = (plan: ReadingPlanDefinition) => {
    setEditingPlanId(plan.id);
    setDraft(planToDraft(plan));
    setImportOpen(false);
    setBuilderOpen(true);
  };

  const updateDraftField = <K extends keyof PlanBuilderDraft>(key: K, value: PlanBuilderDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const updateDraftDay = (dayId: string, field: keyof PlanDraftDay, value: string) => {
    setDraft((current) => ({
      ...current,
      days: current.days.map((day) => (day.id === dayId ? { ...day, [field]: value } : day)),
    }));
  };

  const addDraftDay = () => {
    setDraft((current) => ({
      ...current,
      days: [...current.days, createDraftDay(current.days.length)],
    }));
  };

  const removeDraftDay = (dayId: string) => {
    setDraft((current) => ({
      ...current,
      days:
        current.days.length === 1
          ? current.days
          : current.days.filter((day) => day.id !== dayId).map((day, index) => ({
              ...day,
              title: day.title.startsWith('Dia ') ? `Dia ${index + 1}` : day.title,
            })),
    }));
  };

  const handleSaveCustomPlan = () => {
    const plan = draftToPlan(draft, editingPlanId ?? undefined);
    if (!plan) {
      setFeedback('Preencha nome, descricao e pelo menos um dia com leitura valida.');
      return;
    }

    const finalizedPlan = {
      ...plan,
      shareCode: encodePlan(plan),
    };

    setState((current) => ({
      ...current,
      customPlans: editingPlanId
        ? current.customPlans.map((item) => (item.id === editingPlanId ? finalizedPlan : item))
        : [finalizedPlan, ...current.customPlans],
    }));
    setSelectedPlanId(finalizedPlan.id);
    setBuilderOpen(false);
    setEditingPlanId(null);
    setDraft(createEmptyDraft());
    setFeedback(editingPlanId ? 'Plano personalizado atualizado.' : 'Plano personalizado criado.');
  };

  const handleDeleteCustomPlan = (planId: string) => {
    setState((current) => ({
      savedPlanIds: current.savedPlanIds.filter((id) => id !== planId),
      activePlans: current.activePlans.filter((plan) => plan.id !== planId),
      customPlans: current.customPlans.filter((plan) => plan.id !== planId),
    }));
    setSelectedPlanId(defaultReadingPlans[0]?.id ?? '');
    setBuilderOpen(false);
    setEditingPlanId(null);
    setFeedback('Plano personalizado removido.');
  };

  const handleShareCustomPlan = async (plan: ReadingPlanDefinition) => {
    const shareCode = plan.shareCode ?? encodePlan(plan);
    const payloadText = [
      `Plano de leitura: ${plan.title}`,
      plan.description,
      '',
      `Categoria: ${plan.category}`,
      `Duracao: ${plan.duration} dias`,
      `Codigo Kerygma: ${shareCode}`,
    ].join('\n');

    if (navigator.share) {
      try {
        await navigator.share({
          title: plan.title,
          text: payloadText,
        });
        setFeedback('Plano compartilhado.');
        return;
      } catch {
        // fallback para clipboard
      }
    }

    await navigator.clipboard.writeText(payloadText);
    setFeedback('Codigo do plano copiado para compartilhar.');
  };

  const handleImportPlan = () => {
    const importedPlan = decodePlan(importCode);
    if (!importedPlan) {
      setFeedback('Nao foi possivel importar esse codigo.');
      return;
    }

    const finalizedPlan = {
      ...importedPlan,
      shareCode: importCode.trim(),
    };

    setState((current) => ({
      ...current,
      customPlans: [finalizedPlan, ...current.customPlans],
    }));
    setSelectedPlanId(finalizedPlan.id);
    setImportCode('');
    setImportOpen(false);
    setFeedback('Plano compartilhado importado com sucesso.');
  };

  const handleImportFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const raw = await file.text();
      const importedPlan = decodePlanFile(raw) ?? decodePlan(raw.trim());

      if (!importedPlan) {
        setFeedback('Arquivo invalido. Use um arquivo exportado pelo Kerygma.');
        return;
      }

      setState((current) => ({
        ...current,
        customPlans: [importedPlan, ...current.customPlans],
      }));
      setSelectedPlanId(importedPlan.id);
      setImportOpen(false);
      setImportCode('');
      setFeedback('Plano importado por arquivo com sucesso.');
    } catch {
      setFeedback('Nao foi possivel ler esse arquivo.');
    } finally {
      event.target.value = '';
    }
  };

  const previewDay = selectedPlan
    ? selectedPlan.days[Math.max(0, (selectedActive?.currentDay ?? 1) - 1)]
    : undefined;
  const planProgress =
    selectedPlan && selectedActive
      ? Math.round((selectedActive.completedDays.length / selectedPlan.duration) * 100)
      : 0;
  const selectedIsCustom = Boolean(selectedPlan?.isCustom);

  return (
    <div className="h-full overflow-y-auto premium-page premium-scroll">
      <div className="premium-page__content max-w-7xl">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-hero"
        >
          <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-5">
              <span className="premium-kicker">
                <Compass className="h-4 w-4" />
                Planos de Leitura
              </span>
              <div className="space-y-3">
                <h1 className="premium-title">Uma jornada guiada pela Palavra.</h1>
                <p className="premium-subtitle">
                  Descubra planos com cara de app premium: comecar rapido, continuar de onde parou, ver a agenda dos proximos dias e transformar leitura em rotina.
                </p>
              </div>
            </div>

            <div className="grid min-w-[280px] grid-cols-2 gap-3 md:grid-cols-3">
              {[
                { label: 'Planos ativos', value: activePlans.length, icon: Play },
                { label: 'Salvos', value: state.savedPlanIds.length, icon: Library },
                { label: 'Dias concluidos', value: totalCompletedDays, icon: CheckCircle2 },
              ].map((item) => (
                <div key={item.label} className="premium-card-soft rounded-[28px] p-4">
                  <item.icon className="h-5 w-5 text-gold" />
                  <div className="mt-4 font-display text-3xl font-semibold">{item.value}</div>
                  <div className="ui-text mt-1 text-xs text-bible-text/55">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
        {todayPlan?.plan && (
          <section className="premium-card-strong rounded-[36px] p-6 md:p-8">
            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div className="space-y-4">
                <span className="premium-kicker">Hoje</span>
                <div>
                  <div className="premium-section-title">Continue seu plano</div>
                  <h2 className="mt-2 font-display text-4xl font-semibold leading-none md:text-5xl">{todayPlan.plan.title}</h2>
                </div>
                <p className="ui-text max-w-2xl text-sm leading-7 text-bible-text/70">
                  Dia {todayPlan.currentDay} de {todayPlan.plan.duration}. {todayPlan.plan.days[todayPlan.currentDay - 1]?.focus}
                </p>
                <div className="premium-card-soft rounded-[28px] p-4">
                  <div className="ui-text text-xs font-bold uppercase tracking-[0.22em] text-bible-text/45">Leitura de hoje</div>
                  <div className="mt-3 ui-text text-base font-semibold">{summarizeReadings(todayPlan.plan.days[todayPlan.currentDay - 1]?.readings ?? [])}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="h-2 overflow-hidden rounded-full bg-white/25">
                  <div
                    className="h-full rounded-full bg-bible-accent"
                    style={{ width: `${Math.max(6, Math.round((todayPlan.completedDays.length / todayPlan.plan.duration) * 100))}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    onClick={() => openReading(todayPlan.plan!, todayPlan.currentDay)}
                    className="premium-button px-5 py-4 ui-text text-[11px] font-extrabold uppercase tracking-[0.22em]"
                  >
                    <span className="inline-flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Abrir leitura
                    </span>
                  </button>
                  <button
                    onClick={() => completeDay(todayPlan.id)}
                    className="premium-button-secondary px-5 py-4 ui-text text-[11px] font-extrabold uppercase tracking-[0.22em]"
                  >
                    <span className="inline-flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Concluir dia
                    </span>
                  </button>
                </div>

                <label className="premium-card-soft flex items-center gap-3 rounded-[24px] px-4 py-3">
                  <Clock3 className="h-4 w-4 text-bible-text/45" />
                  <span className="ui-text text-sm text-bible-text/60">Horario preferido</span>
                  <input
                    type="time"
                    value={todayPlan.reminderTime}
                    onChange={(event) => updateReminder(todayPlan.id, event.target.value)}
                    className="ml-auto rounded-2xl border border-bible-accent/10 bg-white/35 px-3 py-2 text-sm outline-none"
                  />
                </label>
              </div>
            </div>
          </section>
        )}

        <section className="premium-card rounded-[36px] p-5 md:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <label className="relative block xl:min-w-[360px]">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-bible-text/40" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Busque por objetivo, tema ou plano"
                className="premium-input pl-11"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={cn(
                    'premium-chip ui-text text-xs font-bold uppercase tracking-[0.16em]',
                    category === item && 'premium-chip-active'
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="premium-card rounded-[36px] p-5 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="premium-section-title">Seu construtor</div>
              <p className="ui-text mt-1 text-sm text-bible-text/55">
                Monte seu proprio plano, edite quando quiser, exclua o que nao fizer mais sentido e compartilhe com outras pessoas.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={openCreateBuilder}
                className="premium-button px-5 py-4 ui-text text-[11px] font-extrabold uppercase tracking-[0.22em]"
              >
                <span className="inline-flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Criar plano
                </span>
              </button>
              <button
                onClick={() => {
                  setBuilderOpen(false);
                  setImportOpen((current) => !current);
                }}
                className="premium-button-secondary px-5 py-4 ui-text text-[11px] font-extrabold uppercase tracking-[0.22em]"
              >
                <span className="inline-flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Importar codigo
                </span>
              </button>
              <button
                onClick={() => {
                  if (!selectedPlan?.isCustom) {
                    setFeedback('Selecione um plano personalizado para exportar.');
                    return;
                  }
                  downloadPlanFile(selectedPlan);
                  setFeedback('Plano exportado em arquivo.');
                }}
                className={cn(
                  'premium-button-secondary px-5 py-4 ui-text text-[11px] font-extrabold uppercase tracking-[0.22em]',
                  !selectedPlan?.isCustom && 'opacity-55'
                )}
              >
                <span className="inline-flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Exportar plano
                </span>
              </button>
            </div>
          </div>

          {feedback && (
            <div className="mt-4 rounded-[22px] border border-bible-accent/15 bg-bible-accent/8 px-4 py-3 ui-text text-sm text-bible-accent">
              {feedback}
            </div>
          )}

          {importOpen && (
            <div className="mt-5 premium-card-soft rounded-[28px] p-5">
              <div className="premium-section-title">Importar plano compartilhado</div>
              <p className="ui-text mt-2 text-sm leading-6 text-bible-text/60">
                Cole o codigo Kerygma ou envie um arquivo exportado para adicionar o plano na sua biblioteca.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.kerygma-plan.json,.txt"
                onChange={handleImportFile}
                className="hidden"
              />
              <textarea
                value={importCode}
                onChange={(event) => setImportCode(event.target.value)}
                placeholder="Cole aqui o codigo do plano"
                className="premium-input mt-4 min-h-[120px] px-4 py-4"
              />
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={handleImportPlan}
                  className="premium-button px-4 py-3 ui-text text-[11px] font-extrabold uppercase tracking-[0.2em]"
                >
                  Importar agora
                </button>
                <button
                  onClick={handleImportFileClick}
                  className="premium-button-secondary px-4 py-3 ui-text text-[11px] font-extrabold uppercase tracking-[0.2em]"
                >
                  <span className="inline-flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upar arquivo
                  </span>
                </button>
                <button
                  onClick={() => {
                    setImportOpen(false);
                    setImportCode('');
                  }}
                  className="premium-button-ghost px-4 py-3 ui-text text-[11px] font-extrabold uppercase tracking-[0.2em]"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}

          {builderOpen && (
            <div className="mt-5 premium-card-soft rounded-[30px] p-5 md:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="premium-section-title">{editingPlanId ? 'Editar plano personalizado' : 'Novo plano personalizado'}</div>
                  <p className="ui-text mt-2 text-sm leading-6 text-bible-text/60">
                    Use referencias como `Joao 1`, `Salmos 23`, `Romanos 8-9`, separadas por virgula.
                  </p>
                </div>
                <div className="premium-chip">{draft.days.length} dias</div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <input value={draft.title} onChange={(event) => updateDraftField('title', event.target.value)} placeholder="Nome do plano" className="premium-input" />
                <input value={draft.badge} onChange={(event) => updateDraftField('badge', event.target.value)} placeholder="Selo curto" className="premium-input" />
                <textarea value={draft.description} onChange={(event) => updateDraftField('description', event.target.value)} placeholder="Descricao do plano" className="premium-input min-h-[120px] px-4 py-4 md:col-span-2" />
                <select value={draft.category} onChange={(event) => updateDraftField('category', event.target.value as PlanBuilderDraft['category'])} className="premium-input">
                  {categories.filter((item) => item !== 'Todos').map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
                <input value={draft.intensity} onChange={(event) => updateDraftField('intensity', event.target.value)} placeholder="Ritmo" className="premium-input" />
                <input value={draft.tone} onChange={(event) => updateDraftField('tone', event.target.value)} placeholder="Tom do plano" className="premium-input md:col-span-2" />
                <input value={draft.highlightsText} onChange={(event) => updateDraftField('highlightsText', event.target.value)} placeholder="Destaques separados por virgula" className="premium-input md:col-span-2" />
              </div>

              <div className="mt-6 space-y-4">
                {draft.days.map((day, index) => (
                  <div key={day.id} className="rounded-[24px] border border-bible-accent/10 bg-white/25 p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="premium-chip">Dia {index + 1}</div>
                      <button
                        onClick={() => removeDraftDay(day.id)}
                        className="premium-button-ghost px-3 py-2 ui-text text-[11px] font-extrabold uppercase tracking-[0.18em]"
                      >
                        Remover
                      </button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <input value={day.title} onChange={(event) => updateDraftDay(day.id, 'title', event.target.value)} placeholder="Titulo do dia" className="premium-input" />
                      <input value={day.subtitle} onChange={(event) => updateDraftDay(day.id, 'subtitle', event.target.value)} placeholder="Subtitulo" className="premium-input" />
                      <textarea value={day.readingsText} onChange={(event) => updateDraftDay(day.id, 'readingsText', event.target.value)} placeholder="Ex.: Joao 1, Salmos 23, Romanos 8-9" className="premium-input min-h-[110px] px-4 py-4 md:col-span-2" />
                      <input value={day.focus} onChange={(event) => updateDraftDay(day.id, 'focus', event.target.value)} placeholder="Foco espiritual do dia" className="premium-input" />
                      <input value={day.minutes} onChange={(event) => updateDraftDay(day.id, 'minutes', event.target.value)} placeholder="Minutos estimados" className="premium-input" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={addDraftDay}
                  className="premium-button-secondary px-4 py-3 ui-text text-[11px] font-extrabold uppercase tracking-[0.2em]"
                >
                  <span className="inline-flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Adicionar dia
                  </span>
                </button>
                <button
                  onClick={handleSaveCustomPlan}
                  className="premium-button px-4 py-3 ui-text text-[11px] font-extrabold uppercase tracking-[0.2em]"
                >
                  Salvar plano
                </button>
                <button
                  onClick={() => {
                    setBuilderOpen(false);
                    setEditingPlanId(null);
                    setDraft(createEmptyDraft());
                  }}
                  className="premium-button-ghost px-4 py-3 ui-text text-[11px] font-extrabold uppercase tracking-[0.2em]"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.02fr_0.98fr]">
          <section className="premium-card rounded-[36px] p-6 md:p-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="premium-section-title">Explorar</div>
                <p className="ui-text mt-1 text-sm text-bible-text/55">Escolha um caminho e deixe a jornada bem clara desde o primeiro dia.</p>
              </div>
              <div className="premium-chip">{filteredPlans.length} planos</div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {filteredPlans.map((plan) => {
                const planState = state.activePlans.find((entry) => entry.id === plan.id);
                const isSaved = state.savedPlanIds.includes(plan.id);

                return (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={cn(
                      'premium-card-soft w-full rounded-[30px] p-5 text-left transition-all hover:border-bible-accent/20',
                      selectedPlan?.id === plan.id && 'border border-bible-accent/20 bg-bible-accent/10'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <span className="premium-kicker">{plan.isCustom ? 'Seu plano' : plan.badge}</span>
                        <h3 className="font-display text-3xl leading-none">{plan.title}</h3>
                      </div>
                      {isSaved && <Star className="h-4 w-4 fill-current text-gold" />}
                    </div>

                    <p className="ui-text mt-4 text-sm leading-6 text-bible-text/65">{plan.description}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <span className="premium-chip ui-text text-[11px] font-bold uppercase tracking-[0.16em]">{plan.duration} dias</span>
                      <span className="premium-chip ui-text text-[11px] font-bold uppercase tracking-[0.16em]">{plan.intensity}</span>
                      <span className="premium-chip ui-text text-[11px] font-bold uppercase tracking-[0.16em]">{plan.category}</span>
                      {plan.isCustom && <span className="premium-chip ui-text text-[11px] font-bold uppercase tracking-[0.16em]">Personalizado</span>}
                    </div>

                    {planState && (
                      <div className="mt-5 rounded-[22px] bg-bible-accent/10 px-4 py-3">
                        <div className="ui-text text-xs font-bold uppercase tracking-[0.2em] text-bible-accent">Em andamento</div>
                        <div className="mt-2 ui-text text-sm text-bible-text/70">Dia {planState.currentDay} de {plan.duration}</div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {selectedPlan && (
            <section className="premium-card rounded-[36px] p-6 md:p-8">
              <div className="space-y-4">
                <span className="premium-kicker">
                  <Sparkles className="h-4 w-4" />
                  Detalhe do Plano
                </span>
                <div className="space-y-3">
                  <h2 className="font-display text-5xl leading-none">{selectedPlan.title}</h2>
                  <p className="ui-text text-sm leading-7 text-bible-text/68">{selectedPlan.description}</p>
                  <p className="ui-text text-sm leading-7 text-bible-text/52">{selectedPlan.tone}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {selectedPlan.highlights.map((highlight) => (
                  <div key={highlight} className="premium-card-soft rounded-[24px] p-4">
                    <Target className="h-4 w-4 text-gold" />
                    <div className="ui-text mt-3 text-sm font-semibold">{highlight}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() => startPlan(selectedPlan.id)}
                  className="premium-button px-5 py-4 ui-text text-[11px] font-extrabold uppercase tracking-[0.22em]"
                >
                  <span className="inline-flex items-center gap-2">
                    <Play className="h-4 w-4 fill-current" />
                    {selectedActive ? 'Iniciar do dia 1' : 'Iniciar plano'}
                  </span>
                </button>
                <button
                  onClick={() => toggleSave(selectedPlan.id)}
                  className="premium-button-secondary px-5 py-4 ui-text text-[11px] font-extrabold uppercase tracking-[0.22em]"
                >
                  <span className="inline-flex items-center gap-2">
                    <Library className="h-4 w-4" />
                    {state.savedPlanIds.includes(selectedPlan.id) ? 'Remover da biblioteca' : 'Salvar na biblioteca'}
                  </span>
                </button>
              </div>

              {selectedIsCustom && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <button
                    onClick={() => openEditBuilder(selectedPlan)}
                    className="premium-button-secondary px-4 py-3 ui-text text-[11px] font-extrabold uppercase tracking-[0.2em]"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Pencil className="h-4 w-4" />
                      Editar
                    </span>
                  </button>
                  <button
                    onClick={() => handleShareCustomPlan(selectedPlan)}
                    className="premium-button-secondary px-4 py-3 ui-text text-[11px] font-extrabold uppercase tracking-[0.2em]"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Share2 className="h-4 w-4" />
                      Compartilhar
                    </span>
                  </button>
                  <button
                    onClick={() => downloadPlanFile(selectedPlan)}
                    className="premium-button-secondary px-4 py-3 ui-text text-[11px] font-extrabold uppercase tracking-[0.2em]"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Exportar arquivo
                    </span>
                  </button>
                  <button
                    onClick={() => handleDeleteCustomPlan(selectedPlan.id)}
                    className="premium-button-ghost px-4 py-3 ui-text text-[11px] font-extrabold uppercase tracking-[0.2em] text-[rgb(179,80,78)]"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </span>
                  </button>
                </div>
              )}

              {selectedActive && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={() => openReading(selectedPlan, selectedActive.currentDay)}
                    className="premium-button-secondary px-5 py-4 ui-text text-[11px] font-extrabold uppercase tracking-[0.22em]"
                  >
                    <span className="inline-flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Continuar leitura
                    </span>
                  </button>
                  <button
                    onClick={() => restartPlan(selectedPlan.id)}
                    className="premium-button-ghost px-5 py-4 ui-text text-[11px] font-extrabold uppercase tracking-[0.22em]"
                  >
                    Reiniciar progresso
                  </button>
                </div>
              )}

              {previewDay && (
                <div className="mt-6 premium-card-soft rounded-[30px] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="premium-section-title">Preview do dia</div>
                      <h3 className="mt-2 font-display text-3xl leading-none">{previewDay.title}</h3>
                      <p className="ui-text mt-2 text-sm text-bible-text/60">{previewDay.subtitle}</p>
                    </div>
                    <div className="premium-chip">{previewDay.minutes} min</div>
                  </div>

                  <div className="mt-5 rounded-[24px] bg-white/30 p-4">
                    <div className="ui-text text-xs font-bold uppercase tracking-[0.2em] text-bible-text/45">Leituras</div>
                    <div className="ui-text mt-3 text-base font-semibold">{summarizeReadings(previewDay.readings)}</div>
                    <p className="ui-text mt-3 text-sm leading-6 text-bible-text/65">{previewDay.focus}</p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={() => openReading(selectedPlan, previewDay.day)}
                      className="premium-button-secondary px-4 py-3 ui-text text-[11px] font-extrabold uppercase tracking-[0.2em]"
                    >
                      Abrir este dia
                    </button>
                    {selectedActive && (
                      <button
                        onClick={() => jumpToDay(selectedPlan.id, previewDay.day)}
                        className="premium-button-ghost px-4 py-3 ui-text text-[11px] font-extrabold uppercase tracking-[0.2em]"
                      >
                        Ir para esse dia
                      </button>
                    )}
                  </div>
                </div>
              )}

              {selectedActive && (
                <div className="mt-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="premium-section-title">Progresso</div>
                    <div className="premium-chip">{planProgress}% concluido</div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-bible-accent/10">
                    <div className="h-full rounded-full bg-bible-accent" style={{ width: `${Math.max(2, planProgress)}%` }} />
                  </div>
                </div>
              )}

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="premium-section-title">Agenda</div>
                    <p className="ui-text mt-1 text-sm text-bible-text/55">Os proximos dias aparecem claramente antes de voce comecar.</p>
                  </div>
                  <CalendarDays className="h-4 w-4 text-bible-text/35" />
                </div>

                <div className="mt-4 space-y-3">
                  {selectedPlan.days
                    .slice(Math.max(0, (selectedActive?.currentDay ?? 1) - 1), Math.max(0, (selectedActive?.currentDay ?? 1) - 1) + 6)
                    .map((day) => (
                      <button
                        key={day.day}
                        onClick={() => openReading(selectedPlan, day.day)}
                        className="premium-card-soft flex w-full items-center justify-between gap-4 rounded-[24px] p-4 text-left"
                      >
                        <div className="min-w-0">
                          <div className="ui-text text-xs font-bold uppercase tracking-[0.2em] text-bible-text/42">Dia {day.day}</div>
                          <div className="mt-1 ui-text text-sm font-semibold">{day.title}</div>
                          <div className="ui-text mt-1 truncate text-xs text-bible-text/55">{summarizeReadings(day.readings)}</div>
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0 text-bible-text/35" />
                      </button>
                    ))}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

function cn(...inputs: Array<string | false | null | undefined>) {
  return inputs.filter(Boolean).join(' ');
}
