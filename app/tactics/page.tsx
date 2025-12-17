'use client'; // 👈 클릭 이벤트 처리를 위해 클라이언트 컴포넌트로 변경

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function TacticsPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState("전체");

  // 카테고리 목록
  const categories = ["전체", "전술", "공격", "수비", "하이라이트", "기타"];

  // 1. 처음 들어왔을 때 데이터 가져오기
  useEffect(() => {
    async function fetchVideos() {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("데이터 가져오기 실패:", error);
      } else {
        setVideos(data || []);
        setFilteredVideos(data || []); // 처음엔 전체 보여주기
      }
      setLoading(false);
    }
    fetchVideos();
  }, []);

  // 2. 카테고리 필터링 함수
  const filterVideos = (category: string) => {
    setCurrentCategory(category);
    if (category === "전체") {
      setFilteredVideos(videos);
    } else {
      const filtered = videos.filter((v) => v.category === category);
      setFilteredVideos(filtered);
    }
  };

  if (loading) return <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">데이터 로딩 중...</div>;

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-24 px-6 pb-10">
      
      {/* 헤더 섹션 */}
      <div className="max-w-7xl mx-auto mb-6 border-b border-white/10 pb-4">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span className="text-red-600">📺</span> TACTICAL ANALYSIS
        </h1>
        <p className="text-gray-400 mt-2 text-sm">
          카테고리별로 영상을 분류해서 볼 수 있습니다.
        </p>
      </div>

      {/* ⭐ 카테고리 필터 버튼 영역 */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-wrap gap-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => filterVideos(cat)}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
              currentCategory === cat
                ? "bg-red-600 text-white shadow-lg shadow-red-900/20"
                : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 비디오 그리드 */}
      {filteredVideos.length === 0 ? (
        <div className="max-w-7xl mx-auto text-center py-20">
          <p className="text-gray-500">선택하신 카테고리에 등록된 영상이 없습니다. 😅</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVideos.map((video) => (
            <div key={video.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-red-600/50 transition-all duration-300 shadow-lg group">
              
              <div className="aspect-video w-full bg-black relative">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${video.video_id}`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded">
                    {video.category || "일반"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(video.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-red-400 transition-colors">
                  {video.title}
                </h3>
                
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {video.description}
                </p>
                
                <div className="flex items-center justify-between mt-4 text-sm text-gray-400 pt-4 border-t border-white/10">
                  <span>By. {video.author}</span>
                  <span className="text-xs px-2 py-1 bg-white/10 rounded hover:bg-red-600 hover:text-white transition-colors cursor-pointer">
                    💬 피드백
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}