'use client'; // 👈 사용자 입력을 받는 페이지라 필수!

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // 입력값들을 저장할 통
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    author: 'Manager', // 기본 작성자
    category: '전술',
    description: '',
  });

  // 1. 유튜브 링크에서 ID만 쏙 뽑아내는 마법의 함수
  const extractVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // 2. 업로드 버튼 눌렀을 때 실행되는 함수
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 화면 새로고침 방지
    setLoading(true);

    const videoId = extractVideoId(formData.url);

    if (!videoId) {
      alert('올바른 유튜브 링크가 아닙니다! (예: https://youtu.be/...)');
      setLoading(false);
      return;
    }

    // DB에 저장!
    const { error } = await supabase.from('videos').insert([
      {
        title: formData.title,
        video_id: videoId, // 추출한 ID 저장
        author: formData.author,
        category: formData.category,
        description: formData.description,
      },
    ]);

    if (error) {
      alert('업로드 실패 ㅠㅠ: ' + error.message);
    } else {
      alert('영상 등록 완료! 전술 페이지로 이동합니다.');
      router.push('/tactics'); // 전술 페이지로 자동 이동
      router.refresh(); // 데이터 새로고침
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-24 px-6 flex justify-center">
      <div className="w-full max-w-xl">
        
        <h1 className="text-3xl font-bold mb-8 text-center">
          <span className="text-red-600">📹</span> 영상 등록하기
        </h1>

        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 p-8 rounded-2xl space-y-6 shadow-2xl">
          
          {/* 제목 입력 */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">영상 제목</label>
            <input
              type="text"
              required
              className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none transition-colors"
              placeholder="예: vs 리버풀 수비 피드백"
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          {/* 유튜브 링크 입력 */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">유튜브 링크 (URL)</label>
            <input
              type="text"
              required
              className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none transition-colors"
              placeholder="https://youtu.be/..."
              onChange={(e) => setFormData({...formData, url: e.target.value})}
            />
            <p className="text-xs text-gray-500 mt-2">유튜브 주소를 그대로 복사해서 붙여넣으세요.</p>
          </div>

          {/* 카테고리 & 작성자 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">카테고리</label>
              <select 
                className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none appearance-none"
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option>전술</option>
                <option>공격</option>
                <option>수비</option>
                <option>하이라이트</option>
                <option>기타</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">작성자</label>
              <input
                type="text"
                className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none"
                value={formData.author}
                onChange={(e) => setFormData({...formData, author: e.target.value})}
              />
            </div>
          </div>

          {/* 설명 입력 */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">코멘트 / 피드백 내용</label>
            <textarea
              rows={4}
              className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none transition-colors"
              placeholder="몇 분 몇 초를 보라고 적어주세요."
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {/* 업로드 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '업로드 중...' : '등록 완료 ✨'}
          </button>

        </form>
      </div>
    </div>
  );
}