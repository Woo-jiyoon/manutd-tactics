import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Supabase와 연결된 단 하나의 클라이언트(객체)를 만듭니다.
// 이제 어디서든 이 'supabase' 친구를 불러서 데이터를 넣거나 뺄 수 있습니다.
export const supabase = createClient(supabaseUrl, supabaseKey);