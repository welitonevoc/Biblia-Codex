import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BibleService } from '../BibleService';
import {
  Users, List, X, Calendar, MapPin, BookOpen, ChevronRight,
  Search, Minus, Plus, Maximize2, Heart, GitBranch, User,
  History, ZoomIn, ZoomOut, RotateCcw, Network, LayoutGrid,
  Sparkles, Target, Eye, EyeOff
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
  parentId?: number;
  childIds: number[];
  isExpanded: boolean;
  angle?: number;
  radius?: number;
}

interface GenealogyTreeProps {
  bookId: string;
  chapter: number;
  verse: number;
  onClose?: () => void;
}

const BRANCH_COLORS = [
  { main: 'var(--accent-bible)', light: 'rgba(var(--accent-bible-rgb), 0.1)', name: 'Accent' },
  { main: '#f472c6', light: 'rgba(244, 114, 182, 0.1)', name: 'Rosa' },
  { main: '#60a5fa', light: 'rgba(96, 165, 250, 0.1)', name: 'Azul' },
  { main: '#34d399', light: 'rgba(52, 211, 153, 0.1)', name: 'Esmeralda' },
  { main: '#a78bfa', light: 'rgba(167, 139, 250, 0.1)', name: 'Violeta' },
  { main: '#fbbf24', light: 'rgba(251, 191, 36, 0.1)', name: 'Amarelo' },
  { main: '#fb7185', light: 'rgba(251, 113, 133, 0.1)', name: 'Rosa Escuro' },
  { main: '#2dd4bf', light: 'rgba(45, 212, 191, 0.1)', name: 'Teal' },
];

export function GenealogyTree({ bookId, chapter, verse, onClose }: GenealogyTreeProps) {
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [showTree, setShowTree] = useState(false);
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState<'all' | 'M' | 'F'>('all');
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  
  const [centerNode, setCenterNode] = useState<number | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [zoom, setZoom] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return 0.5;
    return 0.85;
  });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredCard, setHoveredCard] = useState<TreeNode | null>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; dist: number } | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await BibleService.getPeopleData(bookId, chapter, verse);
      const convertedPeople: Person[] = data.map((p, idx) => ({
        id: Number(p.id) || idx,
        name: p.name,
        gender: p.gender,
        birthyear: p.born ? String(p.born) : undefined,
        deathyear: p.died ? String(p.died) : undefined,
        tree_id: p.tree_id,
        verses: p.verses,
        parent_id: p.parent_id,
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
    data.forEach(p => map.set(p.id, { ...p, children: [] }));
    
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

  function flattenTree(person: Person): TreeNode[] {
    const node: TreeNode = {
      ...person,
      x: 0,
      y: 0,
      childIds: person.children?.map(c => c.id) || [],
      isExpanded: true
    };
    const result = [node];
    person.children?.forEach(child => {
      result.push(...flattenTree(child));
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
      childIds: [],
      isExpanded: true
    }));

    const nodeMap = new Map<number, TreeNode>();
    flatNodes.forEach(n => nodeMap.set(n.id, n));

    flatNodes.forEach(n => {
      if (n.parent_id) {
        const parent = nodeMap.get(n.parent_id);
        if (parent) n.parentId = parent.id;
      }
    });

    setTreeNodes(flatNodes);
  }, [people, centerNode]);

  useEffect(() => {
    if (!treeNodes.length || !dimensions.width || !dimensions.height) return;

    const nodes = [...treeNodes];
    const nodeMap = new Map<number, TreeNode>();
    nodes.forEach(n => nodeMap.set(n.id, n));

    const rootNode = nodes.find(n => n.id === centerNode);
    if (!rootNode) return;

    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    rootNode.x = centerX;
    rootNode.y = centerY;
    rootNode.radius = 0;
    rootNode.angle = 0;

    const positionChildren = (parentId: number, startAngle: number, radius: number, level: number) => {
      const parent = nodeMap.get(parentId);
      if (!parent) return;

      const visibleChildren = parent.childIds
        .filter(id => expandedNodes.has(id))
        .map(id => nodeMap.get(id))
        .filter(Boolean) as TreeNode[];

      if (visibleChildren.length === 0) return;

      const angleSpread = Math.min(Math.PI * 0.8, Math.PI / (visibleChildren.length + 1));
      const startOffset = -angleSpread * (visibleChildren.length - 1) / 2;
      
      const colorIndex = (level - 1) % BRANCH_COLORS.length;
      
      visibleChildren.forEach((child, idx) => {
        const angle = startAngle + startOffset + idx * angleSpread;
        child.x = centerX + Math.cos(angle) * radius;
        child.y = centerY + Math.sin(angle) * radius;
        child.angle = angle;
        child.radius = radius;
        
        positionChildren(child.id, angle, radius + 120, level + 1);
      });
    };

    positionChildren(rootNode.id, -Math.PI / 2, 140, 1);

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    nodes.forEach(node => {
      if (node.x > 0 && node.y > 0) {
        minX = Math.min(minX, node.x - 100);
        maxX = Math.max(maxX, node.x + 100);
        minY = Math.min(minY, node.y - 50);
        maxY = Math.max(maxY, node.y + 50);
      }
    });

    if (minX !== Infinity) {
      const contentWidth = maxX - minX;
      const contentHeight = maxY - minY;
      const offsetX = (dimensions.width - contentWidth) / 2 - minX;
      const offsetY = (dimensions.height - contentHeight) / 2 - minY;
      
      nodes.forEach(node => {
        if (node.x > 0 && node.y > 0) {
          node.x += offsetX;
          node.y += offsetY;
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
        
        if (window.innerWidth < 768) {
          const isMobileZoom = 0.5;
          if (zoom === 0.85 || zoom === 0.5) {
            setZoom(isMobileZoom);
          }
        }
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
      result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (filterGender !== 'all') {
      result = result.filter(p => p.gender === filterGender);
    }
    return result;
  }, [people, searchQuery, filterGender]);

  const toggleNode = (nodeId: number) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === svgRef.current || (e.target as Element).tagName === 'rect') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(z => Math.max(0.3, Math.min(2.5, z + delta)));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setTouchStart({ x: 0, y: 0, dist });
    } else if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStart) {
      const newDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = newDist / touchStart.dist;
      setZoom(z => Math.max(0.3, Math.min(2.5, z * scale)));
      setTouchStart({ ...touchStart, dist: newDist });
    } else if (e.touches.length === 1 && isDragging) {
      setPan({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setTouchStart(null);
  };

  const resetView = () => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    setZoom(isMobile ? 0.5 : 0.85);
    setPan({ x: 0, y: 0 });
  };

  const getNodeColors = (node: TreeNode, level: number) => {
    const rootIndex = treeNodes.findIndex(n => n.id === centerNode);
    const nodeIndex = treeNodes.findIndex(n => n.id === node.id);
    const colorIndex = (nodeIndex - rootIndex + level) % BRANCH_COLORS.length;
    return BRANCH_COLORS[colorIndex] || BRANCH_COLORS[0];
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full relative overflow-hidden bg-[var(--bg-bible)] dark:bg-slate-950">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-[var(--accent-bible)]/10 blur-[120px] dark:from-pink-500/10" />
          <div className="absolute bottom-1/3 right-1/4 w-[350px] h-[350px] rounded-full bg-violet-500/10 blur-[100px] dark:from-violet-500/10" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl border border-[var(--border-bible)] dark:border-slate-700/50 bg-[var(--surface-overlay)] dark:bg-slate-900/50 backdrop-blur-xl flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="relative"
              >
                <Sparkles className="w-10 h-10 text-[var(--accent-bible)] dark:text-pink-400" />
              </motion.div>
            </div>
          </div>
          
          <div className="mt-8 flex flex-col items-center gap-2">
            <div className="h-1.5 w-32 bg-[var(--surface-2)] dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="h-full bg-gradient-to-r from-[var(--accent-bible)] to-violet-500 dark:from-pink-500 dark:to-violet-500 rounded-full"
              />
            </div>
            <p className="text-sm font-medium text-[var(--text-muted-bible)] dark:text-slate-400">Carregando genealogia...</p>
          </div>
        </div>
      </div>
    );
  }

  const renderConnection = (node: TreeNode) => {
    if (!node.parentId || node.radius === undefined) return null;
    
    const parent = treeNodes.find(n => n.id === node.parentId);
    if (!parent) return null;

    const isVisible = expandedNodes.has(node.id) && expandedNodes.has(parent.id);
    if (!isVisible) return null;

    const colors = getNodeColors(node, 1);
    const isHovered = hoveredNode === node.id || hoveredNode === parent.id;

    const controlOffset = 60;
    const midX = (parent.x + node.x) / 2;
    const midY = (parent.y + node.y) / 2;
    const angle = Math.atan2(node.y - parent.y, node.x - parent.x);
    const ctrl1X = parent.x + Math.cos(angle) * controlOffset;
    const ctrl1Y = parent.y + Math.sin(angle) * controlOffset;
    const ctrl2X = node.x - Math.cos(angle) * controlOffset;
    const ctrl2Y = node.y - Math.sin(angle) * controlOffset;

    return (
      <g key={`conn-${node.id}`}>
        <path
          d={`M ${parent.x} ${parent.y} C ${ctrl1X} ${ctrl1Y}, ${ctrl2X} ${ctrl2Y}, ${node.x} ${node.y}`}
          fill="none"
          stroke={colors.main}
          strokeWidth={isHovered ? 3 : 1.5}
          strokeLinecap="round"
          opacity={isHovered ? 0.9 : 0.4}
          className="transition-all duration-300"
        />
        <circle
          cx={parent.x}
          cy={parent.y}
          r="4"
          fill={colors.main}
          opacity="0.6"
        />
      </g>
    );
  };

  const renderMindMapNode = (node: TreeNode) => {
    const isRoot = node.id === centerNode;
    const hasChildren = node.childIds.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedPerson?.id === node.id;
    const isHovered = hoveredNode === node.id;
    const isVisible = isExpanded || isRoot;
    const isMale = node.gender === 'M';

    const colors = getNodeColors(node, isRoot ? 0 : 1);
    const level = isRoot ? 0 : Math.floor((node.radius || 100) / 120);
    const cardWidth = isRoot ? 180 : Math.max(120, 160 - level * 20);
    const cardHeight = isRoot ? 70 : 56;

    return (
      <g
        key={node.id}
        style={{ 
          opacity: isVisible ? 1 : 0.15, 
          transition: 'opacity 0.3s ease-out' 
        }}
      >
        {renderConnection(node)}
        
        <g
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPerson(node);
            if (hasChildren) toggleNode(node.id);
          }}
          onMouseEnter={() => setHoveredNode(node.id)}
          onMouseLeave={() => setHoveredNode(null)}
          style={{ cursor: hasChildren ? 'pointer' : 'default' }}
          transform={`translate(${node.x}, ${node.y})`}
        >
          <defs>
            <filter id={`shadow-${node.id}`} x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor={colors.main} floodOpacity={isHovered ? 0.4 : 0.2} />
            </filter>
            <linearGradient id={`grad-${node.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isRoot ? '#1e1b4b' : '#0f172a'} stopOpacity="0.95" />
              <stop offset="100%" stopColor={isRoot ? '#1e1b4b' : '#0f172a'} stopOpacity="0.85" />
            </linearGradient>
          </defs>

          <rect
            x={-cardWidth / 2}
            y={-cardHeight / 2}
            width={cardWidth}
            height={cardHeight}
            rx={isRoot ? 24 : 16}
            fill={`url(#grad-${node.id})`}
            stroke={isSelected || isHovered ? colors.main : 'rgba(255,255,255,0.08)'}
            strokeWidth={isSelected || isHovered ? 2 : 1}
            filter={isHovered ? `url(#shadow-${node.id})` : undefined}
            className="transition-all duration-200"
          />

          {isRoot && (
            <rect
              x={-cardWidth / 2}
              y={-cardHeight / 2}
              width={cardWidth}
              height={cardHeight}
              rx={24}
              fill={colors.main}
              opacity="0.15"
            />
          )}

          <circle
            cx={-cardWidth / 2 + 28}
            cy="0"
            r="20"
            fill={colors.light}
            opacity="0.2"
          />
          <text
            x={-cardWidth / 2 + 28}
            y="5"
            textAnchor="middle"
            fill={colors.main}
            fontSize="16"
            fontWeight="700"
          >
            {isMale ? '♂' : '♀'}
          </text>

          <text
            x={-cardWidth / 2 + 56}
            y="5"
            textAnchor="start"
            fill="white"
            fontSize={isRoot ? 13 : 11}
            fontWeight={isRoot ? '700' : '600'}
            className="tracking-wide"
          >
            {node.name.length > 18 ? node.name.slice(0, 15) + '...' : node.name}
          </text>

          {(node.birthyear || node.deathyear) && !isRoot && (
            <text
              x={-cardWidth / 2 + 56}
              y="18"
              textAnchor="start"
              fill="rgba(255,255,255,0.35)"
              fontSize="9"
            >
              {node.birthyear || '?'} → {node.deathyear || '?'}
            </text>
          )}

          {hasChildren && (
            <g transform={`translate(${cardWidth / 2 - 16}, 0)`}>
              <circle
                r="12"
                fill={isExpanded ? colors.main : 'rgba(255,255,255,0.05)'}
                stroke={isExpanded ? colors.main : 'rgba(255,255,255,0.1)'}
                strokeWidth="1.5"
                className="transition-all duration-200"
              />
              <text
                x="0"
                y="4"
                textAnchor="middle"
                fill={isExpanded ? '#fff' : 'rgba(255,255,255,0.5)'}
                fontSize="10"
                fontWeight="700"
              >
                {isExpanded ? '−' : node.childIds.length}
              </text>
            </g>
          )}

          {isRoot && (
            <g transform={`translate(0, ${cardHeight / 2 - 12})`}>
              <text
                x="0"
                y="0"
                textAnchor="middle"
                fill={colors.main}
                fontSize="9"
                fontWeight="600"
              >
                RAIZ
              </text>
            </g>
          )}
        </g>
      </g>
    );
  };

  return (
    <div 
      className="flex flex-col h-full relative overflow-hidden bg-[var(--bg-bible)] dark:bg-[#020617]"
      ref={containerRef}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full bg-gradient-to-bl from-[var(--accent-bible)]/8 via-transparent to-transparent blur-3xl dark:from-pink-600/8" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-violet-600/6 via-transparent to-transparent blur-3xl dark:from-violet-600/6" />
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.015]" style={{
          backgroundImage: 'radial-gradient(var(--text-bible) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="shrink-0 relative z-20 px-2 py-2 border-b border-[var(--border-bible)] dark:border-slate-800/60"
        style={{ backgroundColor: 'rgba(var(--accent-bible-rgb), 0.02)', backdropFilter: 'blur(16px)' }}
      >
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1">
            {onClose && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--text-muted-bible)] dark:text-slate-400 hover:text-[var(--text-bible)] dark:hover:text-white hover:bg-[var(--surface-2)] dark:hover:bg-slate-700/50 transition-all"
                aria-label="Fechar"
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            )}
            
            <span className="text-xs font-bold text-[var(--accent-bible)] dark:text-pink-400">
              {showTree ? 'Mapa' : 'Personagens'}
            </span>
            
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface-2)] dark:bg-slate-800 text-[var(--text-muted-bible)] dark:text-slate-400">
              {filteredPeople.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <div className="flex rounded-md bg-[var(--surface-1)] dark:bg-slate-900/50 border border-[var(--border-bible)] dark:border-slate-700/50 overflow-hidden">
              {[
                { id: 'all' as const, icon: Users },
                { id: 'M' as const, icon: User },
                { id: 'F' as const, icon: Heart },
              ].map((filter) => (
                <motion.button
                  key={filter.id}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setFilterGender(filter.id)}
                  className={cn(
                    'w-7 h-7 flex items-center justify-center transition-all',
                    filterGender === filter.id
                      ? 'bg-[var(--accent-bible)] dark:bg-pink-600 text-white'
                      : 'text-[var(--text-muted-bible)] dark:text-slate-400 hover:bg-[var(--surface-2)] dark:hover:bg-slate-800'
                  )}
                  aria-label={filter.id === 'all' ? 'Todos' : filter.id === 'M' ? 'Homens' : 'Mulheres'}
                >
                  <filter.icon className="w-3.5 h-3.5" />
                </motion.button>
              ))}
            </div>

            <div className="flex rounded-md bg-[var(--surface-1)] dark:bg-slate-900/50 border border-[var(--border-bible)] dark:border-slate-700/50 overflow-hidden">
              {[
                { id: false as const, icon: LayoutGrid },
                { id: true as const, icon: Network },
              ].map((mode) => (
                <motion.button
                  key={String(mode.id)}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setShowTree(mode.id);
                    if (mode.id) setSelectedPerson(null);
                  }}
                  className={cn(
                    'w-7 h-7 flex items-center justify-center transition-all',
                    showTree === mode.id
                      ? 'bg-[var(--accent-bible)] dark:bg-pink-600 text-white'
                      : 'text-[var(--text-muted-bible)] dark:text-slate-400 hover:bg-[var(--surface-2)] dark:hover:bg-slate-800'
                  )}
                  aria-label={mode.id ? 'Mapa' : 'Cards'}
                >
                  <mode.icon className="w-3.5 h-3.5" />
                </motion.button>
              ))}
            </div>

            {showTree && (
              <div className="flex items-center gap-0.5">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setZoom(z => Math.max(0.3, z - 0.2))}
                  className="w-6 h-6 flex items-center justify-center text-[var(--text-muted-bible)] dark:text-slate-400 hover:text-[var(--text-bible)] dark:hover:text-white rounded hover:bg-[var(--surface-2)] dark:hover:bg-slate-800"
                  aria-label="Zoom -"
                >
                  <Minus className="w-3 h-3" />
                </motion.button>
                <span className="text-[9px] font-bold text-[var(--accent-bible)] dark:text-pink-400 min-w-[28px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setZoom(z => Math.min(2.5, z + 0.2))}
                  className="w-6 h-6 flex items-center justify-center text-[var(--text-muted-bible)] dark:text-slate-400 hover:text-[var(--text-bible)] dark:hover:text-white rounded hover:bg-[var(--surface-2)] dark:hover:bg-slate-800"
                  aria-label="Zoom +"
                >
                  <Plus className="w-3 h-3" />
                </motion.button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-1">
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-2 py-1 rounded text-[10px] bg-[var(--surface-1)] dark:bg-slate-900/50 border border-[var(--border-bible)] dark:border-slate-700/50 text-[var(--text-bible)] dark:text-white placeholder:text-[var(--text-subtle-bible)] dark:placeholder:text-slate-500 focus:border-[var(--accent-bible)]/50 dark:focus:border-pink-500/50 outline-none"
          />
        </div>
      </motion.div>

      <div className="flex-1 overflow-hidden relative">
        {!showTree ? (
          <motion.div
            key="grid-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="h-full overflow-y-auto p-5"
          >
            {filteredPeople.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-28">
                <div className="w-20 h-20 rounded-2xl bg-slate-800/30 border border-slate-700/30 flex items-center justify-center mb-4">
                  <User className="w-8 h-8 text-slate-500" />
                </div>
                <p className="text-base font-semibold text-slate-300">
                  {searchQuery ? 'Nenhum resultado encontrado' : 'Nenhum registro encontrado'}
                </p>
                <p className="text-sm text-slate-500 mt-1.5 max-w-[220px] text-center">
                  {searchQuery ? 'Tente buscar por outro nome' : 'Este versículo não menciona pessoas'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                <AnimatePresence mode="popLayout">
                  {filteredPeople.map((person, idx) => {
                    const isMale = person.gender === 'M';
                    const isSelected = selectedPerson?.id === person.id;
                    const nodeColor = isMale ? '#f472c6' : '#60a5fa';
                    
                    return (
                      <motion.button
                        key={person.id || idx}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedPerson(person)}
                        className={cn(
                          'flex flex-col items-center p-4 rounded-2xl text-center transition-all border cursor-pointer relative overflow-hidden',
                          isSelected 
                            ? 'bg-slate-800/80 border-pink-500/50' 
                            : 'bg-slate-900/40 border-slate-800/50 hover:border-slate-700/50 hover:bg-slate-800/30'
                        )}
                      >
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center mb-2 relative"
                          style={{ 
                            background: `linear-gradient(135deg, ${nodeColor}44 0%, ${nodeColor}22 100%)`,
                            boxShadow: `0 0 20px ${nodeColor}22`
                          }}
                        >
                          <span className="text-lg font-bold" style={{ color: nodeColor }}>
                            {isMale ? '♂' : '♀'}
                          </span>
                          {isSelected && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-pink-500 border-2 border-slate-900" />
                          )}
                        </div>
                        
                        <h3 className="text-sm font-bold text-white tracking-tight line-clamp-2">
                          {person.name}
                        </h3>
                        
                        {(person.birthyear || person.deathyear) && (
                          <p className="text-[10px] text-slate-500 mt-1 font-medium">
                            {person.birthyear || '?'} → {person.deathyear || '?'}
                          </p>
                        )}
                        
                        {person.verses && (
                          <div className="mt-2 px-2 py-0.5 rounded bg-slate-800/50">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                              {person.verses.split(',').length} refs
                            </span>
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="mindmap-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <svg
              ref={svgRef}
              width={dimensions.width}
              height={dimensions.height}
              className="w-full h-full"
            >
              <defs>
                <pattern id="mindmapGrid" width="25" height="25" patternUnits="userSpaceOnUse">
                  <circle cx="12.5" cy="12.5" r="0.5" fill="rgba(255,255,255,0.02)" />
                </pattern>
              </defs>
              
              <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                <rect 
                  x={-2000} 
                  y={-2000} 
                  width="4000" 
                  height="4000" 
                  fill="url(#mindmapGrid)" 
                />
                
                {treeNodes
                  .filter(n => expandedNodes.has(n.id) || n.id === centerNode)
                  .map(renderMindMapNode)
                }
                
                {!treeNodes.length && (
                  <text
                    x={dimensions.width / 2 / zoom}
                    y={dimensions.height / 2 / zoom}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.2)"
                    fontSize="16"
                    fontWeight="500"
                  >
                    Nenhuma genealogia encontrada
                  </text>
                )}
              </g>
            </svg>

            {hoveredNode !== null && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700/50 backdrop-blur-xl">
                <p className="text-sm font-semibold text-white">
                  {treeNodes.find(n => n.id === hoveredNode)?.name}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Clique para expandir ou ver detalhes
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {selectedPerson && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 z-40 flex items-center justify-center p-4"
            style={{ 
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)'
            }}
            onClick={() => setSelectedPerson(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md relative"
              onClick={(e) => e.stopPropagation()}
            >
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center border border-[var(--border-bible)] dark:border-slate-700"
                    style={{ 
                      background: selectedPerson.gender === 'M' 
                        ? 'linear-gradient(135deg, var(--accent-bible) 0%, #f472c6 100%)' 
                        : 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)'
                    }}
                  >
                    <span className="text-xl font-bold text-white">
                      {selectedPerson.gender === 'M' ? '♂' : '♀'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[var(--accent-bible)] dark:text-pink-400/70">
                      Personagem
                    </span>
                    <h2 className="text-lg font-bold text-[var(--text-bible)] dark:text-white">
                      {selectedPerson.name}
                    </h2>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedPerson(null)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted-bible)] dark:text-slate-400 hover:text-[var(--text-bible)] dark:hover:text-white hover:bg-[var(--surface-2)] dark:hover:bg-slate-800 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </motion.button>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="p-3 rounded-lg bg-[var(--surface-1)] dark:bg-slate-900/50 border border-[var(--border-bible)] dark:border-slate-800/50">
                  <span className="text-[9px] uppercase text-[var(--text-subtle-bible)] dark:text-slate-500">Nascimento</span>
                  <p className="text-sm font-bold text-[var(--text-bible)] dark:text-white">
                    {selectedPerson.birthyear || '—'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-[var(--surface-1)] dark:bg-slate-900/50 border border-[var(--border-bible)] dark:border-slate-800/50">
                  <span className="text-[9px] uppercase text-[var(--text-subtle-bible)] dark:text-slate-500">Falecimento</span>
                  <p className="text-sm font-bold text-[var(--text-bible)] dark:text-white">
                    {selectedPerson.deathyear || '—'}
                  </p>
                </div>
              </div>

              {selectedPerson.verses && (
                <div className="p-2.5 rounded-lg bg-[var(--surface-1)] dark:bg-slate-900/50 border border-[var(--border-bible)] dark:border-slate-800/50 mb-3">
                  <span className="text-[9px] uppercase text-[var(--text-subtle-bible)] dark:text-slate-500">Referências</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedPerson.verses.split(',').slice(0, 4).map((verse, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-[var(--surface-2)] dark:bg-slate-800 text-[var(--text-bible)] dark:text-slate-300">
                        {verse.trim()}
                      </span>
                    ))}
                    {selectedPerson.verses.split(',').length > 4 && (
                      <span className="text-[10px] text-[var(--text-subtle-bible)] dark:text-slate-500">
                        +{selectedPerson.verses.split(',').length - 4}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {!showTree && people.length > 1 && (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowTree(true)}
                  className="w-full p-2.5 rounded-lg font-bold text-xs text-white text-center"
                  style={{ background: 'linear-gradient(to right, var(--accent-bible), #7c3aed)' }}
                >
                  Ver Mapa
                </motion.button>
              )}
            </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
}