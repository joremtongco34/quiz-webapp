import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Quiz {
  id: string;
  code: string;
  host_name: string;
  status: 'waiting' | 'in_progress' | 'completed';
  current_question_index: number;
  question_indices: number[] | null;
  timer_seconds: number;
  started_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Participant {
  id: string;
  quiz_id: string;
  name: string;
  score: number;
  joined_at: string;
}

export interface Answer {
  id: string;
  quiz_id: string;
  participant_id: string;
  question_index: number;
  answer: string;
  is_correct: boolean;
  points_awarded: number;
  response_time_ms: number;
  answered_at: string;
}

