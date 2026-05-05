import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { BibleService } from '../BibleService';
import { MapPin, X, Search } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { PlacesData } from '../types';

function cn(...inputs: (string | boolean | undefined)[]) {
  return twMerge(clsx(inputs));
}

import { clsx } from 'clsx';

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
    return data.map((p: PlacesData) => {
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

  const filteredPlaces = useMemo(() => {
    if (!searchQuery) return places;
    const q = searchQuery.toLowerCase();
    return places.filter(place =>
      place.location?.toLowerCase().includes(q) ||
      place.modernName?.toLowerCase().includes(q) ||
      place.description?.toLowerCase().includes(q)
    );
  }, [places, searchQuery]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-bible-bg">
        <div className="w-12 h-12 rounded-full border-2 border-bible-accent/20 border-t-bible-accent animate-spin" />
        <p className="text-xs text-bible-text-muted mt-3">Carregando...</p>
      </div>
    );
  }

  if (!places || places.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-bible-bg">
        <MapPin className="w-10 h-10 text-bible-text-subtle mb-3" />
        <h3 className="text-sm font-bold text-bible-text">Nenhum lugar</h3>
        <p className="text-xs text-bible-text-muted">Não há lugares bíblicos</p>
        {onClose && (
          <button onClick={onClose} className="mt-4 px-4 py-2 rounded-lg bg-bible-accent text-white text-sm">
            Voltar
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-bible-bg">
      <div className="shrink-0 px-4 py-3 border-b border-bible-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-bible-accent/10">
            <MapPin className="w-4 h-4 text-bible-accent" />
          </div>
          <div>
            <h1 className="text-base font-bold text-bible-text">Locais Bíblicos</h1>
            <p className="text-[10px] text-bible-text-muted">{filteredPlaces.length} encontrados</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-bible-surface-strong">
            <X className="w-4 h-4 text-bible-text-muted" />
          </button>
        )}
      </div>

      <div className="px-4 py-2">
        <input 
          type="text" 
          placeholder="Buscar..." 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
          className="w-full px-3 py-2 rounded-lg text-sm bg-bible-surface-strong/50 border border-bible-border/50 outline-none" 
        />
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {filteredPlaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <MapPin className="w-10 h-10 text-bible-text-subtle mb-3" />
            <p className="text-sm text-bible-text">Nenhum local</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredPlaces.map((place, idx) => (
              <button 
                key={place.id || place.location || idx}
                onClick={() => { setSelectedPlace(place); setCurrentImageIndex(0); }} 
                className="w-full flex items-center gap-3 p-3 rounded-xl text-left bg-bible-surface-strong/30 border border-bible-border/30 hover:border-bible-accent/30"
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
                  {place.verses && (
                    <p className="text-[9px] text-bible-accent mt-1 truncate">{place.verses}</p>
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