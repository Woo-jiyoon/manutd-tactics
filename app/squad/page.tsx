'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

type Player = {
  id: number;
  name: string;
  number: number;
  position: string;
  pos_top: string | null;
  pos_left: string | null;
};

export default function SquadPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const pitchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('number', { ascending: true });

    if (!error && data) {
      setPlayers(data);
    }
  };

  const getPositionColor = (pos: string) => {
    const p = pos.toUpperCase();
    if (['FW', 'ST', 'LW', 'RW', 'CF'].includes(p)) return 'bg-red-600 border-red-400';
    if (['MF', 'LM', 'LAM', 'LCM', 'CM', 'RCM', 'RAM', 'RM', 'CDM', 'LDM', 'RDM'].includes(p)) return 'bg-lime-500 border-lime-300';
    if (['LB', 'CB', 'SW', 'RB', 'DF', 'LWB', 'RWB'].includes(p)) return 'bg-blue-600 border-blue-400';
    if (p === 'GK') return 'bg-yellow-500 border-yellow-300';
    return 'bg-neutral-600 border-neutral-400';
  };

  const handleMouseDown = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    setDraggingId(id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingId === null || !pitchRef.current) return;
    const rect = pitchRef.current.getBoundingClientRect();
    let xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    let yPercent = ((e.clientY - rect.top) / rect.height) * 100;
    setPlayers((prev) =>
      prev.map((p) => (p.id === draggingId ? { ...p, pos_top: `${yPercent}%`, pos_left: `${xPercent}%` } : p))
    );
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (draggingId === null || !pitchRef.current) return;
    const rect = pitchRef.current.getBoundingClientRect();
    const isInsidePitch = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;

    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id !== draggingId) return p;
        if (isInsidePitch) {
          let topVal = Math.max(0, Math.min(100, parseFloat(p.pos_top || "50")));
          let leftVal = Math.max(0, Math.min(100, parseFloat(p.pos_left || "50")));
          return { ...p, pos_top: `${topVal}%`, pos_left: `${leftVal}%` };
        }
        return { ...p, pos_top: null, pos_left: null };
      })
    );
    setDraggingId(null);
  };

  const saveTactics = async () => {
    if(!confirm("전술을 저장하시겠습니까?")) return;
    setIsSaving(true);
    try {
      const updates = players.map(p => ({
        id: p.id, name: p.name, number: p.number, position: p.position,
        pos_top: p.pos_top || null, pos_left: p.pos_left || null,
      }));
      const { error } = await supabase.from('players').upsert(updates);
      if (error) throw error;
      alert("전술 저장 완료! 💾");
      router.refresh();
    } catch (error: any) { alert(`오류: ${error.message}`); } finally { setIsSaving(false); }
  };

  const fieldPlayers = players.filter(p => p.pos_top !== null && p.pos_left !== null);
  const benchPlayers = players.filter(p => p.pos_top === null || p.pos_left === null);

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-24 px-4 pb-10 flex flex-col items-center font-sans" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <div className="w-full max-w-[1400px] flex justify-between items-end mb-8 px-6">
        <div>
          <h1 className="text-5xl font-black italic tracking-tighter leading-none">TACTICAL <span className="text-red-600">BOARD</span></h1>
          <p className="text-gray-500 text-sm mt-2 font-medium tracking-wide uppercase">Professional Squad Management</p>
        </div>
        <button onClick={saveTactics} disabled={isSaving} className={`bg-red-600 hover:bg-red-700 text-white font-black px-12 py-5 rounded-2xl shadow-[0_10px_20px_rgba(220,38,38,0.3)] transition-all ${isSaving ? 'opacity-50' : 'hover:scale-105 active:scale-95'}`}>
          {isSaving ? 'SAVING...' : '전술 저장'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 w-full max-w-[1400px] h-full lg:h-[900px]">
        
        {/* 🏟️ 더 커진 경기장 (너비 확장 및 패딩 조정) */}
        <div className="flex-[2.5] flex justify-center bg-white/[0.02] p-10 rounded-[3.5rem] border border-white/5 shadow-inner">
          <div ref={pitchRef} className="relative w-full max-w-[750px] aspect-[2/3] bg-green-800 rounded-3xl border-[10px] border-white/10 shadow-2xl overflow-hidden cursor-crosshair select-none">
            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_bottom,transparent_49.5%,rgba(255,255,255,0.05)_50%,transparent_50.5%)] bg-[length:100%_10%]"></div>
            <div className="absolute top-1/2 w-full h-1 bg-white/10 -translate-y-1/2"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-[3px] border-white/10 rounded-full"></div>
            
            {fieldPlayers.map((player) => (
              <div key={player.id} onMouseDown={(e) => handleMouseDown(e, player.id)} 
                   className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 cursor-grab active:cursor-grabbing ${draggingId === player.id ? 'z-50 scale-110' : ''}`} 
                   style={{ top: player.pos_top!, left: player.pos_left!, transition: draggingId === player.id ? 'none' : 'all 0.4s cubic-bezier(0.2, 0, 0, 1)' }}>
                {/* 🔴 줄어든 선수 원 크기 및 깔끔한 폰트 적용 */}
                <div className={`w-11 h-11 rounded-full border-[2.5px] flex items-center justify-center relative shadow-2xl transition-colors ${getPositionColor(player.position)}`}>
                  <span className="font-sans font-bold text-lg text-white tracking-tighter">{player.number}</span>
                </div>
                <div className="mt-2 bg-neutral-900/95 backdrop-blur-sm px-3 py-1 rounded-lg text-[10px] font-bold border border-white/10 text-white uppercase tracking-tight shadow-md">
                  {player.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 💺 대기석 영역 */}
        <div className="flex-1 bg-neutral-900/40 backdrop-blur-3xl rounded-[3.5rem] border border-white/10 p-10 flex flex-col max-h-[600px] lg:max-h-full shadow-2xl">
          <h2 className="text-2xl font-black mb-8 flex items-center justify-between italic tracking-widest opacity-80">
            <span>BENCH</span>
            <span className="text-red-500 text-base bg-red-500/10 px-4 py-1 rounded-full border border-red-500/20">{benchPlayers.length}</span>
          </h2>
          
          <div className="flex-1 overflow-y-auto pr-4 space-y-3 
                          [&::-webkit-scrollbar]:w-1.5 
                          [&::-webkit-scrollbar-track]:bg-transparent 
                          [&::-webkit-scrollbar-thumb]:bg-neutral-800 
                          [&::-webkit-scrollbar-thumb]:rounded-full 
                          hover:[&::-webkit-scrollbar-thumb]:bg-red-600 
                          transition-all duration-500">
            {benchPlayers.length === 0 ? (
              <div className="text-neutral-800 text-center py-32 font-black italic text-2xl uppercase tracking-tighter opacity-10">Empty</div>
            ) : (
              benchPlayers.map((player) => (
                <div key={player.id} onMouseDown={(e) => handleMouseDown(e, player.id)} className="bg-white/[0.03] hover:bg-white/[0.08] p-4 rounded-[1.5rem] flex items-center gap-5 cursor-grab active:cursor-grabbing border border-white/5 transition-all group">
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-transform group-hover:scale-105 ${getPositionColor(player.position)}`}>
                    <span className="font-bold text-xs text-white">{player.number}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm text-neutral-200 uppercase tracking-tight leading-none mb-1">{player.name}</div>
                    <div className="text-[9px] text-neutral-500 font-black tracking-widest uppercase">{player.position}</div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/5">
            <div className="bg-white/[0.02] p-5 rounded-2xl border border-white/5 text-[10px] text-neutral-500 leading-relaxed font-semibold uppercase tracking-wider">
              Drag players to assign positions
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}