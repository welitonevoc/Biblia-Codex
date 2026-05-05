import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BibleService } from '../BibleService';
import {
  Users, List, X, Calendar, MapPin, BookOpen, ChevronRight,
  Search, Minus, Plus, Maximize2, Heart, GitBranch, User,
  History, Pause, Play, ZoomIn, ZoomOut, RotateCcw
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ReaderTooltip } from '../bible/Reader';

function cn(...inputs: (string | boolean | undefined)[]) {
  return twMerge(clsx(inputs));
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
  parent_id?: number;
  parentId?: number;
  children?: Person[];
}

interface TreeNode extends Person {
  x: number;
  y: number;
  generation: number;
  parentId?: number;
  childIds: number[];
  isExpanded: boolean;
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
  const [showTree, setShowTree] = useState(false);
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState<'all' | 'M' | 'F'>('all');
  const [isHoveringCard, setIsHoveringCard] = useState<number | null>(null);
  
  const [centerNode, setCenterNode] = useState<number | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await BibleService.getPeopleData(bookId, chapter, verse);
      const convertedPeople: Person[] = data.map(p => ({
        id: Number(p.id) || 0,
        name: p.name,
        birthyear: p.born ? String(p.born) : undefined,
        deathyear: p.died ? String(p.died) : undefined,
        children: []
      }));
      const peopleWithChildren = buildFamilyTree(convertedPeople);
      setPeople(peopleWithChildren);
      if (convertedPeople.length > 0) {
        const root = findRootPerson(peopleWithChildren);
        setCenterNode(root?.id || convertedPeople[0].id);
        const allIds = new Set<number>();
        collectAllIds(root || convertedPeople[0], allIds);
        setExpandedNodes(allIds);
      }
      setLoading(false);
    }
    loadData();
  }, [bookId, chapter, verse]);

  function buildFamilyTree(data: Person[]): Person[] {
    const map = new Map<number, Person>();
    data.forEach(p => {
      map.set(p.id, { ...p, children: [] });
    });
    
    const roots: Person[] = [];
    map.forEach(p => {
      if (p.parent_id && map.has(p.parent_id)) {
        const parent = map.get(p.parent_id)!;
        parent.children = parent.children || [];
        parent.children.push(p);
      } else {
        roots.push(p);
      }
    });
    
    if (roots.length === 0 && data.length > 0) {
      return data.map(p => ({ ...p, children: [] }));
    }
    
    return roots.length > 0 ? roots : data;
  }

  function findRootPerson(people: Person[]): Person | null {
    return people.find(p => !p.parent_id) || people[0] || null;
  }

  function collectAllIds(person: Person, ids: Set<number>) {
    if (!person) return;
    ids.add(person.id);
    person.children?.forEach(child => collectAllIds(child, ids));
  }

  function flattenTree(person: Person, generation = 0): TreeNode[] {
    const node: TreeNode = {
      ...person,
      x: 0,
      y: 0,
      generation,
      childIds: person.children?.map(c => c.id) || [],
      isExpanded: true
    };
    const result = [node];
    person.children?.forEach(child => {
      result.push(...flattenTree(child, generation + 1));
    });
    return result;
  }

  useEffect(() => {
    if (!people.length || !centerNode) return;

    const root = findRootPerson(people);
    const flatNodes = root ? flattenTree(root) : people.map(p => ({
      ...p,
      x: 0,
      y: 0,
      generation: 0,
      childIds: [],
      isExpanded: true
    }));

    const nodeMap = new Map<number, TreeNode>();
    flatNodes.forEach(n => nodeMap.set(n.id, n));

    flatNodes.forEach(n => {
      if (n.parent_id) {
        const parent = nodeMap.get(n.parent_id);
        if (parent) {
          n.parentId = parent.id;
        }
      }
    });

    setTreeNodes(flatNodes);
  }, [people, centerNode]);

  useEffect(() => {
    if (!treeNodes.length || !dimensions.width || !dimensions.height) return;

    const nodes = [...treeNodes];
    const nodeMap = new Map<number, TreeNode>();
    nodes.forEach(n => nodeMap.set(n.id, n));

    const horizontalGap = 220;
    const verticalGap = 100;
    const startY = 100;

    const rootNode = nodes.find(n => n.id === centerNode);
    if (!rootNode) return;

    const calculateSubtreeWidth = (nodeId: number): number => {
      const node = nodeMap.get(nodeId);
      if (!node) return 0;
      
      const children = node.childIds.filter(id => expandedNodes.has(id));
      if (children.length === 0) return horizontalGap;
      
      const childrenWidth = children.reduce((sum, childId) => {
        const child = nodeMap.get(childId);
        if (!child || !expandedNodes.has(childId)) return sum;
        return sum + calculateSubtreeWidth(childId);
      }, 0);
      
      return Math.max(horizontalGap, childrenWidth);
    };

    const positionNode = (nodeId: number, x: number, y: number) => {
      const node = nodeMap.get(nodeId);
      if (!node) return;
      
      node.x = x;
      node.y = y;
      
      const children = node.childIds.filter(id => expandedNodes.has(id));
      if (children.length === 0) return;
      
      const totalWidth = children.reduce((sum, childId) => {
        return sum + calculateSubtreeWidth(childId);
      }, 0);

      let currentX = x - totalWidth / 2;
      
      children.forEach((childId) => {
        const childWidth = calculateSubtreeWidth(childId);
        positionNode(childId, currentX + childWidth / 2, y + verticalGap);
        currentX += childWidth;
      });
    };

    const centerX = dimensions.width / 2;
    positionNode(rootNode.id, centerX, startY);

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    nodes.forEach(node => {
      if (node.x > 0 && node.y > 0) {
        minX = Math.min(minX, node.x - 100);
        maxX = Math.max(maxX, node.x + 100);
        minY = Math.min(minY, node.y - 40);
        maxY = Math.max(maxY, node.y + 40);
      }
    });

    if (minX !== Infinity && maxX !== -Infinity) {
      const treeContentWidth = maxX - minX;
      const treeContentHeight = maxY - minY;
      const centerOffsetX = (dimensions.width - treeContentWidth) / 2 - minX;
      const centerOffsetY = (dimensions.height - treeContentHeight) / 2 - minY;
      
      nodes.forEach(node => {
        if (node.x > 0 && node.y > 0) {
          node.x += centerOffsetX;
          node.y += Math.max(80, centerOffsetY);
        }
      });
    } else {
      nodes.forEach(node => {
        if (node.id === centerNode) {
          node.x = dimensions.width / 2;
          node.y = dimensions.height / 2;
        }
      });
    }

    setTreeNodes(nodes);
  }, [treeNodes, dimensions, centerNode, expandedNodes, showTree]);

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

  const filteredPeople = useMemo(() => {
    const flattenPeople = (p: Person): Person[] => {
      const arr = [p];
      p.children?.forEach(child => arr.push(...flattenPeople(child)));
      return arr;
    };
    let result = people.flatMap(p => flattenPeople(p));
    
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

  const toggleNode = (nodeId: number) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full relative overflow-hidden bg-[#0a0a0f]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-violet-500/20 via-transparent to-transparent blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-gradient-to-tr from-emerald-500/10 to-transparent blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              >
                <Users className="w-8 h-8 text-violet-400" />
              </motion.div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center shadow-lg shadow-violet-500/50">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
          </div>
        </div>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-sm font-medium text-white/60"
        >
          Carregando registros...
        </motion.p>
      </div>
    );
  }

  const renderConnection = (node: TreeNode) => {
    if (!node.parentId) return null;
    
    const parent = treeNodes.find(n => n.id === node.parentId);
    if (!parent) return null;

    const isVisible = expandedNodes.has(node.id) && expandedNodes.has(parent.id);
    if (!isVisible) return null;

    return (
      <path
        key={`conn-${node.id}`}
        d={`M ${parent.x} ${parent.y + 38} L ${parent.x} ${(parent.y + node.y) / 2} L ${node.x} ${(parent.y + node.y) / 2} L ${node.x} ${node.y - 38}`}
        fill="none"
        stroke="url(#lineGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-80"
      />
    );
  };

  const renderTreeNode = (node: TreeNode) => {
    const isCenter = node.id === centerNode;
    const hasChildren = node.childIds.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isMale = node.gender === 'M';
    const isSelected = selectedPerson?.id === node.id;
    const isVisible = isExpanded || isCenter;

    return (
      <g
        key={node.id}
        style={{ 
          opacity: isVisible ? 1 : 0.3, 
          transition: 'opacity 0.2s ease-out' 
        }}
      >
        {renderConnection(node)}
        
        <g
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPerson(node);
            if (hasChildren) toggleNode(node.id);
          }}
          onMouseEnter={() => setIsHoveringCard(node.id)}
          onMouseLeave={() => setIsHoveringCard(null)}
          style={{ cursor: hasChildren ? 'pointer' : 'default' }}
          transform={`translate(${node.x}, ${node.y})`}
        >
          <defs>
            <linearGradient id={`cardGrad-${node.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isCenter ? '#8b5cf6' : isMale ? '#6366f1' : '#ec4899'} stopOpacity="0.15" />
              <stop offset="100%" stopColor="#1e1b2e" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          
          <rect
            x="-100"
            y="-40"
            width="200"
            height="80"
            rx="20"
            fill="url(#cardGrad)"
            stroke={isCenter ? '#8b5cf6' : isSelected ? '#a78bfa' : 'rgba(255,255,255,0.08)'}
            strokeWidth={isCenter || isSelected ? 2 : 1}
            className="transition-all duration-200"
          />
          
          {isCenter && (
            <>
              <rect
                x="-100"
                y="-40"
                width="200"
                height="80"
                rx="20"
                fill="url(#glowGrad)"
                className="opacity-50"
              />
              <defs>
                <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </radialGradient>
              </defs>
            </>
          )}
          
          <circle
            cx="0"
            cy="-10"
            r="24"
            fill={isMale ? '#4338ca' : '#be185d'}
            opacity="0.3"
          />
          <circle
            cx="0"
            cy="-10"
            r="20"
            fill={isMale ? '#6366f1' : '#ec4899'}
            className="opacity-90"
          />
          
          <text
            x="0"
            y="8"
            textAnchor="middle"
            fill="white"
            fontSize="13"
            fontWeight="700"
            className="tracking-wide"
          >
            {node.name.length > 26 ? node.name.slice(0, 23) + '...' : node.name}
          </text>
          
          {(node.birthyear || node.deathyear) && (
            <text
              x="0"
              y="26"
              textAnchor="middle"
              fill="rgba(255,255,255,0.4)"
              fontSize="10"
            >
              {node.birthyear || '?'} → {node.deathyear || '?'}
            </text>
          )}
          
          {hasChildren && (
            <g transform={`translate(85, 0)`}>
              <circle
                r="16"
                fill={isExpanded ? '#10b981' : 'rgba(255,255,255,0.05)'}
                stroke={isExpanded ? '#34d399' : 'rgba(255,255,255,0.1)'}
                strokeWidth="1.5"
                className="transition-all duration-200"
              />
              <text
                x="0"
                y="5"
                textAnchor="middle"
                fill={isExpanded ? '#065f46' : 'rgba(255,255,255,0.5)'}
                fontSize="12"
                fontWeight="700"
              >
                {isExpanded ? '−' : node.childIds.length}
              </text>
            </g>
          )}
          
          {isCenter && (
            <g transform={`translate(-85, 0)`}>
              <circle r="14" fill="#8b5cf6" />
              <text x="0" y="5" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">★</text>
            </g>
          )}
        </g>
      </g>
    );
  };

  return (
    <div 
      className="flex flex-col h-full relative overflow-hidden"
      style={{ backgroundColor: '#0a0a0f' }}
      ref={containerRef}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-violet-600/10 via-transparent to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-fuchsia-600/8 via-transparent to-transparent blur-3xl" />
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)', 
          backgroundSize: '32px 32px' 
        }} />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="shrink-0 relative z-20 px-6 py-5 border-b border-white/5"
        style={{ backgroundColor: 'rgba(10, 10, 15, 0.8)', backdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-start justify-between mb-5">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-white/10">
                <Users className="w-5 h-5 text-violet-400" />
              </div>
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-violet-400/80">
                Estudo Biográfico
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              {showTree ? 'Linhagem Bíblica' : 'Personagens'}
            </h1>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold text-white/70">
                  {filteredPeople.length} <span className="opacity-50">registros</span>
                </span>
              </div>
            </div>
          </div>
          
          {onClose && (
            <ReaderTooltip label="Fechar">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </ReaderTooltip>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search 
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 transition-colors" 
            />
            <input
              type="text"
              placeholder="Buscar personagem..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all outline-none"
            />
          </div>

          <div className="flex gap-2 shrink-0">
            <div className="flex p-1.5 rounded-xl bg-white/5 border border-white/10">
              {[
                { id: 'all' as const, icon: Users, label: 'Todos' },
                { id: 'M' as const, icon: User, label: 'Homens' },
                { id: 'F' as const, icon: Heart, label: 'Mulheres' },
              ].map((filter) => (
                <ReaderTooltip key={filter.id} label={filter.label}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilterGender(filter.id)}
                    className={cn(
                      'min-w-[44px] min-h-[44px] p-2.5 rounded-lg transition-all duration-200 cursor-pointer',
                      filterGender === filter.id
                        ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30'
                        : 'text-white/50 hover:text-white hover:bg-white/10'
                    )}
                  >
                    <filter.icon className="w-4 h-4" />
                  </motion.button>
                </ReaderTooltip>
              ))}
            </div>

            <div className="flex p-1.5 rounded-xl bg-white/5 border border-white/10">
              {[
                { id: false as const, icon: List, label: 'Lista' },
                { id: true as const, icon: GitBranch, label: 'Árvore' },
              ].map((mode) => (
                <ReaderTooltip key={String(mode.id)} label={mode.label}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowTree(mode.id);
                      if (mode.id) setSelectedPerson(null);
                    }}
                    className={cn(
                      'flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer',
                      showTree === mode.id
                        ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30'
                        : 'text-white/50 hover:text-white hover:bg-white/10'
                    )}
                  >
                    <mode.icon className="w-4 h-4" />
                    <span className="hidden md:inline">{mode.label}</span>
                  </motion.button>
                </ReaderTooltip>
              ))}
            </div>

            {showTree && (
              <div className="flex p-1.5 rounded-xl bg-white/5 border border-white/10 items-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setZoom(z => Math.max(0.3, z - 0.1))}
                  className="min-w-[44px] min-h-[44px] p-2.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
                  aria-label="Diminuir zoom"
                >
                  <Minus className="w-4 h-4" />
                </motion.button>
                <span className="px-3 text-xs font-bold text-violet-400 min-w-[50px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setZoom(z => Math.min(2, z + 0.1))}
                  className="min-w-[44px] min-h-[44px] p-2.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
                  aria-label="Aumentar zoom"
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
                <div className="w-px h-5 bg-white/10 mx-1" />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setZoom(1)}
                  className="min-w-[44px] min-h-[44px] p-2.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
                  aria-label="Resetar zoom"
                >
                  <Maximize2 className="w-4 h-4" />
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <div className="flex-1 overflow-hidden relative">
        {!showTree ? (
          <motion.div
            key="list-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="h-full overflow-y-auto p-6"
          >
            {filteredPeople.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                  <User className="w-10 h-10 text-white/30" />
                </div>
                <p className="text-lg font-bold text-white/80">
                  {searchQuery ? 'Nenhum resultado' : 'Nenhum registro'}
                </p>
                <p className="text-sm text-white/40 mt-2 max-w-[250px]">
                  {searchQuery ? 'Tente buscar por outro nome.' : 'Este versículo não menciona pessoas.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredPeople.map((person, idx) => {
                    const isMale = person.gender === 'M';
                    const isSelected = selectedPerson?.id === person.id;
                    
                    return (
                      <motion.button
                        key={person.id || idx}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.25 }}
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.98 }}
                        onMouseEnter={() => setIsHoveringCard(person.id)}
                        onMouseLeave={() => setIsHoveringCard(null)}
                        onClick={() => setSelectedPerson(person)}
                        className={cn(
                          'w-full flex items-center gap-4 p-5 rounded-2xl text-left transition-all border relative overflow-hidden cursor-pointer',
                          isSelected 
                            ? 'bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 border-violet-500/50' 
                            : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                        )}
                      >
                        <div 
                          className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 relative"
                          style={{ 
                            background: isMale 
                              ? 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)' 
                              : 'linear-gradient(135deg, #9d174d 0%, #ec4899 100%)',
                          }}
                        >
                          <div className="absolute inset-0 bg-white/20 rounded-2xl" />
                          <span className="text-xl font-bold text-white drop-shadow-lg">
                            {isMale ? '♂' : '♀'}
                          </span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold text-white tracking-wide">
                            {person.name}
                          </h3>
                          {(person.birthyear || person.deathyear) && (
                            <div className="flex items-center gap-2 mt-2 text-white/40">
                              <Calendar className="w-3.5 h-3.5" />
                              <span className="text-xs font-medium">
                                {person.birthyear || '?'} → {person.deathyear || '?'}
                              </span>
                            </div>
                          )}
                          {person.verses && (
                            <div className="flex items-center gap-2 mt-2">
                              <BookOpen className="w-3.5 h-3.5 text-violet-400" />
                              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400/80">
                                {person.verses.split(',').length} refs
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="shrink-0 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                          <ChevronRight className="w-4 h-4 text-white/60" />
                        </div>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="tree-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
            onClick={() => setSelectedPerson(null)}
          >
            <svg
              width={dimensions.width}
              height={dimensions.height}
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'center center'
              }}
              className="w-full h-full"
            >
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#a855f7" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#d946ef" stopOpacity="0.4" />
                </linearGradient>
                <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="1" fill="rgba(255,255,255,0.05)" />
                </pattern>
              </defs>
              
              <rect width="100%" height="100%" fill="url(#gridPattern)" />
              
              {treeNodes.filter(n => expandedNodes.has(n.id) || n.id === centerNode).map(renderTreeNode)}
              
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
        )}
      </div>

      <AnimatePresence>
        {selectedPerson && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-40"
            style={{ 
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.8) 100%)',
              backdropFilter: 'blur(8px)'
            }}
            onClick={() => setSelectedPerson(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPerson && (
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 z-50"
          >
            <div 
              className="rounded-t-[32px] p-6 max-h-[85vh] overflow-y-auto border-t border-white/10"
              style={{ 
                background: 'linear-gradient(to top, #0a0a0f 0%, rgba(20, 20, 30, 0.95) 100%)',
                backdropFilter: 'blur(20px)' 
              }}
            >
              <div className="flex justify-center mb-6">
                <div className="w-14 h-1.5 rounded-full bg-white/20" />
              </div>
              
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-5">
                  <div 
                    className="w-20 h-20 rounded-[24px] flex items-center justify-center border-2 relative overflow-hidden"
                    style={{ 
                      background: selectedPerson.gender === 'M' 
                        ? 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)' 
                        : 'linear-gradient(135deg, #9d174d 0%, #ec4899 100%)',
                      borderColor: 'rgba(255,255,255,0.2)'
                    }}
                  >
                    <div className="absolute inset-0 bg-white/20" />
                    <span className="text-4xl font-bold text-white drop-shadow-lg relative z-10">
                      {selectedPerson.gender === 'M' ? '♂' : '♀'}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold tracking-[0.2em] uppercase text-violet-400/80">
                        Personagem Bíblico
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight">
                      {selectedPerson.name}
                    </h2>
                    {selectedPerson.tree_id && (
                      <div className="flex items-center gap-2 mt-2">
                        <GitBranch className="w-3.5 h-3.5 text-violet-400" />
                        <span className="text-xs font-bold text-violet-400/70 uppercase tracking-wider">
                          Linhagem #{selectedPerson.tree_id}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedPerson(null)}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="p-2 rounded-lg bg-emerald-500/20">
                      <Calendar className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Nascimento</span>
                  </div>
                  <p className="text-lg font-bold text-white">
                    {selectedPerson.birthyear || 'Período Desconhecido'}
                  </p>
                  {selectedPerson.birthplace && (
                    <div className="flex items-center gap-2 mt-2 text-white/40">
                      <MapPin className="w-3 h-3" />
                      <span className="text-xs font-medium">{selectedPerson.birthplace}</span>
                    </div>
                  )}
                </div>
                
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="p-2 rounded-lg bg-rose-500/20">
                      <History className="w-4 h-4 text-rose-400" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Falecimento</span>
                  </div>
                  <p className="text-lg font-bold text-white">
                    {selectedPerson.deathyear || 'Período Desconhecido'}
                  </p>
                  {selectedPerson.deathplace && (
                    <div className="flex items-center gap-2 mt-2 text-white/40">
                      <MapPin className="w-3 h-3" />
                      <span className="text-xs font-medium">{selectedPerson.deathplace}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedPerson.verses && (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-violet-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">Referências na Bíblia</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedPerson.verses.split(',').slice(0, 10).map((verse, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 text-white/80 border border-white/5"
                      >
                        {verse.trim()}
                      </span>
                    ))}
                    {selectedPerson.verses.split(',').length > 10 && (
                      <span className="px-3 py-1.5 rounded-lg text-xs text-white/40">
                        +{selectedPerson.verses.split(',').length - 10}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {!showTree && people.length > 1 && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowTree(true)}
                  className="w-full flex items-center justify-center gap-3 p-5 rounded-2xl font-bold uppercase tracking-widest text-sm transition-all cursor-pointer"
                  style={{
                    background: 'linear-gradient(to right, #7c3aed 0%, #db2777 100%)',
                    boxShadow: '0 8px 32px rgba(124, 58, 237, 0.3)'
                  }}
                >
                  <GitBranch className="w-5 h-5" />
                  Ver Árvore Genealógica
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}