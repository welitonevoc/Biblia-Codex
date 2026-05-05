import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BibleService } from '../BibleService';
import { Users, TreePine, List, X, Calendar, MapPin, BookOpen, ChevronRight, ZoomIn, ZoomOut, Maximize2, Settings2 } from 'lucide-react';
import { clsx } from 'clsx';

function cn(...inputs: (string | boolean | undefined)[]) {
  return clsx(inputs);
}

function formatYear(year: string | undefined): string {
  if (!year) return '?';
  if (year.includes('BC') || year.includes('bc')) {
    return year.replace(/bc/i, 'a.C.').replace(/BC/, 'a.C.');
  }
  if (year.includes('AD') || year.includes('ad') || !isNaN(Number(year))) {
    return year.replace(/ad/i, 'd.C.').replace(/AD/, 'd.C.') + (isNaN(Number(year)) ? '' : ' d.C.');
  }
  return year;
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

interface GenealogyTreeProps {
  bookId: string;
  chapter: number;
  verse: number;
  onClose?: () => void;
}

const NODE_W = 116;
const NODE_H = 52;
const V_GAP = 90;
const H_GAP = 128;

export function GenealogyTree({ bookId, chapter, verse, onClose }: GenealogyTreeProps) {
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [viewMode, setViewMode] = useState<'tree' | 'list' | 'chain' | 'expand'>('expand');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState<'all' | 'M' | 'F'>('all');
  const [showControls, setShowControls] = useState(true);
  const [zoom, setZoomLocal] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [svgW, setSvgW] = useState(0);
  const [svgH, setSvgH] = useState(0);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [rootId, setRootId] = useState<number | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    (window as any).openDetail = (person: Person) => {
      setSelectedPerson(person);
    };
    (window as any).closeDetail = () => {
      setSelectedPerson(null);
    };
    (window as any).peopleData = people;
    (window as any).zoom = zoom;
    (window as any).pan = pan;
    (window as any).isDragging = false;
(window as any).selectPersonById = (id: number) => {
      const p = people.find(x => Number(x.id) === id);
      if (p) setSelectedPerson(p);
    };
    (window as any).previewPersonById = (id: number) => {
      const p = people.find(x => Number(x.id) === id);
      if (p) setSelectedPerson(p);
    };
    (window as any).toggleExpand = (id: number) => {
      setExpandedIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      });
    };
    (window as any).previewPersonById = (id: number) => {
      const p = people.find(x => Number(x.id) === id);
      if (p) setSelectedPerson(p);
    };
    (window as any).toggleExpand = (id: number) => {
      setExpandedIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      });
    };
    (window as any).expandedIds = expandedIds;
    (window as any).formatYear = formatYear;
    render();
  }, [zoom, searchQuery, filterGender, viewMode, selectedPerson, people, svgW, svgH, expandedIds]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await BibleService.getPeopleData(bookId, chapter, verse);
      setPeople(data);
      setLoading(false);
    }
    loadData();
  }, [bookId, chapter, verse]);

  useEffect(() => {
    function updateDimensions() {
      if (bodyRef.current) {
        setSvgW(bodyRef.current.clientWidth);
        setSvgH(bodyRef.current.clientHeight);
      }
    }
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (people.length > 0) {
      (window as any).peopleData = people;
      render();
    }
  }, [people]);

  useEffect(() => {
    if (!loading && people.length > 0) {
      (window as any).peopleData = people;
      render();
    }
  }, [loading, people, svgW, svgH]);

  const normalizeText = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const getFiltered = () => {
    let r = (window as any).peopleData || [];
    if (searchQuery) {
      const q = normalizeText(searchQuery);
      r = r.filter((p: Person) => normalizeText(p.name).includes(q));
    }
    if (filterGender !== 'all') r = r.filter((p: Person) => p.gender === filterGender);
    return r;
  };

  const computePositions = (filtered: Person[], W: number, H: number) => {
    if (filtered.length === 0) return {};
    const centerId = filtered[0]?.id;
    const centerPos = { x: W / 2 - NODE_W / 2, y: H / 2 - NODE_H / 2 };
    const positions: Record<number, { x: number; y: number }> = {};
    if (centerId) positions[centerId] = centerPos;
    filtered.forEach((p, idx) => {
      if (p.id !== centerId && idx > 0) {
        positions[p.id] = { x: centerPos.x, y: centerPos.y + idx * (NODE_H + V_GAP) };
      }
    });
    return positions;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as Element;
    if (target.closest('.node-g')) return;
    isDragging.current = true;
    (window as any).isDragging = true;
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const newPan = { x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y };
    setPan(newPan);
    (window as any).pan = newPan;
    const panGroup = document.getElementById('pan-group');
    if (panGroup) panGroup.setAttribute('transform', `translate(${newPan.x},${newPan.y}) scale(${zoom})`);
  };

  const handleMouseUp = () => { isDragging.current = false; (window as any).isDragging = false; };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newZoom = Math.max(0.3, Math.min(3, zoom + (e.deltaY > 0 ? -0.1 : 0.1)));
    setZoomLocal(newZoom);
  };

  const setFilter = (val: 'all' | 'M' | 'F') => { setFilterGender(val); };
  const setView = (val: 'tree' | 'list' | 'chain' | 'expand') => { setViewMode(val); };
  const changeZoom = (delta: number) => { setZoomLocal(Math.max(0.3, Math.min(3, zoom + delta))); };
  const resetView = () => { setZoomLocal(1); setPan({ x: 0, y: 0 }); };

  const toggleExpand = useCallback((personId: number) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(personId)) {
        newSet.delete(personId);
      } else {
        newSet.add(personId);
      }
      return newSet;
    });
    setRootId(prev => prev || personId);
  }, []);

  const getDescendants = useCallback((parentId: number, allPeople: Person[]): Person[] => {
    return allPeople.filter(p => p.tree_id === parentId || 
      (p as any).father?.includes(String(parentId)) ||
      (p as any).father === String(parentId));
  }, []);

  const openDetail = (person: Person) => {
    setSelectedPerson(person);
  };

  const closeDetail = () => {
    setSelectedPerson(null);
  };

  const render = useCallback(() => {
    renderTree();
    renderList();
    renderChain();
    renderExpand();
    updateCount();
  }, [svgW, svgH, pan, zoom]);

const renderTree = () => {
    const zoom = (window as any).zoom || 1;
    const pan = (window as any).pan || { x: 0, y: 0 };
    const svg = document.getElementById('tree-svg');
    if (!svg) return;
    const W = bodyRef.current?.clientWidth || 350;
    const H = bodyRef.current?.clientHeight || 500;
    svg.setAttribute('width', String(W));
    svg.setAttribute('height', String(H));
    const filtered = getFiltered();
    const positions = computePositions(filtered, W, H);
    let html = `<g id="pan-group" transform="translate(${pan.x},${pan.y}) scale(${zoom})">`;
    const centerId = filtered[0]?.id;
    const centerPos = positions[centerId];
    filtered.forEach(p => {
      if (p.id === centerId || !centerPos) return;
      const toPos = positions[p.id];
      if (!toPos) return;
      const from = { x: centerPos.x + NODE_W / 2, y: centerPos.y + NODE_H };
      const to = { x: toPos.x + NODE_W / 2, y: toPos.y };
      const my = (from.y + to.y) / 2;
      const bc = p.gender === 'M' ? '#818cf8' : '#f472b6';
      html += `<path d="M${from.x} ${from.y} C${from.x} ${my},${to.x} ${my},${to.x} ${to.y}" fill="none" stroke="${bc}" stroke-width="1.2" stroke-opacity="0.35" stroke-linecap="round"/>`;
    });
    const selectedId = (window as any).selectedId;
    filtered.forEach(p => {
      const pos = positions[p.id];
      if (!pos) return;
      const isCenter = p.id === centerId;
      const isMale = p.gender === 'M';
      const isSelected = p.id === selectedId;
      let bg, border;
      if (isCenter) { bg = '#1a1a2e'; border = '#fbbf24'; }
      else if (isMale) { bg = '#1e1b4b'; border = '#818cf8'; }
      else { bg = '#4c1d4d'; border = '#f472b6'; }
      const cx = pos.x + NODE_W / 2;
      const cy = pos.y + NODE_H / 2;
      const R = isCenter ? 26 : isSelected ? 24 : 22;
      const sw = isSelected ? 2 : 1;
      const sop = isSelected ? 1 : 0.7;
      const icon = isCenter ? '👑' : isMale ? '♂' : '♀';
      const nc = isCenter ? '#fbbf24' : isSelected ? '#fff' : '#94a3b8';
      const sn = p.name.length > 10 ? p.name.slice(0, 7) + '..' : p.name;
      html += `<g class="node-g" data-id="${p.id}" style="cursor:pointer;">
        <circle cx="${cx}" cy="${cy}" r="${R + 6}" fill="transparent" stroke="${border}" stroke-width="1" stroke-opacity="${isSelected ? 0.5 : 0.2}"/>
        <circle cx="${cx}" cy="${cy}" r="${R}" fill="${bg}" stroke="${border}" stroke-width="${sw}" stroke-opacity="${sop}" fill-opacity="${isSelected ? 0.3 : 1}"/>
        <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" fill="white" font-size="${isCenter ? 14 : 12}">${icon}</text>
        <text x="${cx}" y="${cy + R + 10}" text-anchor="middle" fill="${nc}" font-size="${isCenter ? 12 : 10}" font-weight="${isCenter ? 700 : 500}">${sn}</text>
      </g>`;
    });
    html += '</g>';
    svg.innerHTML = html;
    svg.querySelectorAll('.node-g').forEach(g => {
      g.addEventListener('click', (e) => {
        e.stopPropagation();
        const person = (window as any).peopleData?.find((x: Person) => x.id === parseInt((g as Element).getAttribute('data-id') || '0'));
        if (person) {
          (window as any).selectedId = person.id;
          (window as any).openDetail(person);
        }
      });
    });
    svg.addEventListener('click', () => { if (!(window as any).isDragging) { (window as any).closeDetail(); } });
  };

  const renderExpand = () => {
    const expandWrap = document.getElementById('expand-wrap');
    if (!expandWrap) return;
    const filtered = getFiltered();
    const expandedIds = (window as any).expandedIds || new Set();
    const selectedId = (window as any).selectedId;
    const formatYearFn = (window as any).formatYear;
    const peopleData = (window as any).peopleData || [];
    
    const root = filtered[0];
    if (!root) {
      expandWrap.innerHTML = '<div style="padding:20px;text-align:center;color:white/50;">Nenhuma pessoa encontrada</div>';
      return;
    }

    const renderPerson = (p: Person, indent: number = 0): string => {
      const isMale = p.gender === 'M';
      const isSelected = p.id === selectedId;
      const isExpanded = expandedIds.has(p.id);
      const pid = Number(p.id);
      const hasChildren = filtered.some(c => (c as any).father === String(p.id) || (c as any).tree_id === p.id);
      const maleColor = '#818cf8';
      const femaleColor = '#f472b6';
      const color = isMale ? maleColor : femaleColor;
      const indentPx = indent * 20;

      let html = `<div style="margin-left:${indentPx}px;margin-bottom:4px;" class="person-row" data-id="${pid}">
        <button 
          class="person-btn"
          data-id="${pid}"
          style="display:flex;align-items:center;gap:8px;width:100%;background:${isSelected ? color+'33' : 'transparent'};border:none;border-radius:8px;padding:8px 12px;cursor:pointer;text-align:left;transition:background 0.15s;"
        >
          ${hasChildren ? `<span class="expand-icon" data-id="${pid}" style="font-size:14px;color:${color};width:20px;cursor:pointer;">${isExpanded ? '▼' : '▶'}</span>` : `<span style="width:20px;"></span>`}
          <div style="width:24px;height:24px;border-radius:6px;background:${color}22;display:flex;align-items:center;justify-content:center;color:${color};font-size:11px;flex-shrink:0;">${isMale ? '♂' : '♀'}</div>
          <div style="flex:1;min-width:0;">
            <div style="color:white;font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</div>
            <div style="color:white/40;font-size:10px;">${formatYearFn(p.birthyear) || '?'}</div>
          </div>
        </button>
      </div>`;

      if (isExpanded && hasChildren) {
        const children = filtered.filter(c => (c as any).father === String(p.id) || (c as any).tree_id === p.id);
        html += children.map(c => renderPerson(c, indent + 1)).join('');
      }

      return html;
    };

    expandWrap.innerHTML = renderPerson(root);
    
    expandWrap.querySelectorAll('.person-row').forEach(row => {
      const id = parseInt(row.getAttribute('data-id') || '0');
      const btn = row.querySelector('.person-btn') as HTMLElement;
      if (btn) {
        btn.addEventListener('mouseenter', () => {
          const p = peopleData.find((x: Person) => Number(x.id) === id);
          if (p) setSelectedPerson(p);
        });
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const toggleFn = (window as any).toggleExpand;
          if (toggleFn) toggleFn(id);
        });
      }
    });
  };

  const renderList = () => {
    const listWrap = document.getElementById('list-wrap');
    if (!listWrap) return;
    const filtered = getFiltered();
    const selectedId = (window as any).selectedId;
    const formatYearFn = (window as any).formatYear;
    listWrap.innerHTML = filtered.map(p => {
      const isMale = p.gender === 'M';
      const isSelected = p.id === selectedId;
      const maleColor = '#818cf8';
      const femaleColor = '#f472b6';
      const color = isMale ? maleColor : femaleColor;
      return `<button onclick="window.selectPersonById(${p.id})" style="display:flex;align-items:center;gap:10px;width:100%;background:${isSelected ? color+'33' : 'transparent'};border:none;border-radius:8px;padding:10px;margin-bottom:4px;cursor:pointer;">
        <div style="width:32px;height:32px;border-radius:8px;background:${color}22;display:flex;align-items:center;justify-content:center;color:${color};font-size:14px;">${isMale ? '♂' : '♀'}</div>
        <div style="flex:1;text-align:left;">
          <div style="color:white;font-size:13px;font-weight:500;">${p.name}</div>
          <div style="color:white/40;font-size:11px;">${formatYearFn(p.birthyear) || '?'} — ${formatYearFn(p.deathyear) || '?'}</div>
        </div>
        <span style="color:white/20;font-size:18px;">›</span>
      </button>`;
    }).join('');
  };

  const renderChain = () => {
    const chainWrap = document.getElementById('chain-wrap');
    if (!chainWrap) return;
    const filtered = getFiltered();
    const selectedId = (window as any).selectedId;
    const formatYearFn = (window as any).formatYear;
    chainWrap.innerHTML = `<div style="display:flex;align-items:center;gap:0;height:100%;min-width:min-content;padding-bottom:8px;">${filtered.map((p, idx) => {
      const isMale = p.gender === 'M';
      const isSelected = p.id === selectedId;
      const maleColor = '#818cf8';
      const femaleColor = '#f472b6';
      const color = isMale ? maleColor : femaleColor;
      return `<div style="display:flex;align-items:center;gap:0;flex-shrink:0;">
        ${idx > 0 ? `<div style="color:${color};font-size:18px;opacity:0.5;padding:0 4px;">→</div>` : ''}
        <button onclick="window.selectPersonById(${p.id})" style="background:${color}22;border:1px solid ${color};border-radius:8px;padding:8px 12px;min-width:70px;text-align:center;cursor:pointer;${isSelected ? 'background:'+color+'44;border-width:2px;' : ''}">
          <div style="font-size:11px;color:${color};margin-bottom:2px;">${isMale ? '♂' : '♀'}</div>
          <div style="color:white;font-size:12px;font-weight:600;white-space:nowrap;">${p.name}</div>
          <div style="font-size:10px;color:white/50;margin-top:2px;">${formatYearFn(p.birthyear) || '?'}</div>
        </button>
      </div>`;
    }).join('')}</div>`;
  };

  const updateCount = () => {
    const badge = document.getElementById('count-badge');
    if (badge) badge.textContent = String(getFiltered().length);
  };

  useEffect(() => {
    if (!loading) render();
  }, [loading, render]);

  useEffect(() => {
    const handleResize = () => { if (viewMode === 'tree') render(); };
    window.addEventListener('resize', handleResize);
    if (viewMode === 'chain' || viewMode === 'expand') render();
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode, render]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#070710]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="w-12 h-12 rounded-full border-2 border-t-indigo-400/50 border-r-transparent mb-3" />
        <p className="text-sm text-white/60">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#070710]">
      <div className="shrink-0 px-3 py-2.5 border-b border-white/5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span>👑</span>
            <h1 className="text-sm font-bold text-white">Genealogia</h1>
            <span className="text-[10px] text-white/40 bg-white/5 px-1.5 py-0.5 rounded" id="count-badge">{people.length}</span>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setShowControls(!showControls)} className={cn('p-1.5 rounded-lg', showControls ? 'bg-indigo-500/30 text-indigo-300' : 'text-white/40')}>
              <Settings2 className="w-4 h-4" />
            </button>
            {onClose && (
              <button onClick={onClose} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className={cn('overflow-hidden transition-all', showControls ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0')}>
          <div className="flex flex-wrap gap-1.5 pt-2">
            <div className="flex gap-0.5 bg-black/40 rounded-lg p-0.5">
              <button onClick={() => setFilter('all')} className={cn('px-2 py-1.5 rounded text-[12px]', filterGender === 'all' ? 'bg-indigo-500 text-white' : 'text-white/40 hover:text-white')}>
                👤
              </button>
              <button onClick={() => setFilter('M')} className={cn('px-2 py-1.5 rounded text-[12px]', filterGender === 'M' ? 'bg-indigo-500 text-white' : 'text-white/40 hover:text-white')}>
                ♂
              </button>
              <button onClick={() => setFilter('F')} className={cn('px-2 py-1.5 rounded text-[12px]', filterGender === 'F' ? 'bg-indigo-500 text-white' : 'text-white/40 hover:text-white')}>
                ♀
              </button>
            </div>

            <div className="flex gap-0.5 bg-black/40 rounded-lg p-0.5">
              <button onClick={() => setView('expand')} className={cn('px-2 py-1.5 rounded text-[12px]', viewMode === 'expand' ? 'bg-amber-500 text-white' : 'text-white/40 hover:text-white')}>
                ⤢
              </button>
              <button onClick={() => setView('chain')} className={cn('px-2 py-1.5 rounded text-[12px]', viewMode === 'chain' ? 'bg-amber-500 text-white' : 'text-white/40 hover:text-white')}>
                ⊗
              </button>
              <button onClick={() => setView('list')} className={cn('px-2 py-1.5 rounded text-[12px]', viewMode === 'list' ? 'bg-amber-500 text-white' : 'text-white/40 hover:text-white')}>
                ≡
              </button>
            </div>

            <div className="flex gap-0.5 bg-black/40 rounded-lg p-0.5">
              <button onClick={() => changeZoom(-0.15)} className="px-2 py-1.5 rounded text-white/40 hover:text-white">−</button>
              <span className="text-[10px] text-white/50 px-1 min-w-[30px] text-center">{Math.round(zoom * 100)}</span>
              <button onClick={() => changeZoom(0.15)} className="px-2 py-1.5 rounded text-white/40 hover:text-white">+</button>
              <button onClick={resetView} className="px-2 py-1.5 rounded text-white/40 hover:text-white">⤢</button>
            </div>
          </div>

          <input
            type="text"
            placeholder="Buscar pessoa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full mt-2 px-2.5 py-2 text-xs bg-black/40 rounded-lg text-white placeholder:text-white/30 border border-white/5 focus:outline-none focus:border-indigo-500/50"
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative" ref={bodyRef} id="body">
        {viewMode === 'tree' ? (
          <div 
            className="w-full h-full cursor-grab" 
            onMouseDown={handleMouseDown} 
            onMouseMove={handleMouseMove} 
            onMouseUp={handleMouseUp} 
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
          >
            <svg id="tree-svg" width="100%" height="100%" className="block" />
          </div>
        ) : viewMode === 'list' ? (
          <div id="list-wrap" className="h-full overflow-y-auto p-2" />
        ) : viewMode === 'chain' ? (
          <div id="chain-wrap" className="h-full overflow-x-auto overflow-y-hidden p-4" />
        ) : (
          <div id="expand-wrap" className="h-full overflow-y-auto p-3" />
        )}

        <AnimatePresence>
          {selectedPerson && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeDetail} className="absolute inset-0 bg-black/60 z-40" />
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ damping: 25, stiffness: 300 }} className="absolute bottom-0 left-0 right-0 z-50 bg-[#0c0c14] border-t border-white/10 rounded-t-2xl max-h-[70%] overflow-y-auto">
                <div className="p-3">
                  <div className="flex justify-center mb-3">
                    <div className="w-8 h-1 bg-white/20 rounded-full" />
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center text-lg', selectedPerson.gender === 'M' ? 'bg-indigo-500' : 'bg-pink-500')}>
                        {selectedPerson.gender === 'M' ? '♂' : '♀'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{selectedPerson.name}</p>
                        {selectedPerson.tree_id && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full">#{selectedPerson.tree_id}</span>
                        )}
                      </div>
                    </div>
                    <button onClick={closeDetail} className="p-1.5 rounded-lg bg-white/5 text-white/50">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="p-2.5 rounded-lg bg-white/5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs">📅</span>
                        <p className="text-[8px] text-white/40 uppercase">Nascimento</p>
                      </div>
                      <p className="text-xs text-white">{formatYear(selectedPerson.birthyear)}</p>
                      {selectedPerson.birthplace && <p className="text-[10px] text-white/50">{selectedPerson.birthplace}</p>}
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs">📍</span>
                        <p className="text-[8px] text-white/40 uppercase">Falecimento</p>
                      </div>
                      <p className="text-xs text-white">{formatYear(selectedPerson.deathyear)}</p>
                      {selectedPerson.deathplace && <p className="text-[10px] text-white/50">{selectedPerson.deathplace}</p>}
                    </div>
                  </div>
                  {selectedPerson.verses && (
                    <div className="p-2.5 rounded-lg bg-white/5">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-xs">📖</span>
                        <p className="text-[8px] text-white/40 uppercase">Referências</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedPerson.verses.split(',').map((v, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-white/60">{v.trim()}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}