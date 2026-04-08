import React, { useState, useEffect, useRef } from 'react';
import {
  Book, MessageCircle, Dictionary, Map,
  Trash2, Upload, Search, Check, AlertCircle,
  Files, Info, ChevronRight, Loader2, Plus,
  FileText, Database, Globe, Calendar, Folder,
  X, BookOpen, MessageSquare, Library, Layers, History, Tag
} from 'lucide-react';
import {
  listInstalledModules,
  deleteModule,
  importModule,
  ModuleInfo,
  ModuleCategory
} from '../services/moduleService';
import { useAppContext } from '../AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ensureStoragePermission, openAppSettings } from '../services/permissionsService';
import { Capacitor } from '@capacitor/core';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CATEGORY_NAMES: Record<string, string> = {
  bible: 'Bíblias',
  commentary: 'Comentários',
  dictionary: 'Dicionários',
  cross_reference: 'Referências Cruzadas',
  book: 'Livros',
  map: 'Mapas',
  devotional: 'Devocionais',
  plan: 'Planos de Leitura',
};

const CATEGORY_ICONS: Record<string, any> = {
  bible: BookOpen,
  commentary: MessageSquare,
  dictionary: Library,
  cross_reference: Layers,
  book: Book,
  map: Map,
  devotional: History,
  plan: Tag,
};

const CATEGORY_COLORS: Record<string, string> = {
  bible: '#3498DB',
  commentary: '#2ECC71',
  dictionary: '#9B59B6',
  cross_reference: '#E67E22',
  book: '#F06292',
  map: '#E74C3C',
  devotional: '#3F51B5',
  plan: '#FFC107',
};

const SUPPORTED_EXTENSIONS = ['.mybible', '.sqlite3', '.sqlite', '.mybl', '.mybls', '.twm', '.conf', '.dat', '.epub'];

export const ModuleManagement: React.FC = () => {
  const isAndroidNative = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
  const [activeTab, setActiveTab] = useState<'installed' | 'import'>('installed');
  const [modules, setModules] = useState<ModuleInfo[]>([]);
  const [selectedModule, setSelectedModule] = useState<ModuleInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(true);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadModules = async () => {
    setLoading(true);
    try {
      // Verifica permissões primeiro
      if (isAndroidNative) {
        const hasPermission = await ensureStoragePermission();
        setPermissionGranted(hasPermission);
        if (!hasPermission) {
          setShowPermissionDialog(true);
        }
      }

      const data = await listInstalledModules();
      setModules(data);
    } catch (err) {
      setError('Falha ao carregar módulos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModules();
  }, []);

  const handleRequestPermission = async () => {
    if (isAndroidNative) {
      const hasPermission = await ensureStoragePermission();
      setPermissionGranted(hasPermission);
      if (!hasPermission) {
        // Mostrar opção de abrir configurações
        const openConfig = window.confirm('Permissão negada. Deseja abrir as configurações para conceder?');
        if (openConfig) {
          await openAppSettings();
        }
      } else {
        setShowPermissionDialog(false);
        await loadModules();
      }
    }
  };

  const handleDelete = async (module: ModuleInfo) => {
    if (window.confirm('Tem certeza que deseja remover "' + module.name + '"?')) {
      try {
        await deleteModule(module.path);
        setModules(prev => prev.filter(m => m.path !== module.path));
      } catch (err) {
        alert('Erro ao remover módulo.');
      }
    }
  };

  const { refreshModules } = useAppContext();

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setError(null);

    const normalizedName = file.name.toLowerCase();
    const supportedFile = SUPPORTED_EXTENSIONS.some((ext) => normalizedName.endsWith(ext));

    if (!supportedFile) {
      setError('Formato não suportado. Use: .mybible, .sqlite3, .mybl, .twm, .conf, .dat ou .epub.');
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Verifica/solicita permissão antes de importar
    if (isAndroidNative) {
      const hasPermission = await ensureStoragePermission();
      if (!hasPermission) {
        setError('Permissão de armazenamento negada. Por favor, conceda nas configurações do app.');
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
    }

    try {
      const reader = new FileReader();

      const fileData = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          // Remove potential data-URL prefix AND any whitespace/newlines
          const base64 = result.split(',')[1].replace(/\s/g, '');
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      await importModule(fileData, file.name);
      await refreshModules();
      await loadModules(); // Isso força a atualização da lista local
      setActiveTab('installed');
      alert('Módulo importado com sucesso!'); // Feedback visual
    } catch (err) {
      console.error('Erro ao importar módulo:', err);
      setError(err instanceof Error ? err.message : 'Falha ao importar módulo. Verifique o formato.');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const formatTechnology = (format: string) => {
    const names: Record<string, string> = {
      mybible: 'MyBible (SQLite)',
      mysword: 'MySword',
      sword: 'SWORD Project',
      epub: 'EPUB'
    };
    return names[format] || format.toUpperCase();
  };

  const filteredModules = modules.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedModules = filteredModules.reduce((acc, mod) => {
    if (!acc[mod.category]) acc[mod.category] = [];
    acc[mod.category].push(mod);
    return acc;
  }, {} as Record<ModuleCategory, ModuleInfo[]>);

  const categories = (Object.keys(CATEGORY_NAMES) as ModuleCategory[]).filter(cat => groupedModules[cat]);

  return (
    <div className="flex min-h-[420px] h-[min(72dvh,680px)] flex-col text-bible-text">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1 sm:mb-6 sm:px-2">
        <div className="flex space-x-4 overflow-x-auto sm:space-x-6">
          {['installed', 'import'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={cn(
                "ui-text text-[10px] font-black tracking-[0.2em] uppercase transition-all pb-2 border-b-2",
                activeTab === tab ? "border-gold text-gold" : "border-transparent opacity-45 hover:opacity-100"
              )}
            >
              {tab === 'installed' ? 'Instalados' : 'Importar'}
            </button>
          ))}
        </div>

        {activeTab === 'installed' && (
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-30 group-focus-within:opacity-100 transition-opacity" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="premium-input w-32 rounded-full py-1.5 pl-9 pr-4 text-xs transition-[width] sm:w-40 focus:w-40 sm:focus:w-64"
            />
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'installed' ? (
          <motion.div
            key="installed"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex-1 overflow-y-auto premium-scroll pr-2 space-y-8"
          >
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-6 h-6 animate-spin text-gold opacity-50" />
              </div>
            ) : categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 opacity-20 space-y-4">
                <Folder className="w-12 h-12" />
                <p className="ui-text text-sm font-bold uppercase tracking-widest">Nenhum módulo encontrado</p>
              </div>
            ) : (
              categories.map(category => (
                <div key={category} className="space-y-4">
                  <div className="flex items-center justify-between opacity-40 px-2">
                    <div className="flex items-center space-x-2">
                      {React.createElement(CATEGORY_ICONS[category], { className: "w-3 h-3", style: { color: CATEGORY_COLORS[category] } })}
                      <span className="ui-text text-[9px] font-black uppercase tracking-[0.2em]">{CATEGORY_NAMES[category]}</span>
                    </div>
                    <span className="ui-text text-[10px] font-bold">{groupedModules[category].length}</span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {groupedModules[category].map(mod => (
                      <div
                        key={mod.path}
                        onClick={() => setSelectedModule(mod)}
                        className="premium-card rounded-2xl p-4 flex items-center justify-between group hover:border-bible-accent/20 transition-all cursor-pointer"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${CATEGORY_COLORS[category]}15` }}>
                            {React.createElement(CATEGORY_ICONS[category], { className: "w-5 h-5", style: { color: CATEGORY_COLORS[category] } })}
                          </div>
                          <div>
                            <h4 className="ui-text font-black text-sm tracking-tight">{mod.id}</h4>
                            <p className="ui-text text-[10px] opacity-40 line-clamp-1">{mod.name}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="ui-text text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/5 opacity-50">
                                {formatTechnology(mod.format)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(mod); }}
                            className="p-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Remover"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </motion.div>
        ) : (
          <motion.div
            key="import"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex-1 space-y-8"
          >
            <div className="premium-card relative overflow-hidden rounded-[2rem] p-5 space-y-6 sm:p-8">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Upload className="w-32 h-32" />
              </div>

              <div className="relative z-10 space-y-4">
                <h3 className="text-2xl font-display font-bold">Importação Inteligente</h3>
                <p className="ui-text text-sm opacity-50 max-w-md leading-relaxed">
                  O sistema detecta automaticamente o tipo de módulo (Bíblia, Dicionário, Comentário) baseado nos padrões de nomenclatura.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="space-y-1">
                    <span className="ui-text text-[9px] font-black uppercase tracking-widest text-gold">Formatos Suportados</span>
                    <ul className="ui-text text-[11px] opacity-40 space-y-1">
                      <li>• MyBible (.mybible, .sqlite3)</li>
                      <li>• MySword (.mybl, .twm, .mysword)</li>
                      <li>• SWORD (.conf, .dat)</li>
                      <li>• EPUB (.epub)</li>
                    </ul>
                  </div>
                  <div className="space-y-1">
                    <span className="ui-text text-[9px] font-black uppercase tracking-widest text-gold">Estrutura Local</span>
                    <ul className="ui-text text-[11px] opacity-40 space-y-1">
                      <li>• Kerygma/modules/installed/</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <div className="relative">
                  <button
                    type="button"
                    disabled={importing}
                    className={cn(
                      "w-full py-5 rounded-2xl flex items-center justify-center space-x-3 transition-all font-black ui-text text-xs tracking-[0.2em] uppercase",
                      importing ? "bg-white/10 text-white/30" : "bg-gold text-black shadow-xl shadow-gold/20 hover:scale-[1.02] active:scale-[0.98]"
                    )}
                  >
                    {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-5 h-5" />}
                    <span>{importing ? 'Importando...' : 'Selecionar Arquivo'}</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImport}
                    disabled={importing}
                    className={cn(
                      "absolute inset-0 h-full w-full cursor-pointer opacity-0",
                      importing && "pointer-events-none"
                    )}
                    accept={isAndroidNative ? '*/*' : '.mybible,.sqlite3,.sqlite,.mybl,.mybls,.twm,.conf,.dat,.epub'}
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center space-x-3 text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="ui-text text-xs font-bold">{error}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Diálogo de Permissão para Android 13+ */}
      <AnimatePresence>
        {showPermissionDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="premium-card w-full max-w-md rounded-3xl p-6 sm:p-8"
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-amber-500" />
                </div>
                <h2 className="text-xl font-bold text-bible-text">Permissão Necessária</h2>
              </div>

              <div className="space-y-4 text-sm text-bible-text/70 mb-6">
                <p>
                  <strong className="text-bible-text">Android 13+ requer permissão especial</strong> para acessar arquivos de módulos.
                </p>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 space-y-2">
                  <p className="ui-text text-xs">
                    Para importar módulos MySword/MyBible:
                  </p>
                  <ol className="ui-text text-xs space-y-1 list-decimal list-inside">
                    <li>Toque em "Conceder Permissão"</li>
                    <li>Selecione "Permitir acesso a arquivos"</li>
                    <li>Escolha a pasta desejada</li>
                    <li>Retorne ao app e importe os módulos</li>
                  </ol>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowPermissionDialog(false)}
                  className="py-3 bg-white/10 text-bible-text font-bold rounded-xl ui-text text-xs"
                >
                  Depois
                </button>
                <button
                  onClick={async () => {
                    await openAppSettings();
                  }}
                  className="py-3 bg-white/10 text-bible-text font-bold rounded-xl ui-text text-xs"
                >
                  Abrir Configurações
                </button>
                <button
                  onClick={handleRequestPermission}
                  className="py-3 bg-gold text-black font-bold rounded-xl ui-text text-xs"
                >
                  Conceder Permissão
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedModule && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setSelectedModule(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="premium-card w-full max-w-md rounded-3xl p-6 sm:p-8"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="mb-6 text-xl font-bold text-bible-text">{selectedModule.name}</h2>
              <div className="space-y-4 text-sm text-bible-text/70">
                <p><strong>Categoria:</strong> {CATEGORY_NAMES[selectedModule.category]}</p>
                <p><strong>Tecnologia:</strong> {formatTechnology(selectedModule.format)}</p>
                <p><strong>Arquivo:</strong> {selectedModule.path}</p>
                <p><strong>Tamanho:</strong> {(selectedModule.size ? (selectedModule.size / 1024 / 1024).toFixed(2) : '0') + ' MB'}</p>
              </div>
              <button
                onClick={() => setSelectedModule(null)}
                className="mt-8 w-full py-3 bg-gold text-black font-bold rounded-xl"
              >
                Fechar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
