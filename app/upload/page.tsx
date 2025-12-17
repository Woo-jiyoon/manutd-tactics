'use client'; 

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addVideo } from '../actions'; 

export default function UploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    url: '',
    author: '',
    category: '전술', // 기본값
    description: '',
  });

  const extractVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.author.trim()) {
      alert('작성자 이름을 입력해주세요!');
      setLoading(false);
      return;
    }

    const videoId = extractVideoId(formData.url);

    if (!videoId) {
      alert('올바른 유튜브 링크가 아닙니다!');
      setLoading(false);
      return;
    }

    const result = await addVideo({
      title: formData.title,
      videoId: videoId,
      author: formData.author,
      category: formData.category,
      description: formData.description,
    });

    if (!result.success) {
      alert('업로드 실패: ' + result.message);
    } else {
      alert(result.message + ' 전술 페이지로 이동합니다.');
      router.push('/tactics');
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

          <div>
            <label className="block text-sm text-gray-400 mb-2">유튜브 링크 (URL)</label>
            <input
              type="text"
              required
              className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none transition-colors"
              placeholder="https://youtu.be/..."
              onChange={(e) => setFormData({...formData, url: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">카테고리</label>
              <select 
                className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none appearance-none cursor-pointer"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option>전술</option>
                <option>공격</option>
                <option>수비</option>
                <option>하이라이트</option>
                <option>경기 영상</option> {/* 👈 여기에 경기 영상 옵션을 추가했습니다! */}
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

          <div>
            <label className="block text-sm text-gray-400 mb-2">코멘트 / 피드백 내용</label>
            <textarea
              rows={4}
              className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none transition-colors"
              placeholder="영상에 대한 설명을 적어주세요."
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            {loading ? '업로드 중...' : '등록 완료 ✨'}
          </button>

        </form>
      </div>
    </div>
  );
}