import { createClient } from "@supabase/supabase-js";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabaseClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase URL эсвэл Key байхгүй байна.");
    return null; 
  }
  return createClient(supabaseUrl, supabaseKey);
};
