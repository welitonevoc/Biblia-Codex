/**
 * Módulo de Gerenciamento de Arquivos Premium
 * Responsável por estruturar módulos em pastas e detectar tipos automaticamente.
 */
import { Filesystem, Directory } from '@capacitor/filesystem';

export type ModuleCategory = 'bible' | 'commentary' | 'dictionary' | 'cross_reference' | 'book' | 'map' | 'devotional' | 'other';
export type ModuleFormat = 'mybible' | 'mysword' | 'sword' | 'epub' | 'other';

export interface ModuleInfo {
  id: string;
  name: string;
  abbreviation: string;
  category: ModuleCategory;
  format: ModuleFormat;
  version: string;
  author: string;
  language: string;
  path: string;
  size?: number;
}

const BASE_DIR = 'Codex/modules/installed';
const SUB_DIRS = ['mybible', 'mysword', 'sword', 'epub'];
const SQLITE_HEADER = 'SQLite format 3\u0000';
const DOC_PREFIX = 'documents://';
const DATA_PREFIX = 'data://';

/**
 * Detecta a categoria baseada no nome do arquivo
 */
const detectCategory = (fileName: string): ModuleCategory => {
  const name = fileName.toLowerCase();
  if (name.includes('.dct.') || name.includes('.dict.') || name.includes('.lexicon.')) return 'dictionary';
  if (name.includes('.cmt.') || name.includes('.comment.')) return 'commentary';
  if (name.includes('.xref.') || name.includes('.ref.') || name.includes('.xrefs.')) return 'cross_reference';
  if (name.includes('.bok.') || name.includes('.book.')) return 'book';
  if (name.includes('.map.') || name.includes('.atlas.') || name.includes(' mapa') || name.includes(' atlas') || name.includes('mapa.') || name.includes('atlas.')) return 'map';
  if (name.includes('.devot.') || name.includes('.devotions.')) return 'devotional';
  return 'bible';
};

/**
 * Detecta o formato baseado na extensão
 */
const detectFormat = (fileName: string): ModuleFormat => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext === 'mybible' || ext === 'sqlite3' || ext === 'sqlite') return 'mybible';
  if (ext === 'mybl' || ext === 'mybls' || ext === 'twm' || fileName.includes('.mysword')) return 'mysword';
  if (ext === 'conf' || ext === 'dat') return 'sword';
  if (ext === 'epub') return 'epub';
  return 'other';
};

const decodeBase64Prefix = (base64: string, bytes: number): string => {
  const clean = base64.replace(/\s/g, '');
  const charsNeeded = Math.ceil(bytes / 3) * 4;
  const prefix = clean.slice(0, charsNeeded);
  return atob(prefix).slice(0, bytes);
};

const isSqliteBase64 = (base64: string): boolean => {
  try {
    return decodeBase64Prefix(base64, SQLITE_HEADER.length) === SQLITE_HEADER;
  } catch {
    return false;
  }
};

const encodePath = (directory: Directory.Documents | Directory.Data, path: string): string => {
  return `${directory === Directory.Documents ? DOC_PREFIX : DATA_PREFIX}${path}`;
};

const decodePath = (modulePath: string): {
  directory: Directory.Documents | Directory.Data;
  path: string;
  explicit: boolean;
} => {
  if (modulePath.startsWith(DOC_PREFIX)) {
    return { directory: Directory.Documents, path: modulePath.slice(DOC_PREFIX.length), explicit: true };
  }
  if (modulePath.startsWith(DATA_PREFIX)) {
    return { directory: Directory.Data, path: modulePath.slice(DATA_PREFIX.length), explicit: true };
  }
  return { directory: Directory.Documents, path: modulePath, explicit: false };
};

export const listInstalledModules = async (): Promise<ModuleInfo[]> => {
  const allModules: ModuleInfo[] = [];
  const seen = new Set<string>();

  try {
    for (const sub of SUB_DIRS) {
      const path = `${BASE_DIR}/${sub}`;
      try {
        const result = await Filesystem.readdir({
          directory: Directory.Documents,
          path,
        });

        for (const file of result.files) {
          const uniqueKey = `${sub}::${file.name}`;
          if (seen.has(uniqueKey)) continue;

          const stats = await Filesystem.stat({
            directory: Directory.Documents,
            path: `${path}/${file.name}`,
          });

          allModules.push({
            id: file.name.replace(/\.[^/.]+$/, ""),
            name: file.name,
            abbreviation: file.name.replace(/\.[^/.]+$/, "").substring(0, 4).toUpperCase(),
            category: detectCategory(file.name),
            format: sub as ModuleFormat,
            version: '1.0.0',
            author: 'Unknown',
            language: 'pt-BR',
            path: encodePath(Directory.Documents, `${path}/${file.name}`),
            size: stats.size,
          });
          seen.add(uniqueKey);
        }
      } catch (e) {
        // Subdiretório não existe, ignora
      }
    }
    for (const sub of SUB_DIRS) {
      const path = `${BASE_DIR}/${sub}`;
      try {
        const result = await Filesystem.readdir({
          directory: Directory.Data,
          path,
        });

        for (const file of result.files) {
          const uniqueKey = `${sub}::${file.name}`;
          if (seen.has(uniqueKey)) continue;

          const stats = await Filesystem.stat({
            directory: Directory.Data,
            path: `${path}/${file.name}`,
          });

          allModules.push({
            id: file.name.replace(/\.[^/.]+$/, ""),
            name: file.name,
            abbreviation: file.name.replace(/\.[^/.]+$/, "").substring(0, 4).toUpperCase(),
            category: detectCategory(file.name),
            format: sub as ModuleFormat,
            version: '1.0.0',
            author: 'Unknown',
            language: 'pt-BR',
            path: encodePath(Directory.Data, `${path}/${file.name}`),
            size: stats.size,
          });
          seen.add(uniqueKey);
        }
      } catch (e) {
        // SubdiretÃ³rio nÃ£o existe, ignora
      }
    }

    return allModules;
  } catch (error) {
    console.error("Erro ao listar módulos:", error);
    return [];
  }
};

/**
 * Lê o conteúdo binário de um módulo para uso pelo SQL engine.
 */
export const readModuleBinary = async (modulePath: string): Promise<Uint8Array> => {
  try {
    const resolved = decodePath(modulePath);
    let contents;

    try {
      contents = await Filesystem.readFile({
        directory: resolved.directory,
        path: resolved.path,
      });
    } catch (firstError) {
      if (resolved.explicit) throw firstError;

      contents = await Filesystem.readFile({
        directory: Directory.Data,
        path: resolved.path,
      });
    }
    
    const raw = contents.data;

    // Web: readFile retorna Blob. Native: retorna string base64.
    if (raw instanceof Blob) {
      const buffer = await raw.arrayBuffer();
      return new Uint8Array(buffer);
    }

    if (typeof raw === 'string') {
      const cleanBase64 = raw.replace(/\s/g, '');
      const binaryData = atob(cleanBase64);
      const bytes = new Uint8Array(binaryData.length);
      for (let i = 0; i < binaryData.length; i++) {
        bytes[i] = binaryData.charCodeAt(i);
      }
      return bytes;
    }

    // Fallback: tenta converter como ArrayBuffer
    if (raw && typeof (raw as any).byteLength === 'number') {
      return new Uint8Array(raw as ArrayBuffer);
    }

    throw new Error(`Formato de dados não suportado: ${typeof raw}, path=${modulePath}`);
  } catch (error) {
    console.error("Erro ao ler binário do módulo:", modulePath, error);
    throw error;
  }
};

export const deleteModule = async (modulePath: string): Promise<void> => {
  try {
    const resolved = decodePath(modulePath);
    try {
      await Filesystem.deleteFile({
        directory: resolved.directory,
        path: resolved.path,
      });
    } catch (firstError) {
      if (resolved.explicit) throw firstError;

      await Filesystem.deleteFile({
        directory: Directory.Data,
        path: resolved.path,
      });
    }
  } catch (error) {
    console.error("Erro ao deletar módulo:", error);
    throw error;
  }
};

export const importModule = async (content: string, fileName: string): Promise<ModuleInfo> => {
  const format = detectFormat(fileName);
  const lowerName = fileName.toLowerCase();
  const expectsSqlite =
    format === 'mybible' ||
    format === 'mysword' ||
    lowerName.endsWith('.mybible') ||
    lowerName.endsWith('.sqlite3') ||
    lowerName.endsWith('.sqlite');

  if (expectsSqlite && !isSqliteBase64(content)) {
    throw new Error('Arquivo incompatível: este módulo não está em SQLite válido. Use .bbl.mybible ou .SQLite3.');
  }

  const destDir = `${BASE_DIR}/${format === 'other' ? 'mybible' : format}`;
  const destPath = `${destDir}/${fileName}`;

  let usedDirectory: Directory.Documents | Directory.Data = Directory.Documents;
  let writeError: unknown = null;

  for (const directory of [Directory.Documents, Directory.Data] as const) {
    try {
      await Filesystem.mkdir({
        directory,
        path: destDir,
        recursive: true,
      });

      await Filesystem.writeFile({
        directory,
        path: destPath,
        data: content,
        recursive: true,
      });

      usedDirectory = directory;
      writeError = null;
      break;
    } catch (error) {
      writeError = error;
    }
  }

  if (writeError) {
    console.error('Falha ao gravar módulo em Documents/Data:', writeError);
    throw new Error('Não foi possível salvar o arquivo do módulo no armazenamento do app.');
  }

  return {
    id: fileName.replace(/\.[^/.]+$/, ""),
    name: fileName,
    abbreviation: fileName.replace(/\.[^/.]+$/, "").substring(0, 4).toUpperCase(),
    category: detectCategory(fileName),
    format: format === 'other' ? 'mybible' : format,
    version: '1.0.0',
    author: 'Unknown',
    language: 'pt-BR',
    path: encodePath(usedDirectory, destPath)
  };
};
