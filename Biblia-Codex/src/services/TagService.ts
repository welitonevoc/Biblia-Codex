import { Tag } from '../types';
import { storage } from '../StorageService';

const HUE_STEPS = [210, 140, 270, 25, 330, 185, 45, 90, 310, 0, 160, 240];
let hueIdx = Math.floor(Math.random() * HUE_STEPS.length);

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
  { id: 'davi',      n: 'Davi',      dot: '#1a1a1a', bg: '#f0f0ee', tc: '#1a1a1a' },
  { id: 'paz',       n: 'Paz',       dot: '#0891b2', bg: '#cffafe', tc: '#0e7490' },
  { id: 'sabedoria', n: 'Sabedoria', dot: '#db2777', bg: '#fce7f3', tc: '#be185d' },
  { id: 'amor',      n: 'Amor',      dot: '#2563eb', bg: '#dbeafe', tc: '#1d4ed8' },
];

export const TagService = {
  generateColor() {
    const base = HUE_STEPS[hueIdx % HUE_STEPS.length];
    hueIdx++;
    const h = (base + Math.floor(Math.random() * 30) - 15 + 360) % 360;
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
