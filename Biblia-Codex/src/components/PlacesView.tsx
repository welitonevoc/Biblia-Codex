import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, ExternalLink, ImageIcon, Calendar, BookOpen, Globe, Navigation } from 'lucide-react';
import { BibleService } from '../BibleService';
import { clsx } from 'clsx';

function cn(...inputs: (string | boolean | undefined)[]) {
  return clsx(inputs);
}

interface Place {
  id?: number;
  location?: string;
  name?: string;
  book?: number;
  chapter?: number;
  verse?: number;
  description?: string;
  comment?: string;
  image?: string;
  modernName?: string;
  lat?: number;
  lon?: number;
  type?: string;
  region?: string;
  coordinates?: { lat: number; lng: number };
  biblicalReferences?: any[];
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
          })).filter((p: Place) => p.name || p.location);

          setPlaces(normalizedPlaces);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error loading places:', err);
          setPlaces([]);
          setLoading(false);
        });
    }
  }, [bookId, chapter, verse, initialPlaces]);

  const filteredPlaces = places.filter(place =>
    !searchQuery ||
    place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    place.modernName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    place.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          <div className="w-16 h-16 border-4 border-bible-accent/20 border-t-bible-accent rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <MapPin className="w-6 h-6 text-bible-accent animate-pulse" />
          </div>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-bible-text-muted mt-4 font-medium"
        >
          Carregando lugares...
        </motion.p>
      </div>
    );
  }

  if (!places || places.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="inline-flex p-4 rounded-2xl bg-bible-accent/10 mb-4">
          <MapPin className="w-8 h-8 text-bible-accent" />
        </div>
        <h3 className="text-sm font-bold text-bible-text mb-1">Nenhum lugar encontrado</h3>
        <p className="text-xs text-bible-text-muted">
          Não há lugares bíblicos para este versículo
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-bible-bg">
      {/* Header Premium */}
      <div className="shrink-0 px-5 py-5 border-b border-bible-border/50">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-bible-accent" />
              <span className="premium-kicker">Geografia Bíblica</span>
            </div>
            <h2 className="text-xl font-bold text-bible-text">Lugares Bíblicos</h2>
            <p className="text-xs text-bible-text-muted mt-0.5">
              {places.length} {places.length === 1 ? 'lugar encontrado' : 'lugares encontrados'}
            </p>
          </div>
          {onClose && (
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="premium-icon-button"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-bible-text-muted" />
          <input
            type="text"
            placeholder="Buscar lugar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="premium-input pl-9 py-2.5 text-sm"
          />
        </div>
      </div>

      {/* Places List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredPlaces.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="inline-flex p-4 rounded-2xl bg-bible-accent/10 mb-4">
              <MapPin className="w-8 h-8 text-bible-accent" />
            </div>
            <h3 className="text-sm font-bold text-bible-text mb-1">
              {searchQuery ? 'Nenhum lugar encontrado' : 'Nenhum lugar para este versículo'}
            </h3>
            <p className="text-xs text-bible-text-muted">
              {searchQuery ? 'Tente outra busca' : 'Este versículo não tem lugares associados'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-xs text-bible-text-muted mb-2">
              {filteredPlaces.length} {filteredPlaces.length === 1 ? 'lugar encontrado' : 'lugares encontrados'}
            </div>
            {filteredPlaces.map((place, idx) => (
              <motion.button
                key={place.id || place.location || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedPlace(place)}
                className="premium-card p-4 w-full text-left group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-bible-accent/20 to-bible-accent/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-bible-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-bible-text mb-1 truncate">
                      {place.name || place.location || 'Lugar desconhecido'}
                    </h3>
                    {place.description && (
                      <p className="text-xs text-bible-text-muted line-clamp-2 mb-2">
                        {place.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 flex-wrap">
                      {place.lat && place.lon && (
                        <div className="flex items-center gap-1 text-[10px] text-bible-text-muted">
                          <Globe className="w-3 h-3" />
                          <span>{place.lat.toFixed(2)}, {place.lon.toFixed(2)}</span>
                        </div>
                      )}
                      {place.verses && (
                        <div className="flex items-center gap-1 text-[10px] text-bible-text-muted">
                          <BookOpen className="w-3 h-3" />
                          <span className="truncate">{place.verses}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-bible-text-muted group-hover:text-bible-accent group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal Premium */}
      <AnimatePresence>
        {selectedPlace && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={() => setSelectedPlace(null)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-lg bg-bible-bg rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[85vh] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative h-32 sm:h-40 bg-gradient-to-br from-bible-accent/20 to-bible-accent/10 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-bible-bg via-transparent to-transparent" />
                <div className="relative z-10 text-center">
                  <MapPin className="w-12 h-12 text-bible-accent mx-auto mb-2" />
                  <h3 className="text-xl font-bold text-bible-text px-4">
                    {selectedPlace.name || selectedPlace.location || 'Lugar'}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedPlace(null)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 backdrop-blur-sm z-20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content Scrollable */}
              <div className="overflow-y-auto p-5" style={{ maxHeight: '50vh' }}>
                {/* GPS Coordinates */}
                {selectedPlace.lat && selectedPlace.lon && (
                  <div className="mb-4 p-3 rounded-xl bg-bible-surface flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-bible-accent" />
                      <span className="text-xs font-bold text-bible-text">Coordenadas GPS</span>
                    </div>
                    <span className="text-xs font-mono text-bible-accent">
                      {selectedPlace.lat.toFixed(4)}, {selectedPlace.lon.toFixed(4)}
                    </span>
                  </div>
                )}

                {/* Description */}
                {selectedPlace.description && (
                  <div className="mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-bible-text-muted mb-2">Descrição</p>
                    <p className="text-sm text-bible-text leading-relaxed">
                      {selectedPlace.description.replace(/<[^>]+>/g, '')}
                    </p>
                  </div>
                )}

                {/* Biblical References */}
                {selectedPlace.verses && (
                  <div className="mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-bible-text-muted mb-2">Referências Bíblicas</p>
                    <p className="text-sm text-bible-accent font-medium">
                      {selectedPlace.verses}
                    </p>
                  </div>
                )}

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {selectedPlace.book && (
                    <div className="premium-card-soft p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-bible-text-muted mb-1">Livro</p>
                      <p className="text-sm font-semibold text-bible-text">{selectedPlace.book}</p>
                    </div>
                  )}
                  {selectedPlace.location && selectedPlace.name !== selectedPlace.location && (
                    <div className="premium-card-soft p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-bible-text-muted mb-1">Local</p>
                      <p className="text-sm font-semibold text-bible-text">{selectedPlace.location}</p>
                    </div>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPlace(null)}
                  className="premium-button w-full"
                >
                  Fechar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}