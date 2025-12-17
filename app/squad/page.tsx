'use client'; // 👈 마우스 움직임을 감지해야 해서 Client Component로 변경!

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

// 선수 타입 정의
type Player = {
  id: number;
  name: string;
  number: number;
  position: string;
  pos_top: string;
  pos_left: string;
};

export default function SquadPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  
  // 경기장 요소(div)를 참조하기 위한 ref
  const pitchRef = useRef<HTMLDivElement>(null);

  // 1. 처음 들어오면 DB에서 선수 명단 가져오기
  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    const { data, error } = await supabase.from('players').select('*');
    if (!error && data) {
      setPlayers(data);
    }
    setLoading(false);
  };

  // 2. 마우스 클릭 시 (드래그 시작)
  const handleMouseDown = (e: React.MouseEvent, id: number) => {
    e.preventDefault(); // 글자 선택 방지
    setDraggingId(id);
  };

  // 3. 마우스 움직임 (드래그 중)
  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingId === null || !pitchRef.current) return;

    // 경기장의 크기와 위치 계산
    const rect = pitchRef.current.getBoundingClientRect();
    
    // 마우스 좌표를 %로 변환 (0~100 사이로 제한)
    let xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    let yPercent = ((e.clientY - rect.top) / rect.height) * 100;

    // 경기장 밖으로 못 나가게 가두기
    xPercent = Math.max(0, Math.min(100, xPercent));
    yPercent = Math.max(0, Math.min(100, yPercent));

    // 화면상의 위치 업데이트 (아직 DB 저장은 안 함)
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === draggingId
          ? { ...p, pos_top: `${yPercent}%`, pos_left: `${xPercent}%` }
          : p
      )
    );
  };

  // 4. 마우스 뗌 (드래그 끝)
  const handleMouseUp = () => {
    setDraggingId(null);
  };

  // 5. [전술 저장] 버튼 클릭 시 DB에 진짜 저장
  const saveTactics = async () => {
    if(!confirm("현재 배치로 전술을 저장하시겠습니까?")) return;

    // 변경된 모든 선수의 위치를 하나씩 업데이트
    for (const p of players) {
      await supabase
        .from('players')
        .update({ pos_top: p.pos_top, pos_left: p.pos_left })
        .eq('id', p.id);
    }
    alert("전술 저장 완료! 💾");
  };

  return (
    <div 
      className="min-h-screen bg-neutral-950 text-white pt-24 px-4 pb-10 flex flex-col items-center"
      onMouseMove={handleMouseMove} // 마우스가 어디서 움직이든 감지
      onMouseUp={handleMouseUp}     // 마우스 떼는 것도 감지
    >
      
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-4xl font-extrabold tracking-tighter">
          STARTING <span className="text-red-600">XI</span>
        </h1>
        {/* 저장 버튼 */}
        <button 
          onClick={saveTactics}
          className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-full text-sm shadow-lg hover:scale-105 transition-transform"
        >
          💾 전술 저장
        </button>
      </div>

      {/* 🏟️ 드래그 가능한 축구장 */}
      <div 
        ref={pitchRef}
        className="relative w-full max-w-2xl aspect-[2/3] bg-green-800 rounded-xl border-4 border-white/20 shadow-2xl overflow-hidden cursor-crosshair"
      >
        {/* 잔디 & 라인들 (디자인 동일) */}
        <div className="absolute inset-0 opacity-10 bg-[size:40px_40px] bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)]"></div>
        <div className="absolute top-1/2 w-full h-0.5 bg-white/40"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white/40 rounded-full"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 border-x-2 border-b-2 border-white/40"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-12 border-x-2 border-b-2 border-white/40"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-32 border-x-2 border-t-2 border-white/40"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-12 border-x-2 border-t-2 border-white/40"></div>

        {/* 🏃 선수들 (드래그 가능!) */}
        {players.map((player) => (
          <div
            key={player.id}
            onMouseDown={(e) => handleMouseDown(e, player.id)} // 클릭하면 드래그 시작
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-grab active:cursor-grabbing ${draggingId === player.id ? 'z-50 scale-110' : 'z-10'}`}
            style={{ top: player.pos_top, left: player.pos_left, transition: draggingId === player.id ? 'none' : 'all 0.2s' }}
          >
            {/* 유니폼 */}
            <div className={`w-12 h-12 rounded-full border-2 shadow-lg flex items-center justify-center relative transition-colors ${draggingId === player.id ? 'bg-yellow-500 border-yellow-200' : 'bg-red-600 border-white'}`}>
              <span className="font-bold text-lg">{player.number}</span>
              <div className="absolute -bottom-1 -right-1 bg-black text-[10px] px-1.5 py-0.5 rounded text-yellow-400 font-bold border border-white/20">
                {player.position}
              </div>
            </div>
            {/* 이름표 */}
            <div className="mt-1 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-sm font-medium border border-white/10">
              {player.name}
            </div>
          </div>
        ))}
      </div>
      
      <p className="mt-6 text-gray-400 text-sm animate-pulse">
        👆 선수를 드래그해서 위치를 옮기고, [전술 저장] 버튼을 누르세요.
      </p>

    </div>
  );
}