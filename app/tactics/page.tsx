'use client';

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function TacticsPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState("전체");
  
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [allCommentCounts, setAllCommentCounts] = useState<{ [key: string]: number }>({});
  const [newComment, setNewComment] = useState({ author: "", content: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; 
  const categories = ["전체", "전술", "공격", "수비", "하이라이트", "경기 영상", "기타"];

  useEffect(() => {
    fetchVideos();
    fetchAllCommentCounts();
  }, []);

  async function fetchVideos() {
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) {
      setVideos(data || []);
      setFilteredVideos(data || []);
    }
    setLoading(false);
  }

  const fetchAllCommentCounts = async () => {
    const { data, error } = await supabase.from("video_comments").select("video_id");
    if (!error && data) {
      const counts = data.reduce((acc: any, cur: any) => {
        acc[cur.video_id] = (acc[cur.video_id] || 0) + 1;
        return acc;
      }, {});
      setAllCommentCounts(counts);
    }
  };

  const fetchComments = async (videoId: string) => {
    const { data, error } = await supabase
      .from("video_comments")
      .select("*")
      .eq("video_id", videoId)
      .order("created_at", { ascending: true });
    if (!error) setComments(data || []);
  };

  const handleCommentSubmit = async (videoId: string) => {
    if (!newComment.author.trim() || !newComment.content.trim()) return alert("이름과 내용을 입력해주세요!");
    setIsSubmitting(true);
    const { error } = await supabase.from("video_comments").insert([
      { video_id: videoId, author: newComment.author, content: newComment.content }
    ]);

    if (!error) {
      setNewComment({ ...newComment, content: "" });
      await fetchComments(videoId);
      await fetchAllCommentCounts();
    }
    setIsSubmitting(false);
  };

  const handleDeleteComment = async (commentId: string, videoId: string) => {
    if (!confirm("이 댓글을 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("video_comments").delete().eq("id", commentId);
    if (!error) {
      await fetchComments(videoId);
      await fetchAllCommentCounts();
    }
  };

  const handleUpdateComment = async (commentId: string, videoId: string) => {
    if (!editContent.trim()) return alert("내용을 입력해주세요!");
    const { error } = await supabase
      .from("video_comments")
      .update({ content: editContent })
      .eq("id", commentId);
    
    if (!error) {
      setEditingCommentId(null);
      await fetchComments(videoId);
    }
  };

  const filterVideos = (category: string) => {
    setCurrentCategory(category);
    setCurrentPage(1); 
    setFilteredVideos(category === "전체" ? videos : videos.filter((v) => v.category === category));
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredVideos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);

  // 🔢 ⭐ 추가된 페이지네이션 그룹화 로직
  const pageGroupSize = 7; // 한 번에 보여줄 페이지 버튼 개수
  const currentGroup = Math.ceil(currentPage / pageGroupSize); // 현재 페이지가 몇 번째 그룹인지
  const startPage = (currentGroup - 1) * pageGroupSize + 1; // 그룹의 시작 페이지
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages); // 그룹의 끝 페이지 (전체 페이지를 넘지 않음)

  if (loading) return <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">데이터 로딩 중...</div>;

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-24 px-6 pb-20 font-sans">
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(220, 38, 38, 0.5); border-radius: 10px; }
      `}</style>

      {/* 헤더 및 카테고리 (기존 동일) */}
      <div className="max-w-7xl mx-auto mb-6 border-b border-white/10 pb-4">
        <h1 className="text-3xl font-black italic tracking-tighter flex items-center gap-3">
          <span className="text-red-600">📺</span> TACTICAL ANALYSIS
        </h1>
      </div>

      <div className="max-w-7xl mx-auto mb-10 flex flex-wrap gap-3">
        {categories.map((cat) => (
          <button key={cat} onClick={() => filterVideos(cat)} className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${currentCategory === cat ? "bg-red-600 text-white shadow-lg" : "bg-white/5 text-gray-400 border border-white/10"}`}>{cat}</button>
        ))}
      </div>

      {/* 비디오 그리드 (기존 동일) */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 items-stretch">
        {currentItems.map((video) => (
          <div key={video.id} className="relative bg-white/5 border border-white/10 rounded-2xl overflow-visible hover:border-red-600/50 transition-all flex flex-col shadow-xl">
            <div className="aspect-video w-full bg-black rounded-t-2xl overflow-hidden">
              <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${video.video_id}`} title={video.title} allowFullScreen />
            </div>

            <div className="p-5 flex-1 flex flex-col relative">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 px-2 py-1 rounded-md">{video.category || "일반"}</span>
                <span className="text-[10px] text-gray-500">{new Date(video.created_at).toLocaleDateString()}</span>
              </div>
              <h3 className="text-lg font-bold mb-2 line-clamp-1">{video.title}</h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{video.description}</p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                <span className="text-xs text-gray-500 font-semibold uppercase">By. {video.author}</span>
                <button 
                  onClick={() => {
                    if (activeVideoId === video.id) setActiveVideoId(null);
                    else { setActiveVideoId(video.id); fetchComments(video.id); }
                  }}
                  className={`z-10 flex items-center gap-2 text-[11px] font-black uppercase px-3 py-1.5 rounded-full transition-all ${
                    activeVideoId === video.id ? "bg-red-600 text-white shadow-lg scale-105" : "bg-white/10 text-gray-300 hover:bg-red-600 hover:text-white"
                  }`}
                >
                  💬 댓글
                  {allCommentCounts[video.id] > 0 && (
                    <span className="bg-white text-red-600 w-4 h-4 flex items-center justify-center rounded-full text-[9px]">
                      {allCommentCounts[video.id]}
                    </span>
                  )}
                </button>
              </div>

              {/* 댓글창 로직 (기존 동일) */}
              {activeVideoId === video.id && (
                <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-neutral-900 rounded-2xl p-4 border border-red-600/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-200">
                  <div className="absolute -top-2 right-6 w-4 h-4 bg-neutral-900 border-l border-t border-red-600/30 rotate-45"></div>
                  <div className="max-h-56 overflow-y-auto mb-4 space-y-3 pr-2 custom-scrollbar">
                    {comments.length === 0 ? (
                      <p className="text-[10px] text-gray-600 text-center py-4 uppercase font-bold italic">No feedback yet</p>
                    ) : (
                      comments.map((c) => (
                        <div key={c.id} className="text-xs bg-white/[0.03] p-3 rounded-xl border border-white/5">
                          <div className="flex justify-between items-center mb-1">
                             <span className="font-black text-red-500 text-[10px] uppercase">{c.author}</span>
                             <div className="flex gap-2 items-center">
                               <span className="text-[9px] text-neutral-600">{new Date(c.created_at).toLocaleDateString()}</span>
                               <div className="flex gap-1 ml-1">
                                 <button onClick={() => { setEditingCommentId(c.id); setEditContent(c.content); }} className="hover:text-blue-400 text-[9px] opacity-50 hover:opacity-100">✏️</button>
                                 <button onClick={() => handleDeleteComment(c.id, video.id)} className="hover:text-red-500 text-[9px] opacity-50 hover:opacity-100">❌</button>
                               </div>
                             </div>
                          </div>
                          {editingCommentId === c.id ? (
                            <div className="mt-2 space-y-2">
                              <textarea className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-xs text-white focus:border-blue-500 outline-none" value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                              <div className="flex justify-end gap-2">
                                <button onClick={() => setEditingCommentId(null)} className="text-[9px] text-gray-400">취소</button>
                                <button onClick={() => handleUpdateComment(c.id, video.id)} className="text-[9px] text-blue-400 font-bold">저장</button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-gray-300 leading-snug">{c.content}</div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <input type="text" placeholder="NAME" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[10px] font-bold focus:border-red-600 text-white placeholder:text-gray-600 transition-all uppercase" value={newComment.author} onChange={(e) => setNewComment({...newComment, author: e.target.value})} />
                    <div className="flex gap-2">
                      <input type="text" placeholder="ADD FEEDBACK..." className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[10px] font-bold focus:border-red-600 text-white placeholder:text-gray-600 transition-all uppercase" value={newComment.content} onChange={(e) => setNewComment({...newComment, content: e.target.value})} onKeyDown={(e) => e.key === 'Enter' && !isSubmitting && handleCommentSubmit(video.id)} />
                      <button disabled={isSubmitting} onClick={() => handleCommentSubmit(video.id)} className="bg-red-600 hover:bg-red-700 disabled:opacity-50 px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all shadow-lg">{isSubmitting ? "..." : "POST"}</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 🔢 ⭐ 수정된 하단 페이지네이션 (7페이지 단위 그룹화 적용) */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3">
          <button 
            disabled={currentPage === 1} 
            onClick={() => { setCurrentPage(prev => Math.max(prev - 1, 1)); window.scrollTo(0, 0); }} 
            className="px-5 py-2 bg-white/5 border border-white/10 rounded-xl disabled:opacity-20 hover:bg-white/10 font-bold text-xs uppercase tracking-tighter transition-all italic"
          >
            PREV
          </button>
          
          <div className="flex gap-2">
            {/* 7개 단위로 생성된 페이지 버튼만 렌더링 */}
            {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((pageNum) => (
              <button 
                key={pageNum} 
                onClick={() => { setCurrentPage(pageNum); window.scrollTo(0, 0); }} 
                className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${currentPage === pageNum ? "bg-red-600 text-white scale-110 shadow-lg" : "bg-white/5 text-gray-500 hover:bg-white/10"}`}
              >
                {pageNum}
              </button>
            ))}
          </div>

          <button 
            disabled={currentPage === totalPages} 
            onClick={() => { setCurrentPage(prev => Math.min(prev + 1, totalPages)); window.scrollTo(0, 0); }} 
            className="px-5 py-2 bg-white/5 border border-white/10 rounded-xl disabled:opacity-20 hover:bg-white/10 font-bold text-xs uppercase tracking-tighter transition-all italic"
          >
            NEXT
          </button>
        </div>
      )}
    </div>
  );
}