import { supabase, Participant, Quiz } from '../supabase';
import { getQuiz } from './quizService';

/**
 * Join a quiz as a participant
 */
export async function joinQuiz(quizCode: string, name: string): Promise<Participant> {
  // Get quiz
  const quiz = await getQuiz(quizCode);
  if (!quiz) {
    throw new Error('Quiz not found');
  }

  // Check if quiz has started
  if (quiz.status !== 'waiting') {
    throw new Error('Quiz has already started. Cannot join.');
  }

  // Check if name already exists for this quiz
  const { data: existing } = await supabase
    .from('participants')
    .select('id')
    .eq('quiz_id', quiz.id)
    .eq('name', name)
    .single();

  if (existing) {
    throw new Error('Name already taken. Please choose a different name.');
  }

  // Create participant
  const { data, error } = await supabase
    .from('participants')
    .insert({
      quiz_id: quiz.id,
      name: name.trim(),
      score: 0,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to join quiz: ${error.message}`);
  }

  return data as Participant;
}

/**
 * Get all participants for a quiz
 */
export async function getParticipants(quizCode: string): Promise<Participant[]> {
  const quiz = await getQuiz(quizCode);
  if (!quiz) {
    throw new Error('Quiz not found');
  }

  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('quiz_id', quiz.id)
    .order('joined_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to get participants: ${error.message}`);
  }

  return data as Participant[];
}

/**
 * Get participant by ID
 */
export async function getParticipant(participantId: string): Promise<Participant | null> {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('id', participantId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to get participant: ${error.message}`);
  }

  return data as Participant;
}

