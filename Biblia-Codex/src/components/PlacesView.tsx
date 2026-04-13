import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BibleService } from '../BibleService';
import {
  MapPin, X, Globe, BookOpen, ChevronRight, Search,
  Image, Navigation, ArrowLeft, ArrowRight
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | boolean | undefined)[]) {
  return twMerge(clsx(inputs));
}

interface Place {
  id: number;
  location: string;
  lat: number;
  lon: number;
  verses: string;
  description: string;
  images: string[];
  modernName: string;
  type: string;
}

interface PlacesViewProps {
  bookId?: string;
  chapter?: number;
  verse?: number;
  places?: Place[];
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
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
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

  function processPlaces(data: any[]): Place[] {
    return (data || []).map((p: any) => {
      const images = extractImagesFromComment(p.comment || '');
      return {
        id: p.id || 0,
        location: p.location || p.name || '',
        lat: p.lat || 0,
        lon: p.lon || 0,
        verses: p.verses || '',
        description: cleanDescription(p.comment || p.description || ''),
        images: images,
        modernName: extractModernName(p.comment || ''),
        type: ''
      };
    }).filter((p: Place) => p.location);
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
    <div className="flex flex-col h-full relative" style={{ backgroundColor: 'var(--bg-bible)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: 'var(--accent-bible)', opacity: 0.05 }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: '#8b5cf6', opacity: 0.05 }} />
      </div>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="shrink-0 relative px-4 py-4 z-10">
        <div className="absolute inset-0 border-b" style={{ borderColor: 'var(--border-bible)' }} />
        
        <div className="relative">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4" style={{ color: 'var(--accent-bible)' }} />
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--accent-bible)' }}>Geografia</span>
              </div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--text-bible)', fontFamily: 'var(--font-display)' }}>Lugares Bíblicos</h1>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-bible)' }}>
                  <MapPin className="w-3 h-3" style={{ color: 'var(--text-bible-muted)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-bible-muted)' }}>{filteredPlaces.length} lugares</span>
                </div>
              </div>
            </div>
            {onClose && (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClose} className="p-2 rounded-lg transition-colors" style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-bible)' }}>
                <X className="w-4 h-4" style={{ color: 'var(--text-bible-muted)' }} />
              </motion.button>
            )}
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-bible-subtle)' }} />
            <input type="text" placeholder="Buscar lugar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm" style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-bible)', color: 'var(--text-bible)' }} />
          </div>
        </div>
      </motion.div>

      <div className="flex-1 overflow-hidden relative">
        <div className="h-full overflow-y-auto p-4">
          {filteredPlaces.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--text-bible-subtle)' }} />
              <p className="text-sm" style={{ color: 'var(--text-bible-muted)' }}>Nenhum lugar encontrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredPlaces.map((place, idx) => {
                  const hasImage = place.images.length > 0;
                  
                  return (
                    <motion.button key={place.id || place.location || idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: idx * 0.03 }} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => { setSelectedPlace(place); setCurrentImageIndex(0); }} className="w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all border" style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border-bible)' }}>
                      {hasImage ? (
                        <div className="w-20 h-20 rounded-lg shrink-0 overflow-hidden" style={{ backgroundColor: 'var(--surface-2)' }}>
                          <img 
                            src={place.images[0]} 
                            alt={place.location} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }} 
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-lg shrink-0 flex items-center justify-center" style={{ backgroundColor: 'var(--accent-bible)', opacity: 0.1 }}>
                          <MapPin className="w-8 h-8" style={{ color: 'var(--accent-bible)' }} />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-bible)' }}>{place.location}</h3>
                        {place.modernName && <p className="text-xs mt-0.5" style={{ color: 'var(--text-bible-muted)' }}>📍 {place.modernName}</p>}
                        {place.verses && (
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <BookOpen className="w-3 h-3" style={{ color: 'var(--accent-bible)' }} />
                            <span className="text-xs" style={{ color: 'var(--accent-bible)' }}>{place.verses.split(',').length} ref(s)</span>
                          </div>
                        )}
                      </div>
                      
                      <ChevronRight className="w-5 h-5 shrink-0 mt-1" style={{ color: 'var(--text-bible-subtle)' }} />
                    </motion.button>
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
            
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="absolute bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-hidden">
              <div className="rounded-t-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-bible)', borderTop: '1px solid var(--border-bible)' }}>
                <div className="flex justify-center py-3">
                  <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--border-bible-strong)' }} />
                </div>
                
                <div className="overflow-y-auto px-5 pb-6" style={{ maxHeight: 'calc(85vh - 40px)' }}>
                  {(() => {
                    const images = selectedPlace.images;
                    const hasImages = images.length > 0;
                    
                    return (
                      <>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h2 className="text-xl font-bold" style={{ color: 'var(--text-bible)', fontFamily: 'var(--font-display)' }}>{selectedPlace.location}</h2>
                            {selectedPlace.modernName && <p className="text-sm mt-1" style={{ color: 'var(--text-bible-muted)' }}>📍 {selectedPlace.modernName}</p>}
                          </div>
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setSelectedPlace(null)} className="p-2 rounded-lg border" style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border-bible)' }}>
                            <X className="w-4 h-4" style={{ color: 'var(--text-bible-muted)' }} />
                          </motion.button>
                        </div>

                        {hasImages && (
                          <div className="relative mb-4 rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--surface-2)' }}>
                            <div className="aspect-video w-full flex items-center justify-center">
                              <img 
                                src={images[currentImageIndex]} 
                                alt={selectedPlace.location} 
                                className="max-w-full max-h-full object-contain"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = '<div class="flex items-center justify-center w-full h-full" style="background:var(--surface-2)"><svg class="w-12 h-12" style="color:var(--text-bible-subtle)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg></div>';
                                  }
                                }} 
                              />
                            </div>
                            {images.length > 1 && (
                              <>
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                  {images.map((_, idx) => (
                                    <button key={idx} onClick={() => setCurrentImageIndex(idx)} className="w-2 h-2 rounded-full transition-all" style={{ backgroundColor: idx === currentImageIndex ? 'white' : 'rgba(255,255,255,0.5)' }} />
                                  ))}
                                </div>
                                {currentImageIndex > 0 && (
                                  <button onClick={() => setCurrentImageIndex(i => i - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50" style={{ backdropFilter: 'blur(4px)' }}>
                                    <ArrowLeft className="w-4 h-4 text-white" />
                                  </button>
                                )}
                                {currentImageIndex < images.length - 1 && (
                                  <button onClick={() => setCurrentImageIndex(i => i + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50" style={{ backdropFilter: 'blur(4px)' }}>
                                    <ArrowRight className="w-4 h-4 text-white" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        )}

                        {selectedPlace.description && (
                          <div className="p-4 rounded-xl border mb-4" style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border-bible)' }}>
                            <div className="flex items-center gap-2 mb-2">
                              <Image className="w-4 h-4" style={{ color: 'var(--accent-bible)' }} />
                              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-bible-muted)' }}>Descrição</span>
                            </div>
                            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-bible)' }}>{selectedPlace.description}</p>
                          </div>
                        )}

                        {selectedPlace.lat !== 0 && selectedPlace.lon !== 0 && (
                          <div className="p-3 rounded-xl border mb-4" style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border-bible)' }}>
                            <div className="flex items-center gap-2 mb-1">
                              <Globe className="w-3.5 h-3.5" style={{ color: 'var(--text-bible-muted)' }} />
                              <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-bible-muted)' }}>Coordenadas</span>
                            </div>
                            <p className="text-sm font-mono" style={{ color: 'var(--text-bible)' }}>{selectedPlace.lat.toFixed(4)}°, {selectedPlace.lon.toFixed(4)}°</p>
                          </div>
                        )}

                        {selectedPlace.verses && (
                          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border-bible)' }}>
                            <div className="flex items-center gap-2 mb-3">
                              <BookOpen className="w-4 h-4" style={{ color: 'var(--accent-bible)' }} />
                              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-bible-muted)' }}>Referências Bíblicas</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {selectedPlace.verses.split(',').map((verse, idx) => (
                                <span key={idx} className="px-3 py-2 rounded-lg text-sm font-medium border" style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border-bible)', color: 'var(--text-bible)' }}>{verse.trim()}</span>
                              ))}
                            </div>
                          </div>
                        )}
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