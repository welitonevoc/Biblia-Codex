import React, { useState, useEffect, useMemo } from 'react';
import { Tag as TagIcon, Bookmark, ChevronRight, Hash, FolderOpen, Zap, Heart, Brain, Activity, LayoutDashboard, Link2, ArrowLeft, ArrowRight, RotateCcw, Trash2, Pencil, X, Check } from 'lucide-react';
import { storage } from '../StorageService';
import { Bookmark as BookmarkType, Tag } from '../types';
import { TagService, PALETTE } from '../services/TagService';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ViewType = 'lib' | 'chain' | 'mood' | 'dash';

export const TagsView: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('lib');
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // For Add Tag
  const [newTagName, setNewTagName] = useState('');
  const [tagMode, setTagMode] = useState<'auto' | 'manual'>('auto');
  const [selectedPaletteIdx, setSelectedPaletteIdx] = useState(0);
  const [currentAutoColor, setCurrentAutoColor] = useState(() => ({ dot: '#8b5cf6', bg: '#f3e8ff', tc: '#7c3aed' }));

  // For Chain View
  const [chainIndex, setChainIndex] = useState(0);

  // For Edit Modal
  const [editingBookmark, setEditingBookmark] = useState<BookmarkType | null>(null);
  const [editTags, setEditTags] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [bData, tData] = await Promise.all([
      storage.getBookmarks(),
      storage.getTags()
    ]);
    setBookmarks(bData);
    setTags(tData);
    setLoading(false);
  };

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;

    const colors = tagMode === 'auto' ? currentAutoColor : PALETTE[selectedPaletteIdx];
    await TagService.createTag(newTagName, colors);

    setNewTagName('');
    if (tagMode === 'auto') setCurrentAutoColor(TagService.generateColor());
    await fetchData();
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!window.confirm('Excluir esta etiqueta de todos os versículos?')) return;

    // Remove tag from all bookmarks that have it
    const affected = bookmarks.filter(b => b.tags?.includes(tagId));
    for (const bm of affected) {
      const updated = { ...bm, tags: bm.tags.filter(t => t !== tagId) };
      await storage.saveBookmark(updated);
    }

    // Delete the tag itself
    await storage.deleteTag(tagId);

    if (selectedTagId === tagId) setSelectedTagId(null);
    await fetchData();
  };

  const openEditModal = (bm: BookmarkType) => {
    setEditingBookmark(bm);
    setEditTags(bm.tags ? [...bm.tags] : []);
  };

  const toggleEditTag = (tagId: string) => {
    setEditTags(prev => prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]);
  };

  const handleSaveEditTags = async () => {
    if (!editingBookmark) return;
    const updated = { ...editingBookmark, tags: editTags };
    await storage.saveBookmark(updated);
    setEditingBookmark(null);
    setEditTags([]);
    await fetchData();
  };

  const filteredBookmarks = useMemo(() => {
    if (!selectedTagId) return bookmarks;
    return bookmarks.filter(b => b.tags?.includes(selectedTagId));
  }, [bookmarks, selectedTagId]);

  const activeTag = useMemo(() => tags.find(t => t.id === selectedTagId), [tags, selectedTagId]);

  // Moods configuration from HTML
  const MOODS = [
    { ic: '😔', n: 'Tristeza', g: ['paz', 'amor'], desc: 'Versículos de consolo e restauração' },
    { ic: '😰', n: 'Ansiedade', g: ['oracao', 'paz'], desc: 'Descanso e cuidado divino' },
    { ic: '🙏', n: 'Gratidão', g: ['graca', 'amor'], desc: 'Bênçãos e misericórdias' },
    { ic: '🔍', n: 'Dúvida', g: ['fe', 'sabedoria'], desc: 'Fundamentos da fé' },
    { ic: '⚖️', n: 'Decisão', g: ['sabedoria', 'oracao'], desc: 'Discernimento e direção' },
    { ic: '💪', n: 'Força', g: ['fe', 'graca'], desc: 'Vitória e promessas' },
  ];

  const renderSidebar = () => (
    <aside className="w-full border-b border-bible-accent/10 bg-bible-accent/5 flex flex-col lg:w-64 lg:border-b-0 lg:border-r">
      <div className="p-4 border-b border-bible-accent/10">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-bible-accent/50 mb-4">Etiquetas</h3>
        <div className="space-y-1 max-h-64 overflow-y-auto lg:max-h-none lg:overflow-y-auto">
          <button
            onClick={() => setSelectedTagId(null)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-sm",
              !selectedTagId ? "bg-bible-accent text-bible-bg shadow-sm" : "hover:bg-bible-accent/10 text-bible-accent"
            )}
          >
            <div className="flex items-center space-x-2">
              <Hash className="w-3.5 h-3.5 opacity-50" />
              <span>Todos</span>
            </div>
            <span className="text-[10px] opacity-50">{bookmarks.length}</span>
          </button>
          {tags.map(tag => (
            <div
              key={tag.id}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-sm group/item",
                selectedTagId === tag.id ? "bg-white shadow-sm" : "hover:bg-bible-accent/5"
              )}
              style={selectedTagId === tag.id ? { color: tag.color, borderLeft: `3px solid ${tag.color}` } : {}}
            >
              <button
                onClick={() => setSelectedTagId(tag.id)}
                className="flex items-center space-x-2 flex-1 min-w-0 text-left"
              >
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
                <span className="font-medium truncate">#{tag.name}</span>
              </button>
              <div className="flex items-center space-x-1 shrink-0">
                <span className="text-[10px] opacity-40">{bookmarks.filter(b => b.tags?.includes(tag.id)).length}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteTag(tag.id); }}
                  className="p-1 rounded opacity-0 group-hover/item:opacity-50 hover:!opacity-100 hover:bg-red-500/10 hover:text-red-500 transition-all"
                  title="Excluir etiqueta"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 mt-2 lg:mt-auto">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-bible-accent/50 mb-3">Nova Etiqueta</h3>
        <div className="bg-white/50 border border-dashed border-bible-accent/20 rounded-xl p-3 space-y-3">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="#Nome"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="flex-1 min-w-0 bg-white border border-bible-accent/10 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-bible-accent/40"
            />
            <button
              onClick={handleAddTag}
              className="bg-bible-accent text-bible-bg px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:opacity-90"
            >
              Criar
            </button>
          </div>

          <div className="flex bg-bible-accent/5 rounded-lg p-0.5">
            <button
              onClick={() => setTagMode('auto')}
              className={cn("flex-1 flex items-center justify-center space-x-1 py-1 rounded-md text-[9px] font-bold uppercase transition-all", tagMode === 'auto' ? "bg-white shadow-sm text-bible-accent" : "text-bible-accent/40")}
            >
              <Zap className="w-2.5 h-2.5" />
              <span>Auto</span>
            </button>
            <button
              onClick={() => setTagMode('manual')}
              className={cn("flex-1 flex items-center justify-center space-x-1 py-1 rounded-md text-[9px] font-bold uppercase transition-all", tagMode === 'manual' ? "bg-white shadow-sm text-bible-accent" : "text-bible-accent/40")}
            >
              <Activity className="w-2.5 h-2.5" />
              <span>Manual</span>
            </button>
          </div>

          {tagMode === 'auto' ? (
            <div
              className="rounded-lg p-2 flex items-center justify-between border border-bible-accent/10"
              style={{ backgroundColor: currentAutoColor.bg }}
            >
              <span className="text-[10px] font-bold" style={{ color: currentAutoColor.tc }}>
                #{newTagName || 'Preview'}
              </span>
              <button
                onClick={() => setCurrentAutoColor(TagService.generateColor())}
                className="p-1 hover:bg-black/5 rounded-full transition-colors"
                style={{ color: currentAutoColor.tc }}
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {PALETTE.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedPaletteIdx(i)}
                  className={cn("w-full aspect-square rounded-full border-2 transition-all", selectedPaletteIdx === i ? "border-bible-accent scale-110" : "border-transparent")}
                  style={{ backgroundColor: p.dot }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );

  const renderLib = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-baseline space-x-3">
        <h2 className="text-2xl font-display font-bold text-bible-accent sm:text-3xl">
          {activeTag ? `#${activeTag.name}` : 'Biblioteca de Temas'}
        </h2>
        <span className="text-xs font-medium opacity-40 uppercase tracking-widest">
          {filteredBookmarks.length} versículos
        </span>
      </div>

      <div className="grid gap-4">
        {filteredBookmarks.length === 0 ? (
          <div className="py-24 text-center opacity-20 flex flex-col items-center">
            <TagIcon className="w-16 h-16 mb-4" />
            <p className="font-display text-xl uppercase tracking-widest">Nenhum versículo marcado</p>
          </div>
        ) : (
          filteredBookmarks.map(b => (
            <motion.div
              key={b.id}
              layout
              className="bg-white border border-bible-accent/10 rounded-2xl p-5 hover:border-bible-accent/30 transition-all group cursor-pointer shadow-sm hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-bible-accent/60">
                    {b.bookId} {b.chapter}:{b.verse}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => openEditModal(b)}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-50 hover:!opacity-100 hover:bg-bible-accent/10 text-bible-accent transition-all"
                    title="Editar etiquetas"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <Bookmark className="w-3.5 h-3.5 text-bible-accent/20 group-hover:text-bible-accent transition-colors" />
                </div>
              </div>
              <p className="bible-text !p-0 text-base leading-relaxed italic opacity-80 mb-4">"{b.text}"</p>
              <div className="flex flex-wrap gap-2">
                {b.tags.map(tId => {
                  const t = tags.find(x => x.id === tId);
                  if (!t) return null;
                  return (
                    <span
                      key={tId}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                      style={{ backgroundColor: t.background, color: t.textColor }}
                    >
                      #{t.name}
                    </span>
                  );
                })}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );

  const renderChain = () => {
    const chainBookmarks = filteredBookmarks;
    const current = chainBookmarks[chainIndex];

    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-display font-bold text-bible-accent sm:text-3xl">Corrente Temática</h2>
          <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">
            {activeTag ? `#${activeTag.name}` : 'Geral'} · {chainBookmarks.length} versículos
          </p>
        </div>

        {chainBookmarks.length > 0 ? (
          <div className="bg-bible-accent/5 rounded-[2rem] p-5 border border-bible-accent/10 shadow-xl relative overflow-hidden group sm:p-8 md:p-10">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Link2 className="w-32 h-32" />
            </div>

            <div className="relative z-10 space-y-8">
              <div className="text-center">
                <span className="text-xs font-bold uppercase tracking-widest text-bible-accent/40 mb-4 block">
                  {current.bookId} {current.chapter}:{current.verse}
                </span>
                <h3 className="text-2xl font-display leading-relaxed text-bible-accent italic sm:text-3xl">
                  "{current.text}"
                </h3>
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                {current.tags.map(tId => {
                  const t = tags.find(x => x.id === tId);
                  if (!t) return null;
                  return (
                    <span
                      key={tId}
                      className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm"
                      style={{ backgroundColor: t.background, color: t.textColor }}
                    >
                      #{t.name}
                    </span>
                  );
                })}
              </div>

              <div className="pt-8 border-t border-bible-accent/10 flex items-center justify-between">
                <button
                  disabled={chainIndex === 0}
                  onClick={() => setChainIndex(i => i - 1)}
                  className="p-3 rounded-full bg-white border border-bible-accent/10 text-bible-accent disabled:opacity-30 hover:bg-bible-accent hover:text-white transition-all shadow-sm"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="flex space-x-2">
                  {chainBookmarks.map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        chainIndex === i ? "w-8 bg-bible-accent" : "w-1.5 bg-bible-accent/20"
                      )}
                    />
                  ))}
                </div>

                <button
                  disabled={chainIndex === chainBookmarks.length - 1}
                  onClick={() => setChainIndex(i => i + 1)}
                  className="p-3 rounded-full bg-white border border-bible-accent/10 text-bible-accent disabled:opacity-30 hover:bg-bible-accent hover:text-white transition-all shadow-sm"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <textarea
                placeholder="Anotação para esta conexão..."
                className="w-full bg-white/50 border border-bible-accent/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-bible-accent/30 resize-none h-24"
              />
            </div>
          </div>
        ) : (
          <div className="py-24 text-center opacity-20">
            <Link2 className="w-16 h-16 mx-auto mb-4" />
            <p className="font-display text-xl uppercase tracking-widest">Nenhuma corrente ativa</p>
          </div>
        )}
      </div>
    );
  };

  const renderMood = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2 max-w-lg mx-auto">
        <h2 className="text-2xl font-display font-bold text-bible-accent sm:text-3xl">Como você está?</h2>
        <p className="text-sm opacity-60">Escolha um momento e encontraremos versículos para você agora.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4">
        {MOODS.map((m, i) => (
          <button
            key={i}
            className="bg-white border border-bible-accent/10 rounded-2xl p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all group"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{m.ic}</div>
            <div className="text-sm font-bold text-bible-accent uppercase tracking-wider mb-1">{m.n}</div>
            <div className="text-[10px] opacity-40 leading-tight">{m.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderDash = () => {
    const sortedTags = [...tags]
      .map(t => ({ ...t, count: bookmarks.filter(b => b.tags?.includes(t.id)).length }))
      .sort((a, b) => b.count - a.count);

    const maxCount = Math.max(...sortedTags.map(t => t.count), 1);

    return (
      <div className="space-y-8 animate-in zoom-in-95 duration-500">
        <h2 className="text-2xl font-display font-bold text-bible-accent sm:text-3xl">Painel de Estudo</h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <div className="bg-bible-accent/5 rounded-2xl p-6 border border-bible-accent/10">
            <div className="text-4xl font-display font-bold text-bible-accent">{bookmarks.length}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-1">Versículos marcados</div>
          </div>
          <div className="bg-bible-accent/5 rounded-2xl p-6 border border-bible-accent/10">
            <div className="text-4xl font-display font-bold text-bible-accent">{tags.length}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-1">Etiquetas ativas</div>
          </div>
          <div className="bg-bible-accent/5 rounded-2xl p-6 border border-bible-accent/10">
            <div className="text-4xl font-display font-bold text-bible-accent">0</div>
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-1">Correntes criadas</div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-40">Temas mais estudados</h3>
          <div className="space-y-3">
            {sortedTags.slice(0, 5).map(tag => (
              <div key={tag.id} className="flex items-center space-x-4">
                <div className="w-24 text-[11px] font-bold text-bible-accent truncate">#{tag.name}</div>
                <div className="flex-1 h-2 bg-bible-accent/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(tag.count / maxCount) * 100}%` }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                </div>
                <div className="w-8 text-[10px] font-bold opacity-30 text-right">{tag.count}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-bible-accent rounded-[2rem] p-8 text-bible-bg relative overflow-hidden">
          <Sparkles className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12" />
          <div className="relative z-10 space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Sugestão Inteligente</span>
            <p className="text-lg font-display italic leading-relaxed max-w-md">
              "Você tem focado muito em temas de #Graça ultimamente. Que tal explorar versículos sobre #Justiça para complementar seu estudo?"
            </p>
            <button className="bg-bible-bg text-bible-accent px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-lg">
              Ver Recomendados
            </button>
          </div>
        </div>
      </div>
    );
  };

  const Sparkles = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" /><path d="M3 5h4" /><path d="M21 17v4" /><path d="M19 19h4" />
    </svg>
  );

  return (
    <div className="flex flex-col h-full bg-bible-bg overflow-hidden">
      {/* Header Tabs */}
      <div className="px-3 py-3 border-b border-bible-accent/10 flex flex-wrap items-center justify-between gap-2 sm:px-6 sm:py-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-bible-accent/5 rounded-xl">
            <TagIcon className="w-5 h-5 text-bible-accent" />
          </div>
          <h1 className="text-lg font-display font-bold text-bible-accent tracking-tight sm:text-xl">Etiquetas</h1>
        </div>

        <div className="flex bg-bible-accent/5 p-1 rounded-2xl overflow-x-auto max-w-full">
          {(['lib', 'chain', 'mood', 'dash'] as ViewType[]).map(v => (
            <button
              key={v}
              onClick={() => setActiveView(v)}
              className={cn(
                "px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wide transition-all sm:px-5 sm:text-xs sm:tracking-widest",
                activeView === v ? "bg-white text-bible-accent shadow-sm" : "text-bible-accent/40 hover:text-bible-accent/60"
              )}
            >
              {v === 'lib' ? 'Biblioteca' : v === 'chain' ? 'Corrente' : v === 'mood' ? 'Momento' : 'Painel'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden lg:flex-row">
        {renderSidebar()}

        <main className="flex-1 overflow-y-auto p-4 bg-white/30 backdrop-blur-sm sm:p-8">
          <AnimatePresence mode="wait">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-20">
                <div className="w-10 h-10 border-2 border-bible-accent border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-bold uppercase tracking-widest">Sincronizando Etiquetas...</p>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto h-full">
                {activeView === 'lib' && renderLib()}
                {activeView === 'chain' && renderChain()}
                {activeView === 'mood' && renderMood()}
                {activeView === 'dash' && renderDash()}
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Edit Tags Modal */}
      <AnimatePresence>
        {editingBookmark && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => { setEditingBookmark(null); setEditTags([]); }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-bible-bg border border-bible-accent/20 rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-bible-accent/10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-display font-bold text-bible-accent">Editar Etiquetas</h3>
                  <button
                    onClick={() => { setEditingBookmark(null); setEditTags([]); }}
                    className="p-1.5 rounded-lg hover:bg-bible-accent/10 text-bible-accent/40 hover:text-bible-accent transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-bible-accent/40">
                  {editingBookmark.bookId} {editingBookmark.chapter}:{editingBookmark.verse}
                </p>
                <p className="text-sm italic opacity-60 mt-1 line-clamp-2">"{editingBookmark.text}"</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {tags.length === 0 ? (
                  <p className="text-center text-sm opacity-30 py-8">Nenhuma etiqueta criada</p>
                ) : (
                  tags.map(tag => {
                    const isActive = editTags.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => toggleEditTag(tag.id)}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-sm",
                          isActive
                            ? "border-2 shadow-sm"
                            : "border border-bible-accent/10 hover:border-bible-accent/20"
                        )}
                        style={isActive ? { borderColor: tag.color, backgroundColor: tag.background } : {}}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={cn("w-3 h-3 rounded-full transition-all", isActive && "ring-2 ring-offset-1")}
                            style={{ backgroundColor: tag.color }}
                          />
                          <span className="font-medium" style={isActive ? { color: tag.textColor } : {}}>
                            #{tag.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] opacity-30">
                            {bookmarks.filter(b => b.tags?.includes(tag.id)).length}
                          </span>
                          {isActive && (
                            <Check className="w-4 h-4" style={{ color: tag.color }} />
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              <div className="p-4 border-t border-bible-accent/10 flex space-x-3">
                <button
                  onClick={() => { setEditingBookmark(null); setEditTags([]); }}
                  className="flex-1 py-3 rounded-xl border border-bible-accent/20 text-bible-accent/60 text-xs font-bold uppercase tracking-widest hover:bg-bible-accent/5 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEditTags}
                  className="flex-1 py-3 rounded-xl bg-bible-accent text-bible-bg text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lg"
                >
                  Salvar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
