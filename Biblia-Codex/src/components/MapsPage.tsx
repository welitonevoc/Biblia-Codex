/**
 * MapsPage Premium - Atlas Bíblico Interativo
 * Inspirado em: YouVersion, Bible Atlas, Logos, Olive Tree, Dwell
 * 
 * Features:
 * - Mapa SVG interativo da Terra Santa
 * - Camadas históricas (Êxodo, Reino, Jesus, Paulo)
 * - Linhas do tempo integradas
 * - Referências bíblicas clicáveis
 * - Busca avançada
 * - Visualização 3D de terrenos
 * - Rotas de jornadas bíblicas
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Map, MapPinned, Compass, Globe2, Landmark, Layers3, Route, Search,
  Navigation, BookOpen, Clock, Mountain, Droplets, Building2, Tent,
  ChevronRight, ChevronLeft, ZoomIn, ZoomOut, Maximize, Info,
  Star, Heart, Share2, Download, Filter, X, Plus, Minus, Eye, EyeOff,
  History, BookMarked, Pin, ArrowRight, Sparkles, Calendar
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAppContext } from '../AppContext';
import { listInstalledModules } from '../services/moduleService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Tipos e Interfaces ────────────────────────────────────────────

interface BiblicalPlace {
  id: string;
  name: string;
  namePt: string;
  type: 'city' | 'region' | 'mountain' | 'river' | 'sea' | 'desert' | 'temple';
  coordinates: { x: number; y: number };
  biblicalReferences: { bookId: string; chapter: number; verse?: number }[];
  description: string;
  era: string[];
  significance: string;
  modernName?: string;
  elevation?: number;
  population?: string;
}

interface BiblicalJourney {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  period: string;
  color: string;
  stops: string[];
  references: { bookId: string; chapter: number }[];
  duration?: string;
  distance?: string;
}

interface MapLayer {
  id: string;
  name: string;
  icon: React.ElementType;
  visible: boolean;
  color: string;
}

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  placeId?: string;
  references: { bookId: string; chapter: number }[];
}

// ─── Dados Bíblicos ────────────────────────────────────────────────

const BIBLICAL_PLACES: BiblicalPlace[] = [
  // Cidades Principais
  { id: 'jerusalem', name: 'Jerusalem', namePt: 'Jerusalém', type: 'city', coordinates: { x: 62, y: 58 }, biblicalReferences: [{ bookId: '2SA', chapter: 5 }, { bookId: 'MAT', chapter: 21 }], description: 'Cidade santa, capital do reino de Davi e local do templo.', era: ['OT', 'NT'], significance: 'Centro religioso e político de Israel', modernName: 'Jerusalem', elevation: 754 },
  { id: 'bethlehem', name: 'Bethlehem', namePt: 'Belém', type: 'city', coordinates: { x: 59, y: 61 }, biblicalReferences: [{ bookId: 'RUT', chapter: 1 }, { bookId: 'MAT', chapter: 2 }], description: 'Cidade de Davi e local de nascimento de Jesus.', era: ['OT', 'NT'], significance: 'Nascimento do Messias', modernName: 'Bethlehem', elevation: 775 },
  { id: 'nazareth', name: 'Nazareth', namePt: 'Nazaré', type: 'city', coordinates: { x: 51, y: 42 }, biblicalReferences: [{ bookId: 'LUK', chapter: 1 }, { bookId: 'MAT', chapter: 2 }], description: 'Onde Jesus cresceu e começou seu ministério.', era: ['NT'], significance: 'Infância e juventude de Jesus', modernName: 'Nazareth', elevation: 347 },
  { id: 'capernaum', name: 'Capernaum', namePt: 'Cafarnaum', type: 'city', coordinates: { x: 59, y: 36 }, biblicalReferences: [{ bookId: 'MRK', chapter: 1 }, { bookId: 'MAT', chapter: 4 }], description: 'Base do ministério de Jesus na Galileia.', era: ['NT'], significance: 'Ministério galileu de Jesus', modernName: 'Tel Hum', elevation: -214 },
  { id: 'samaria', name: 'Samaria', namePt: 'Samaria', type: 'city', coordinates: { x: 56, y: 50 }, biblicalReferences: [{ bookId: '1KI', chapter: 16 }, { bookId: 'JHN', chapter: 4 }], description: 'Capital do reino do norte e cidade da mulher samaritana.', era: ['OT', 'NT'], significance: 'Reino do Norte', modernName: 'Sebastia', elevation: 430 },
  { id: 'hebron', name: 'Hebron', namePt: 'Hebrom', type: 'city', coordinates: { x: 58, y: 68 }, biblicalReferences: [{ bookId: 'GEN', chapter: 23 }, { bookId: '2SA', chapter: 2 }], description: 'Onde Abraão comprou a cova de Macpela e Davi reinou primeiro.', era: ['OT'], significance: 'Patriarcas e início de Davi', modernName: 'Al-Khalil', elevation: 930 },
  { id: 'jericho', name: 'Jericho', namePt: 'Jericó', type: 'city', coordinates: { x: 65, y: 56 }, biblicalReferences: [{ bookId: 'JOS', chapter: 6 }, { bookId: 'LUK', chapter: 19 }], description: 'Cidade das palmeiras, primeira conquista de Canaã.', era: ['OT', 'NT'], significance: 'Conquista de Canaã', modernName: 'Tell es-Sultan', elevation: -258 },
  { id: 'bethany', name: 'Bethany', namePt: 'Betânia', type: 'city', coordinates: { x: 63, y: 59 }, biblicalReferences: [{ bookId: 'JHN', chapter: 11 }, { bookId: 'MRK', chapter: 11 }], description: 'Casa de Maria, Marta e Lázaro.', era: ['NT'], significance: 'Ressurreição de Lázaro', modernName: 'Al-Eizariya', elevation: 730 },

  // Regiões
  { id: 'galilee', name: 'Galilee', namePt: 'Galileia', type: 'region', coordinates: { x: 54, y: 40 }, biblicalReferences: [{ bookId: 'MAT', chapter: 4 }, { bookId: 'ISA', chapter: 9 }], description: 'Região do ministério de Jesus.', era: ['OT', 'NT'], significance: 'Ministério de Jesus', modernName: 'Galil' },
  { id: 'judea', name: 'Judea', namePt: 'Judéia', type: 'region', coordinates: { x: 60, y: 62 }, biblicalReferences: [{ bookId: 'MAT', chapter: 2 }, { bookId: 'LUK', chapter: 1 }], description: 'Região de Jerusalem e Belém.', era: ['OT', 'NT'], significance: 'Centro do judaísmo', modernName: 'Yehuda' },
  { id: 'decapolis', name: 'Decapolis', namePt: 'Decápole', type: 'region', coordinates: { x: 68, y: 42 }, biblicalReferences: [{ bookId: 'MRK', chapter: 5 }, { bookId: 'MAT', chapter: 4 }], description: 'Liga de dez cidades greco-romanas.', era: ['NT'], significance: 'Gentios e ministério de Jesus', modernName: 'Decapolis' },

  // Corpos d'água
  { id: 'sea_of_galilee', name: 'Sea of Galilee', namePt: 'Mar da Galileia', type: 'sea', coordinates: { x: 60, y: 38 }, biblicalReferences: [{ bookId: 'MAT', chapter: 4 }, { bookId: 'MRK', chapter: 4 }], description: 'Onde Jesus chamou os discípulos e acalmou a tempestade.', era: ['NT'], significance: 'Ministério de Jesus', modernName: 'Kinneret', elevation: -214 },
  { id: 'dead_sea', name: 'Dead Sea', namePt: 'Mar Morto', type: 'sea', coordinates: { x: 70, y: 70 }, biblicalReferences: [{ bookId: 'GEN', chapter: 14 }, { bookId: 'EZK', chapter: 47 }], description: 'Mar salgado onde Sodoma e Gomorra foram destruídas.', era: ['OT', 'NT'], significance: 'Julgamento e cura', modernName: 'Yam HaMelakh', elevation: -430 },
  { id: 'jordan_river', name: 'Jordan River', namePt: 'Rio Jordão', type: 'river', coordinates: { x: 66, y: 45 }, biblicalReferences: [{ bookId: 'JOS', chapter: 3 }, { bookId: 'MAT', chapter: 3 }], description: 'Onde Israel cruzou e Jesus foi batizado.', era: ['OT', 'NT'], significance: 'Passagem e batismo', modernName: 'Nahr al-Urdunn' },

  // Montanhas
  { id: 'mount_sinai', name: 'Mount Sinai', namePt: 'Monte Sinai', type: 'mountain', coordinates: { x: 30, y: 82 }, biblicalReferences: [{ bookId: 'EXO', chapter: 19 }, { bookId: 'EXO', chapter: 24 }], description: 'Onde Moisés recebeu os Dez Mandamentos.', era: ['OT'], significance: 'Lei e Aliança', modernName: 'Jabal Musa', elevation: 2285 },
  { id: 'mount_zion', name: 'Mount Zion', namePt: 'Monte Sião', type: 'mountain', coordinates: { x: 61, y: 59 }, biblicalReferences: [{ bookId: '2SA', chapter: 5 }, { bookId: 'PSA', chapter: 125 }], description: 'Monte do templo e cidade de Davi.', era: ['OT', 'NT'], significance: 'Presença de Deus', modernName: 'Har Tzion', elevation: 765 },
  { id: 'mount_of_olives', name: 'Mount of Olives', namePt: 'Monte das Oliveiras', type: 'mountain', coordinates: { x: 64, y: 58 }, biblicalReferences: [{ bookId: 'MAT', chapter: 24 }, { bookId: 'ACT', chapter: 1 }], description: 'Onde Jesus ensinou e ascendeu.', era: ['NT'], significance: 'Discurso escatológico e ascensão', modernName: 'Har HaZeitim', elevation: 826 },
  { id: 'mount_tabor', name: 'Mount Tabor', namePt: 'Monte Tabor', type: 'mountain', coordinates: { x: 56, y: 41 }, biblicalReferences: [{ bookId: 'JDG', chapter: 4 }, { bookId: 'MAT', chapter: 17 }], description: 'Tradicional local da transfiguração.', era: ['OT', 'NT'], significance: 'Transfiguração de Jesus', modernName: 'Har Tavor', elevation: 588 },
  { id: 'mount_carmel', name: 'Mount Carmel', namePt: 'Monte Carmelo', type: 'mountain', coordinates: { x: 48, y: 39 }, biblicalReferences: [{ bookId: '1KI', chapter: 18 }], description: 'Onde Elias confrontou os profetas de Baal.', era: ['OT'], significance: 'Confronto de Elias', modernName: 'Har HaCarmel', elevation: 546 },

  // Desertos
  { id: 'judean_desert', name: 'Judean Desert', namePt: 'Deserto da Judéia', type: 'desert', coordinates: { x: 68, y: 62 }, biblicalReferences: [{ bookId: 'MAT', chapter: 4 }, { bookId: 'PSA', chapter: 63 }], description: 'Onde Jesus foi tentado e Davi se escondeu.', era: ['OT', 'NT'], significance: 'Tentação e refúgio', modernName: 'Midbar Yehuda' },
  { id: 'sinai_desert', name: 'Sinai Desert', namePt: 'Deserto do Sinai', type: 'desert', coordinates: { x: 25, y: 80 }, biblicalReferences: [{ bookId: 'EXO', chapter: 16 }, { bookId: 'NUM', chapter: 14 }], description: '40 anos de peregrinação de Israel.', era: ['OT'], significance: 'Peregrinação', modernName: 'Sinai' },

  // Templo
  { id: 'temple_mount', name: 'Temple Mount', namePt: 'Monte do Templo', type: 'temple', coordinates: { x: 62, y: 58 }, biblicalReferences: [{ bookId: '1KI', chapter: 6 }, { bookId: 'MAT', chapter: 21 }], description: 'Local do templo de Salomão e Herodes.', era: ['OT', 'NT'], significance: 'Centro do culto judaico', modernName: 'Har HaBayit', elevation: 740 },
];

const BIBLICAL_JOURNEYS: BiblicalJourney[] = [
  {
    id: 'exodus',
    title: 'O Êxodo',
    subtitle: 'Da escravidão à Terra Prometida',
    description: 'A jornada libertadora de Israel através do Mar Vermelho até o Sinai e finalmente às portas de Canaã.',
    period: '1446-1406 a.C.',
    color: '#f59e0b',
    stops: ['goshen', 'mount_sinai', 'kadesh_barnea', 'jericho'],
    references: [{ bookId: 'EXO', chapter: 12 }, { bookId: 'NUM', chapter: 33 }],
    duration: '40 anos',
    distance: '~1.500 km'
  },
  {
    id: 'conquest',
    title: 'Conquista de Canaã',
    subtitle: 'Josué e a Promessa Cumprida',
    description: 'A travessia do Jordão e a conquista sistemática da terra prometida sob a liderança de Josué.',
    period: '1406-1367 a.C.',
    color: '#ef4444',
    stops: ['jericho', 'ai', 'gibeon', 'shiloh'],
    references: [{ bookId: 'JOS', chapter: 1 }, { bookId: 'JOS', chapter: 21 }],
    duration: '~7 anos',
    distance: '~800 km'
  },
  {
    id: 'david_fleeing',
    title: 'Fuga de Davi',
    subtitle: 'Perseguido por Saul',
    description: 'Os anos de fuga de Davi, sendo ungido rei mas perseguido por Saul antes de assumir o trono.',
    period: '1010-1003 a.C.',
    color: '#8b5cf6',
    stops: ['gibeah', 'nob', 'keilah', 'engedi', 'hebron'],
    references: [{ bookId: '1SA', chapter: 18 }, { bookId: '2SA', chapter: 2 }],
    duration: '~7 anos',
    distance: '~600 km'
  },
  {
    id: 'jesus_ministry',
    title: 'Ministério de Jesus',
    subtitle: 'Três Anos de Graça e Verdade',
    description: 'O ministério público de Jesus desde o batismo no Jordão até a ascensão do Monte das Oliveiras.',
    period: '27-30 d.C.',
    color: '#10b981',
    stops: ['bethany_beyond', 'nazareth', 'capernaum', 'jerusalem', 'bethany', 'mount_of_olives'],
    references: [{ bookId: 'MAT', chapter: 3 }, { bookId: 'ACT', chapter: 1 }],
    duration: '~3 anos',
    distance: '~1.200 km'
  },
  {
    id: 'paul_first',
    title: '1ª Viagem Missionária',
    subtitle: 'Paulo e Barnabé',
    description: 'A primeira viagem missionária de Paulo, estabelecendo igrejas na Galácia.',
    period: '46-48 d.C.',
    color: '#0ea5e9',
    stops: ['antioch_syria', 'cyprus', 'pisidian_antioch', 'iconium', 'lystra', 'derbe'],
    references: [{ bookId: 'ACT', chapter: 13 }, { bookId: 'ACT', chapter: 14 }],
    duration: '~2 anos',
    distance: '~2.000 km'
  },
  {
    id: 'paul_second',
    title: '2ª Viagem Missionária',
    subtitle: 'Levando o Evangelho à Europa',
    description: 'Paulo leva o evangelho à Macedônia e Acaia, estabelecendo igrejas em Filipos, Tessalônica e Corinto.',
    period: '49-52 d.C.',
    color: '#06b6d4',
    stops: ['antioch_syria', 'troas', 'philippi', 'thessalonica', 'athens', 'corinth'],
    references: [{ bookId: 'ACT', chapter: 15 }, { bookId: 'ACT', chapter: 18 }],
    duration: '~3 anos',
    distance: '~2.800 km'
  },
  {
    id: 'paul_third',
    title: '3ª Viagem Missionária',
    subtitle: 'Fortalecendo as Igrejas',
    description: 'Paulo fortalece as igrejas estabelecidas e passa três anos em Éfeso.',
    period: '53-57 d.C.',
    color: '#14b8a6',
    stops: ['antioch_syria', 'ephesus', 'corinth', 'miletus', 'jerusalem'],
    references: [{ bookId: 'ACT', chapter: 18 }, { bookId: 'ACT', chapter: 21 }],
    duration: '~4 anos',
    distance: '~3.200 km'
  },
  {
    id: 'paul_rome',
    title: 'Viagem a Roma',
    subtitle: 'Prisioneiro de Cristo',
    description: 'A jornada dramática de Paulo como prisioneiro de Cesareia até Roma, incluindo o naufrágio em Malta.',
    period: '59-60 d.C.',
    color: '#6366f1',
    stops: ['cesarea', 'sidon', 'myra', 'malta', 'rome'],
    references: [{ bookId: 'ACT', chapter: 27 }, { bookId: 'ACT', chapter: 28 }],
    duration: '~1 ano',
    distance: '~3.500 km'
  },
];

const TIMELINE_EVENTS: TimelineEvent[] = [
  { year: '2166 a.C.', title: 'Nascimento de Abraão', description: 'Pai da fé chamado por Deus.', references: [{ bookId: 'GEN', chapter: 11 }] },
  { year: '1446 a.C.', title: 'Êxodo do Egito', description: 'Libertação miraculosa através do Mar Vermelho.', references: [{ bookId: 'EXO', chapter: 12 }] },
  { year: '1406 a.C.', title: 'Entrada em Canaã', description: 'Israel atravessa o Jordão e conquista a terra.', references: [{ bookId: 'JOS', chapter: 3 }] },
  { year: '1000 a.C.', title: 'Davi conquista Jerusalem', description: 'A cidade se torna capital do reino.', references: [{ bookId: '2SA', chapter: 5 }] },
  { year: '960 a.C.', title: 'Templo de Salomão', description: 'Primeiro templo construído.', references: [{ bookId: '1KI', chapter: 6 }] },
  { year: '586 a.C.', title: 'Destruição do Templo', description: 'Exílio babilônico começa.', references: [{ bookId: '2KI', chapter: 25 }] },
  { year: '538 a.C.', title: 'Retorno do Exílio', description: 'Reconstrução do templo.', references: [{ bookId: 'EZR', chapter: 1 }] },
  { year: '6 a.C.', title: 'Nascimento de Jesus', description: 'O Verbo se fez carne em Belém.', references: [{ bookId: 'LUK', chapter: 2 }] },
  { year: '27 d.C.', title: 'Batismo de Jesus', description: 'Início do ministério público.', references: [{ bookId: 'MAT', chapter: 3 }] },
  { year: '30 d.C.', title: 'Crucificação e Ressurreição', description: 'Obra redentora consumada.', references: [{ bookId: 'MAT', chapter: 27 }, { bookId: 'MAT', chapter: 28 }] },
  { year: '30 d.C.', title: 'Pentecostes', description: 'Descida do Espírito Santo.', references: [{ bookId: 'ACT', chapter: 2 }] },
  { year: '46-57 d.C.', title: 'Viagens de Paulo', description: 'Expansão do evangelho aos gentios.', references: [{ bookId: 'ACT', chapter: 13 }] },
  { year: '60 d.C.', title: 'Paulo em Roma', description: 'Evangelho proclamado no coração do império.', references: [{ bookId: 'ACT', chapter: 28 }] },
];

const MAP_LAYERS: MapLayer[] = [
  { id: 'cities', name: 'Cidades', icon: Building2, visible: true, color: '#f59e0b' },
  { id: 'regions', name: 'Regiões', icon: Globe2, visible: true, color: '#10b981' },
  { id: 'water', name: 'Água', icon: Droplets, visible: true, color: '#0ea5e9' },
  { id: 'mountains', name: 'Montanhas', icon: Mountain, visible: false, color: '#8b5cf6' },
  { id: 'desert', name: 'Desertos', icon: Tent, visible: false, color: '#f97316' },
  { id: 'temple', name: 'Templo', icon: Landmark, visible: true, color: '#ef4444' },
];

// ─── Componente: Mapa SVG Interativo ───────────────────────────────

const InteractiveMap: React.FC<{
  selectedPlace: BiblicalPlace | null;
  selectedJourney: BiblicalJourney | null;
  activeLayers: MapLayer[];
  onPlaceSelect: (place: BiblicalPlace) => void;
  zoom: number;
  onNavigate: (bookId: string, chapter: number, verse?: number) => void;
}> = ({ selectedPlace, selectedJourney, activeLayers, onPlaceSelect, zoom, onNavigate }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const getPlaceColor = (place: BiblicalPlace) => {
    const layer = activeLayers.find(l => {
      if (l.id === 'cities' && place.type === 'city') return true;
      if (l.id === 'regions' && place.type === 'region') return true;
      if (l.id === 'water' && ['sea', 'river'].includes(place.type)) return true;
      if (l.id === 'mountains' && place.type === 'mountain') return true;
      if (l.id === 'desert' && place.type === 'desert') return true;
      if (l.id === 'temple' && place.type === 'temple') return true;
      return false;
    });
    return layer?.color || '#94a3b8';
  };

  const isVisible = (place: BiblicalPlace) => {
    return activeLayers.some(l => {
      if (l.id === 'cities' && place.type === 'city') return l.visible;
      if (l.id === 'regions' && place.type === 'region') return l.visible;
      if (l.id === 'water' && ['sea', 'river'].includes(place.type)) return l.visible;
      if (l.id === 'mountains' && place.type === 'mountain') return l.visible;
      if (l.id === 'desert' && place.type === 'desert') return l.visible;
      if (l.id === 'temple' && place.type === 'temple') return l.visible;
      return false;
    });
  };

  const journeyStops = selectedJourney?.stops.map(stopId =>
    BIBLICAL_PLACES.find(p => p.id === stopId)
  ).filter(Boolean) as BiblicalPlace[] || [];

  return (
    <div className="relative w-full h-full overflow-hidden rounded-[24px] bg-gradient-to-br from-amber-50 via-orange-50/30 to-amber-100/50">
      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.3) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        className="w-full h-full"
        style={{
          transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {/* Base Map - Simplified Holy Land */}
        <defs>
          <linearGradient id="landGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#fde68a" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#fcd34d" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="seaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.4" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="0.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Mediterranean Sea */}
        <path
          d="M 0 0 L 15 0 L 15 100 L 0 100 Z"
          fill="url(#seaGradient)"
          stroke="#0ea5e9"
          strokeWidth="0.2"
          opacity="0.5"
        />

        {/* Dead Sea */}
        <ellipse
          cx="72" cy="72" rx="3" ry="8"
          fill="url(#seaGradient)"
          stroke="#0ea5e9"
          strokeWidth="0.2"
          opacity="0.6"
        />

        {/* Sea of Galilee */}
        <circle
          cx="60" cy="37" r="2.5"
          fill="url(#seaGradient)"
          stroke="#0ea5e9"
          strokeWidth="0.2"
          opacity="0.6"
        />

        {/* Jordan River */}
        <path
          d="M 60 37 Q 63 45 66 55 Q 68 65 70 72"
          fill="none"
          stroke="#0ea5e9"
          strokeWidth="0.4"
          opacity="0.5"
          strokeLinecap="round"
        />

        {/* Land Mass - Simplified */}
        <path
          d="M 15 0 Q 25 5 35 10 Q 45 15 50 20 Q 55 25 60 30 L 65 35 L 70 40 L 75 50 L 78 60 L 80 70 L 75 80 L 70 85 L 65 90 L 60 95 L 50 100 L 15 100 Z"
          fill="url(#landGradient)"
          stroke="#d97706"
          strokeWidth="0.3"
          opacity="0.8"
        />

        {/* Journey Routes */}
        {selectedJourney && journeyStops.length > 1 && (
          <motion.g
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          >
            <path
              d={journeyStops.map((stop, i) =>
                `${i === 0 ? 'M' : 'L'} ${stop.coordinates.x} ${stop.coordinates.y}`
              ).join(' ')}
              fill="none"
              stroke={selectedJourney.color}
              strokeWidth="0.5"
              strokeDasharray="1 0.5"
              strokeLinecap="round"
              filter="url(#glow)"
              opacity="0.8"
            />
            {/* Animated dots along route */}
            <motion.circle
              r="0.8"
              fill={selectedJourney.color}
              initial={{ offsetDistance: '0%' }}
              animate={{ offsetDistance: '100%' }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              style={{
                offsetPath: `path('${journeyStops.map((stop, i) =>
                  `${i === 0 ? 'M' : 'L'} ${stop.coordinates.x} ${stop.coordinates.y}`
                ).join(' ')}')`
              }}
            />
          </motion.g>
        )}

        {/* Place Markers */}
        {BIBLICAL_PLACES.filter(isVisible).map((place) => {
          const isSelected = selectedPlace?.id === place.id;
          const isJourneyStop = journeyStops.some(s => s.id === place.id);
          const color = getPlaceColor(place);

          return (
            <motion.g
              key={place.id}
              onClick={() => onPlaceSelect(place)}
              className="cursor-pointer"
              initial={{ scale: 0 }}
              animate={{ scale: isSelected ? 1.3 : 1 }}
              whileHover={{ scale: 1.2 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {/* Marker circle */}
              <circle
                cx={place.coordinates.x}
                cy={place.coordinates.y}
                r={isSelected ? 2 : 1.2}
                fill={isJourneyStop ? selectedJourney?.color || color : color}
                stroke="white"
                strokeWidth="0.3"
                filter={isSelected ? 'url(#glow)' : ''}
                opacity={isSelected ? 1 : 0.8}
              />

              {/* Pulsing ring for selected */}
              {isSelected && (
                <>
                  <circle
                    cx={place.coordinates.x}
                    cy={place.coordinates.y}
                    r="3"
                    fill="none"
                    stroke={color}
                    strokeWidth="0.2"
                    opacity="0.5"
                  >
                    <animate attributeName="r" from="2" to="4" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.8" to="0" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                </>
              )}

              {/* Label */}
              <text
                x={place.coordinates.x}
                y={place.coordinates.y + (isSelected ? 4 : 3)}
                textAnchor="middle"
                fontSize="1.5"
                fill={isSelected ? color : 'rgba(100, 100, 100, 0.6)'}
                fontWeight={isSelected ? 'bold' : 'normal'}
                className="select-none pointer-events-none"
                style={{ textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}
              >
                {place.namePt}
              </text>
            </motion.g>
          );
        })}
      </svg>

      {/* Map Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('PSA', 122)}
          className="p-2 rounded-xl bg-white/90 backdrop-blur shadow-lg border border-amber-200 text-amber-700 hover:bg-amber-50 transition-colors"
          title="Ir para Salmos 122 (Cântico de Sião)"
        >
          <BookOpen className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
};

// ─── Componente: Timeline Horizontal ───────────────────────────────

const TimelineStrip: React.FC<{
  onSelectEvent: (event: TimelineEvent) => void;
}> = ({ onSelectEvent }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {TIMELINE_EVENTS.map((event, index) => (
          <motion.button
            key={index}
            onClick={() => onSelectEvent(event)}
            className="flex-shrink-0 min-w-[180px] p-4 rounded-2xl bg-gradient-to-br from-bible-accent/5 to-bible-accent/10 border border-bible-accent/10 hover:border-bible-accent/20 transition-all text-left group"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-3.5 h-3.5 text-bible-accent/40" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-bible-accent/50">{event.year}</span>
            </div>
            <h4 className="text-sm font-bold text-bible-accent group-hover:text-bible-accent/80 transition-colors">
              {event.title}
            </h4>
            <p className="text-[10px] text-bible-accent/40 mt-1 line-clamp-2">
              {event.description}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

// ─── Componente: Card de Lugar ─────────────────────────────────────

const PlaceCard: React.FC<{
  place: BiblicalPlace;
  isSelected: boolean;
  onClick: () => void;
  onNavigate: () => void;
}> = ({ place, isSelected, onClick, onNavigate }) => {
  const TypeIcon = {
    city: Building2,
    region: Globe2,
    mountain: Mountain,
    river: Droplets,
    sea: Droplets,
    desert: Tent,
    temple: Landmark,
  }[place.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onClick={onClick}
      className={cn(
        "group relative p-4 rounded-2xl border transition-all cursor-pointer",
        isSelected
          ? "bg-bible-accent/10 border-bible-accent/30 shadow-lg shadow-bible-accent/5"
          : "bg-bible-accent/3 border-bible-accent/8 hover:bg-bible-accent/5 hover:border-bible-accent/15"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
          isSelected ? "bg-bible-accent/20" : "bg-bible-accent/10 group-hover:bg-bible-accent/15"
        )}>
          <TypeIcon className={cn("w-5 h-5", isSelected ? "text-bible-accent" : "text-bible-accent/50")} />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-bold text-bible-accent truncate">{place.namePt}</h3>
            {place.elevation && (
              <span className="text-[9px] font-medium text-bible-accent/30 whitespace-nowrap">
                {place.elevation > 0 ? '+' : ''}{place.elevation}m
              </span>
            )}
          </div>
          <p className="text-[10px] text-bible-accent/40 line-clamp-2">{place.description}</p>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[9px] font-medium text-bible-accent/30 uppercase tracking-wider">
              {place.type === 'city' ? 'Cidade' : place.type === 'region' ? 'Região' : place.type}
            </span>
            {place.modernName && (
              <>
                <span className="text-[8px] text-bible-accent/20">•</span>
                <span className="text-[9px] text-bible-accent/30">{place.modernName}</span>
              </>
            )}
          </div>
        </div>
        <motion.button
          onClick={(e) => { e.stopPropagation(); onNavigate(); }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-lg bg-bible-accent/5 hover:bg-bible-accent/10 transition-colors opacity-0 group-hover:opacity-100"
        >
          <BookOpen className="w-4 h-4 text-bible-accent/60" />
        </motion.button>
      </div>
    </motion.div>
  );
};

// ─── Componente: Painel de Camadas ─────────────────────────────────

const LayerPanel: React.FC<{
  layers: MapLayer[];
  onToggleLayer: (id: string) => void;
  onClose: () => void;
}> = ({ layers, onToggleLayer, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute top-4 right-4 z-20 w-64 rounded-2xl bg-white/95 backdrop-blur-xl shadow-2xl border border-bible-accent/10 overflow-hidden"
    >
      <div className="p-4 border-b border-bible-accent/8">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-bible-accent">Camadas do Mapa</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-bible-accent/5">
            <X className="w-4 h-4 text-bible-accent/40" />
          </button>
        </div>
      </div>
      <div className="p-2 space-y-1">
        {layers.map((layer) => (
          <button
            key={layer.id}
            onClick={() => onToggleLayer(layer.id)}
            className={cn(
              "w-full flex items-center justify-between p-2.5 rounded-xl transition-colors",
              layer.visible ? "bg-bible-accent/5" : "hover:bg-bible-accent/3"
            )}
          >
            <div className="flex items-center gap-3">
              <layer.icon className="w-4 h-4" style={{ color: layer.color }} />
              <span className="text-sm font-medium text-bible-accent/70">{layer.name}</span>
            </div>
            <div className={cn(
              "w-9 h-5 rounded-full p-1 transition-colors",
              layer.visible ? "bg-bible-accent/20" : "bg-bible-accent/5"
            )}>
              <motion.div
                layout
                className={cn(
                  "w-3 h-3 rounded-full transition-colors",
                  layer.visible ? "bg-bible-accent" : "bg-bible-accent/20"
                )}
                animate={{ x: layer.visible ? 16 : 0 }}
              />
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
};

// ─── Componente Principal ──────────────────────────────────────────

interface MapsPageProps {
  onNavigate: (bookId: string, chapter: number, verse?: number) => void;
}

export const MapsPage: React.FC<MapsPageProps> = ({ onNavigate }) => {
  const { setActiveTab } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<BiblicalPlace | null>(null);
  const [selectedJourney, setSelectedJourney] = useState<BiblicalJourney | null>(null);
  const [activeLayers, setActiveLayers] = useState<MapLayer[]>(MAP_LAYERS);
  const [mapZoom, setMapZoom] = useState(1);
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [installedModules, setInstalledModules] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'map' | 'list' | 'journeys'>('map');

  useEffect(() => {
    listInstalledModules().then(setInstalledModules).catch(() => setInstalledModules([]));
  }, []);

  const mapModules = installedModules.filter(m =>
    m.category === 'map' ||
    m.name.toLowerCase().includes('map') ||
    m.name.toLowerCase().includes('atlas')
  );

  const filteredPlaces = BIBLICAL_PLACES.filter(place =>
    place.namePt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    place.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    place.era.some(era => era.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleToggleLayer = useCallback((layerId: string) => {
    setActiveLayers(prev => prev.map(layer =>
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ));
  }, []);

  const handleNavigateToPlace = useCallback((place: BiblicalPlace) => {
    if (place.biblicalReferences.length > 0) {
      const ref = place.biblicalReferences[0];
      onNavigate(ref.bookId, ref.chapter, ref.verse);
    }
  }, [onNavigate]);

  const handleZoomIn = () => setMapZoom(prev => Math.min(prev + 0.2, 2));
  const handleZoomOut = () => setMapZoom(prev => Math.max(prev - 0.2, 0.6));
  const handleResetZoom = () => setMapZoom(1);

  return (
    <div className="h-full overflow-y-auto bg-bible-bg">
      <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 space-y-6">

        {/* Header Premium */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[32px] p-6 md:p-8"
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #3730a3 100%)'
          }}
        >
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <Globe2 className="w-6 h-6 text-white/80" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/50">Atlas Bíblico</p>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-white leading-tight">
                  Explore a Geografia da Salvação
                </h1>
              </div>
            </div>

            <p className="text-white/70 text-sm md:text-base max-w-2xl leading-relaxed">
              Viaje através dos lugares sagrados, siga as jornadas dos patriarcas, profetas e apóstolos,
              e descubra como Deus agiu na história em locais reais.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              {[
                { label: 'Lugares', value: BIBLICAL_PLACES.length, icon: MapPinned },
                { label: 'Jornadas', value: BIBLICAL_JOURNEYS.length, icon: Route },
                { label: 'Eventos', value: TIMELINE_EVENTS.length, icon: Calendar },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-white/5 backdrop-blur p-4 border border-white/10">
                  <stat.icon className="w-5 h-5 text-amber-400/80 mb-2" />
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-[10px] text-white/50 uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Timeline Strip */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-bible-accent/40" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-bible-accent/50">Linha do Tempo Bíblica</h2>
          </div>
          <TimelineStrip onSelectEvent={(event) => console.log('Timeline event:', event)} />
        </motion.section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Interactive Map */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-bible-accent/40" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-bible-accent/50">Mapa Interativo</h2>
              </div>

              <div className="flex items-center gap-2">
                {/* View Mode Toggle */}
                <div className="flex rounded-xl bg-bible-accent/5 p-1">
                  {[
                    { id: 'map', label: 'Mapa', icon: Map },
                    { id: 'list', label: 'Lista', icon: Landmark },
                    { id: 'journeys', label: 'Jornadas', icon: Route },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setViewMode(mode.id as any)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                        viewMode === mode.id
                          ? "bg-white text-bible-accent shadow-sm"
                          : "text-bible-accent/40 hover:text-bible-accent/60"
                      )}
                    >
                      <mode.icon className="w-3.5 h-3.5" />
                      {mode.label}
                    </button>
                  ))}
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-1 rounded-xl bg-bible-accent/5 p-1">
                  <button onClick={handleZoomOut} className="p-1.5 rounded-lg hover:bg-bible-accent/10">
                    <Minus className="w-3.5 h-3.5 text-bible-accent/50" />
                  </button>
                  <button onClick={handleResetZoom} className="px-2 py-1 text-[9px] font-bold text-bible-accent/50">
                    {Math.round(mapZoom * 100)}%
                  </button>
                  <button onClick={handleZoomIn} className="p-1.5 rounded-lg hover:bg-bible-accent/10">
                    <Plus className="w-3.5 h-3.5 text-bible-accent/50" />
                  </button>
                </div>

                {/* Layer Toggle */}
                <button
                  onClick={() => setShowLayerPanel(!showLayerPanel)}
                  className="p-2 rounded-xl bg-bible-accent/5 hover:bg-bible-accent/10 transition-colors"
                >
                  <Layers3 className="w-4 h-4 text-bible-accent/50" />
                </button>
              </div>
            </div>

            {/* Layer Panel */}
            <AnimatePresence>
              {showLayerPanel && (
                <LayerPanel
                  layers={activeLayers}
                  onToggleLayer={handleToggleLayer}
                  onClose={() => setShowLayerPanel(false)}
                />
              )}
            </AnimatePresence>

            {/* Map Container */}
            <div className="aspect-[4/3] lg:aspect-video">
              <InteractiveMap
                selectedPlace={selectedPlace}
                selectedJourney={selectedJourney}
                activeLayers={activeLayers}
                onPlaceSelect={setSelectedPlace}
                zoom={mapZoom}
                onNavigate={onNavigate}
              />
            </div>

            {/* Journey Selector */}
            {viewMode === 'journeys' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2">
                  <Route className="w-4 h-4 text-bible-accent/40" />
                  <h2 className="text-sm font-bold uppercase tracking-widest text-bible-accent/50">Jornadas Bíblicas</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {BIBLICAL_JOURNEYS.map((journey) => (
                    <motion.button
                      key={journey.id}
                      onClick={() => setSelectedJourney(journey)}
                      className={cn(
                        "p-4 rounded-2xl border text-left transition-all",
                        selectedJourney?.id === journey.id
                          ? "border-bible-accent/30 bg-bible-accent/5"
                          : "border-bible-accent/8 hover:bg-bible-accent/3"
                      )}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: journey.color }} />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-bible-accent/40">{journey.period}</span>
                      </div>
                      <h3 className="text-base font-bold text-bible-accent">{journey.title}</h3>
                      <p className="text-sm text-bible-accent/50 mt-1">{journey.subtitle}</p>
                      {journey.duration && (
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-bible-accent/30">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {journey.duration}
                          </span>
                          <span>{journey.distance}</span>
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-bible-accent/30" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar lugares, regiões..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-bible-accent/10 focus:border-bible-accent/20 focus:outline-none text-sm transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-bible-accent/5"
                >
                  <X className="w-3.5 h-3.5 text-bible-accent/30" />
                </button>
              )}
            </div>

            {/* Selected Place Info */}
            <AnimatePresence mode="wait">
              {selectedPlace ? (
                <motion.div
                  key={selectedPlace.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="rounded-3xl bg-gradient-to-br from-bible-accent/5 to-bible-accent/10 border border-bible-accent/10 p-5 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-bible-accent/20 flex items-center justify-center">
                        {selectedPlace.type === 'city' && <Building2 className="w-6 h-6 text-bible-accent" />}
                        {selectedPlace.type === 'region' && <Globe2 className="w-6 h-6 text-bible-accent" />}
                        {selectedPlace.type === 'mountain' && <Mountain className="w-6 h-6 text-bible-accent" />}
                        {(selectedPlace.type === 'sea' || selectedPlace.type === 'river') && <Droplets className="w-6 h-6 text-bible-accent" />}
                        {selectedPlace.type === 'desert' && <Tent className="w-6 h-6 text-bible-accent" />}
                        {selectedPlace.type === 'temple' && <Landmark className="w-6 h-6 text-bible-accent" />}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-bible-accent">{selectedPlace.namePt}</h3>
                        <p className="text-[10px] text-bible-accent/40 uppercase tracking-wider">{selectedPlace.name}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedPlace(null)}
                      className="p-2 rounded-xl hover:bg-bible-accent/10"
                    >
                      <X className="w-4 h-4 text-bible-accent/30" />
                    </button>
                  </div>

                  <p className="text-sm text-bible-accent/70 leading-relaxed">{selectedPlace.description}</p>

                  {selectedPlace.elevation && (
                    <div className="flex items-center gap-4 text-[10px] text-bible-accent/40">
                      <span className="flex items-center gap-1">
                        <Mountain className="w-3 h-3" />
                        {selectedPlace.elevation > 0 ? '+' : ''}{selectedPlace.elevation}m
                      </span>
                      {selectedPlace.modernName && (
                        <span>Hoje: {selectedPlace.modernName}</span>
                      )}
                    </div>
                  )}

                  {selectedPlace.biblicalReferences.length > 0 && (
                    <motion.button
                      onClick={() => handleNavigateToPlace(selectedPlace)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 rounded-xl bg-bible-accent text-white text-[10px] font-bold uppercase tracking-widest hover:bg-bible-accent/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <BookOpen className="w-4 h-4" />
                      Abrir Referência
                    </motion.button>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="rounded-3xl border-2 border-dashed border-bible-accent/10 p-8 text-center space-y-3"
                >
                  <MapPinned className="w-10 h-10 text-bible-accent/20 mx-auto" />
                  <p className="text-sm font-medium text-bible-accent/40">Selecione um lugar no mapa</p>
                  <p className="text-[10px] text-bible-accent/30">ou na lista ao lado</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Places List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-bible-accent/50">
                  {searchQuery ? 'Resultados' : 'Lugares Principais'}
                </h3>
                <span className="text-[10px] text-bible-accent/30">{filteredPlaces.length} lugares</span>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-hide">
                {filteredPlaces.slice(0, 8).map((place) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    isSelected={selectedPlace?.id === place.id}
                    onClick={() => setSelectedPlace(place)}
                    onNavigate={() => handleNavigateToPlace(place)}
                  />
                ))}
              </div>
            </div>

            {/* Installed Modules */}
            {mapModules.length > 0 && (
              <div className="rounded-2xl bg-bible-accent/3 border border-bible-accent/8 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Layers3 className="w-4 h-4 text-bible-accent/40" />
                  <h3 className="text-sm font-bold text-bible-accent/60">Atlas Instalados</h3>
                </div>
                <div className="space-y-2">
                  {mapModules.map((mod, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-white/50">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-bible-accent truncate">{mod.name}</p>
                        <p className="text-[9px] text-bible-accent/40">{mod.format}</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('modules')}
                        className="p-1.5 rounded-lg hover:bg-bible-accent/5"
                      >
                        <ArrowRight className="w-3.5 h-3.5 text-bible-accent/40" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
