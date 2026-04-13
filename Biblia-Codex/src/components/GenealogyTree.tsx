import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BibleService } from '../BibleService';
import {
  Users, TreePine, List, X, Calendar, MapPin,
  BookOpen, ChevronRight, Search, Minus, Plus,
  Maximize2, Heart, Star
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

    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;

    if (nodes.length === 1) {
      nodes[0].x = centerX;
      nodes[0].y = centerY;
      setTreeNodes(nodes);
      return;
    }

    const maxRadius = Math.min(dimensions.width, dimensions.height) * 0.42;
    const maxGen = Math.max(...nodes.map(n => n.generation), 1);

    const rootNode = nodes.find(n => n.id === centerNode);
    if (rootNode) {
      rootNode.x = centerX;
      rootNode.y = centerY;
    }

    const otherNodes = nodes.filter(n => n.id !== centerNode);
    
    otherNodes.forEach(node => {
      const gen = node.generation;
      const ringRadius = maxRadius * (gen / maxGen);
      
      const siblings = otherNodes.filter(n => 
        n.generation === gen && n.parentId === node.parentId
      );
      const siblingIdx = siblings.indexOf(node);
      const totalSiblings = siblings.length || 1;

      let baseAngle: number;
      if (node.parentId) {
        const parent = nodeMap.get(node.parentId);
        baseAngle = parent ? Math.atan2(parent.y - centerY, parent.x - centerX) : -Math.PI / 2;
      } else {
        const angleStep = (Math.PI * 2) / totalSiblings;
        baseAngle = -Math.PI / 2 + siblingIdx * angleStep;
      }
      
      const arcSpan = Math.PI * 0.7;
      const angle = baseAngle + (siblingIdx - (totalSiblings - 1) / 2) * (arcSpan / Math.max(totalSiblings, 1));

      node.x = centerX + Math.cos(angle) * ringRadius;
      node.y = centerY + Math.sin(angle) * ringRadius;
    });

    setTreeNodes(nodes);
  }, [treeNodes, dimensions, centerNode]);

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full relative overflow-hidden bg-gradient-to-b from-stone-950 to-stone-900">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-amber-500/5 blur-3xl" />
        </div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <div className="w-16 h-16 rounded-2xl border border-stone-700 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <TreePine className="w-6 h-6 text-amber-500" />
            </motion.div>
          </div>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-sm font-medium text-stone-400"
        >
          Carregando genealogia...
        </motion.p>
      </div>
    );
  }

  const renderNode = (node: TreeNode) => {
    const isMale = node.gender === 'M';
    const isSelected = selectedPerson?.id === node.id;
    const isHovered = isHoveringCard === node.id;
    const isExpanded = expandedNodes.has(node.id);
    const isCenter = node.id === centerNode;
    const hasChildren = node.childIds.length > 0;
    const isVisible = isExpanded || isCenter;

    const size = isCenter ? 48 : isSelected ? 44 : isHovered ? 42 : 40;
    
    const bgColor = isCenter 
      ? 'from-amber-500/20 to-amber-600/10' 
      : isMale 
        ? 'from-stone-700/40 to-stone-800/30' 
        : 'from-stone-700/40 to-stone-800/30';
    
    const borderColor = isCenter 
      ? 'border-amber-500/50' 
      : isMale 
        ? 'border-stone-500/40' 
        : 'border-stone-500/40';

    const textColor = isCenter 
      ? 'text-amber-400' 
      : 'text-stone-200';

    return (
      <g key={node.id} style={{ opacity: isVisible ? 1 : 0.3, transition: 'opacity 0.3s' }}>
        {node.parentId && (() => {
          const parent = treeNodes.find(n => n.id === node.parentId);
          if (!parent) return null;
          return (
            <path
              d={`M ${parent.x} ${parent.y} L ${node.x} ${node.y}`}
              fill="none"
              stroke={isCenter ? '#f59e0b' : '#57534e'}
              strokeWidth={isSelected ? 2 : 1.5}
              strokeOpacity={isSelected ? 0.8 : 0.3}
              strokeLinecap="round"
            />
          );
        })()}
        
        <g
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPerson(node);
          }}
          onMouseEnter={() => setIsHoveringCard(node.id)}
          onMouseLeave={() => setIsHoveringCard(null)}
          style={{ cursor: 'pointer' }}
          transform={`translate(${node.x}, ${node.y})`}
        >
          <circle
            r={size + 6}
            fill="transparent"
            stroke={isCenter ? '#f59e0b' : '#78716c'}
            strokeWidth="1"
            strokeOpacity={isSelected ? 0.6 : isHovered ? 0.4 : 0.2}
          />
          
          <circle
            r={size}
            className={cn(
              'fill stroke-2',
              bgColor,
              borderColor
            )}
          />
          
          {hasChildren && (
            <g transform={`translate(${size + 4}, ${size + 4})`}>
              <circle r="10" fill="#292524" stroke="#57534e" strokeWidth="1" />
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fill="#a8a29e"
                fontSize="10"
                fontWeight="600"
              >
                {isExpanded ? '−' : node.childIds.length}
              </text>
            </g>
          )}
          
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fill={textColor}
            fontSize={isCenter ? "18" : "14"}
            fontWeight={isCenter ? "600" : "500"}
          >
            {isCenter ? '⚜' : isMale ? '♂' : '♀'}
          </text>
          
          <text
            y={size + 14}
            textAnchor="middle"
            fill={isCenter ? '#fbbf24' : '#d6d3d1'}
            fontSize={isCenter ? "11" : "10"}
            fontWeight={isCenter ? "600" : "500"}
          >
            {node.name.length > 16 ? node.name.slice(0, 13) + '...' : node.name}
          </text>
          
          {(node.birthyear || node.deathyear) && !isCenter && (
            <text
              y={size + 26}
              textAnchor="middle"
              fill="#78716c"
              fontSize="9"
            >
              {node.birthyear || '?'} – {node.deathyear || '?'}
            </text>
          )}
        </g>
      </g>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950" ref={containerRef}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-amber-500/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-stone-500/3 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="shrink-0 relative px-4 py-4"
      >
        <div className="absolute inset-0 border-b border-stone-800/50" />
        
        <div className="relative">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <TreePine className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-500/80">
                  Genealogy
                </span>
              </div>
              <h1 className="text-lg font-semibold text-stone-100">
                Árvore Genealógica
              </h1>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-stone-800/50 border border-stone-700/50">
                  <Users className="w-3 h-3 text-stone-400" />
                  <span className="text-xs text-stone-400">
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
                className="p-2 rounded-lg bg-stone-800/50 border border-stone-700/50 hover:border-stone-600/50 transition-colors"
              >
                <X className="w-4 h-4 text-stone-400" />
              </motion.button>
            )}
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-stone-800/50 border border-stone-700/50 text-sm text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-stone-600/50 transition-colors"
            />
          </div>

          <div className="flex gap-2">
            <div className="flex gap-0.5 p-1 rounded-lg bg-stone-800/50 border border-stone-700/50">
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
                      ? 'bg-stone-700 text-stone-100'
                      : 'text-stone-500 hover:text-stone-300'
                  )}
                >
                  <filter.icon className="w-3.5 h-3.5" />
                </motion.button>
              ))}
            </div>

            <div className="flex gap-0.5 p-1 rounded-lg bg-stone-800/50 border border-stone-700/50">
              {[
                { id: 'tree' as const, icon: TreePine, label: 'Mapa' },
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
                      ? 'bg-stone-700 text-stone-100'
                      : 'text-stone-500 hover:text-stone-300'
                  )}
                >
                  <mode.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{mode.label}</span>
                </motion.button>
              ))}
            </div>

            <div className="flex gap-0.5 p-1 rounded-lg bg-stone-800/50 border border-stone-700/50">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
                className="p-2 rounded-md text-stone-500 hover:text-stone-300 transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </motion.button>
              <span className="px-2 py-1.5 text-xs text-stone-400 font-medium">
                {Math.round(zoom * 100)}%
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setZoom(z => Math.min(2, z + 0.1))}
                className="p-2 rounded-md text-stone-500 hover:text-stone-300 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setZoom(1)}
                className="p-2 rounded-md text-stone-500 hover:text-stone-300 transition-colors"
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
                  <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                  </radialGradient>
                </defs>
                
                {centerNode && (
                  <circle
                    cx={dimensions.width / 2}
                    cy={dimensions.height / 2}
                    r={180}
                    fill="url(#centerGlow)"
                  />
                )}
                
                {treeNodes.map(renderNode)}
                
                {!treeNodes.length && (
                  <text
                    x={dimensions.width / 2}
                    y={dimensions.height / 2}
                    textAnchor="middle"
                    fill="#78716c"
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
                  <Users className="w-8 h-8 text-stone-600 mx-auto mb-3" />
                  <p className="text-sm text-stone-500">
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
                              ? 'bg-stone-800/60 border-stone-600/50'
                              : 'bg-stone-800/30 border-stone-800/30 hover:border-stone-700/50'
                          )}
                        >
                          <div className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                            'bg-stone-800/50 border border-stone-700/50'
                          )}>
                            <span className="text-base">{isMale ? '♂' : '♀'}</span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-stone-200 truncate">
                              {person.name}
                            </h3>
                            {(person.birthyear || person.deathyear) && (
                              <p className="text-xs text-stone-500 mt-0.5">
                                {person.birthyear || '?'} – {person.deathyear || '?'}
                              </p>
                            )}
                          </div>
                          
                          <ChevronRight className="w-4 h-4 text-stone-600 shrink-0" />
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
            className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm z-40"
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
            <div className="bg-stone-900 border-t border-stone-800 rounded-t-2xl p-5 max-h-[60vh] overflow-y-auto">
              <div className="flex justify-center mb-4">
                <div className="w-10 h-1 rounded-full bg-stone-700" />
              </div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center',
                    'bg-stone-800 border border-stone-700'
                  )}>
                    <span className="text-2xl">
                      {selectedPerson.gender === 'M' ? '♂' : '♀'}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-stone-100">
                      {selectedPerson.name}
                    </h2>
                    {selectedPerson.tree_id && (
                      <span className="text-xs text-amber-500/80">
                        Árvore #{selectedPerson.tree_id}
                      </span>
                    )}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedPerson(null)}
                  className="p-2 rounded-lg bg-stone-800 border border-stone-700"
                >
                  <X className="w-4 h-4 text-stone-400" />
                </motion.button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-stone-800/50 border border-stone-800">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-500" />
                    <span className="text-[10px] font-medium uppercase tracking-wider text-stone-500">Nascimento</span>
                  </div>
                  <p className="text-sm font-medium text-stone-200">
                    {selectedPerson.birthyear || '?'}
                  </p>
                  {selectedPerson.birthplace && (
                    <p className="text-xs text-stone-500 mt-1">{selectedPerson.birthplace}</p>
                  )}
                </div>
                
                <div className="p-3 rounded-xl bg-stone-800/50 border border-stone-800">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-500" />
                    <span className="text-[10px] font-medium uppercase tracking-wider text-stone-500">Falecimento</span>
                  </div>
                  <p className="text-sm font-medium text-stone-200">
                    {selectedPerson.deathyear || '?'}
                  </p>
                  {selectedPerson.deathplace && (
                    <p className="text-xs text-stone-500 mt-1">{selectedPerson.deathplace}</p>
                  )}
                </div>
              </div>

              {selectedPerson.verses && (
                <div className="p-3 rounded-xl bg-stone-800/50 border border-stone-800">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[10px] font-medium uppercase tracking-wider text-stone-500">Referências</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPerson.verses.split(',').map((verse, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 rounded-md bg-stone-800 border border-stone-700 text-xs text-stone-400"
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