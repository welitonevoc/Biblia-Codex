import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BibleService } from '../BibleService';
import {
  Users, TreePine, List, X, Calendar, MapPin,
  BookOpen, ChevronRight, Search, Minus, Plus,
  Maximize2, Heart, Star, GitBranch, User, ArrowRight, History,
  Venus, Mars
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
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [focusedNodeId, setFocusedNodeId] = useState<number | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!showTree || !treeNodes.length) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      const visibleNodes = treeNodes.filter(n => expandedNodes.has(n.id) || n.id === centerNode);
      const currentIndex = focusedNodeId !== null ? visibleNodes.findIndex(n => n.id === focusedNodeId) : -1;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          if (currentIndex > 0) {
            setFocusedNodeId(visibleNodes[currentIndex - 1].id);
            setSelectedPerson(visibleNodes[currentIndex - 1]);
          } else if (focusedNodeId === null && visibleNodes.length > 0) {
            setFocusedNodeId(visibleNodes[0].id);
            setSelectedPerson(visibleNodes[0]);
          }
          break;
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          if (currentIndex < visibleNodes.length - 1) {
            setFocusedNodeId(visibleNodes[currentIndex + 1].id);
            setSelectedPerson(visibleNodes[currentIndex + 1]);
          }
          break;
        case 'Enter':
        case ' ':
          if (focusedNodeId !== null) {
            const node = treeNodes.find(n => n.id === focusedNodeId);
            if (node?.childIds.length) toggleNode(focusedNodeId);
          }
          break;
        case 'Escape':
          setSelectedPerson(null);
          setFocusedNodeId(null);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showTree, treeNodes, expandedNodes, centerNode, focusedNodeId]);

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
          initial={prefersReducedMotion ? {} : { scale: 0.8, opacity: 0 }}
          animate={prefersReducedMotion ? {} : { scale: 1, opacity: 1 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5 }}
          className="relative z-10"
        >
          <div className="w-16 h-16 rounded-2xl border border-[var(--border-bible)] flex items-center justify-center bg-[var(--surface-1)]">
            <motion.div
              animate={prefersReducedMotion ? {} : { rotate: 360 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Users className="w-6 h-6 text-[var(--accent-bible)]" />
            </motion.div>
          </div>
        </motion.div>
        <motion.p
          initial={prefersReducedMotion ? {} : { opacity: 0 }}
          animate={prefersReducedMotion ? {} : { opacity: 1 }}
          transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.3 }}
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
    const isFocused = focusedNodeId === node.id;
    const isVisible = isExpanded || isCenter;

    return (
      <g
        key={node.id}
        tabIndex={isVisible ? 0 : -1}
        onFocus={() => setFocusedNodeId(node.id)}
        role="button"
        aria-label={`${node.name}${hasChildren ? ', pressione Enter para expandir' : ''}`}
        aria-expanded={hasChildren ? isExpanded : undefined}
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
            stroke={isFocused ? 'var(--accent-bible)' : isCenter ? 'var(--accent-bible)' : isSelected ? 'var(--accent-bible)' : 'var(--border-bible)'}
            strokeWidth={isFocused || isCenter || isSelected ? 3 : 1}
            className="transition-all duration-200"
            style={{
              filter: isFocused ? 'var(--shadow-sm), drop-shadow(0 0 8px var(--accent-bible))' : 'var(--shadow-sm)',
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
          {isMale ? (
            <g transform="translate(0, -10)">
              <Mars className="w-5 h-5" style={{ fill: 'var(--accent-bible)', color: 'var(--accent-bible)' }} />
            </g>
          ) : (
            <g transform="translate(0, -10)">
              <Venus className="w-5 h-5" style={{ fill: '#8b5cf6', color: '#8b5cf6' }} />
            </g>
          )}
          
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
              <Star className="w-4 h-4 text-white" style={{ transform: 'translate(-8px, -8px)' }} />
            </g>
          )}
        </g>
      </g>
    );
  };

  return (
    <div 
      className="flex flex-col h-full relative overflow-hidden"
      style={{ backgroundColor: 'var(--bg-bible)' }}
      ref={containerRef}
    >
      {/* Background Decorator Premium */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-bible-accent/10 blur-[100px]" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-purple-500/10 blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(var(--text-bible) 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
      </div>
      
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
        className="shrink-0 relative z-20 px-6 py-5 backdrop-blur-xl bg-bible-bg/80 border-b border-bible-border/50 shadow-sm"
      >
        <div className="flex items-start justify-between mb-5">
          <div className="flex-1">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 rounded-lg bg-bible-accent/10">
                <Users className="w-4 h-4 text-bible-accent" />
              </div>
              <span className="premium-kicker">Estudo Biográfico</span>
            </div>
            <h1 className="text-2xl font-black text-bible-text tracking-tight">
              {showTree ? 'Linhagem Bíblica' : 'Pessoas Bíblicas'}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-bible-surface-strong/50 border border-bible-border/50 shadow-inner">
                <Users className="w-3 h-3 text-bible-accent" />
                <span className="text-[11px] font-bold text-bible-text-muted">
                  {filteredPeople.length} <span className="opacity-60">Registros</span>
                </span>
              </div>
            </div>
          </div>
          
          {onClose && (
            <ReaderTooltip label="Fechar">
              <motion.button
                whileHover={prefersReducedMotion ? {} : { scale: 1.1, rotate: 90 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
                onClick={onClose}
                className="premium-icon-button min-w-[44px] min-h-[44px] focus:outline-none focus:ring-2 focus:ring-bible-accent/50"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </ReaderTooltip>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search 
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-bible-text-subtle transition-colors group-focus-within:text-bible-accent" 
            />
            <input
              type="text"
              placeholder="Buscar personagem..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm bg-bible-surface-strong/50 border border-bible-border/50 focus:border-bible-accent/50 focus:ring-4 focus:ring-bible-accent/10 transition-all outline-none"
            />
          </div>

          <div className="flex gap-2 shrink-0">
            <div className="flex p-1 rounded-2xl bg-bible-surface-strong/50 border border-bible-border/50">
              {[
                { id: 'all' as const, icon: Users, label: 'Todos' },
                { id: 'M' as const, icon: User, label: 'Homens' },
                { id: 'F' as const, icon: Heart, label: 'Mulheres' },
              ].map((filter) => (
                <ReaderTooltip key={filter.id} label={filter.label}>
                  <motion.button
                    whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                    whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                    onClick={() => setFilterGender(filter.id)}
                    className={cn(
                      'min-w-[44px] min-h-[44px] p-2.5 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-bible-accent/50 focus:ring-offset-2 focus:ring-offset-bible-bg',
                      filterGender === filter.id
                        ? 'bg-bible-accent text-white shadow-lg shadow-bible-accent/25'
                        : 'text-bible-text-muted hover:bg-bible-accent/10'
                    )}
                    aria-label={filter.label}
                    aria-pressed={filterGender === filter.id}
                  >
                    <filter.icon className="w-4 h-4" />
                  </motion.button>
                </ReaderTooltip>
              ))}
            </div>

            <div className="flex p-1 rounded-2xl bg-bible-surface-strong/50 border border-bible-border/50">
              {[
                { id: false as const, icon: List, label: 'Visualizar Lista' },
                { id: true as const, icon: GitBranch, label: 'Visualizar Árvore' },
              ].map((mode) => (
                <ReaderTooltip key={String(mode.id)} label={mode.label}>
                  <motion.button
                    whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                    whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                    onClick={() => {
                      setShowTree(mode.id);
                      if (mode.id) setSelectedPerson(null);
                    }}
                    className={cn(
                      'flex items-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-bible-accent/50 focus:ring-offset-2 focus:ring-offset-bible-bg',
                      showTree === mode.id
                        ? 'bg-bible-accent text-white shadow-lg shadow-bible-accent/25'
                        : 'text-bible-text-muted hover:bg-bible-accent/10'
                    )}
                    aria-label={mode.label}
                    aria-pressed={showTree === mode.id}
                  >
                    <mode.icon className="w-4 h-4" />
                    <span className="hidden md:inline uppercase tracking-widest">{mode.label.replace('Visualizar ', '')}</span>
                  </motion.button>
                </ReaderTooltip>
              ))}
            </div>

            {showTree && (
              <div className="flex p-1 rounded-2xl bg-bible-surface-strong/50 border border-bible-border/50 items-center">
                <motion.button
                  whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
                  onClick={() => setZoom(z => Math.max(0.3, z - 0.1))}
                  className="min-w-[44px] min-h-[44px] p-2.5 rounded-xl text-bible-text-muted hover:bg-bible-accent/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-bible-accent/50"
                  aria-label="Diminuir zoom"
                >
                  <Minus className="w-4 h-4" />
                </motion.button>
                <span className="px-3 text-[10px] font-black text-bible-accent min-w-[45px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <motion.button
                  whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
                  onClick={() => setZoom(z => Math.min(2, z + 0.1))}
                  className="min-w-[44px] min-h-[44px] p-2.5 rounded-xl text-bible-text-muted hover:bg-bible-accent/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-bible-accent/50"
                  aria-label="Aumentar zoom"
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
                <div className="w-px h-4 bg-bible-border/50 mx-1" />
                <motion.button
                  whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
                  onClick={() => setZoom(1)}
                  className="min-w-[44px] min-h-[44px] p-2.5 rounded-xl text-bible-text-muted hover:bg-bible-accent/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-bible-accent/50"
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
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
            className="h-full overflow-y-auto p-6"
          >
            {filteredPeople.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-full bg-bible-surface-strong/50 flex items-center justify-center mb-4 border border-bible-border/50">
                  <User className="w-8 h-8 text-bible-text-subtle" />
                </div>
                <p className="text-base font-bold text-bible-text">
                  {searchQuery ? 'Ninguém por aqui' : 'Nenhuma pessoa'}
                </p>
                <p className="text-sm text-bible-text-muted mt-1 max-w-[200px]">
                  {searchQuery ? 'Tente buscar por outro nome bíblico.' : 'Este versículo não menciona pessoas específicas.'}
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
                        initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
                        animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
                        exit={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
                        transition={prefersReducedMotion ? { duration: 0 } : { delay: idx * 0.02, duration: 0.2 }}
                        whileHover={prefersReducedMotion ? {} : { y: -4, scale: 1.02 }}
                        whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                        onMouseEnter={() => setIsHoveringCard(person.id)}
                        onMouseLeave={() => setIsHoveringCard(null)}
                        onClick={() => setSelectedPerson(person)}
                        className={cn(
                          'w-full flex items-center gap-4 p-5 rounded-2xl text-left transition-all border group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-bible-accent/50 focus:ring-offset-2 focus:ring-offset-bible-bg',
                          isSelected ? "bg-bible-surface-strong border-bible-accent shadow-lg" : "bg-bible-bg border-bible-border/50 hover:border-bible-accent/30 shadow-sm"
                        )}
                      >
                        {isSelected && (
                          <div className="absolute top-0 right-0 w-24 h-24 bg-bible-accent/5 rounded-full -translate-y-12 translate-x-12 blur-2xl" />
                        )}

                        <div 
                          className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner relative"
                          style={{ 
                            backgroundColor: isMale ? 'rgba(var(--accent-bible-rgb), 0.1)' : 'rgba(139, 92, 246, 0.1)',
                          }}
                        >
                          {isMale ? (
                            <Mars className="w-7 h-7" style={{ color: 'var(--accent-bible)' }} />
                          ) : (
                            <Venus className="w-7 h-7" style={{ color: '#8b5cf6' }} />
                          )}
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-bible-bg border-2 border-white flex items-center justify-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-bible-accent animate-pulse" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 
                            className="text-base font-black text-bible-text tracking-tight group-hover:text-bible-accent transition-colors"
                          >
                            {person.name}
                          </h3>
                          {(person.birthyear || person.deathyear) && (
                            <div className="flex items-center gap-1.5 mt-1 text-bible-text-muted">
                              <Calendar className="w-3 h-3 opacity-60" />
                              <span className="text-[11px] font-bold">
                                {person.birthyear || '?'} – {person.deathyear || '?'}
                              </span>
                            </div>
                          )}
                          {person.verses && (
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <BookOpen className="w-3 h-3 text-bible-accent opacity-60" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-bible-accent/70">
                                {person.verses.split(',').length} Referências
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="shrink-0 w-8 h-8 rounded-full bg-bible-surface-strong flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-bible-border/50">
                          <ChevronRight className="w-4 h-4 text-bible-accent" />
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
            initial={prefersReducedMotion ? {} : { opacity: 0 }}
            animate={prefersReducedMotion ? {} : { opacity: 1 }}
            exit={prefersReducedMotion ? {} : { opacity: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
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
            initial={prefersReducedMotion ? {} : { opacity: 0 }}
            animate={prefersReducedMotion ? {} : { opacity: 1 }}
            exit={prefersReducedMotion ? {} : { opacity: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.15 }}
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
            initial={prefersReducedMotion ? { y: '100%' } : { y: '100%' }}
            animate={{ y: 0 }}
            exit={prefersReducedMotion ? { y: '100%' } : { y: '100%' }}
            transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 z-50"
          >
            <div 
              className="rounded-t-[32px] p-6 max-h-[85vh] overflow-y-auto backdrop-blur-2xl bg-bible-bg/95 shadow-2xl border-t border-bible-border/50"
            >
              <div className="flex justify-center mb-6">
                <div className="w-12 h-1.5 rounded-full bg-bible-border/50" />
              </div>
              
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-5">
<div 
                      className="w-20 h-20 rounded-[24px] flex items-center justify-center border-2 shadow-lg relative overflow-hidden group/avatar"
                      style={{ 
                        backgroundColor: selectedPerson.gender === 'M' ? 'rgba(var(--accent-bible-rgb), 0.1)' : 'rgba(139, 92, 246, 0.1)',
                        borderColor: selectedPerson.gender === 'M' ? 'rgba(var(--accent-bible-rgb), 0.2)' : 'rgba(139, 92, 246, 0.2)'
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                      {selectedPerson.gender === 'M' ? (
                        <Mars className="w-10 h-10 relative z-10 transition-transform group-hover/avatar:scale-110 duration-500" style={{ color: 'var(--accent-bible)' }} />
                      ) : (
                        <Venus className="w-10 h-10 relative z-10 transition-transform group-hover/avatar:scale-110 duration-500" style={{ color: '#8b5cf6' }} />
                      )}
                    </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="premium-kicker">Personagem Bíblico</span>
                    </div>
                    <h2 className="text-3xl font-black text-bible-text tracking-tight">
                      {selectedPerson.name}
                    </h2>
                    {selectedPerson.tree_id && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <GitBranch className="w-3.5 h-3.5 text-bible-accent" />
                        <span className="text-xs font-bold text-bible-accent/70 uppercase tracking-widest">
                          Linhagem #{selectedPerson.tree_id}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <motion.button
                  whileHover={prefersReducedMotion ? {} : { scale: 1.1, rotate: 90 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
                  onClick={() => setSelectedPerson(null)}
                  className="premium-icon-button min-w-[44px] min-h-[44px] focus:outline-none focus:ring-2 focus:ring-bible-accent/50"
                  aria-label="Fechar detalhes"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="premium-card p-5 border-bible-border/30 bg-bible-surface-strong/30">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10">
                      <Calendar className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-bible-text-muted">Nascimento</span>
                  </div>
                  <p className="text-lg font-black text-bible-text">
                    {selectedPerson.birthyear || 'Período Desconhecido'}
                  </p>
                  {selectedPerson.birthplace && (
                    <div className="flex items-center gap-1.5 mt-2 text-bible-text-muted">
                      <MapPin className="w-3 h-3 opacity-60" />
                      <span className="text-xs font-medium">{selectedPerson.birthplace}</span>
                    </div>
                  )}
                </div>
                
                <div className="premium-card p-5 border-bible-border/30 bg-bible-surface-strong/30">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="p-1.5 rounded-lg bg-red-500/10">
                      <History className="w-4 h-4 text-red-500" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-bible-text-muted">Falecimento</span>
                  </div>
                  <p className="text-lg font-black text-bible-text">
                    {selectedPerson.deathyear || 'Período Desconhecido'}
                  </p>
                  {selectedPerson.deathplace && (
                    <div className="flex items-center gap-1.5 mt-2 text-bible-text-muted">
                      <MapPin className="w-3 h-3 opacity-60" />
                      <span className="text-xs font-medium">{selectedPerson.deathplace}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedPerson.verses && (
                <div className="premium-card p-4 border-bible-border/30 bg-bible-surface-strong/20 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-bible-accent" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-bible-text-muted">Referências na Bíblia</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPerson.verses.split(',').slice(0, 10).map((verse, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 rounded-md text-xs font-medium bg-bible-bg border border-bible-border/50 text-bible-text"
                      >
                        {verse.trim()}
                      </span>
                    ))}
                    {selectedPerson.verses.split(',').length > 10 && (
                      <span className="px-2 py-1 rounded-md text-xs text-bible-text-muted">
                        +{selectedPerson.verses.split(',').length - 10}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {!showTree && people.length > 1 && (
                <motion.button
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.2 }}
                  whileHover={prefersReducedMotion ? {} : { scale: 1.02, y: -2 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                  onClick={() => setShowTree(true)}
                  className="w-full flex items-center justify-center gap-3 p-5 rounded-[20px] font-black uppercase tracking-widest text-sm transition-all bg-gradient-to-r from-bible-accent to-bible-accent-dark text-white shadow-xl shadow-bible-accent/20 focus:outline-none focus:ring-2 focus:ring-bible-accent/50 focus:ring-offset-2 focus:ring-offset-bible-bg"
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
