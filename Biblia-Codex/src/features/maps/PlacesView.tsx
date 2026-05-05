import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BibleService } from '../BibleService';
import {
  MapPin, X, Globe, BookOpen, Search,
  Image, Navigation, ChevronLeft, ChevronRight
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ReaderTooltip } from '../bible/Reader';

function cn(...inputs: (string | boolean | undefined)[]) {
  return twMerge(clsx(inputs));
}

import { Verse, Book, CrossReference, PeopleData, PlacesData, Footnote } from '../types';

interface PlacesViewProps {
  bookId?: string;
  chapter?: number;
  verse?: number;
  places?: PlacesData[];
  onClose?: () => void;
}

function extractImagesFromComment(comment: string): string[] {
  const images: string[] = [];
  if (!comment) return images;
  
  const imgRegex = /<img\s+src=['"]([^'"]+)['"]/gi;
  let match;
  while ((match = imgRegex.exec(comment)) !== null) {
    if (match[1] && match[1].includes('openbible.info')) {
      images.push(match[1]);
    }
  }
  
  return images;
}

function extractModernName(comment: string): string {
  if (!comment) return '';
  const match = comment.match(/<modern\s+id="[^"]+">([^<]+)<\/modern>/);
  return match ? match[1] : '';
}

function cleanDescription(comment: string): string {
  if (!comment) return '';
  return comment
    .replace(/<[^>]+>/g, '')
    .replace(/\(modern\)/gi, '')
    .replace(/OpenBible\.info details.*$/gi, '')
    .replace(/Possible identification.*$/gi, '')
    .trim();
}

export function PlacesView({ bookId, chapter, verse, places: initialPlaces, onClose }: PlacesViewProps) {
  const [places, setPlaces] = useState<PlacesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState<PlacesData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (initialPlaces && initialPlaces.length > 0) {
      setPlaces(processPlaces(initialPlaces));
      setLoading(false);
      return;
    }

    if (bookId && chapter) {
      setLoading(true);
      BibleService.getPlacesData(bookId, chapter, verse || 1)
        .then(data => {
          setPlaces(processPlaces(data || []));
          setLoading(false);
        })
        .catch(err => {
          console.error('Error loading places:', err);
          setPlaces([]);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [bookId, chapter, verse, initialPlaces]);

  function processPlaces(data: unknown): PlacesData[] {
    if (!Array.isArray(data)) return [];
    return (data || []).map((p) => {
      const images = extractImagesFromComment(p.comment || '');
      return {
        id: p.id || 0,
        name: p.name || p.location || '',
        location: p.location || p.name || '',
        lat: p.lat || 0,
        lon: p.lon || 0,
        verses: p.verses || '',
        description: cleanDescription(p.comment || p.description || ''),
        images: images,
        modernName: extractModernName(p.comment || ''),
        type: ''
      };
    }).filter((p: PlacesData) => p.location);
  }

  const placeTypes = useMemo(() => {
    return ['all'];
  }, [places]);

  const filteredPlaces = useMemo(() => {
    let result = places;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(place =>
        place.location?.toLowerCase().includes(q) ||
        place.modernName?.toLowerCase().includes(q) ||
        place.description?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [places, searchQuery, filterType]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full relative overflow-hidden bg-[var(--bg-bible)]">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[var(--accent-bible)]/5 blur-3xl" />
        </div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <div className="w-16 h-16 rounded-2xl border border-[var(--border-bible)] flex items-center justify-center bg-[var(--surface-1)]">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
              <MapPin className="w-6 h-6 text-[var(--accent-bible)]" />
            </motion.div>
          </div>
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-4 text-sm font-medium text-[var(--text-bible-muted)]">
          Carregando lugares...
        </motion.p>
      </div>
    );
  }

  if (!places || places.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-[var(--bg-bible)]">
        <div className="inline-flex p-4 rounded-2xl mb-4" style={{ backgroundColor: 'var(--accent-bible)', opacity: 0.1 }}>
          <MapPin className="w-8 h-8" style={{ color: 'var(--accent-bible)' }} />
        </div>
        <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--text-bible)' }}>Nenhum lugar encontrado</h3>
        <p className="text-xs" style={{ color: 'var(--text-bible-muted)' }}>Não há lugares bíblicos para este versículo</p>
        {onClose && (
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClose} className="mt-4 px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--accent-bible)', color: 'white' }}>
            Voltar
          </motion.button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-bible-bg">
      {/* Header Compacto */}
      <div className="shrink-0 px-4 py-3 border-b border-bible-border/50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-bible-accent/10">
            <MapPin className="w-4 h-4 text-bible-accent" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-bible-text">Locais Bíblicos</h1>
            <p className="text-[10px] text-bible-text-muted">{filteredPlaces.length} encontrados</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-bible-surface-strong">
            <X className="w-4 h-4 text-bible-text-muted" />
          </button>
        )}
      </div>

      {/* Busca */}
      <div className="px-4 py-2">
        <input 
          type="text" 
          placeholder="Buscar..." 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
          className="w-full px-3 py-2 rounded-lg text-sm bg-bible-surface-strong/50 border border-bible-border/50 focus:border-bible-accent/50 outline-none" 
        />
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto p-3">
        {filteredPlaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MapPin className="w-10 h-10 text-bible-text-subtle mb-3" />
            <p className="text-sm font-medium text-bible-text">Nenhum local encontrado</p>
            <p className="text-xs text-bible-text-muted mt-1">Tente buscar otros critérios.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredPlaces.map((place, idx) => (
              <button 
                key={place.id || place.location || idx}
                onClick={() => { setSelectedPlace(place); setCurrentImageIndex(0); }} 
                className="w-full flex items-center gap-3 p-3 rounded-xl text-left bg-bible-surface-strong/30 border border-bible-border/30 hover:border-bible-accent/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-bible-accent/10 flex items-center justify-center shrink-0">
                  {place.images?.[0] ? (
                    <img src={place.images[0]} alt={place.location} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <MapPin className="w-5 h-5 text-bible-accent/40" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-bible-text truncate">{place.location}</h3>
                  {place.modernName && (
                    <p className="text-[10px] text-bible-text-muted truncate">{place.modernName}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
                        layout
                        initial={{ opacity: 0, scale: 0.9 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0, scale: 0.9 }} 
                        transition={{ delay: idx * 0.02 }} 
                        whileHover={{ y: -4, scale: 1.02 }} 
                        whileTap={{ scale: 0.98 }} 
                        onClick={() => { setSelectedPlace(place); setCurrentImageIndex(0); }} 
                        className="w-full flex items-stretch gap-4 p-4 rounded-2xl text-left transition-all border group bg-bible-bg border-bible-border/50 hover:border-bible-accent/30 shadow-sm"
                      >
                        <div className="w-24 h-24 rounded-xl shrink-0 overflow-hidden bg-bible-surface-strong/50 border border-bible-border/30 relative">
                          {hasImage ? (
                            <>
                              <img 
                                src={images[0]} 
                                alt={place.location} 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-bible-accent/5">
                              <MapPin className="w-8 h-8 text-bible-accent/30" />
                            </div>
                          )}
                          {images.length > 1 && (
                            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/50 backdrop-blur-md text-[9px] font-black text-white uppercase tracking-tighter">
                              +{images.length - 1} fotos
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 flex flex-col justify-center min-w-0 py-1">
                          <h3 className="text-base font-black text-bible-text tracking-tight group-hover:text-bible-accent transition-colors truncate">{place.location}</h3>
                          {place.modernName && (
                            <p className="text-[11px] font-bold mt-0.5 flex items-center gap-1.5 text-bible-text-muted truncate">
                              <MapPin className="w-3 h-3 text-bible-accent/60" /> 
                              {place.modernName}
                            </p>
                          )}
                          {place.verses && (
                            <div className="flex items-center gap-1.5 mt-2.5">
                              <div className="px-2 py-0.5 rounded-md bg-bible-accent/10 border border-bible-accent/20">
                                <span className="text-[10px] font-black uppercase tracking-widest text-bible-accent">
                                  {place.verses.split(',').length} Ref. Bíblicas
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="shrink-0 flex items-center pr-1">
                          <div className="w-8 h-8 rounded-full bg-bible-surface-strong flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-bible-border/50">
                            <ChevronRight className="w-4 h-4 text-bible-accent" />
                          </div>
                        </div>
                      </motion.button>
                    </ReaderTooltip>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedPlace && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setSelectedPlace(null)} />
            
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="absolute bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-hidden">
              <div className="rounded-t-[32px] overflow-hidden backdrop-blur-2xl bg-bible-bg/95 shadow-2xl border-t border-bible-border/50">
                <div className="flex justify-center py-4">
                  <div className="w-12 h-1.5 rounded-full bg-bible-border/50" />
                </div>
                
                <div className="overflow-y-auto px-6 pb-10" style={{ maxHeight: 'calc(90vh - 40px)' }}>
                  {(() => {
                    const images = selectedPlace.images || [];
                    const hasImages = images.length > 0;
                    
                    return (
                      <>
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="premium-kicker">Exploração Geográfica</span>
                            </div>
                            <h2 className="text-3xl font-black text-bible-text tracking-tight">{selectedPlace.location}</h2>
                            {selectedPlace.modernName && (
                              <p className="text-sm font-bold mt-1.5 flex items-center gap-1.5 text-bible-text-muted">
                                <MapPin className="w-3.5 h-3.5 text-bible-accent" /> 
                                Localização atual: <span className="text-bible-text">{selectedPlace.modernName}</span>
                              </p>
                            )}
                          </div>
                          <motion.button 
                            whileHover={{ scale: 1.1, rotate: 90 }} 
                            whileTap={{ scale: 0.9 }} 
                            onClick={() => setSelectedPlace(null)} 
                            className="premium-icon-button"
                          >
                            <X className="w-4 h-4" />
                          </motion.button>
                        </div>

                        {hasImages && (
                          <div className="relative mb-8 rounded-3xl overflow-hidden border border-bible-border/50 shadow-xl group/gallery">
                            <div className="aspect-video w-full flex items-center justify-center bg-bible-surface-strong/30">
                              <AnimatePresence mode="wait">
                                <motion.img 
                                  key={currentImageIndex}
                                  initial={{ opacity: 0, scale: 1.1 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.9 }}
                                  transition={{ duration: 0.4 }}
                                  src={images[currentImageIndex]} 
                                  alt={selectedPlace.location} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }} 
                                />
                              </AnimatePresence>
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                            </div>
                            
                            {images.length > 1 && (
                              <>
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                  {images.map((_, idx) => (
                                    <button 
                                      key={idx} 
                                      onClick={() => setCurrentImageIndex(idx)} 
                                      className={cn(
                                        "h-1.5 rounded-full transition-all duration-300",
                                        idx === currentImageIndex ? "w-8 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
                                      )} 
                                    />
                                  ))}
                                </div>
                                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover/gallery:opacity-100 transition-opacity duration-300">
                                  <button 
                                    onClick={() => setCurrentImageIndex(i => (i - 1 + images.length) % images.length)} 
                                    className="p-3 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 text-white hover:bg-black/60 transition-colors"
                                  >
                                    <ChevronLeft className="w-5 h-5" />
                                  </button>
                                  <button 
                                    onClick={() => setCurrentImageIndex(i => (i + 1) % images.length)} 
                                    className="p-3 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 text-white hover:bg-black/60 transition-colors"
                                  >
                                    <ChevronRight className="w-5 h-5" />
                                  </button>
                                </div>
                              </>
                            )}
                            
                            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-[10px] font-black text-white uppercase tracking-widest">
                              {currentImageIndex + 1} / {images.length} Fotos
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div className="lg:col-span-2 space-y-6">
                            {selectedPlace.description && (
                              <div className="premium-card p-6 border-bible-border/30 bg-bible-surface-strong/20">
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="p-2 rounded-xl bg-bible-accent/10">
                                    <Image className="w-4 h-4 text-bible-accent" />
                                  </div>
                                  <span className="text-xs font-black uppercase tracking-widest text-bible-text-muted">Narrativa Histórica</span>
                                </div>
                                <p className="text-base leading-relaxed text-bible-text">{selectedPlace.description}</p>
                              </div>
                            )}

                            {selectedPlace.verses && (
                              <div className="premium-card p-6 border-bible-border/30 bg-bible-surface-strong/20">
                                <div className="flex items-center gap-3 mb-5">
                                  <div className="p-2 rounded-xl bg-blue-500/10">
                                    <BookOpen className="w-4 h-4 text-blue-500" />
                                  </div>
                                  <span className="text-xs font-black uppercase tracking-widest text-bible-text-muted">Ocorrências Bíblicas</span>
                                </div>
                                <div className="flex flex-wrap gap-2.5">
                                  {selectedPlace.verses.split(',').map((verseStr: string, idx: number) => (
                                    <span 
                                      key={idx} 
                                      className="px-4 py-2.5 rounded-xl text-sm font-bold bg-bible-bg border border-bible-border/50 text-bible-text hover:border-bible-accent hover:text-bible-accent transition-all cursor-default shadow-sm"
                                    >
                                      {verseStr.trim()}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="space-y-6">
                            {selectedPlace.lat !== undefined && selectedPlace.lon !== undefined && selectedPlace.lat !== 0 && selectedPlace.lon !== 0 && (
                              <div className="premium-card p-6 border-bible-border/30 bg-bible-surface-strong/30">
                                <div className="flex items-center gap-2.5 mb-4">
                                  <div className="p-2 rounded-xl bg-orange-500/10">
                                    <Globe className="w-4 h-4 text-orange-500" />
                                  </div>
                                  <span className="text-[11px] font-black uppercase tracking-widest text-bible-text-muted">Coordenadas GPS</span>
                                </div>
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center py-2 border-b border-bible-border/30">
                                    <span className="text-xs text-bible-text-muted font-bold">Latitude</span>
                                    <span className="text-sm font-mono font-black text-bible-text">{selectedPlace.lat.toFixed(6)}°</span>
                                  </div>
                                  <div className="flex justify-between items-center py-2">
                                    <span className="text-xs text-bible-text-muted font-bold">Longitude</span>
                                    <span className="text-sm font-mono font-black text-bible-text">{selectedPlace.lon.toFixed(6)}°</span>
                                  </div>
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="w-full mt-4 flex items-center justify-center gap-2 p-3 rounded-xl bg-bible-accent text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-bible-accent/20"
                                  onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${selectedPlace.lat},${selectedPlace.lon}`, '_blank')}
                                >
                                  <Navigation className="w-3.5 h-3.5" />
                                  Abrir no Mapa
                                </motion.button>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}