import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rfkfxlrddbifmgriqqnu.supabase.co';
const supabaseAnonKey = 'sb_publishable_mw-vKvvrbjhS01Du2ysxPQ_vG8q4N7d';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SupabaseProject {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  date: string;
  created_at?: string;
}
