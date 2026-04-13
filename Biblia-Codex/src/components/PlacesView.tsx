import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BibleService } from '../BibleService';
import {
  Users, MapPin, List, X, Calendar, Globe,
  BookOpen, ChevronRight, Search, Minus, Plus,
  Maximize2, Heart, Star, GitBranch, Image, Navigation
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | boolean | undefined)[]) {
  return twMerge(clsx(inputs));
}

interface Place {
  id?: number;
  location?: string;
  name?: string;
  book?: number;
  chapter?: number;
  verse?: number;
  verses?: string;
  description?: string;
  comment?: string;
  image?: string;
  modernName?: string;
  lat?: number;
  lon?: number;
  type?: string;
  region?: string;
  coordinates?: { lat: number; lng: number };
}

interface PlacesViewProps {
  bookId?: string;
  chapter?: number;
  verse?: number;
  places?: Place[];
  onClose?: () => void;
}

export function PlacesView({ bookId, chapter, verse, places: initialPlaces, onClose }: PlacesViewProps) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    if (initialPlaces && initialPlaces.length > 0) {
      setPlaces(initialPlaces);
      setLoading(false);
      return;
    }

    if (bookId && chapter) {
      setLoading(true);
      BibleService.getPlacesData(bookId, chapter, verse || 1)
        .then(data => {
          const normalizedPlaces = (data || []).map((p: any) => ({
            id: p.id || 0,
            location: p.location || p.name || '',
            name: p.name || p.location || p.place_name || '',
            book: p.book,
            chapter: p.chapter,
            verse: p.verse,
            description: p.comment || p.description || p.locinfo || '',
            comment: p.comment || '',
            lat: p.lat,
            lon: p.lon,
            modernName: p.modernName || '',
            verses: p.verses || '',
            type: p.type || '',
            region: p.region || '',
          })).filter((p: Place) => p.name || p.location);

          setPlaces(normalizedPlaces);
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

  const placeTypes = useMemo(() => {
    const types = new Set<string>();
    places.forEach(p => {
      if (p.type) types.add(p.type);
      else if (p.region) types.add(p.region);
    });
    return ['all', ...Array.from(types)];
  }, [places]);

  const filteredPlaces = useMemo(() => {
    let result = places;
    
    if (searchQuery) {
      result = result.filter(place =>
        place.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.modernName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      result = result.filter(place => 
        place.type === filterType || place.region === filterType
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
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <MapPin className="w-6 h-6 text-[var(--accent-bible)]" />
            </motion.div>
          </div>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-sm font-medium text-[var(--text-bible-muted)]"
        >
          Carregando lugares...
        </motion.p>
      </div>
    );
  }

  if (!places || places.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-[var(--bg-bible)]">
        <div 
          className="inline-flex p-4 rounded-2xl mb-4"
          style={{ backgroundColor: 'var(--accent-bible)', opacity: 0.1 }}
        >
          <MapPin className="w-8 h-8" style={{ color: 'var(--accent-bible)' }} />
        </div>
        <h3 
          className="text-sm font-bold mb-1"
          style={{ color: 'var(--text-bible)' }}
        >
          Nenhum lugar encontrado
        </h3>
        <p 
          className="text-xs"
          style={{ color: 'var(--text-bible-muted)' }}
        >
          Não há lugares bíblicos para este versículo
        </p>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col h-full relative"
      style={{ backgroundColor: 'var(--bg-bible)' }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl"
          style={{ backgroundColor: 'var(--accent-bible)', opacity: 0.05 }}
        />
        <div 
          className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl"
          style={{ backgroundColor: '#8b5cf6', opacity: 0.05 }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="shrink-0 relative px-4 py-4 z-10"
      >
        <div 
          className="absolute inset-0 border-b"
          style={{ borderColor: 'var(--border-bible)' }}
        />
        
        <div className="relative">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4" style={{ color: 'var(--accent-bible)' }} />
                <span 
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: 'var(--accent-bible)' }}
                >
                  Geografia
                </span>
              </div>
              <h1 
                className="text-lg font-bold"
                style={{ color: 'var(--text-bible)', fontFamily: 'var(--font-display)' }}
              >
                Lugares Bíblicos
              </h1>
              <div className="flex items-center gap-2 mt-1.5">
                <div 
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md"
                  style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-bible)' }}
                >
                  <MapPin className="w-3 h-3" style={{ color: 'var(--text-bible-muted)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-bible-muted)' }}>
                    {filteredPlaces.length} lugares
                  </span>
                </div>
              </div>
            </div>
            {onClose && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="p-2 rounded-lg transition-colors"
                style={{ 
                  backgroundColor: 'var(--surface-1)', 
                  border: '1px solid var(--border-bible)' 
                }}
              >
                <X className="w-4 h-4" style={{ color: 'var(--text-bible-muted)' }} />
              </motion.button>
            )}
          </div>

          <div className="relative mb-3">
            <Search 
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" 
              style={{ color: 'var(--text-bible-subtle)' }} 
            />
            <input
              type="text"
              placeholder="Buscar lugar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm transition-colors"
              style={{ 
                backgroundColor: 'var(--surface-1)', 
                border: '1px solid var(--border-bible)',
                color: 'var(--text-bible)',
              }}
            />
          </div>

          {placeTypes.length > 1 && (
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {placeTypes.map(type => (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFilterType(type)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                    filterType === type
                      ? 'text-white'
                      : 'text-[var(--text-bible-muted)]'
                  )}
                  style={{
                    backgroundColor: filterType === type 
                      ? 'var(--accent-bible)' 
                      : 'var(--surface-1)',
                    border: filterType === type ? 'none' : '1px solid var(--border-bible)',
                  }}
                >
                  {type === 'all' ? 'Todos' : type}
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <div className="flex-1 overflow-hidden relative">
        <div className="h-full overflow-y-auto p-4">
          {filteredPlaces.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--text-bible-subtle)' }} />
              <p className="text-sm" style={{ color: 'var(--text-bible-muted)' }}>
                {searchQuery ? 'Nenhum lugar encontrado' : 'Nenhum lugar'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {filteredPlaces.map((place, idx) => {
                  const isSelected = selectedPlace?.id === place.id;
                  
                  return (
                    <motion.button
                      key={place.id || place.location || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedPlace(place)}
                      className={cn(
                        'w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all border'
                      )}
                      style={{
                        backgroundColor: isSelected ? 'var(--surface-2)' : 'var(--surface-1)',
                        borderColor: isSelected ? 'var(--accent-bible)' : 'var(--border-bible)',
                      }}
                    >
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{ 
                          backgroundColor: 'var(--accent-bible)',
                          opacity: 0.15 
                        }}
                      >
                        <MapPin 
                          className="w-6 h-6"
                          style={{ color: 'var(--accent-bible)' }}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 
                          className="text-base font-semibold"
                          style={{ color: 'var(--text-bible)' }}
                        >
                          {place.name || place.location || 'Lugar desconhecido'}
                        </h3>
                        {place.modernName && (
                          <p 
                            className="text-xs mt-0.5"
                            style={{ color: 'var(--text-bible-muted)' }}
                          >
                            Nome moderno: {place.modernName}
                          </p>
                        )}
                        {place.description && (
                          <p 
                            className="text-xs mt-1 line-clamp-1"
                            style={{ color: 'var(--text-bible-subtle)' }}
                          >
                            {place.description.replace(/<[^>]+>/g, '').slice(0, 80)}...
                          </p>
                        )}
                        {place.verses && (
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <BookOpen className="w-3 h-3" style={{ color: 'var(--accent-bible)' }} />
                            <span 
                              className="text-xs truncate"
                              style={{ color: 'var(--accent-bible)' }}
                            >
                              {place.verses.split(',').length} referência(s)
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <ChevronRight 
                        className="w-5 h-5 shrink-0" 
                        style={{ color: 'var(--text-bible-subtle)' }} 
                      />
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40"
            style={{ 
              backgroundColor: 'rgba(0,0,0,0.3)',
              backdropFilter: 'blur(4px)'
            }}
            onClick={() => setSelectedPlace(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPlace && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 z-50"
          >
            <div 
              className="rounded-t-2xl p-5 max-h-[75vh] overflow-y-auto"
              style={{ 
                backgroundColor: 'var(--bg-bible)',
                borderTop: '1px solid var(--border-bible)'
              }}
            >
              <div className="flex justify-center mb-4">
                <div 
                  className="w-10 h-1 rounded-full" 
                  style={{ backgroundColor: 'var(--border-bible-strong)' }} 
                />
              </div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{ 
                      backgroundColor: 'var(--accent-bible)',
                      opacity: 0.15
                    }}
                  >
                    <MapPin 
                      className="w-7 h-7"
                      style={{ color: 'var(--accent-bible)' }}
                    />
                  </div>
                  <div>
                    <h2 
                      className="text-xl font-bold"
                      style={{ color: 'var(--text-bible)' }}
                    >
                      {selectedPlace.name || selectedPlace.location || 'Lugar'}
                    </h2>
                    {selectedPlace.modernName && (
                      <p 
                        className="text-xs"
                        style={{ color: 'var(--text-bible-muted)' }}
                      >
                        Nome moderno: {selectedPlace.modernName}
                      </p>
                    )}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedPlace(null)}
                  className="p-2 rounded-lg border"
                  style={{ 
                    backgroundColor: 'var(--surface-1)',
                    borderColor: 'var(--border-bible)'
                  }}
                >
                  <X className="w-4 h-4" style={{ color: 'var(--text-bible-muted)' }} />
                </motion.button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {selectedPlace.lat && selectedPlace.lon && (
                  <div 
                    className="p-3 rounded-xl border col-span-2"
                    style={{ 
                      backgroundColor: 'var(--surface-1)',
                      borderColor: 'var(--border-bible)'
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className="w-3.5 h-3.5" style={{ color: 'var(--text-bible-muted)' }} />
                      <span 
                        className="text-[10px] font-medium uppercase tracking-wider"
                        style={{ color: 'var(--text-bible-muted)' }}
                      >
                        Coordenadas GPS
                      </span>
                    </div>
                    <p 
                      className="text-sm font-mono"
                      style={{ color: 'var(--text-bible)' }}
                    >
                      {selectedPlace.lat.toFixed(4)}°, {selectedPlace.lon.toFixed(4)}°
                    </p>
                  </div>
                )}

                {(selectedPlace.type || selectedPlace.region) && (
                  <div 
                    className="p-3 rounded-xl border"
                    style={{ 
                      backgroundColor: 'var(--surface-1)',
                      borderColor: 'var(--border-bible)'
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Navigation className="w-3.5 h-3.5" style={{ color: 'var(--text-bible-muted)' }} />
                      <span 
                        className="text-[10px] font-medium uppercase tracking-wider"
                        style={{ color: 'var(--text-bible-muted)' }}
                      >
                        Tipo/Região
                      </span>
                    </div>
                    <p 
                      className="text-sm font-medium"
                      style={{ color: 'var(--text-bible)' }}
                    >
                      {selectedPlace.type || selectedPlace.region}
                    </p>
                  </div>
                )}

                {selectedPlace.location && selectedPlace.name !== selectedPlace.location && (
                  <div 
                    className="p-3 rounded-xl border"
                    style={{ 
                      backgroundColor: 'var(--surface-1)',
                      borderColor: 'var(--border-bible)'
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--text-bible-muted)' }} />
                      <span 
                        className="text-[10px] font-medium uppercase tracking-wider"
                        style={{ color: 'var(--text-bible-muted)' }}
                      >
                        Localização
                      </span>
                    </div>
                    <p 
                      className="text-sm font-medium"
                      style={{ color: 'var(--text-bible)' }}
                    >
                      {selectedPlace.location}
                    </p>
                  </div>
                )}
              </div>

              {selectedPlace.description && (
                <div 
                  className="p-4 rounded-xl border mb-4"
                  style={{ 
                    backgroundColor: 'var(--surface-1)',
                    borderColor: 'var(--border-bible)'
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4" style={{ color: 'var(--accent-bible)' }} />
                    <span 
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: 'var(--text-bible-muted)' }}
                    >
                      Descrição
                    </span>
                  </div>
                  <p 
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--text-bible)' }}
                  >
                    {selectedPlace.description.replace(/<[^>]+>/g, '')}
                  </p>
                </div>
              )}

              {selectedPlace.verses && (
                <div 
                  className="p-4 rounded-xl border mb-4"
                  style={{ 
                    backgroundColor: 'var(--surface-1)',
                    borderColor: 'var(--border-bible)'
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4" style={{ color: 'var(--accent-bible)' }} />
                    <span 
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: 'var(--text-bible-muted)' }}
                    >
                      Referências Bíblicas
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedPlace.verses.split(',').map((verse, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-2 rounded-lg text-sm font-medium border"
                        style={{ 
                          backgroundColor: 'var(--surface-2)',
                          borderColor: 'var(--border-bible)',
                          color: 'var(--text-bible)'
                        }}
                      >
                        {verse.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}