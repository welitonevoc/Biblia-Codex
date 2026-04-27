/**
 * ModuleManagement - Premium Visual Design
 * Gerenciamento de Módulos com visual alinhado ao Home
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Book, Map,
  Trash2, Upload, Search, Check, AlertCircle,
  Info, ChevronRight, Loader2, Plus,
  FileText, Database, Globe, Calendar, Folder,
  X, BookOpen, MessageSquare, Library, Layers, History, Tag, Sparkles, ArrowRight
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
          const base64 = result.split(',')[1].replace(/\s/g, '');
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      await importModule(fileData, file.name);
      await refreshModules();
      await loadModules();
      setActiveTab('installed');
      alert('Módulo importado com sucesso!');
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

  // Contagem total por categoria
  const totalModules = modules.length;
  const categoriesCount = new Set(modules.map(m => m.category)).size;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 py-6 pb-28 space-y-6">
        {/* Header Premium */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card p-5"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-bible-accent" />
                <span className="premium-kicker">Gerenciamento</span>
              </div>
              <h1 className="premium-title mt-2 mb-1">Módulos</h1>
              <p className="premium-subtitle text-sm">
                Gerencie Bíblias, comentários, dicionários e mais
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center px-4 py-2 rounded-xl bg-bible-accent/10">
                <Folder className="w-5 h-5 text-bible-accent mx-auto mb-1" />
                <div className="text-lg font-bold text-bible-accent">{totalModules}</div>
                <div className="text-[10px] font-medium text-bible-accent/70 uppercase tracking-wider">módulos</div>
              </div>
              <div className="text-center px-4 py-2 rounded-xl bg-blue-500/10">
                <Layers className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <div className="text-lg font-bold text-blue-500">{categoriesCount}</div>
                <div className="text-[10px] font-medium text-blue-500/70 uppercase tracking-wider">tipos</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs Premium */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 p-1 premium-card"
        >
          {[
            { id: 'installed' as const, label: 'Instalados', icon: Folder },
            { id: 'import' as const, label: 'Importar', icon: Upload },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all',
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-bible-accent to-bible-accent-strong text-white shadow-md'
                  : 'text-bible-text-muted hover:text-bible-text'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'installed' ? (
            <motion.div
              key="installed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-bible-text-muted" />
                <input
                  type="text"
                  placeholder="Buscar módulos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="premium-input pl-9 py-2.5 text-sm"
                />
              </div>

              {/* Loading */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative"
                  >
                    <div className="w-12 h-12 border-4 border-bible-accent/20 border-t-bible-accent rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Database className="w-5 h-5 text-bible-accent animate-pulse" />
                    </div>
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm text-bible-text-muted mt-4 font-medium"
                  >
                    Carregando módulos...
                  </motion.p>
                </div>
              ) : categories.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="premium-card-soft p-12 text-center"
                >
                  <div className="inline-flex p-4 rounded-2xl bg-bible-accent/10 mb-4">
                    <Folder className="w-8 h-8 text-bible-accent" />
                  </div>
                  <h3 className="text-lg font-bold text-bible-text mb-2">
                    {searchQuery ? 'Nenhum módulo encontrado' : 'Nenhum módulo instalado'}
                  </h3>
                  <p className="text-sm text-bible-text-muted mb-4">
                    {searchQuery ? 'Tente outra busca' : 'Importe módulos para começar'}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('import')}
                    className="premium-button px-6 py-3 inline-flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Importar módulos
                  </motion.button>
                </motion.div>
              ) : (
                /* Categories */
                <div className="space-y-6">
                  {categories.map((category, catIdx) => {
                    const IconComponent = CATEGORY_ICONS[category];
                    const categoryColor = CATEGORY_COLORS[category];
                    return (
                      <motion.div
                        key={category}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + catIdx * 0.1 }}
                      >
                        {/* Category Header */}
                        <div className="flex items-center gap-2 mb-3">
                          <div
                            className="p-1.5 rounded-lg"
                            style={{ backgroundColor: `${categoryColor}20` }}
                          >
                            <IconComponent className="w-4 h-4" style={{ color: categoryColor }} />
                          </div>
                          <h3 className="text-sm font-bold text-bible-text">{CATEGORY_NAMES[category]}</h3>
                          <span className="text-xs text-bible-text-muted">({groupedModules[category].length})</span>
                        </div>

                        {/* Modules Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {groupedModules[category].map((mod, modIdx) => (
                            <motion.div
                              key={mod.path}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.4 + catIdx * 0.1 + modIdx * 0.05 }}
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setSelectedModule(mod)}
                              className="premium-card p-4 cursor-pointer group"
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                                  style={{ backgroundColor: `${categoryColor}15` }}
                                >
                                  <IconComponent className="w-6 h-6" style={{ color: categoryColor }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-bold text-bible-text mb-0.5 truncate">
                                    {mod.name}
                                  </h4>
                                  <p className="text-xs text-bible-text-muted mb-2 truncate">
                                    {mod.id}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className="px-2 py-0.5 rounded-full text-[9px] font-bold"
                                      style={{
                                        backgroundColor: `${categoryColor}15`,
                                        color: categoryColor,
                                      }}
                                    >
                                      {formatTechnology(mod.format)}
                                    </span>
                                    <span className="text-[9px] text-bible-text-muted">
                                      {mod.size ? `${(mod.size / 1024 / 1024).toFixed(1)} MB` : ''}
                                    </span>
                                  </div>
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => { e.stopPropagation(); handleDelete(mod); }}
                                  className="premium-icon-button text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </motion.button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="import"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* Import Info Card */}
              <div className="premium-card p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-bible-accent/10">
                    <Upload className="w-6 h-6 text-bible-accent" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-bible-text mb-1">Importação Inteligente</h2>
                    <p className="text-sm text-bible-text-muted">
                      O sistema detecta automaticamente o tipo de módulo baseado nos padrões de nomenclatura.
                    </p>
                  </div>
                </div>

                {/* Supported Formats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 rounded-xl bg-bible-surface">
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-bible-text-muted mb-2">Formatos Suportados</h3>
                    <ul className="space-y-1.5">
                      {[
                        'MyBible (.mybible, .sqlite3)',
                        'MySword (.mybl, .twm, .mysword)',
                        'SWORD (.conf, .dat)',
                        'EPUB (.epub)'
                      ].map((fmt, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-bible-text">
                          <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                          {fmt}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-bible-text-muted mb-2">Local de Armazenamento</h3>
                    <div className="flex items-center gap-2 text-xs text-bible-text font-mono">
                      <Folder className="w-3.5 h-3.5 text-bible-accent" />
                      Codex/modules/installed/
                    </div>
                  </div>
                </div>

                {/* Upload Button */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: importing ? 1 : 1.02 }}
                    whileTap={{ scale: importing ? 1 : 0.98 }}
                    disabled={importing}
                    className={cn(
                      "w-full py-5 rounded-xl flex items-center justify-center gap-3 text-sm font-bold transition-all",
                      importing
                        ? "bg-bible-surface text-bible-text-muted cursor-not-allowed"
                        : "bg-gradient-to-r from-bible-accent to-bible-accent-strong text-white shadow-lg"
                    )}
                  >
                    {importing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Importando...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        <span>Selecionar Arquivo</span>
                      </>
                    )}
                  </motion.button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImport}
                    disabled={importing}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    accept={isAndroidNative ? '*/*' : '.mybible,.sqlite3,.sqlite,.mybl,.mybls,.twm,.conf,.dat,.epub'}
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-red-500 font-medium">{error}</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Permission Dialog Premium */}
      <AnimatePresence>
        {showPermissionDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="glass-panel w-full max-w-md p-6"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-amber-500/10">
                  <AlertCircle className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-bible-text">Permissão Necessária</h2>
                  <p className="text-xs text-bible-text-muted">Android 13+ requer permissão especial</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <p className="text-sm text-bible-text">
                  Para importar módulos MySword/MyBible, conceda acesso aos arquivos.
                </p>
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <ol className="space-y-2 text-xs text-bible-text">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 text-amber-600 font-bold">1</span>
                      Toque em "Conceder Permissão"
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 text-amber-600 font-bold">2</span>
                      Selecione "Permitir acesso a arquivos"
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 text-amber-600 font-bold">3</span>
                      Escolha a pasta desejada
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 text-amber-600 font-bold">4</span>
                      Retorne ao app e importe os módulos
                    </li>
                  </ol>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowPermissionDialog(false)}
                  className="premium-button-secondary py-3"
                >
                  Depois
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={async () => await openAppSettings()}
                  className="premium-button-secondary py-3"
                >
                  Configurações
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRequestPermission}
                  className="premium-button py-3 col-span-2"
                >
                  Conceder Permissão
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Module Detail Modal Premium */}
      <AnimatePresence>
        {selectedModule && (() => {
          const IconComponent = CATEGORY_ICONS[selectedModule.category];
          const categoryColor = CATEGORY_COLORS[selectedModule.category];
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[300] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setSelectedModule(null)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 20, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="glass-panel w-full max-w-md p-6"
                onClick={e => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-xl"
                      style={{ backgroundColor: `${categoryColor}20` }}
                    >
                      <IconComponent className="w-6 h-6" style={{ color: categoryColor }} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-bible-text">{selectedModule.name}</h2>
                      <p className="text-xs text-bible-text-muted">{selectedModule.id}</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedModule(null)}
                    className="premium-icon-button"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Details Grid */}
                <div className="space-y-3 mb-6">
                  {[
                    { label: 'Categoria', value: CATEGORY_NAMES[selectedModule.category], icon: Tag },
                    { label: 'Tecnologia', value: formatTechnology(selectedModule.format), icon: Database },
                    { label: 'Tamanho', value: selectedModule.size ? `${(selectedModule.size / 1024 / 1024).toFixed(2)} MB` : 'N/A', icon: Info },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-bible-surface">
                      <item.icon className="w-4 h-4 text-bible-accent" />
                      <div className="flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-bible-text-muted">{item.label}</p>
                        <p className="text-sm font-semibold text-bible-text">{item.value}</p>
                      </div>
                    </div>
                  ))}
                  <div className="p-3 rounded-xl bg-bible-surface">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-bible-text-muted mb-1">Arquivo</p>
                    <p className="text-xs font-mono text-bible-text truncate">{selectedModule.path}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      handleDelete(selectedModule);
                      setSelectedModule(null);
                    }}
                    className="premium-button-secondary py-3 flex-1 flex items-center justify-center gap-2 text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remover
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedModule(null)}
                    className="premium-button py-3 flex-1"
                  >
                    Fechar
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
};
