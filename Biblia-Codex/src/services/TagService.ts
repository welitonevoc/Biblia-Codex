import { Tag } from '../types';
import { storage } from '../StorageService';

const HUE_STEPS = [210, 140, 270, 25, 330, 185, 45, 90, 310, 0, 160, 240];
let hueIdx = 0;

function hslToHex(h: number, s: number, l: number) {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c).toString(16).padStart(2, '0');
  };
  return '#' + f(0) + f(8) + f(4);
}

export const PALETTE = [
  { dot: '#1a1a1a', bg: '#f0f0ee', tc: '#1a1a1a' },
  { dot: '#2563eb', bg: '#dbeafe', tc: '#1d4ed8' },
  { dot: '#16a34a', bg: '#dcfce7', tc: '#15803d' },
  { dot: '#9333ea', bg: '#f3e8ff', tc: '#7e22ce' },
  { dot: '#ea580c', bg: '#ffedd5', tc: '#c2410c' },
  { dot: '#db2777', bg: '#fce7f3', tc: '#be185d' },
  { dot: '#0891b2', bg: '#cffafe', tc: '#0e7490' },
  { dot: '#854d0e', bg: '#fef9c3', tc: '#713f12' },
];

const DEFAULT_TAGS = [
  { id: 'graca',     n: 'Graça',     dot: '#2563eb', bg: '#dbeafe', tc: '#1d4ed8' },
  { id: 'fe',        n: 'Fé',        dot: '#16a34a', bg: '#dcfce7', tc: '#15803d' },
  { id: 'oracao',    n: 'Oração',    dot: '#9333ea', bg: '#f3e8ff', tc: '#7e22ce' },
  { id: 'justica',   n: 'Justiça',   dot: '#ea580c', bg: '#ffedd5', tc: '#c2410c' },
  { id: 'paz',       n: 'Paz',       dot: '#0891b2', bg: '#cffafe', tc: '#0e7490' },
  { id: 'sabedoria', n: 'Sabedoria', dot: '#db2777', bg: '#fce7f3', tc: '#be185d' },
  { id: 'amor',      n: 'Amor',      dot: '#f43f5e', bg: '#ffe4e6', tc: '#e11d48' },
  { id: 'esperanca',  n: 'Esperança', dot: '#84cc16', bg: '#ecfccb', tc: '#65a30d' },
  { id: 'salvacao',  n: 'Salvação',  dot: '#22c55e', bg: '#dcfce7', tc: '#16a34a' },
  { id: 'redoencao', n: 'Redenção',  dot: '#14b8a6', bg: '#ccfbf1', tc: '#0d9488' },
  { id: 'espirito',  n: 'Espírito Santo', dot: '#8b5cf6', bg: '#ede9fe', tc: '#7c3aed' },
  { id: 'palavra',   n: 'Palavra de Deus', dot: '#dc2626', bg: '#fee2e2', tc: '#dc2626' },
  { id: 'adoracao',  n: 'Adoração', dot: '#fbbf24', bg: '#fef3c7', tc: '#d97706' },
  { id: 'louvor',   n: 'Louvor',   dot: '#f59e0b', bg: '#fde68a', tc: '#d97706' },
  { id: 'missao',   n: 'Missão',   dot: '#ef4444', bg: '#fecaca', tc: '#dc2626' },
  { id: 'evangelho', n: 'Evangelho', dot: '#22c55e', bg: '#bbf7d0', tc: '#16a34a' },
  { id: 'fé_viva',   n: 'Fé Viva', dot: '#10b981', bg: '#d1fae5', tc: '#059669' },
  { id: '慈爱',      n: 'Amor Divino', dot: '#ec4899', bg: '#fce7f3', tc: '#db2777' },
  { id: '馨香',     n: 'Sacrifício', dot: '#f97316', bg: '#ffedd5', tc: '#ea580c' },
  { id: '盼望',     n: 'Esperança Cristã', dot: '#06b6d4', bg: '#cffafe', tc: '#0891b2' },
  { id: '信心',     n: 'Fé Salvadora', dot: '#8b5cf6', bg: '#ede9fe', tc: '#7c22ce' },
  { id: '悔改',     n: 'Arrependimento', dot: '#a855f7', bg: '#f3e8ff', tc: '#9333ea' },
  { id: '洗礼',     n: 'Batismo', dot: '#3b82f6', bg: '#dbeafe', tc: '#2563eb' },
  { id: '圣灵',     n: 'Espírito', dot: '#6366f1', bg: '#e0e7ff', tc: '#4f46e5' },
  { id: '真理',     n: 'Verdade', dot: '#0ea5e9', bg: '#e0f2fe', tc: '#0284c7' },
  { id: '生命',     n: 'Vida Eterna', dot: '#14b8a6', bg: '#ccfbf1', tc: '#0d9488' },
  { id: '复活',     n: 'Ressurreição', dot: '#f43f5e', bg: '#ffe4e6', tc: '#e11d48' },
  { id: '审判',     n: 'Juízo', dot: '#b91c1c', bg: '#fee2e2', tc: '#991b1b' },
  { id: '荣耀',     n: 'Glória de Deus', dot: '#eab308', bg: '#fef9c3', tc: '#ca8a04' },
  { id: '怜悯',    n: 'Misericórdia', dot: '#f59e0b', bg: '#fef3c7', tc: '#d97706' },
  { id: '恩典',     n: 'Graça Abundante', dot: '#818cf8', bg: '#e0e7ff', tc: '#6366f1' },
  { id: '果子',     n: 'Frutos do Espírito', dot: '#22c55e', bg: '#dcfce7', tc: '#16a34a' },
  { id: '果子',     n: 'Fruto do Espírito', dot: '#10b981', bg: '#d1fae5', tc: '#059669' },
  { id: 'debildad', n: 'Debilidade', dot: '#f43f5e', bg: '#ffe4e6', tc: '#e11d48' },
  { id: 'fortaleza', n: 'Força Interior', dot: '#78716c', bg: '#f5f5f4', tc: '#44403c' },
  { id: ' guia',     n: 'Guia Divino', dot: '#0d9488', bg: '#ccfbf1', tc: '#0e7490' },
  { id: 'proteção',  n: 'Proteção', dot: '#06b6d4', bg: '#cffafe', tc: '#0891b2' },
  { id: 'providencia', n: 'Providência', dot: '#f59e0b', bg: '#fef3c7', tc: '#d97706' },
  { id: 'soberania', n: 'Soberania de Deus', dot: '#84cc16', bg: '#ecfccb', tc: '#65a30d' },
  { id: 'presenca',  n: 'Presença de Deus', dot: '#a855f7', bg: '#f3e8ff', tc: '#9333ea' },
  { id: 'unidade',  n: 'Unidade Cristã', dot: '#14b8a6', bg: '#ccfbf1', tc: '#0d9488' },
  { id: 'comunhao', n: 'Comunhão', dot: '#3b82f6', bg: '#dbeafe', tc: '#2563eb' },
  { id: 'corpo',    n: 'Corpo de Cristo', dot: '#ec4899', bg: '#fce7f3', tc: '#db2777' },
  { id: 'igreja',   n: 'Igreja', dot: '#22c55e', bg: '#dcfce7', tc: '#16a34a' },
  { id: 'ministerio', n: 'Ministério', dot: '#f97316', bg: '#ffedd5', tc: '#ea580c' },
  { id: 'chamado',  n: 'Chamado Cristão', dot: '#8b5cf6', bg: '#ede9fe', tc: '#7c3aed' },
  { id: 'formacao',  n: 'Formação Cristã', dot: '#6366f1', bg: '#e0e7ff', tc: '#4f46e5' },
  { id: 'discipulo', n: 'Discipulado', dot: '#0ea5e9', bg: '#e0f2fe', tc: '#0284c7' },
  { id: 'cruz',     n: 'A Cruz', dot: '#b91c1c', bg: '#fee2e2', tc: '#991b1b' },
  { id: 'ressurreicao', n: 'Ressurreição', dot: '#f43f5e', bg: '#ffe4e6', tc: '#e11d48' },
  { id: 'segunda_vinda', n: 'Segunda Vinda', dot: '#eab308', bg: '#fef9c3', tc: '#ca8a04' },
  { id: 'novos_ceu', n: 'Novos Céus', dot: '#06b6d4', bg: '#cffafe', tc: '#0891b2' },
  { id: 'nova_terra', n: 'Nova Terra', dot: '#10b981', bg: '#d1fae5', tc: '#059669' },
  { id: 'reino',    n: 'Reino de Deus', dot: '#eab308', bg: '#fef9c3', tc: '#ca8a04' },
  { id: 'immanuel',  n: 'Immanuel', dot: '#f59e0b', bg: '#fef3c7', tc: '#d97706' },
  { id: '-type',    n: 'Tipo Bíblico', dot: '#78716c', bg: '#f5f5f4', tc: '#44403c' },
  { id: 'profecia',  n: 'Profecia', dot: '#a855f7', bg: '#f3e8ff', tc: '#9333ea' },
  { id: 'cumprimento', n: 'Cumprimento', dot: '#14b8a6', bg: '#ccfbf1', tc: '#0d9488' },
  { id: 'sinal',    n: 'Sinais e Milagres', dot: '#f43f5e', bg: '#ffe4e6', tc: '#e11d48' },
  { id: 'ensinamento', n: 'Ensino', dot: '#3b82f6', bg: '#dbeafe', tc: '#2563eb' },
  { id: 'doctrina',  n: 'Doutrina', dot: '#8b5cf6', bg: '#ede9fe', tc: '#7c3aed' },
];

export const TagService = {
  generateColor() {
    const base = HUE_STEPS[hueIdx % HUE_STEPS.length];
    hueIdx++;
    const h = (base + (((hueIdx * 7) % 30) - 15) + 360) % 360;
    return {
      dot: hslToHex(h, 62, 38),
      bg: hslToHex(h, 80, 94),
      tc: hslToHex(h, 62, 25),
    };
  },

  async initDefaults() {
    const existing = await storage.getTags();
    if (existing.length === 0) {
      for (const t of DEFAULT_TAGS) {
        await storage.saveTag({
          id: t.id,
          name: t.n,
          color: t.dot,
          background: t.bg,
          textColor: t.tc,
          createdAt: Date.now()
        });
      }
    }
  },

  async createTag(name: string, customColors?: { dot: string, bg: string, tc: string }): Promise<Tag> {
    const id = name.toLowerCase()
      .trim()
      .replace(/\s+/g, '_')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const existing = await this.getTag(id);
    if (existing) return existing;

    const colors = customColors || this.generateColor();

    const newTag: Tag = {
      id,
      name: name.startsWith('#') ? name.slice(1) : name,
      color: colors.dot,
      background: colors.bg,
      textColor: colors.tc,
      createdAt: Date.now()
    };

    await storage.saveTag(newTag);
    return newTag;
  },

  async getTag(id: string): Promise<Tag | undefined> {
    const tags = await storage.getTags();
    return tags.find(t => t.id === id);
  },

  async getAllTags(): Promise<Tag[]> {
    return storage.getTags();
  }
};
