import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BibleService } from '../BibleService';
import {
  Users, TreePine, List, X, Calendar, MapPin,
  BookOpen, ChevronRight, Search, Minus, Plus,
  Maximize2, Heart, Star, GitBranch
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
  parent_id?: number;
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

interface NodeComponent {
  node: TreeNode;
  x: number;
  y: number;
  onToggle: (id: number) => void;
  onSelect: (person: Person) => void;
  isSelected: boolean;
  isHovered: boolean | null;
  onHover: (id: number | null) => void;
  isExpanded: boolean;
  centerNode: number | null;
}

const MindMapNode = ({ node, x, y, onToggle, onSelect, isSelected, isHovered, onHover, isExpanded, centerNode }: NodeComponent) => {
  const isCenter = node.id === centerNode;
  const hasChildren = node.childIds.length > 0;
  const isMale = node.gender === 'M';
  
  const nodeWidth = isCenter ? 180 : 150;
  const nodeHeight = isCenter ? 70 : 60;
  
  return (
    <g
      transform={`translate(${x - nodeWidth/2}, ${y - nodeHeight/2})`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node);
        if (hasChildren) onToggle(node.id);
      }}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      style={{ cursor: hasChildren ? 'pointer' : 'default' }}
    >
      <defs>
        <filter id={`shadow-${node.id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="#000" floodOpacity="0.4" />
        </filter>
        <linearGradient id={`grad-${node.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isCenter ? '#f59e0b' : isMale ? '#3b82f6' : '#8b5cf6'} stopOpacity="0.9" />
          <stop offset="100%" stopColor={isCenter ? '#d97706' : isMale ? '#1d4ed8' : '#6d28d9'} stopOpacity="0.95" />
        </linearGradient>
      </defs>
      
      <rect
        width={nodeWidth}
        height={nodeHeight}
        rx="8"
        fill={`url(#grad-${node.id})`}
        stroke={isSelected ? '#fff' : isCenter ? '#fbbf24' : isMale ? '#60a5fa' : '#a78bfa'}
        strokeWidth={isSelected ? 3 : isCenter ? 2 : 1.5}
        filter={`url(#shadow-${node.id})`}
        className="transition-all duration-200"
      />
      
      <text
        x={nodeWidth / 2}
        y={nodeHeight / 2 - 8}
        textAnchor="middle"
        fill="#fff"
        fontSize={isCenter ? "14" : "12"}
        fontWeight={isCenter ? "700" : "600"}
      >
        {node.name.length > 20 ? node.name.slice(0, 17) + '...' : node.name}
      </text>
      
      {(node.birthyear || node.deathyear) && (
        <text
          x={nodeWidth / 2}
          y={nodeHeight / 2 + 12}
          textAnchor="middle"
          fill="rgba(255,255,255,0.7)"
          fontSize="10"
        >
          {node.birthyear || '?'} — {node.deathyear || '?'}
        </text>
      )}
      
      {hasChildren && (
        <g transform={`translate(${nodeWidth - 8}, ${-8})`}>
          <circle
            r="14"
            fill={isExpanded ? '#22c55e' : '#64748b'}
            stroke={isExpanded ? '#4ade80' : '#94a3b8'}
            strokeWidth="1.5"
          />
          <text
            x="0"
            y="4"
            textAnchor="middle"
            fill="#fff"
            fontSize="12"
            fontWeight="700"
          >
            {isExpanded ? '−' : node.childIds.length}
          </text>
        </g>
      )}
      
      {isCenter && (
        <g transform={`translate(8, ${-8})`}>
          <circle r="12" fill="#fbbf24" />
          <text x="0" y="4" textAnchor="middle" fill="#000" fontSize="10" fontWeight="700">⚜</text>
        </g>
      )}
    </g>
  );
};

export function GenealogyTree({ bookId, chapter, verse, onClose }: GenealogyTreeProps) {
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState<'all' | 'M' | 'F'>('all');
  const [isHoveringCard, setIsHoveringCard] = useState<number | null>(null);
  
  const [centerNode, setCenterNode] = useState<number | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await BibleService.getPeopleData(bookId, chapter, verse);
      const peopleWithChildren = buildFamilyTree(data);
      setPeople(peopleWithChildren);
      if (data.length > 0) {
        const root = findRootPerson(peopleWithChildren);
        setCenterNode(root?.id || data[0].id);
        const allIds = new Set<number>();
        collectAllIds(root || data[0], allIds);
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

    const horizontalGap = 180;
    const verticalGap = 100;
    const startY = 60;

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
      
      let currentX = x - totalWidth / 2 + calculateSubtreeWidth(children[0]) / 2;
      
      children.forEach((childId, idx) => {
        const childWidth = calculateSubtreeWidth(childId);
        positionNode(childId, currentX, y + verticalGap);
        currentX += childWidth;
      });
    };

    const treeWidth = calculateSubtreeWidth(rootNode.id);
    const centerX = dimensions.width / 2;
    positionNode(rootNode.id, centerX, startY);

    setTreeNodes(nodes);
  }, [treeNodes, dimensions, centerNode, expandedNodes]);

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
    let result = people;
    const flattenPeople = (p: Person): Person[] => {
      const arr = [p];
      p.children?.forEach(child => arr.push(...flattenPeople(child)));
      return arr;
    };
    result = people.flatMap(p => flattenPeople(p));
    
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

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as Element).tagName === 'svg' || (e.target as Element).tagName === 'rect') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full relative overflow-hidden bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl" />
        </div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <div className="w-16 h-16 rounded-2xl border border-slate-700 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <GitBranch className="w-6 h-6 text-blue-500" />
            </motion.div>
          </div>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-sm font-medium text-slate-400"
        >
          Construindo mind map...
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

    const midY = (parent.y + node.y) / 2;
    
    return (
      <path
        key={`conn-${node.id}`}
        d={`M ${parent.x} ${parent.y + 30} L ${parent.x} ${midY} L ${node.x} ${midY} L ${node.x} ${node.y - 30}`}
        fill="none"
        stroke="#475569"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-opacity duration-300"
      />
    );
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" ref={containerRef}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-blue-500/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-violet-500/3 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="shrink-0 relative px-4 py-4 z-10"
      >
        <div className="absolute inset-0 border-b border-slate-800/50" />
        
        <div className="relative">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <GitBranch className="w-4 h-4 text-blue-500" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-blue-500/80">
                  Genealogy
                </span>
              </div>
              <h1 className="text-lg font-semibold text-slate-100">
                Árvore Genealógica
              </h1>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-800/50 border border-slate-700/50">
                  <Users className="w-3 h-3 text-slate-400" />
                  <span className="text-xs text-slate-400">
                    {filteredPeople.length} pessoas
                  </span>
                </div>
              </div>
            </div>
            {onClose && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </motion.button>
            )}
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-slate-600/50 transition-colors"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <div className="flex gap-0.5 p-1 rounded-lg bg-slate-800/50 border border-slate-700/50">
              {[
                { id: 'all' as const, icon: Users },
                { id: 'M' as const, icon: Heart },
                { id: 'F' as const, icon: Star },
              ].map((filter) => (
                <motion.button
                  key={filter.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilterGender(filter.id)}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    filterGender === filter.id
                      ? 'bg-slate-700 text-slate-100'
                      : 'text-slate-500 hover:text-slate-300'
                  )}
                >
                  <filter.icon className="w-3.5 h-3.5" />
                </motion.button>
              ))}
            </div>

            <div className="flex gap-0.5 p-1 rounded-lg bg-slate-800/50 border border-slate-700/50">
              {[
                { id: 'tree' as const, icon: GitBranch, label: 'Mapa' },
                { id: 'list' as const, icon: List, label: 'Lista' },
              ].map((mode) => (
                <motion.button
                  key={mode.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode(mode.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors',
                    viewMode === mode.id
                      ? 'bg-slate-700 text-slate-100'
                      : 'text-slate-500 hover:text-slate-300'
                  )}
                >
                  <mode.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{mode.label}</span>
                </motion.button>
              ))}
            </div>

            <div className="flex gap-0.5 p-1 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setZoom(z => Math.max(0.3, z - 0.1))}
                className="p-2 rounded-md text-slate-500 hover:text-slate-300 transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </motion.button>
              <span className="px-2 py-1.5 text-xs text-slate-400 font-medium">
                {Math.round(zoom * 100)}%
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setZoom(z => Math.min(2, z + 0.1))}
                className="p-2 rounded-md text-slate-500 hover:text-slate-300 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
                className="p-2 rounded-md text-slate-500 hover:text-slate-300 transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {viewMode === 'tree' ? (
            <motion.div
              key="tree-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onClick={() => setSelectedPerson(null)}
            >
              <svg
                width={dimensions.width}
                height={dimensions.height}
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: 'center top'
                }}
                className="w-full h-full"
              >
                <defs>
                  <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <circle cx="15" cy="15" r="1" fill="rgba(255,255,255,0.03)" />
                  </pattern>
                  <radialGradient id="bgGlow" cx="50%" cy="0%" r="80%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </radialGradient>
                </defs>
                
                <rect width="100%" height="100%" fill="url(#grid)" />
                
                {centerNode && (
                  <rect
                    x={dimensions.width / 2 - 400}
                    y="0"
                    width="800"
                    height={dimensions.height}
                    fill="url(#bgGlow)"
                  />
                )}
                
                {treeNodes.map(renderConnection)}
                
                {treeNodes.filter(n => expandedNodes.has(n.id) || n.id === centerNode).map(node => (
                  <MindMapNode
                    key={node.id}
                    node={node}
                    x={node.x}
                    y={node.y}
                    onToggle={toggleNode}
                    onSelect={setSelectedPerson}
                    isSelected={selectedPerson?.id === node.id}
                    isHovered={isHoveringCard}
                    onHover={setIsHoveringCard}
                    isExpanded={expandedNodes.has(node.id)}
                    centerNode={centerNode}
                  />
                ))}
                
                {!treeNodes.length && (
                  <text
                    x={dimensions.width / 2}
                    y={dimensions.height / 2}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="14"
                  >
                    Nenhuma genealogia encontrada
                  </text>
                )}
              </svg>
            </motion.div>
          ) : (
            <motion.div
              key="list-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full overflow-y-auto p-4"
            >
              {filteredPeople.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">
                    {searchQuery ? 'Nenhuma pessoa encontrada' : 'Nenhuma pessoa'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <AnimatePresence>
                    {filteredPeople.map((person, idx) => {
                      const isMale = person.gender === 'M';
                      const isSelected = selectedPerson?.id === person.id;
                      
                      return (
                        <motion.button
                          key={person.id || idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onMouseEnter={() => setIsHoveringCard(person.id)}
                          onMouseLeave={() => setIsHoveringCard(null)}
                          onClick={() => setSelectedPerson(person)}
                          className={cn(
                            'relative flex items-center gap-3 p-3 rounded-xl text-left transition-all',
                            'border',
                            isSelected
                              ? 'bg-slate-800/60 border-slate-600/50'
                              : 'bg-slate-800/30 border-slate-800/30 hover:border-slate-700/50'
                          )}
                        >
                          <div className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                            'bg-slate-800/50 border border-slate-700/50'
                          )}>
                            <span className="text-base">{isMale ? '♂' : '♀'}</span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-slate-200 truncate">
                              {person.name}
                            </h3>
                            {(person.birthyear || person.deathyear) && (
                              <p className="text-xs text-slate-500 mt-0.5">
                                {person.birthyear || '?'} – {person.deathyear || '?'}
                              </p>
                            )}
                          </div>
                          
                          <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
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

      <AnimatePresence>
        {selectedPerson && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-40"
            onClick={() => setSelectedPerson(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPerson && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 z-50"
          >
            <div className="bg-slate-900 border-t border-slate-800 rounded-t-2xl p-5 max-h-[60vh] overflow-y-auto">
              <div className="flex justify-center mb-4">
                <div className="w-10 h-1 rounded-full bg-slate-700" />
              </div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center',
                    selectedPerson.gender === 'M' 
                      ? 'bg-blue-500/20 border-blue-500/30' 
                      : 'bg-violet-500/20 border-violet-500/30',
                    'border'
                  )}>
                    <span className="text-2xl">
                      {selectedPerson.gender === 'M' ? '♂' : '♀'}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-100">
                      {selectedPerson.name}
                    </h2>
                    {selectedPerson.tree_id && (
                      <span className="text-xs text-blue-500/80">
                        Árvore #{selectedPerson.tree_id}
                      </span>
                    )}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedPerson(null)}
                  className="p-2 rounded-lg bg-slate-800 border border-slate-700"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </motion.button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Nascimento</span>
                  </div>
                  <p className="text-sm font-medium text-slate-200">
                    {selectedPerson.birthyear || '?'}
                  </p>
                  {selectedPerson.birthplace && (
                    <p className="text-xs text-slate-500 mt-1">{selectedPerson.birthplace}</p>
                  )}
                </div>
                
                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Falecimento</span>
                  </div>
                  <p className="text-sm font-medium text-slate-200">
                    {selectedPerson.deathyear || '?'}
                  </p>
                  {selectedPerson.deathplace && (
                    <p className="text-xs text-slate-500 mt-1">{selectedPerson.deathplace}</p>
                  )}
                </div>
              </div>

              {selectedPerson.verses && (
                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Referências</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPerson.verses.split(',').map((verse, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs text-slate-400"
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