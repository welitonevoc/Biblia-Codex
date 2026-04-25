import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BibleService } from '../BibleService';
import {
  Users, TreePine, List, X, Calendar, MapPin,
  BookOpen, ChevronRight, Search, Minus, Plus,
  Maximize2, Heart, Star, GitBranch, User, ArrowRight
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

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

    const horizontalGap = 200;
    const verticalGap = 90;
    const startY = 80;

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

    const treeWidth = calculateSubtreeWidth(rootNode.id);
    const centerX = dimensions.width / 2;
    positionNode(rootNode.id, centerX, startY);

    // Calculate bounding box
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    nodes.forEach(node => {
      if (node.x > 0 && node.y > 0) {
        minX = Math.min(minX, node.x - 90);
        maxX = Math.max(maxX, node.x + 90);
        minY = Math.min(minY, node.y - 35);
        maxY = Math.max(maxY, node.y + 35);
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
          node.y += Math.max(60, centerOffsetY);
        }
      });
    } else {
      // Fallback: center the root node
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
              <Users className="w-6 h-6 text-[var(--accent-bible)]" />
            </motion.div>
          </div>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-sm font-medium text-[var(--text-bible-muted)]"
        >
          Carregando pessoas...
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
        d={`M ${parent.x} ${parent.y + 35} L ${parent.x} ${(parent.y + node.y) / 2} L ${node.x} ${(parent.y + node.y) / 2} L ${node.x} ${node.y - 35}`}
        fill="none"
        stroke="var(--border-bible-strong)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  };

  const renderTreeNode = (node: TreeNode) => {
    const isCenter = node.id === centerNode;
    const hasChildren = node.childIds.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isMale = node.gender === 'M';
    const isSelected = selectedPerson?.id === node.id;
    const isHovered = isHoveringCard === node.id;
    const isVisible = isExpanded || isCenter;

    return (
      <g
        key={node.id}
        style={{ 
          opacity: isVisible ? 1 : 0.4, 
          transition: 'opacity 0.3s ease' 
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
          <rect
            x="-90"
            y="-35"
            width="180"
            height="70"
            rx="16"
            fill="var(--surface-1)"
            stroke={isCenter ? 'var(--accent-bible)' : isSelected ? 'var(--accent-bible)' : 'var(--border-bible)'}
            strokeWidth={isCenter || isSelected ? 2 : 1}
            className="transition-all duration-200"
            style={{
              filter: 'var(--shadow-sm)',
            }}
          />
          
          {isCenter && (
            <rect
              x="-90"
              y="-35"
              width="180"
              height="70"
              rx="16"
              fill="url(#centerGrad)"
              opacity="0.1"
            />
          )}
          
          <circle
            cx="0"
            cy="-8"
            r="22"
            fill={isMale ? 'var(--accent-bible)' : '#8b5cf6'}
            opacity="0.15"
          />
          <text
            x="0"
            y="-3"
            textAnchor="middle"
            dominantBaseline="central"
            fill={isMale ? 'var(--accent-bible)' : '#8b5cf6'}
            fontSize="18"
            fontWeight="600"
          >
            {isMale ? '♂' : '♀'}
          </text>
          
          <text
            x="0"
            y="18"
            textAnchor="middle"
            fill="var(--text-bible)"
            fontSize="12"
            fontWeight={isCenter ? "700" : "600"}
          >
            {node.name.length > 22 ? node.name.slice(0, 19) + '...' : node.name}
          </text>
          
          {(node.birthyear || node.deathyear) && (
            <text
              x="0"
              y="32"
              textAnchor="middle"
              fill="var(--text-bible-subtle)"
              fontSize="10"
            >
              {node.birthyear || '?'} — {node.deathyear || '?'}
            </text>
          )}
          
          {hasChildren && (
            <g transform={`translate(75, 0)`}>
              <circle
                r="14"
                fill={isExpanded ? 'var(--success-bible)' : 'var(--surface-3)'}
                stroke="var(--border-bible-strong)"
                strokeWidth="1"
              />
              <text
                x="0"
                y="4"
                textAnchor="middle"
                fill="var(--text-bible)"
                fontSize="12"
                fontWeight="600"
              >
                {isExpanded ? '−' : node.childIds.length}
              </text>
            </g>
          )}
          
          {isCenter && (
            <g transform={`translate(-75, 0)`}>
              <circle r="12" fill="var(--accent-bible)" />
              <text x="0" y="4" textAnchor="middle" fill="white" fontSize="10" fontWeight="700">⚜</text>
            </g>
          )}
        </g>
      </g>
    );
  };

  return (
    <div 
      className="flex flex-col h-full relative"
      style={{ backgroundColor: 'var(--bg-bible)' }}
      ref={containerRef}
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
                <Users className="w-4 h-4" style={{ color: 'var(--accent-bible)' }} />
                <span 
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: 'var(--accent-bible)' }}
                >
                  Genealogy
                </span>
              </div>
              <h1 
                className="text-lg font-bold"
                style={{ color: 'var(--text-bible)', fontFamily: 'var(--font-display)' }}
              >
                {showTree ? 'Árvore Genealógica' : 'Pessoas'}
              </h1>
              <div className="flex items-center gap-2 mt-1.5">
                <div 
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md"
                  style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-bible)' }}
                >
                  <Users className="w-3 h-3" style={{ color: 'var(--text-bible-muted)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-bible-muted)' }}>
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
              placeholder="Buscar..."
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

          <div className="flex gap-2 flex-wrap">
            <div 
              className="flex gap-0.5 p-1 rounded-lg"
              style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-bible)' }}
            >
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
                      ? 'bg-[var(--accent-bible)] text-white'
                      : 'text-[var(--text-bible-muted)]'
                  )}
                >
                  <filter.icon className="w-3.5 h-3.5" />
                </motion.button>
              ))}
            </div>

            <div 
              className="flex gap-0.5 p-1 rounded-lg"
              style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-bible)' }}
            >
              {[
                { id: false as const, icon: List, label: 'Lista' },
                { id: true as const, icon: GitBranch, label: 'Árvore' },
              ].map((mode) => (
                <motion.button
                  key={String(mode.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowTree(mode.id);
                    if (mode.id) {
                      setSelectedPerson(null);
                    }
                  }}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors',
                    showTree === mode.id
                      ? 'bg-[var(--accent-bible)] text-white'
                      : 'text-[var(--text-bible-muted)]'
                  )}
                >
                  <mode.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{mode.label}</span>
                </motion.button>
              ))}
            </div>

            {showTree && (
              <div 
                className="flex gap-0.5 p-1 rounded-lg"
                style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-bible)' }}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setZoom(z => Math.max(0.3, z - 0.1))}
                  className="p-2 rounded-md transition-colors text-[var(--text-bible-muted)]"
                >
                  <Minus className="w-3.5 h-3.5" />
                </motion.button>
                <span className="px-2 py-1.5 text-xs font-medium text-[var(--text-bible-muted)]">
                  {Math.round(zoom * 100)}%
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setZoom(z => Math.min(2, z + 0.1))}
                  className="p-2 rounded-md transition-colors text-[var(--text-bible-muted)]"
                >
                  <Plus className="w-3.5 h-3.5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setZoom(1)}
                  className="p-2 rounded-md transition-colors text-[var(--text-bible-muted)]"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full overflow-y-auto p-4"
          >
            {filteredPeople.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--text-bible-subtle)' }} />
                <p className="text-sm" style={{ color: 'var(--text-bible-muted)' }}>
                  {searchQuery ? 'Nenhuma pessoa encontrada' : 'Nenhuma pessoa'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
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
                            backgroundColor: isMale ? 'var(--accent-bible)' : '#8b5cf6',
                            opacity: 0.15 
                          }}
                        >
                          <span 
                            className="text-xl"
                            style={{ color: isMale ? 'var(--accent-bible)' : '#8b5cf6' }}
                          >
                            {isMale ? '♂' : '♀'}
                          </span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 
                            className="text-base font-semibold"
                            style={{ color: 'var(--text-bible)' }}
                          >
                            {person.name}
                          </h3>
                          {(person.birthyear || person.deathyear) && (
                            <p 
                              className="text-xs mt-0.5"
                              style={{ color: 'var(--text-bible-muted)' }}
                            >
                              {person.birthyear || '?'} – {person.deathyear || '?'}
                            </p>
                          )}
                          {person.verses && (
                            <p 
                              className="text-xs mt-1 truncate"
                              style={{ color: 'var(--accent-bible)' }}
                            >
                              {person.verses.split(',').length} referência(s) bíblica(s)
                            </p>
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
          </motion.div>
        ) : (
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
                <radialGradient id="centerGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="var(--accent-bible)" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="var(--accent-bible)" stopOpacity="0" />
                </radialGradient>
                <pattern id="gridLight" width="30" height="30" patternUnits="userSpaceOnUse">
                  <circle cx="15" cy="15" r="1" fill="var(--border-bible)" opacity="0.3" />
                </pattern>
              </defs>
              
              <rect width="100%" height="100%" fill="url(#gridLight)" opacity="0.5" />
              
              {treeNodes.filter(n => expandedNodes.has(n.id) || n.id === centerNode).map(renderTreeNode)}
              
              {!treeNodes.length && (
                <text
                  x={dimensions.width / 2}
                  y={dimensions.height / 2}
                  textAnchor="middle"
                  fill="var(--text-bible-subtle)"
                  fontSize="14"
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
            className="absolute inset-0 z-40"
            style={{ 
              backgroundColor: 'rgba(0,0,0,0.3)',
              backdropFilter: 'blur(4px)'
            }}
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
            <div 
              className="rounded-t-2xl p-5 max-h-[70vh] overflow-y-auto"
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
                    className="w-14 h-14 rounded-xl flex items-center justify-center border"
                    style={{ 
                      backgroundColor: selectedPerson.gender === 'M' ? 'var(--accent-bible)' : '#8b5cf6',
                      opacity: 0.15,
                      borderColor: selectedPerson.gender === 'M' ? 'var(--accent-bible)' : '#8b5cf6'
                    }}
                  >
                    <span 
                      className="text-3xl"
                      style={{ color: selectedPerson.gender === 'M' ? 'var(--accent-bible)' : '#8b5cf6' }}
                    >
                      {selectedPerson.gender === 'M' ? '♂' : '♀'}
                    </span>
                  </div>
                  <div>
                    <h2 
                      className="text-xl font-bold"
                      style={{ color: 'var(--text-bible)' }}
                    >
                      {selectedPerson.name}
                    </h2>
                    {selectedPerson.tree_id && (
                      <span 
                        className="text-xs"
                        style={{ color: 'var(--accent-bible)' }}
                      >
                        Árvore #{selectedPerson.tree_id}
                      </span>
                    )}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedPerson(null)}
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
                <div 
                  className="p-3 rounded-xl border"
                  style={{ 
                    backgroundColor: 'var(--surface-1)',
                    borderColor: 'var(--border-bible)'
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--text-bible-muted)' }} />
                    <span 
                      className="text-[10px] font-medium uppercase tracking-wider"
                      style={{ color: 'var(--text-bible-muted)' }}
                    >
                      Nascimento
                    </span>
                  </div>
                  <p 
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-bible)' }}
                  >
                    {selectedPerson.birthyear || '?'}
                  </p>
                  {selectedPerson.birthplace && (
                    <p 
                      className="text-xs mt-1"
                      style={{ color: 'var(--text-bible-muted)' }}
                    >
                      {selectedPerson.birthplace}
                    </p>
                  )}
                </div>
                
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
                      Falecimento
                    </span>
                  </div>
                  <p 
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-bible)' }}
                  >
                    {selectedPerson.deathyear || '?'}
                  </p>
                  {selectedPerson.deathplace && (
                    <p 
                      className="text-xs mt-1"
                      style={{ color: 'var(--text-bible-muted)' }}
                    >
                      {selectedPerson.deathplace}
                    </p>
                  )}
                </div>
              </div>

              {selectedPerson.verses && (
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
                    {selectedPerson.verses.split(',').map((verse, idx) => (
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

              {!showTree && people.length > 1 && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowTree(true)}
                  className="w-full flex items-center justify-center gap-2 p-4 rounded-xl font-semibold transition-all"
                  style={{ 
                    backgroundColor: 'var(--accent-bible)',
                    color: 'white'
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