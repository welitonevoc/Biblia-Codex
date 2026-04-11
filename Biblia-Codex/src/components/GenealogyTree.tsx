import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BibleService } from '../BibleService';
import {
  Users, TreePine, List, X, Calendar, MapPin,
  BookOpen, ChevronRight, Search, Sparkles,
  Star, Heart, Crown, Scroll, Zap
} from 'lucide-react';
import { clsx } from 'clsx';

function cn(...inputs: (string | boolean | undefined)[]) {
  return clsx(inputs);
}

interface Person {
  id: number;
  name: string;
  gender?: string;
  birthyear?: string;
  deathyear?: string;
  birthplace?: string;
  deathplace?: string;
  tree_id?: number;
  verses?: string;
}

interface TreeNode extends Person {
  x: number;
  y: number;
  generation: number;
  connections: { from: number; to: number }[];
}

interface GenealogyTreeProps {
  bookId: string;
  chapter: number;
  verse: number;
  onClose?: () => void;
}

export function GenealogyTree({ bookId, chapter, verse, onClose }: GenealogyTreeProps) {
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('list');
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState<'all' | 'M' | 'F'>('all');
  const [isHoveringCard, setIsHoveringCard] = useState<number | null>(null);

  // Load people data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await BibleService.getPeopleData(bookId, chapter, verse);
      setPeople(data);
      setLoading(false);
    }
    loadData();
  }, [bookId, chapter, verse]);

  // Build tree nodes with positions - Enhanced hierarchical layout
  useEffect(() => {
    if (!people.length) return;

    const treeGroups = new Map<number, Person[]>();
    people.forEach(p => {
      const treeId = p.tree_id || 0;
      if (!treeGroups.has(treeId)) treeGroups.set(treeId, []);
      treeGroups.get(treeId)!.push(p);
    });

    const nodes: TreeNode[] = [];
    const nodeSpacing = { x: 220, y: 140 };
    const startX = 150;
    let currentY = 120;

    treeGroups.forEach((group, treeId) => {
      if (treeId === 0) return;

      // Sort by generation (estimated by year)
      const sorted = [...group].sort((a, b) => {
        const yearA = parseInt(a.birthyear || '0');
        const yearB = parseInt(b.birthyear || '0');
        return yearA - yearB;
      });

      sorted.forEach((person, idx) => {
        const gen = Math.floor(idx / 5);
        const node: TreeNode = {
          ...person,
          x: startX + (idx % 5) * nodeSpacing.x,
          y: currentY + gen * nodeSpacing.y,
          generation: gen,
          connections: idx > 0 ? [{ from: idx - 1, to: idx }] : []
        };
        nodes.push(node);
      });

      const totalGen = Math.ceil(sorted.length / 5);
      currentY += totalGen * nodeSpacing.y + 100;
    });

    setTreeNodes(nodes);
  }, [people]);

  // Handle container resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Filter people
  const filteredPeople = useMemo(() => {
    let result = people;
    if (searchQuery) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterGender !== 'all') {
      result = result.filter(p => p.gender === filterGender);
    }
    return result;
  }, [people, searchQuery, filterGender]);

  // Enhanced tree node renderer
  const renderNode = (node: TreeNode, idx: number) => {
    const isMale = node.gender === 'M';
    const isSelected = selectedPerson?.id === node.id;
    const isHovered = isHoveringCard === node.id;
    const radius = isSelected ? 42 : isHovered ? 40 : 38;

    return (
      <g key={node.id}>
        <defs>
          <radialGradient id={`grad-${node.id}`} cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor={isMale ? '#818cf8' : '#f9a8d4'} />
            <stop offset="100%" stopColor={isMale ? '#4f46e5' : '#ec4899'} />
          </radialGradient>
          <filter id={`glow-${node.id}`}>
            <feGaussianBlur stdDeviation={isSelected ? "6" : "4"} result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={`shadow-${node.id}`}>
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Connection lines with curves */}
        {node.connections.map((conn, i) => {
          const prevNode = treeNodes[idx - 1];
          if (!prevNode) return null;
          return (
            <path
              key={`line-${idx}-${i}`}
              d={`M ${prevNode.x} ${prevNode.y + 45} C ${prevNode.x} ${prevNode.y + 70}, ${node.x} ${node.y - 70}, ${node.x} ${node.y - 45}`}
              fill="none"
              stroke="url(#lineGrad)"
              strokeWidth="2.5"
              strokeOpacity={isSelected || isHovered ? "0.8" : "0.3"}
              filter={`url(#glow-${node.id})`}
            />
          );
        })}

        {/* Node group */}
        <g
          onClick={() => setSelectedPerson(node)}
          onMouseEnter={() => setIsHoveringCard(node.id)}
          onMouseLeave={() => setIsHoveringCard(null)}
          style={{ cursor: 'pointer' }}
          transform={`translate(${node.x}, ${node.y})`}
        >
          {/* Outer glow ring */}
          <circle
            r={radius + 8}
            fill="transparent"
            stroke={isMale ? '#6366f1' : '#ec4899'}
            strokeWidth="2"
            strokeOpacity={isSelected ? "0.6" : isHovered ? "0.4" : "0.15"}
            filter={`url(#glow-${node.id})`}
          />

          {/* Main circle */}
          <circle
            r={radius}
            fill={isSelected ? `url(#grad-${node.id})` : isMale ? '#1e1b4b' : '#4c1d4d'}
            stroke={isMale ? '#818cf8' : '#f472b6'}
            strokeWidth={isSelected ? 4 : isHovered ? 3 : 2.5}
            strokeOpacity={isSelected ? 1 : 0.6}
            filter={`url(#shadow-${node.id})`}
          />

          {/* Inner icon/text */}
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fill="white"
            fontSize="22"
            y="-4"
          >
            {isMale ? '👨‍🎓' : '👩‍🎓'}
          </text>

          {/* Name label */}
          <text
            y="60"
            textAnchor="middle"
            fill={isSelected ? '#e2e8f0' : '#cbd5e1'}
            fontSize={isSelected ? "12" : "11"}
            fontWeight={isSelected ? '700' : '600'}
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
          >
            {node.name.length > 18 ? node.name.slice(0, 15) + '...' : node.name}
          </text>

          {/* Year label */}
          {(node.birthyear || node.deathyear) && (
            <text
              y="75"
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="9"
              fontWeight="500"
            >
              {node.birthyear || '?'}{node.birthyear && node.deathyear ? ' - ' : ''}{node.deathyear || ''}
            </text>
          )}
        </g>
      </g>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.1, scale: 1 }}
            transition={{ duration: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.08, scale: 1.2 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 blur-3xl"
          />
        </div>

        {/* Loading spinner */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotate: -180 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 100 }}
          className="relative z-10"
        >
          <div className="relative">
            {/* Outer ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="w-20 h-20 rounded-full border-2 border-transparent border-t-bible-accent/40 border-r-bible-accent/20"
            />
            {/* Inner ring */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-3 w-14 h-14 rounded-full border-2 border-transparent border-b-bible-accent/60 border-l-bible-accent/30"
            />
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Users className="w-7 h-7 text-bible-accent" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Loading text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center z-10"
        >
          <p className="text-sm font-semibold text-bible-text mb-1">
            Carregando genealogia...
          </p>
          <p className="text-xs text-bible-text-muted">
            Buscando dados bíblicos
          </p>
        </motion.div>

        {/* Sparkles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              x: [0, (Math.random() - 0.5) * 200],
              y: [0, (Math.random() - 0.5) * 200]
            }}
            transition={{
              duration: 2 + Math.random(),
              repeat: Infinity,
              delay: i * 0.3
            }}
            className="absolute"
            style={{
              left: `${30 + Math.random() * 40}%`,
              top: `${30 + Math.random() * 40}%`
            }}
          >
            <Sparkles className="w-4 h-4 text-bible-accent/40" />
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f]" ref={containerRef}>
      {/* Ambient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            opacity: [0.03, 0.06, 0.03],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-indigo-600/20 to-purple-600/20 blur-3xl"
        />
        <motion.div
          animate={{
            opacity: [0.04, 0.07, 0.04],
            scale: [1, 1.15, 1]
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-pink-600/20 to-rose-600/20 blur-3xl"
        />
      </div>

      {/* Header Premium */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="shrink-0 relative overflow-hidden"
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-transparent" />
        <div className="absolute inset-0 border-b border-white/5" />

        <div className="relative px-6 py-6">
          {/* Title section */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-2.5 mb-3"
              >
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  >
                    <Crown className="w-4 h-4 text-amber-400" />
                  </motion.div>
                  <div className="absolute inset-0 w-4 h-4 bg-amber-400/30 rounded-full blur-md" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400/90">
                  Genealogia
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/80"
              >
                Pessoas Bíblicas
              </motion.h1>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 mt-2"
              >
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
                  <Users className="w-3 h-3 text-bible-accent" />
                  <span className="text-xs font-semibold text-white/70">
                    {people.length} {people.length === 1 ? 'pessoa' : 'pessoas'}
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Close button */}
            {onClose && (
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="relative group p-2.5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all"
              >
                <X className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
              </motion.button>
            )}
          </div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="relative mb-3"
          >
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-white/40" />
            </div>
            <input
              type="text"
              placeholder="Buscar pessoa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-bible-accent/50 focus:border-bible-accent/50 transition-all"
            />
            <AnimatePresence>
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="w-4 h-4 text-white/40 hover:text-white/70" />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Gender filter */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-2 p-1.5 rounded-xl bg-black/30 backdrop-blur-sm border border-white/5"
          >
            {[
              { id: 'all' as const, label: 'Todos', icon: Users },
              { id: 'M' as const, label: 'Homens', icon: Heart },
              { id: 'F' as const, label: 'Mulheres', icon: Star },
            ].map((filter, idx) => (
              <motion.button
                key={filter.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFilterGender(filter.id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold transition-all relative overflow-hidden',
                  filterGender === filter.id
                    ? 'text-white'
                    : 'text-white/40 hover:text-white/70'
                )}
              >
                {filterGender === filter.id && (
                  <motion.div
                    layoutId="genderFilter"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-500/90 to-purple-500/90 rounded-lg"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <filter.icon className={cn(
                  'w-3.5 h-3.5 relative z-10',
                  filter.id === 'M' && filterGender === filter.id && 'text-blue-200',
                  filter.id === 'F' && filterGender === filter.id && 'text-pink-200'
                )} />
                <span className="relative z-10">{filter.label}</span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* View Mode Tabs */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="shrink-0 px-6 py-3 relative"
      >
        <div className="flex gap-2 p-1 rounded-xl bg-black/30 backdrop-blur-sm border border-white/5">
          {[
            { id: 'list' as const, label: 'Lista', icon: List },
            { id: 'tree' as const, label: 'Árvore', icon: TreePine },
          ].map((mode) => (
            <motion.button
              key={mode.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setViewMode(mode.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all relative overflow-hidden',
                viewMode === mode.id
                  ? 'text-white'
                  : 'text-white/40 hover:text-white/70'
              )}
            >
              {viewMode === mode.id && (
                <motion.div
                  layoutId="viewModeTab"
                  className="absolute inset-0 bg-gradient-to-r from-bible-accent/90 to-bible-accent-strong/90 rounded-lg"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <mode.icon className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{mode.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto relative">
        <AnimatePresence mode="wait">
          {viewMode === 'tree' ? (
            <motion.div
              key="tree-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full overflow-auto"
            >
              <svg
                width={Math.max(dimensions.width, treeNodes.length > 0 ? Math.max(...treeNodes.map(n => n.x)) + 250 : 900)}
                height={Math.max(dimensions.height, treeNodes.length > 0 ? Math.max(...treeNodes.map(n => n.y)) + 250 : 700)}
                className="min-w-[900px] min-h-[700px]"
              >
                <defs>
                  <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity="0.8" />
                  </linearGradient>
                  <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                    <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  </pattern>
                </defs>

                {/* Background grid */}
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Tree nodes */}
                {treeNodes.map(renderNode)}

                {/* Empty state */}
                {!treeNodes.length && (
                  <text
                    x={dimensions.width / 2}
                    y={dimensions.height / 2}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.3)"
                    fontSize="16"
                    fontWeight="500"
                  >
                    Nenhuma genealogia encontrada
                  </text>
                )}
              </svg>
            </motion.div>
          ) : (
            <motion.div
              key="list-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full overflow-y-auto p-4"
            >
              {filteredPeople.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16 px-4"
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="inline-flex p-5 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 mb-5"
                  >
                    <Users className="w-10 h-10 text-white/40" />
                  </motion.div>
                  <h3 className="text-base font-bold text-white/80 mb-2">
                    {searchQuery ? 'Nenhuma pessoa encontrada' : 'Nenhuma pessoa ainda'}
                  </h3>
                  <p className="text-xs text-white/40">
                    {searchQuery ? 'Tente outra busca' : 'Carregando dados...'}
                  </p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <AnimatePresence>
                    {filteredPeople.map((person, idx) => {
                      const isMale = person.gender === 'M';
                      const isSelected = selectedPerson?.id === person.id;
                      return (
                        <motion.button
                          key={person.id || idx}
                          initial={{ opacity: 0, y: 15, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ delay: idx * 0.04 }}
                          whileHover={{ scale: 1.02, y: -3 }}
                          whileTap={{ scale: 0.98 }}
                          onMouseEnter={() => setIsHoveringCard(person.id)}
                          onMouseLeave={() => setIsHoveringCard(null)}
                          onClick={() => setSelectedPerson(person)}
                          className={cn(
                            'relative overflow-hidden rounded-2xl p-4 text-left transition-all group',
                            'backdrop-blur-sm border',
                            isSelected
                              ? 'bg-gradient-to-br from-white/10 to-white/5 border-bible-accent/50 shadow-lg shadow-bible-accent/20'
                              : 'bg-gradient-to-br from-white/5 to-white/3 border-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-white/5'
                          )}
                        >
                          {/* Hover glow effect */}
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: isHoveringCard === person.id ? 0.1 : 0 }}
                            className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500"
                          />

                          <div className="relative z-10">
                            <div className="flex items-start gap-3.5">
                              {/* Avatar */}
                              <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className={cn(
                                  'w-14 h-14 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden',
                                  'border border-white/10',
                                  isMale
                                    ? 'bg-gradient-to-br from-indigo-500/25 to-blue-500/15'
                                    : 'bg-gradient-to-br from-pink-500/25 to-rose-500/15'
                                )}
                              >
                                <span className="text-2xl">
                                  {isMale ? '👨‍🎓' : '👩‍🎓'}
                                </span>
                                {/* Avatar glow */}
                                <div className={cn(
                                  'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity',
                                  isMale ? 'bg-indigo-500/20' : 'bg-pink-500/20'
                                )} />
                              </motion.div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-bold text-white/90 mb-1.5 truncate group-hover:text-white transition-colors">
                                  {person.name}
                                </h3>

                                {/* Birth/Death year */}
                                {(person.birthyear || person.deathyear) && (
                                  <motion.div
                                    className="flex items-center gap-1.5 text-xs text-white/50 mb-1.5"
                                    whileHover={{ x: 3 }}
                                  >
                                    <Calendar className="w-3.5 h-3.5 text-white/40" />
                                    <span>{person.birthyear || '?'} - {person.deathyear || '?'}</span>
                                  </motion.div>
                                )}

                                {/* Location */}
                                {(person.birthplace || person.deathplace) && (
                                  <motion.div
                                    className="flex items-center gap-1.5 text-xs text-white/50"
                                    whileHover={{ x: 3 }}
                                  >
                                    <MapPin className="w-3.5 h-3.5 text-white/40" />
                                    <span className="truncate">
                                      {person.birthplace || ''}{person.birthplace && person.deathplace ? ' → ' : ''}{person.deathplace || ''}
                                    </span>
                                  </motion.div>
                                )}
                              </div>

                              {/* Arrow */}
                              <motion.div
                                animate={{ x: isSelected ? 4 : 0 }}
                                className="flex-shrink-0 mt-1"
                              >
                                <ChevronRight className={cn(
                                  'w-4 h-4 transition-all',
                                  'text-white/30 group-hover:text-bible-accent',
                                  isSelected && 'text-bible-accent'
                                )} />
                              </motion.div>
                            </div>

                            {/* Verses badge */}
                            {person.verses && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-3 pt-3 border-t border-white/5"
                              >
                                <div className="flex items-center gap-1.5">
                                  <Scroll className="w-3 h-3 text-bible-accent/70" />
                                  <span className="text-[10px] font-medium text-white/40 truncate">
                                    {person.verses.split(',').length} {person.verses.split(',').length === 1 ? 'referência' : 'referências'}
                                  </span>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Detail Panel Premium - Glassmorphism Bottom Sheet */}
      <AnimatePresence>
        {selectedPerson && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPerson(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 z-50"
              style={{ maxHeight: '65vh' }}
            >
              <div className="relative overflow-hidden">
                {/* Gradient border */}
                <div className="absolute inset-0 rounded-t-3xl bg-gradient-to-t from-bible-accent/20 via-transparent to-transparent" />

                {/* Main content */}
                <div className="relative backdrop-blur-2xl bg-gradient-to-t from-[#0a0a0f] via-[#0f0f1a]/95 to-[#0f0f1a]/90 border-t border-white/10 rounded-t-3xl">
                  {/* Handle bar */}
                  <div className="flex justify-center pt-3 pb-2">
                    <div className="w-12 h-1.5 rounded-full bg-white/20" />
                  </div>

                  <div className="overflow-y-auto p-6" style={{ maxHeight: '60vh' }}>
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', delay: 0.1 }}
                          className={cn(
                            'w-16 h-16 rounded-2xl flex items-center justify-center relative overflow-hidden',
                            'border-2 border-white/20 shadow-lg',
                            selectedPerson.gender === 'M'
                              ? 'bg-gradient-to-br from-indigo-500 to-blue-600'
                              : 'bg-gradient-to-br from-pink-500 to-rose-600'
                          )}
                        >
                          <span className="text-3xl">
                            {selectedPerson.gender === 'M' ? '👨‍🎓' : '👩‍🎓'}
                          </span>
                          {/* Glow */}
                          <motion.div
                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className={cn(
                              'absolute inset-0',
                              selectedPerson.gender === 'M' ? 'bg-indigo-400/30' : 'bg-pink-400/30'
                            )}
                          />
                        </motion.div>

                        {/* Name and badge */}
                        <div>
                          <motion.h3
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 }}
                            className="text-xl font-black text-white mb-2"
                          >
                            {selectedPerson.name}
                          </motion.h3>
                          {selectedPerson.tree_id && (
                            <motion.span
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.2 }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-400 border border-amber-500/30"
                            >
                              <Crown className="w-3 h-3" />
                              Árvore #{selectedPerson.tree_id}
                            </motion.span>
                          )}
                        </div>
                      </div>

                      {/* Close button */}
                      <motion.button
                        whileHover={{ scale: 1.15, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedPerson(null)}
                        className="p-2.5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all"
                      >
                        <X className="w-4 h-4 text-white/60" />
                      </motion.button>
                    </div>

                    {/* Info cards grid */}
                    <div className="grid grid-cols-2 gap-4 mb-5">
                      {/* Birth */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-white/5 to-white/3 backdrop-blur-sm border border-white/10"
                      >
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-xl" />
                        <div className="relative">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-lg bg-indigo-500/20">
                              <Calendar className="w-4 h-4 text-indigo-400" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-white/40">Nascimento</p>
                          </div>
                          <p className="text-base font-bold text-white">
                            {selectedPerson.birthyear || '?'
                            }{selectedPerson.birthplace ? (
                              <span className="block text-xs font-medium text-white/60 mt-1">
                                {selectedPerson.birthplace}
                              </span>
                            ) : ''}
                          </p>
                        </div>
                      </motion.div>

                      {/* Death */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-white/5 to-white/3 backdrop-blur-sm border border-white/10"
                      >
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-pink-500/10 to-transparent rounded-full blur-xl" />
                        <div className="relative">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-lg bg-pink-500/20">
                              <MapPin className="w-4 h-4 text-pink-400" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-white/40">Falecimento</p>
                          </div>
                          <p className="text-base font-bold text-white">
                            {selectedPerson.deathyear || '?'
                            }{selectedPerson.deathplace ? (
                              <span className="block text-xs font-medium text-white/60 mt-1">
                                {selectedPerson.deathplace}
                              </span>
                            ) : ''}
                          </p>
                        </div>
                      </motion.div>
                    </div>

                    {/* Verses */}
                    {selectedPerson.verses && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-white/5 to-white/3 backdrop-blur-sm border border-white/10"
                      >
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-bible-accent/10 to-transparent rounded-full blur-2xl" />
                        <div className="relative">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 rounded-lg bg-bible-accent/20">
                              <BookOpen className="w-4 h-4 text-bible-accent" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-white/40">Referências Bíblicas</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedPerson.verses.split(',').map((verse, idx) => (
                              <motion.span
                                key={idx}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 + idx * 0.05 }}
                                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-all"
                              >
                                {verse.trim()}
                              </motion.span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
