import { supabase } from "@/lib/supabase"; // 👈 우리가 만든 열쇠 가져오기

export const dynamic = 'force-dynamic';

// 💡 중요: DB 통신을 위해 함수 앞에 'async'가 붙었습니다.
export default async function TacticsPage() {
  
  // 1. Supabase 'videos' 테이블에서 데이터 가져오기
  // "모든 컬럼(*)을 가져오되, 만든 날짜(created_at) 내림차순으로 정렬해줘"
  const { data: videos, error } = await supabase
    .from("videos")
    .select("*")
    .order("created_at", { ascending: false });

  // 에러 체크 (개발자 확인용)
  if (error) {
    console.error("데이터 가져오기 실패:", error);
  }

  // 데이터가 없을 때 보여줄 화면
  if (!videos || videos.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white pt-32 px-6 text-center">
        <h1 className="text-3xl font-bold mb-4">아직 등록된 영상이 없습니다 😅</h1>
        <p className="text-gray-400">관리자가 열심히 영상을 업로드 중입니다!</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-24 px-6 pb-10">
      
      {/* 헤더 섹션 */}
      <div className="max-w-7xl mx-auto mb-10 border-b border-white/10 pb-4">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span className="text-red-600">📺</span> TACTICAL ANALYSIS
        </h1>
        <p className="text-gray-400 mt-2 text-sm">
          경기 영상을 복기하고 전술을 수정하는 공간입니다.
        </p>
      </div>

      {/* 비디오 그리드 */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* 2. 가져온 데이터(videos)를 하나씩 꺼내서 카드 만들기 */}
        {videos.map((video) => (
          <div key={video.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-red-600/50 transition-all duration-300 shadow-lg group">
            
            {/* 유튜브 플레이어 */}
            <div className="aspect-video w-full bg-black relative">
              <iframe
                className="w-full h-full"
                // DB에 저장된 video_id를 여기에 쏙 넣습니다.
                src={`https://www.youtube.com/embed/${video.video_id}`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* 영상 정보 */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded">
                  {video.category || "일반"}
                </span>
                {/* 날짜를 예쁘게 자르기 (2025-09-20...) */}
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

    </div>
  );
}