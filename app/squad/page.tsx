'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

// --- 타입 정의 ---
type Player = {
  id: number;
  name: string;
  number: number;
  position: string;
  pos_top: string | null;
  pos_left: string | null;
};

type Opponent = {
  id: string;
  pos_top: string;
  pos_left: string;
};

type Point = { x: number; y: number };
type Line = {
  id: number;
  points: Point[];
  color: string;
  width: number;
};

export default function SquadPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  
  const defaultOpponents = [
    { id: 'op1', pos_top: '15%', pos_left: '40%' },
    { id: 'op2', pos_top: '15%', pos_left: '60%' },
    { id: 'op3', pos_top: '25%', pos_left: '30%' },
    { id: 'op4', pos_top: '25%', pos_left: '70%' },
  ];

  const [opponents, setOpponents] = useState<Opponent[]>(defaultOpponents);
  const [draggingOpId, setDraggingOpId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const pitchRef = useRef<HTMLDivElement>(null);

  // --- 드로잉 관련 상태 ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState<'move' | 'pen' | 'eraser'>('move');
  const [penColor, setPenColor] = useState('white');
  const [lines, setLines] = useState<Line[]>([]);
  const [currentLine, setCurrentLine] = useState<Point[]>([]);

  // 1. 초기 데이터 로드 (선수, 상대팀, 드로잉 데이터)
  useEffect(() => {
    fetchPlayers();
    
    // 상대팀 위치 불러오기
    const savedOps = localStorage.getItem('opponents-tactics');
    if (savedOps) setOpponents(JSON.parse(savedOps));

    // ⭐ 드로잉 선 데이터 불러오기
    const savedLines = localStorage.getItem('saved-lines');
    if (savedLines) {
      const parsedLines = JSON.parse(savedLines);
      setLines(parsedLines);
    }

    // 캔버스 크기 설정 및 초기 드로잉
    setTimeout(() => {
      resizeCanvas();
    }, 100); // 레이아웃이 잡힐 시간을 약간 줍니다.

    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // 2. ⭐ 선 데이터가 바뀔 때마다 로컬 스토리지에 자동 저장 + 다시 그리기
  useEffect(() => {
    if (lines.length >= 0) {
      localStorage.setItem('saved-lines', JSON.stringify(lines));
    }
    drawAllLines();
  }, [lines, currentLine]);

  const resizeCanvas = () => {
    if (canvasRef.current && pitchRef.current) {
      canvasRef.current.width = pitchRef.current.clientWidth;
      canvasRef.current.height = pitchRef.current.clientHeight;
      drawAllLines(); // 크기가 변하면 다시 그려야 함
    }
  };

  const drawAllLines = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 저장된 모든 선 그리기
    lines.forEach(line => {
      if (line.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = line.color;
      ctx.lineWidth = line.width;
      ctx.moveTo(line.points[0].x, line.points[0].y);
      line.points.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    });

    // 현재 마우스로 그리고 있는 실시간 선
    if (currentLine.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = penColor;
      ctx.lineWidth = 3;
      ctx.moveTo(currentLine[0].x, currentLine[0].y);
      currentLine.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    }
  };

  const fetchPlayers = async () => {
    const { data, error } = await supabase.from('players').select('*').order('number', { ascending: true });
    if (!error && data) setPlayers(data);
  };

  const autoSavePlayers = async (currentPlayers: Player[]) => {
    setIsSaving(true);
    try {
      const updates = currentPlayers.map(p => ({
        id: p.id, name: p.name, number: p.number, position: p.position,
        pos_top: p.pos_top || null, pos_left: p.pos_left || null,
      }));
      await supabase.from('players').upsert(updates);
    } catch (e) { console.error(e); } finally { setIsSaving(false); }
  };

  const resetSquad = async () => {
    if (!confirm("모든 우리 팀 선수는 대기석으로, 상대 선수는 왼쪽 상단으로 모을까요?")) return;
    const resetPlayers = players.map(p => ({ ...p, pos_top: null, pos_left: null }));
    const resetOpponents = opponents.map((op, index) => ({ ...op, pos_top: '5%', pos_left: `${5 + (index * 5)}%` }));
    setPlayers(resetPlayers);
    setOpponents(resetOpponents);
    localStorage.setItem('opponents-tactics', JSON.stringify(resetOpponents));
    await autoSavePlayers(resetPlayers);
  };

  // --- 드로잉 핸들러 ---
  const startDrawing = (e: React.MouseEvent) => {
    if (drawMode === 'move') return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (drawMode === 'eraser') {
      setLines(prev => prev.filter(line => 
        !line.points.some(p => Math.abs(p.x - x) < 20 && Math.abs(p.y - y) < 20)
      ));
      return;
    }

    setIsDrawing(true);
    setCurrentLine([{ x, y }]);
  };

  const drawing = (e: React.MouseEvent) => {
    if (!isDrawing || drawMode !== 'pen') return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCurrentLine(prev => [...prev, { x, y }]);
  };

  const stopDrawing = () => {
    if (isDrawing && currentLine.length > 1) {
      setLines(prev => [...prev, { id: Date.now(), points: currentLine, color: penColor, width: 3 }]);
    }
    setIsDrawing(false);
    setCurrentLine([]);
  };

  const clearAllDrawings = () => {
    if (confirm("그려진 모든 내용을 지우시겠습니까?")) {
      setLines([]);
      localStorage.removeItem('saved-lines');
    }
  };

  // --- 드래그 핸들러 ---
  const handleMouseDown = (e: React.MouseEvent, id: number) => {
    if (drawMode !== 'move') return;
    e.preventDefault();
    setDraggingId(id);
  };

  const handleOpMouseDown = (e: React.MouseEvent, id: string) => {
    if (drawMode !== 'move') return;
    e.preventDefault();
    setDraggingOpId(id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (drawMode !== 'move') {
      drawing(e);
      return;
    }
    if (!pitchRef.current) return;
    const rect = pitchRef.current.getBoundingClientRect();
    let xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    let yPercent = ((e.clientY - rect.top) / rect.height) * 100;

    if (draggingId !== null) {
      setPlayers(prev => prev.map(p => (p.id === draggingId ? { ...p, pos_top: `${yPercent}%`, pos_left: `${xPercent}%` } : p)));
    }
    if (draggingOpId !== null) {
      setOpponents(prev => prev.map(op => (op.id === draggingOpId ? { ...op, pos_top: `${yPercent}%`, pos_left: `${xPercent}%` } : op)));
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (drawMode !== 'move') {
      stopDrawing();
      return;
    }
    if (draggingOpId !== null) {
      localStorage.setItem('opponents-tactics', JSON.stringify(opponents));
      setDraggingOpId(null);
      return;
    }
    if (draggingId === null || !pitchRef.current) return;
    const rect = pitchRef.current.getBoundingClientRect();
    const isInsidePitch = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;

    const newPlayers = players.map(p => {
      if (p.id !== draggingId) return p;
      if (isInsidePitch) {
        let topVal = Math.max(0, Math.min(100, parseFloat(p.pos_top || "50")));
        let leftVal = Math.max(0, Math.min(100, parseFloat(p.pos_left || "50")));
        return { ...p, pos_top: `${topVal}%`, pos_left: `${leftVal}%` };
      }
      return { ...p, pos_top: null, pos_left: null };
    });
    setPlayers(newPlayers);
    setDraggingId(null);
    autoSavePlayers(newPlayers);
  };

  const fieldPlayers = players.filter(p => p.pos_top !== null && p.pos_left !== null);
  const benchPlayers = players.filter(p => p.pos_top === null || p.pos_left === null);

  const getPositionColor = (pos: string) => {
    const p = pos.toUpperCase();
    if (['FW', 'ST', 'LW', 'RW', 'CF'].includes(p)) return 'bg-red-600 border-red-400';
    if (['MF', 'LM', 'LAM', 'LCM', 'CM', 'RCM', 'RAM', 'RM', 'CDM', 'LDM', 'RDM'].includes(p)) return 'bg-lime-500 border-lime-300';
    if (['LB', 'CB', 'SW', 'RB', 'DF', 'LWB', 'RWB'].includes(p)) return 'bg-blue-600 border-blue-400';
    if (p === 'GK') return 'bg-yellow-500 border-yellow-300';
    return 'bg-neutral-600 border-neutral-400';
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-24 px-4 pb-10 flex flex-col items-center font-sans" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      
      {/* --- 상단 컨트롤러 --- */}
      <div className="w-full max-w-[1400px] flex flex-wrap justify-between items-center mb-8 px-6 gap-6 text-black">
        <div>
          <h1 className="text-5xl font-black italic tracking-tighter leading-none text-white">TACTICAL <span className="text-red-600">BOARD</span></h1>
          <p className="text-gray-500 text-sm mt-2 font-medium tracking-wide uppercase">Professional Squad Management</p>
        </div>
        
        {/* 드로잉 도구 모음 */}
        <div className="flex items-center gap-2 bg-gray-200/90 p-2 rounded-3xl border border-white/10 backdrop-blur-md">
          <button onClick={() => setDrawMode('move')} className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${drawMode === 'move' ? 'bg-black text-white font-extrabold shadow-md' : 'text-gray-600 hover:bg-white/10'}`}>✋ 이동</button>
          <div className="w-[1px] h-4 bg-gray-400/30 mx-1" />
          <button onClick={() => setDrawMode('pen')} className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${drawMode === 'pen' ? 'bg-red-600 text-white font-extrabold shadow-md' : 'text-gray-600 hover:bg-white/10'}`}>✏️ 펜</button>
          
          {drawMode === 'pen' && (
            <div className="flex gap-2 px-2 animate-in fade-in slide-in-from-left-2">
              {['white', 'black', 'red', 'blue'].map(color => (
                <button 
                  key={color} 
                  onClick={() => setPenColor(color)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${penColor === color ? 'scale-125 border-yellow-400 shadow-sm' : 'border-black/10'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}
          
          <button onClick={() => setDrawMode('eraser')} className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${drawMode === 'eraser' ? 'bg-black text-white font-extrabold shadow-md' : 'text-gray-600 hover:bg-white/10'}`}>🧹 지우개</button>
          <button onClick={clearAllDrawings} className="px-4 py-2 rounded-2xl text-xs font-bold text-gray-600 hover:bg-red-600 hover:text-white transition-all font-extrabold">🗑️ 전체삭제</button>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={resetSquad} className="bg-white/5 hover:bg-white/10 text-gray-400 font-bold px-6 py-4 rounded-2xl border border-white/10 transition-all hover:text-white text-sm">🔄 전체 초기화</button>
          <div className="flex items-center gap-4 bg-neutral-900/50 p-1 px-4 rounded-2xl border border-white/5">
            {isSaving && <span className="text-red-500 text-xs font-bold animate-pulse uppercase tracking-widest">Saving</span>}
            <div className={`px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest ${isSaving ? 'text-gray-600' : 'text-green-500'}`}>Auto saving</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 w-full max-w-[1400px] h-full lg:h-[900px]">
        <div className="flex-[2.5] flex justify-center bg-white/[0.02] p-10 rounded-[3.5rem] border border-white/5 shadow-inner">
          <div 
            ref={pitchRef} 
            className="relative w-full max-w-[750px] aspect-[2/3] bg-green-800 rounded-3xl border-[10px] border-white/10 shadow-2xl select-none"
            style={{ cursor: drawMode === 'pen' ? 'crosshair' : drawMode === 'eraser' ? 'cell' : 'default' }}
          >
            {/* --- 드로잉 캔버스 레이어 --- */}
            <canvas 
              ref={canvasRef}
              onMouseDown={startDrawing}
              className={`absolute inset-0 z-30 pointer-events-${drawMode === 'move' ? 'none' : 'auto'}`}
            />

            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_bottom,transparent_49.5%,rgba(255,255,255,0.05)_50%,transparent_50.5%)] bg-[length:100%_10%] pointer-events-none"></div>
            <div className="absolute top-1/2 w-full h-1 bg-white/10 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-[3px] border-white/10 rounded-full pointer-events-none"></div>
            
            {/* 우리팀 렌더링 */}
            {fieldPlayers.map((player) => (
              <div key={player.id} onMouseDown={(e) => handleMouseDown(e, player.id)} 
                   className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 ${draggingId === player.id ? 'z-50 scale-110 shadow-3xl' : ''} ${drawMode === 'move' ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'}`} 
                   style={{ top: player.pos_top!, left: player.pos_left!, transition: draggingId === player.id ? 'none' : 'all 0.3s ease-out' }}>
                <div className={`w-11 h-11 rounded-full border-[2.5px] flex items-center justify-center relative shadow-2xl transition-colors ${getPositionColor(player.position)}`}>
                  <span className="font-sans font-bold text-lg text-white tracking-tighter">{player.number}</span>
                </div>
                <div className="mt-2 bg-neutral-900/95 backdrop-blur-sm px-3 py-1 rounded-lg text-[10px] font-bold border border-white/10 text-white uppercase tracking-tight shadow-md">
                  {player.name}
                </div>
              </div>
            ))}

            {opponents.map((op) => (
              <div key={op.id} onMouseDown={(e) => handleOpMouseDown(e, op.id)}
                   className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 ${draggingOpId === op.id ? 'z-50 scale-110 shadow-3xl' : ''} ${drawMode === 'move' ? 'cursor-move' : 'pointer-events-none'}`}
                   style={{ top: op.pos_top, left: op.pos_left, transition: draggingOpId === op.id ? 'none' : 'all 0.3s ease-out' }}>
                <div className="w-10 h-10 rounded-full bg-black border-[2px] border-neutral-700 flex items-center justify-center shadow-xl">
                  <span className="text-[9px] font-black text-white opacity-40 italic"></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 벤치 영역 */}
        <div className="flex-1 bg-neutral-900/40 backdrop-blur-3xl rounded-[3.5rem] border border-white/10 p-10 flex flex-col max-h-[600px] lg:max-h-full shadow-2xl">
          <h2 className="text-2xl font-black mb-8 flex items-center justify-between italic tracking-widest opacity-80 uppercase">
            <span>Bench</span>
            <span className="text-red-500 text-base bg-red-500/10 px-4 py-1 rounded-full border border-red-500/20">{benchPlayers.length}</span>
          </h2>
          <div className="flex-1 overflow-y-auto pr-4 space-y-3 scrollbar-hide text-white">
            {benchPlayers.map((player) => (
              <div key={player.id} onMouseDown={(e) => handleMouseDown(e, player.id)} className={`bg-white/[0.03] hover:bg-white/[0.08] p-4 rounded-[1.5rem] flex items-center gap-5 border border-white/5 transition-all group ${drawMode === 'move' ? 'cursor-grab' : 'opacity-50 pointer-events-none'}`}>
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-transform group-hover:scale-105 ${getPositionColor(player.position)}`}>
                  <span className="font-bold text-xs text-white">{player.number}</span>
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm text-neutral-200 uppercase tracking-tight leading-none mb-1">{player.name}</div>
                  <div className="text-[9px] text-neutral-500 font-black tracking-widest uppercase">{player.position}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}