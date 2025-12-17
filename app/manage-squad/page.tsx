'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ManageSquadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // 위치 정보는 이제 입력받지 않음 (기본값: 중앙 대기)
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    position: 'FW',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('players').insert([
      {
        name: formData.name,
        number: parseInt(formData.number),
        position: formData.position,
        pos_top: '50%',   // 기본값: 중앙
        pos_left: '50%',  // 기본값: 중앙
      },
    ]);

    if (error) {
      alert('영입 실패 ㅠㅠ: ' + error.message);
    } else {
      alert('계약 완료! 선수단 페이지에서 위치를 잡아주세요.');
      router.push('/squad');
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-32 px-6 flex justify-center">
      <div className="w-full max-w-lg">
        
        <h1 className="text-3xl font-bold mb-8 text-center">
          <span className="text-red-600">✍️</span> 선수 영입 계약서
        </h1>

        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 p-8 rounded-2xl space-y-6 shadow-2xl">
          
          {/* 이름 입력 */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">선수 이름</label>
            <input
              type="text"
              required
              className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none"
              placeholder="예: Rashford"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          {/* 등번호 입력 */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">등번호</label>
            <input
              type="number"
              required
              className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none"
              placeholder="10"
              onChange={(e) => setFormData({...formData, number: e.target.value})}
            />
          </div>

          {/* 포지션 선택 */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">주 포지션</label>
            <select 
              className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none appearance-none"
              onChange={(e) => setFormData({...formData, position: e.target.value})}
            >
              <option value="FW">FW (공격수)</option>
              <option value="ST">ST (스트라이커)</option>
              <option value="LW">LW (왼쪽 윙)</option>
              <option value="RW">RW (오른쪽 윙)</option>
              <option value="MF">MF (미드필더)</option>
              <option value="CAM">CAM (공미)</option>
              <option value="CDM">CDM (수미)</option>
              <option value="DF">DF (수비수)</option>
              <option value="CB">CB (센터백)</option>
              <option value="LB">LB (왼쪽 풀백)</option>
              <option value="RB">RB (오른쪽 풀백)</option>
              <option value="GK">GK (골키퍼)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-red-900/50 transform active:scale-95"
          >
            {loading ? '계약 진행 중...' : '계약 완료 및 합류'}
          </button>

          <p className="text-center text-xs text-gray-500">
            * 등록 후 [선수단] 페이지에서 위치를 배정하세요.
          </p>

        </form>
      </div>
    </div>
  );
}