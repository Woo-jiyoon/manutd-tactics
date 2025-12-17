'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// 선수 타입 정의
type Player = {
  id: number;
  name: string;
  number: number;
  position: string;
  pos_top: string | null;
  pos_left: string | null;
};

export default function SquadPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false); // 저장 중 상태 추가
  
  // 경기장 참조
  const pitchRef = useRef<HTMLDivElement>(null);

  // 1. 선수 데이터 가져오기
  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    // 좌표가 있는 선수(선발), 없는 선수(후보) 모두 가져옴
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('number', { ascending: true });

    if (!error && data) {
      setPlayers(data);
    }
  };

  // 2. 드래그 시작
  const handleMouseDown = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    setDraggingId(id);
  };

  // 3. 마우스 이동 (드래그 중)
  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingId === null || !pitchRef.current) return;

    const rect = pitchRef.current.getBoundingClientRect();
    
    // 마우스 좌표를 경기장 기준 %로 변환
    let xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    let yPercent = ((e.clientY - rect.top) / rect.height) * 100;

    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id !== draggingId) return p;
        
        // 드래그 중 시각적 업데이트
        return { 
          ...p, 
          pos_top: `${yPercent}%`, 
          pos_left: `${xPercent}%` 
        };
      })
    );
  };

  // 4. 드래그 종료 (놓았을 때 판정)
  const handleMouseUp = (e: React.MouseEvent) => {
    if (draggingId === null || !pitchRef.current) return;

    const rect = pitchRef.current.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    // 경기장 영역 안에 놓았는지 확인
    const isInsidePitch = 
      x >= rect.left && x <= rect.right &&
      y >= rect.top && y <= rect.bottom;

    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id !== draggingId) return p;

        if (isInsidePitch) {
            // 경기장 안: 좌표 0~100% 클램핑
            let topVal = parseFloat(p.pos_top || "50");
            let leftVal = parseFloat(p.pos_left || "50");
            
            topVal = Math.max(0, Math.min(100, topVal));
            leftVal = Math.max(0, Math.min(100, leftVal));

            return { ...p, pos_top: `${topVal}%`, pos_left: `${leftVal}%` };
        } else {
            // 경기장 밖: 벤치 멤버 (좌표 null)
            return { ...p, pos_top: null, pos_left: null };
        }
      })
    );

    setDraggingId(null);
  };

  // 5. 저장하기 (개선된 버전)
  const saveTactics = async () => {
    if(!confirm("현재 배치와 대기 명단을 저장하시겠습니까?")) return;
    
    setIsSaving(true);

    try {
      // players 배열 전체를 한 번에 upsert (업데이트)
      // map을 통해 불필요한 속성이 있다면 제거하거나, 좌표가 없는 경우 명확히 null 처리
      const updates = players.map(p => ({
        id: p.id,
        name: p.name,
        number: p.number,
        position: p.position,
        // pos_top이 빈 문자열이거나 undefined일 경우에도 확실하게 null로 저장
        pos_top: p.pos_top ? p.pos_top : null,
        pos_left: p.pos_left ? p.pos_left : null,
      }));

      const { error } = await supabase
        .from('players')
        .upsert(updates);

      if (error) throw error;

      alert("전술 및 대기 명단 저장 완료! 💾");
    // app/squad/page.tsx 의 saveTactics 함수 내부 catch 블록 수정

  } catch (error: any) {
    // 에러의 상세 내용을 뜯어서 출력
    console.error("저장 에러 발생!");
    console.error("메시지:", error.message);
    console.error("상세:", error.details);
    console.error("힌트:", error.hint);
    
    alert(`저장 실패: ${error.message || "알 수 없는 오류"}`);
  } finally {
    setIsSaving(false);
  }
  };

  // 렌더링 도우미
  const fieldPlayers = players.filter(p => p.pos_top !== null && p.pos_left !== null);
  const benchPlayers = players.filter(p => p.pos_top === null || p.pos_left === null);

  return (
    <div 
      className="min-h-screen bg-neutral-950 text-white pt-24 px-4 pb-10 flex flex-col items-center"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      
      {/* 상단 헤더 */}
      <div className="w-full max-w-6xl flex justify-between items-end mb-6 px-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter">
              MATCH <span className="text-red-600">DAY</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            선수를 경기장으로 드래그하면 <span className="text-white font-bold">선발</span>, 밖으로 빼면 <span className="text-gray-300 font-bold">대기</span>입니다.
          </p>
        </div>
        <button 
          onClick={saveTactics}
          disabled={isSaving}
          className={`bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-full shadow-lg hover:scale-105 transition-transform flex items-center gap-2 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span>{isSaving ? '저장 중...' : '💾 전술 저장'}</span>
        </button>
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl">
        
        {/* 🏟️ 1. 경기장 (Left) */}
        <div className="flex-1 flex justify-center bg-black/30 p-4 rounded-3xl border border-white/5">
            <div 
            ref={pitchRef}
            className="relative w-full max-w-[600px] aspect-[2/3] bg-green-800 rounded-xl border-4 border-white/20 shadow-2xl overflow-hidden cursor-crosshair select-none"
            >
            {/* 잔디 패턴 & 라인 */}
            <div className="absolute inset-0 opacity-10 bg-[size:40px_40px] bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)]"></div>
            <div className="absolute top-1/2 w-full h-0.5 bg-white/40"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white/40 rounded-full"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 border-x-2 border-b-2 border-white/40"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-12 border-x-2 border-b-2 border-white/40"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-32 border-x-2 border-t-2 border-white/40"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-12 border-x-2 border-t-2 border-white/40"></div>

            {/* 🏃 필드 위 선수들 */}
            {fieldPlayers.map((player) => (
                <div
                key={player.id}
                onMouseDown={(e) => handleMouseDown(e, player.id)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-grab active:cursor-grabbing hover:z-50 ${draggingId === player.id ? 'z-50 scale-110' : 'z-10'}`}
                style={{ top: player.pos_top!, left: player.pos_left!, transition: draggingId === player.id ? 'none' : 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)' }}
                >
                {/* 선수 아이콘 (유니폼) */}
                <div className={`w-14 h-14 rounded-full border-2 shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex items-center justify-center relative transition-colors ${draggingId === player.id ? 'bg-red-500 border-white scale-110' : 'bg-red-700 border-white/80'}`}>
                    <span className="font-black text-xl italic">{player.number}</span>
                    {/* 포지션 뱃지 */}
                    <div className="absolute -bottom-1 -right-1 bg-black text-[10px] px-1.5 py-0.5 rounded text-yellow-400 font-bold border border-white/20 shadow-md">
                        {player.position}
                    </div>
                </div>
                {/* 이름표 */}
                <div className="mt-1 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/10 shadow-lg text-white">
                    {player.name}
                </div>
                </div>
            ))}
            </div>
        </div>

        {/* 💺 2. 대기석 (Right) */}
        <div className="w-full lg:w-80 bg-neutral-900/50 backdrop-blur-sm rounded-3xl border border-white/10 p-6 flex flex-col h-[600px] lg:h-auto">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-red-600 rounded-full"></span>
                SUBSTITUTES <span className="text-gray-500 text-sm">({benchPlayers.length})</span>
            </h2>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {benchPlayers.length === 0 ? (
                    <div className="text-gray-500 text-sm text-center py-10">대기 선수가 없습니다.</div>
                ) : (
                    benchPlayers.map((player) => (
                        <div 
                            key={player.id}
                            onMouseDown={(e) => handleMouseDown(e, player.id)}
                            className="bg-neutral-800/80 hover:bg-neutral-700 p-3 rounded-xl flex items-center gap-4 cursor-grab active:cursor-grabbing border border-white/5 transition-all hover:border-red-500/50 group"
                        >
                            {/* 미니 유니폼 아이콘 */}
                            <div className="w-10 h-10 rounded-full bg-neutral-700 border border-white/20 flex items-center justify-center group-hover:bg-red-900 transition-colors relative">
                                <span className="font-bold text-sm text-gray-300 group-hover:text-white">{player.number}</span>
                                <div className="absolute -bottom-1 -right-1 bg-black text-[8px] px-1 rounded text-yellow-400 font-bold">
                                    {player.position}
                                </div>
                            </div>
                            
                            {/* 정보 */}
                            <div className="flex-1">
                                <div className="font-bold text-sm text-gray-200">{player.name}</div>
                                <div className="text-xs text-gray-500">Waiting</div>
                            </div>

                            <div className="text-gray-500 group-hover:text-green-400 text-xs">
                                ◀ Drag
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            {/* 힌트 박스 */}
            <div className="mt-4 bg-red-900/20 p-4 rounded-xl border border-red-500/20 text-xs text-red-200">
                💡 <strong>교체 방법:</strong><br/>
                대기 선수를 드래그해서 경기장 위에 놓으면 <span className="text-white font-bold">출전</span>합니다. 반대로 경기장 밖으로 빼면 <span className="text-gray-400 font-bold">교체 아웃</span> 됩니다.
            </div>
        </div>

      </div>
    </div>
  );
}