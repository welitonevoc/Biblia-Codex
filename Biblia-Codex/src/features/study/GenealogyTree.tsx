import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BibleService } from '../BibleService';
import { Users, TreePine, List, X, Calendar, MapPin, BookOpen, ChevronRight, ZoomIn, ZoomOut, Maximize2, Settings2 } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState<'all' | 'M' | 'F'>('all');
  const [showControls, setShowControls] = useState(true);
  const [zoom, setZoomLocal] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [svgW, setSvgW] = useState(0);
  const [svgH, setSvgH] = useState(0);
  const bodyRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const zoomRef = useRef(1);
  const searchRef = useRef('');
  const filterRef = useRef<'all' | 'M' | 'F'>('all');
  const viewRef = useRef<'tree' | 'list'>('tree');
  const selectedRef = useRef<Person | null>(null);
  const peopleRef = useRef<Person[]>([]);

  useEffect(() => {
    zoomRef.current = zoom;
    searchRef.current = searchQuery;
    filterRef.current = filterGender;
    viewRef.current = viewMode;
    selectedRef.current = selectedPerson;
    peopleRef.current = people;
    render();
  }, [zoom, searchQuery, filterGender, viewMode, selectedPerson, people, svgW, svgH]);

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

  const normalizeText = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const getFiltered = useCallback(() => {
    let r = peopleRef.current;
    if (searchRef.current) {
      const q = normalizeText(searchRef.current);
      r = r.filter(p => normalizeText(p.name).includes(q));
    }
    if (filterRef.current !== 'all') r = r.filter(p => p.gender === filterRef.current);
    return r;
  }, []);

  const computePositions = useCallback((filtered: Person[]) => {
    const allMap: Record<number, Person> = {};
    peopleRef.current.forEach(p => allMap[p.id] = p);
    const gen: Record<number, number> = {};
    function getGen(id: number): number {
      if (gen[id] !== undefined) return gen[id];
      const idx = id - 1;
      if (idx < 0 || !peopleRef.current[idx]) { gen[id] = 0; return 0; }
      gen[id] = getGen(id - 1) + 1;
      return gen[id];
    }
    peopleRef.current.forEach(p => {
      const g = p.tree_id || 0;
      gen[p.id] = g;
    });
    const byGen: Record<number, Person[]> = {};
    filtered.forEach(p => {
      const g = p.tree_id || 0;
      if (!byGen[g]) byGen[g] = [];
      byGen[g].push(p);
    });
    const W = svgW || 350;
    const H = svgH || 500;
    const gens = Object.keys(byGen).map(Number).sort((a, b) => a - b);
    const totalH = gens.length * (NODE_H + V_GAP);
    const startY = Math.max(30, (H - totalH) / 2);
    const positions: Record<number, { x: number; y: number }> = {};
    gens.forEach((g, gi) => {
      const nodes = byGen[g];
      const rowW = nodes.length * NODE_W + (nodes.length - 1) * (H_GAP - NODE_W);
      const startX = (W - rowW) / 2;
      nodes.forEach((p, ni) => {
        positions[p.id] = { x: startX + ni * H_GAP, y: startY + gi * (NODE_H + V_GAP) };
      });
    });
    return positions;
  }, [svgW, svgH]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as Element;
    if (target.closest('.node-g')) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const newPan = { x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y };
    setPan(newPan);
    const panGroup = document.getElementById('pan-group');
    if (panGroup) panGroup.setAttribute('transform', `translate(${newPan.x},${newPan.y}) scale(${zoomRef.current})`);
  };

  const handleMouseUp = () => { isDragging.current = false; };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newZoom = Math.max(0.3, Math.min(3, zoomRef.current + (e.deltaY > 0 ? -0.1 : 0.1)));
    setZoomLocal(newZoom);
  };

  const setFilter = (val: 'all' | 'M' | 'F') => { setFilterGender(val); };
  const setView = (val: 'tree' | 'list') => { setViewMode(val); };
  const changeZoom = (delta: number) => { setZoomLocal(Math.max(0.3, Math.min(3, zoomRef.current + delta))); };
  const resetView = () => { setZoomLocal(1); setPan({ x: 0, y: 0 }); };

  const openDetail = (person: Person) => {
    setSelectedPerson(person);
  };

  const closeDetail = () => {
    setSelectedPerson(null);
  };

  const render = useCallback(() => {
    renderTree();
    renderList();
    updateCount();
  }, [svgW, svgH, pan, zoom]);

  const renderTree = useCallback(() => {
    const svg = document.getElementById('tree-svg');
    if (!svg) return;
    const filtered = getFiltered();
    const filteredIds = new Set(filtered.map(p => p.id));
    const positions = computePositions(filtered);
    const W = svgW || 350;
    const H = svgH || 500;
    svg.setAttribute('width', String(W));
    svg.setAttribute('height', String(H));
    let html = `<g id="pan-group" transform="translate(${pan.x},${pan.y}) scale(${zoom})">`;
    filtered.forEach(p => {
      if (!p.tree_id || p.tree_id <= 1) return;
      const parentIdx = p.id - 1;
      if (!filteredIds.has(parentIdx)) return;
      const from = positions[parentIdx];
      const to = positions[p.id];
      if (!from || !to) return;
      const fx = from.x + NODE_W / 2;
      const fy = from.y + NODE_H;
      const tx = to.x + NODE_W / 2;
      const ty = to.y;
      const my = (fy + ty) / 2;
      const bc = p.gender === 'M' ? '#818cf8' : '#f472b6';
      html += `<path d="M${fx} ${fy} C${fx} ${my},${tx} ${my},${tx} ${ty}" fill="none" stroke="${bc}" stroke-width="1.2" stroke-opacity="0.35" stroke-linecap="round"/>`;
    });
    filtered.forEach(p => {
      const pos = positions[p.id];
      if (!pos) return;
      const isCenter = p.id === peopleRef.current[0]?.id;
      const isMale = p.gender === 'M';
      const isSelected = selectedRef.current?.id === p.id;
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
        const person = peopleRef.current.find(p => p.id === parseInt((g as Element).getAttribute('data-id') || '0'));
        if (person) openDetail(person);
      });
    });
    svg.addEventListener('click', () => { if (!isDragging.current) closeDetail(); });
  }, [svgW, svgH, pan, zoom, getFiltered, computePositions]);

  const renderList = useCallback(() => {
    const listWrap = document.getElementById('list-wrap');
    if (!listWrap) return;
    const filtered = getFiltered();
    listWrap.innerHTML = filtered.map(p => {
      const isMale = p.gender === 'M';
      const isSelected = selectedRef.current?.id === p.id;
      return `<button class="list-item${isSelected ? ' selected' : ''}" onclick="var p=peopleRef.current.find(x=>x.id==${p.id});if(p)openDetail(p)">
        <div class="list-avatar ${isMale ? 'male' : 'female'}">${isMale ? '♂' : '♀'}</div>
        <div style="flex:1;min-width:0;">
          <div class="list-name">${p.name}</div>
          ${(p.birthyear || p.deathyear) ? `<div class="list-years">${p.birthyear || '?'} — ${p.deathyear || '?'}</div>` : ''}
        </div>
        <span class="list-chevron">›</span>
      </button>`;
    }).join('');
  }, [getFiltered]);

  const updateCount = useCallback(() => {
    const badge = document.getElementById('count-badge');
    if (badge) badge.textContent = String(getFiltered().length);
  }, [getFiltered]);

  useEffect(() => {
    if (!loading) render();
  }, [loading, render]);

  useEffect(() => {
    const handleResize = () => { if (viewMode === 'tree') render(); };
    window.addEventListener('resize', handleResize);
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
              <button onClick={() => setView('tree')} className={cn('px-2 py-1.5 rounded text-[12px]', viewMode === 'tree' ? 'bg-amber-500 text-white' : 'text-white/40 hover:text-white')}>
                🌲
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
        ) : (
          <div id="list-wrap" className="h-full overflow-y-auto p-2" />
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
                      <p className="text-xs text-white">{selectedPerson.birthyear || '?'}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs">📍</span>
                        <p className="text-[8px] text-white/40 uppercase">Falecimento</p>
                      </div>
                      <p className="text-xs text-white">{selectedPerson.deathyear || '?'}</p>
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