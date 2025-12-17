'use server'; // 👈 Server Action임을 명시합니다.

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache'; // 👈 캐시 무효화 함수를 가져옵니다.

// 영상 데이터를 받아 DB에 저장하고 캐시를 무효화하는 함수
export async function addVideo(videoData: { 
  title: string; 
  videoId: string; 
  author: string; 
  category: string; 
  description: string; 
}) {
  
  const { error } = await supabase.from('videos').insert([
    {
      title: videoData.title,
      video_id: videoData.videoId,
      author: videoData.author,
      category: videoData.category,
      description: videoData.description,
    },
  ]);

  if (error) {
    return { success: false, message: error.message };
  }

  // 🔥 핵심: DB에 변화가 생겼으니, /tactics 경로의 캐시를 무효화합니다.
  revalidatePath('/tactics'); 

  return { success: true, message: '영상 등록 완료!' };
}