// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Supabase 환경변수가 설정되지 않았습니다. .env.local을 확인하세요.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// 서버사이드 전용 (API Route, Server Component)
export const supabaseAdmin = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY가 없습니다.");
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
};
