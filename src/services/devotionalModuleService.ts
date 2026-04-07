/**
 * Service para ler módulos devocionais MyBible (.devotions.SQLite3).
 * Usa sql.js (WASM) para ler o banco SQLite no navegador.
 */
import initSqlJs from 'sql.js';
import { readModuleBinary, listInstalledModules, ModuleInfo } from './moduleService';
import { parseDevotional, ParsedDevotional, extractBibleReferences } from './devotionalParser';

export interface DevotionalModuleData {
  id: string;
  name: string;
  description: string;
  language: string;
  author: string;
  totalDays: number;
  path: string;
  entries: Map<number, ParsedDevotional>;
  rawEntries: Map<number, string>; // HTML bruto para renderização
  bibleRefs: Map<number, { ref: string; bookId?: string; chapter?: number; verse?: number }[]>;
}

const moduleCache = new Map<string, DevotionalModuleData>();

/** Lê o módulo devocional do filesystem e parseia */
async function loadModule(modulePath: string): Promise<DevotionalModuleData> {
  if (moduleCache.has(modulePath)) {
    return moduleCache.get(modulePath)!;
  }

  const SQL = await initSqlJs({
    locateFile: () => '/sql-wasm.wasm',
  });

  const binaryData = await readModuleBinary(modulePath);
  const db = new SQL.Database(binaryData);

  try {
    // Ler info
    const infoResult = db.exec("SELECT name, value FROM info");
    const infoMap = new Map<string, string>();
    if (infoResult.length > 0) {
      for (const row of infoResult[0].values) {
        infoMap.set(row[0] as string, row[1] as string);
      }
    }

    // Ler devocionais
    const devotionsResult = db.exec("SELECT day, devotion FROM devotions ORDER BY day ASC");
    const entries = new Map<number, ParsedDevotional>();
    const rawEntries = new Map<number, string>();
    const bibleRefs = new Map<number, { ref: string; bookId?: string; chapter?: number; verse?: number }[]>();

    if (devotionsResult.length > 0) {
      for (const row of devotionsResult[0].values) {
        const day = row[0] as number;
        const html = row[1] as string;
        rawEntries.set(day, html);
        entries.set(day, parseDevotional(html));
        bibleRefs.set(day, extractBibleReferences(html));
      }
    }

    // Extrair autor do detailed_info ou description
    const description = infoMap.get('description') || '';
    const detailedInfo = infoMap.get('detailed_info') || '';
    let author = '';
    const authorMatch = detailedInfo.match(/<i>([^<]+)<\/i>/);
    if (authorMatch) {
      author = authorMatch[1].trim();
    } else if (description.includes(' - ')) {
      author = description.split(' - ').pop()?.trim() || '';
    }

    const id = modulePath.split('/').pop()?.replace(/\.[^/.]+$/, '') || modulePath;

    const moduleData: DevotionalModuleData = {
      id,
      name: description,
      description: detailedInfo ? detailedInfo.replace(/<[^>]+>/g, ' ').trim() : description,
      language: infoMap.get('language') || 'pt',
      author,
      totalDays: entries.size,
      path: modulePath,
      entries,
      rawEntries,
      bibleRefs,
    };

    moduleCache.set(modulePath, moduleData);
    return moduleData;
  } finally {
    db.close();
  }
}

/** Lista todos os módulos devocionais instalados */
export async function listDevotionalModules(): Promise<ModuleInfo[]> {
  const allModules = await listInstalledModules();
  return allModules.filter(m => m.category === 'devotional');
}

/** Carrega um módulo devocional pelo path */
export async function loadDevotionalModule(modulePath: string): Promise<DevotionalModuleData> {
  return loadModule(modulePath);
}

/** Obtém o devocional de um dia específico */
export async function getDevotionalForDay(
  modulePath: string,
  day: number
): Promise<{ parsed: ParsedDevotional; raw: string; refs: { ref: string; bookId?: string; chapter?: number; verse?: number }[] } | null> {
  const moduleData = await loadModule(modulePath);
  const parsed = moduleData.entries.get(day);
  const raw = moduleData.rawEntries.get(day);
  const refs = moduleData.bibleRefs.get(day) || [];

  if (!parsed || !raw) return null;
  return { parsed, raw, refs };
}

/** Calcula o dia do ano atual (1-366) */
export function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/** Limpa o cache de módulos */
export function clearDevotionalCache(): void {
  moduleCache.clear();
}

export { extractBibleReferences };
