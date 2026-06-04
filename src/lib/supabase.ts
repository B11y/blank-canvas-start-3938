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
  client?: string | null;
  tools?: string | null;
  challenge?: string | null;
  goal?: string | null;
  concept?: string | null;
  deliverables?: string | null;
  process?: string | null;
  result?: string | null;
  testimonial?: string | null;
  featured?: boolean;
  created_at?: string;
}

export interface SupabaseProjectImage {
  id: string;
  project_id: string;
  image_url: string;
  sort_order: number;
  created_at?: string;
}
