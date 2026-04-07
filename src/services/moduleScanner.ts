import { Filesystem, Directory } from '@capacitor/filesystem';
import { BibleModule } from '../types';

const isWeb = typeof window !== 'undefined' && !(window as any).Capacitor?.isNativePlatform?.();

const PUBLIC_MODULES = [
  { file: 'ARA_s (Almeida Revista e Atualizada com Strong).bbl.mybible', name: 'ARA (Almeida Revista e Atualizada)' },
  { file: 'ARC 2009 SBB (Corrigida 2009).bbl.mybible', name: 'ARC 2009 (Almeida Revista e Corrigida)' },
];

const PUBLIC_DICTIONARIES = [
  { file: 'Strong AMG Bíblia Palavra-Chave.dct.mybible', name: 'Strong AMG (Bíblia Palavra-Chave)' },
  { file: 'Strong KJ Concordância.dct.mybible', name: 'Strong KJ (Concordância)' },
];

export const scanForBibleModules = async (): Promise<BibleModule[]> => {
  if (isWeb) {
    return PUBLIC_MODULES.map(m => ({
      id: m.file,
      name: m.name,
      abbreviation: m.name.substring(0, 4).toUpperCase(),
      type: 'bible' as const,
      format: 'mybible' as any,
      category: 'mybible' as any,
      path: m.file,
      language: 'pt-BR'
    }));
  }

  const BASE_PATH = 'Kerygma/modules/installed';
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
