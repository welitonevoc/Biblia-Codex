import { Filesystem, Directory } from '@capacitor/filesystem';
import { BibleModule } from '../types';

const isWeb = typeof window !== 'undefined' && !(window as any).Capacitor?.isNativePlatform?.();

const PUBLIC_MODULES = [
  { file: 'ARA_s (Almeida Revista e Atualizada com Strong).bbl.mybible', name: 'ARA (Almeida Revista e Atualizada)', abbreviation: 'ARA' },
  { file: 'ARC 2009 SBB (Corrigida 2009).bbl.mybible', name: 'ARC 2009 (Almeida Revista e Corrigida)', abbreviation: 'ARC' },
  { file: "ACF'07.SQLite3", name: 'ACF (Almeida Corrigida Fiel)', abbreviation: 'ACF' },
];

const PUBLIC_DICTIONARIES = [
  { file: 'Strong AMG Biblia Palavra-Chave.dct.mybible', name: 'Strong AMG (Biblia Palavra-Chave)' },
  { file: 'Strong KJ Concordancia.dct.mybible', name: 'Strong KJ (Concordancia)' },
  { file: 'EnciclopediaMerril_optimized.db', name: 'Enciclopédia Merrill (Tenney)', category: 'merrill' },
];

export const scanForBibleModules = async (): Promise<BibleModule[]> => {
  if (isWeb) {
    // Inclui tanto bíblias quanto dicionários públicos no web
    const bibleModules = PUBLIC_MODULES.map(m => ({
      id: m.file,
      name: m.name,
      abbreviation: m.abbreviation || m.name.substring(0, 4).toUpperCase(),
      type: 'bible' as const,
      format: 'mybible' as any,
      category: 'mybible' as any,
      path: m.file,
      language: 'pt-BR'
    }));
const dictModules = PUBLIC_DICTIONARIES.map(m => ({
  id: m.file,
  name: m.name,
  abbreviation: m.name.substring(0, 4).toUpperCase(),
  type: 'dictionary' as const,
  format: (m.category || 'mybible') as any,
  category: 'mybible' as any,
  path: m.file,
  language: 'pt-BR'
}));
    return [...bibleModules, ...dictModules];
  }

  const BASE_PATH = 'Codex/modules/installed';
  const SUB_DIRS = ['mybible', 'mysword', 'sword', 'epub'];
  const allModules: BibleModule[] = [];

  for (const subDir of SUB_DIRS) {
    try {
      const path = `${BASE_PATH}/${subDir}`;
      const contents = await Filesystem.readdir({
        path,
        directory: Directory.Documents,
      });

      const modules: BibleModule[] = contents.files.map(file => ({
        id: file.name,
        name: file.name.replace(/\.[^/.]+$/, ""),
        abbreviation: file.name.replace(/\.[^/.]+$/, "").substring(0, 4).toUpperCase(),
        type: 'bible',
        format: subDir as any,
        category: subDir as any,
        path: `${path}/${file.name}`,
        language: 'pt-BR' 
      }));
      
      allModules.push(...modules);
    } catch (error: any) {
      // Ignora subpastas que não existem
    }
  }

  return allModules;
};
