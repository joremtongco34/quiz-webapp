import { supabase, Quiz } from '../supabase';
import { QUESTIONS, getRandomQuestions } from '../constants/questions';

/**
 * Generate a unique quiz code (6-8 alphanumeric characters)
 */
function generateQuizCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Get questions for a quiz based on stored question indices
 */
export function getQuizQuestions(quiz: Quiz) {
  if (!quiz.question_indices || quiz.question_indices.length === 0) {
    // Fallback to all questions if indices not set (for backward compatibility)
    return QUESTIONS;
  }
  return quiz.question_indices.map((index) => QUESTIONS[index]);
}

/**
 * Create a new quiz
 */
export async function createQuiz(hostName: string, timerSeconds: number = 30): Promise<{ quiz: Quiz; code: string }> {
  let code = generateQuizCode();
  let attempts = 0;
  const maxAttempts = 10;

  // Ensure code is unique
  while (attempts < maxAttempts) {
    const { data: existing } = await supabase
      .from('quizzes')
      .select('id')
      .eq('code', code)
      .single();

    if (!existing) {
      break;
    }
    code = generateQuizCode();
    attempts++;
  }

  if (attempts >= maxAttempts) {
    throw new Error('Failed to generate unique quiz code');
  }

  // Randomly select at least 10 questions
  const selectedQuestions = getRandomQuestions(10);
  const questionIndices = selectedQuestions.map((q) => QUESTIONS.indexOf(q));

  const { data, error } = await supabase
    .from('quizzes')
    .insert({
      code,
      host_name: hostName,
      status: 'waiting',
      current_question_index: 0,
      question_indices: questionIndices,
      timer_seconds: timerSeconds,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create quiz: ${error.message}`);
  }

  return { quiz: data as Quiz, code };
}

/**
 * Get quiz by code
 */
export async function getQuiz(code: string): Promise<Quiz | null> {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('code', code)
    .single();

  if (error) {
    // Handle "not found" errors
    if (error.code === 'PGRST116' || error.message?.includes('No rows')) {
      return null; // Not found
    }
    console.error('Error getting quiz:', error);
    throw new Error(`Failed to get quiz: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return data as Quiz;
}

/**
 * Start a quiz
 */
export async function startQuiz(code: string): Promise<void> {
  const { error } = await supabase
    .from('quizzes')
    .update({
      status: 'in_progress',
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('code', code);

  if (error) {
    throw new Error(`Failed to start quiz: ${error.message}`);
  }
}

/**
 * Move to next question
 */
export async function nextQuestion(code: string, currentIndex?: number): Promise<void> {
  // If currentIndex is provided, use it directly (more reliable)
  if (currentIndex !== undefined) {
    const { data, error } = await supabase
      .from('quizzes')
      .update({
        current_question_index: currentIndex + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('code', code)
      .select()
      .single();

    if (error) {
      console.error('Error updating quiz:', error);
      throw new Error(`Failed to move to next question: ${error.message}`);
    }

    if (!data) {
      throw new Error('Quiz update did not return data. The quiz may have been deleted.');
    }
    return;
  }

  // Otherwise, fetch quiz first (with retry)
  let quiz = await getQuiz(code);
  if (!quiz) {
    // Retry once after a short delay
    await new Promise(resolve => setTimeout(resolve, 500));
    quiz = await getQuiz(code);
    if (!quiz) {
      throw new Error(`Quiz not found with code: ${code}. Please refresh the page.`);
    }
  }

  const newIndex = quiz.current_question_index + 1;
  
  const { data, error } = await supabase
    .from('quizzes')
    .update({
      current_question_index: newIndex,
      updated_at: new Date().toISOString(),
    })
    .eq('code', code)
    .select()
    .single();

  if (error) {
    console.error('Error updating quiz:', error);
    console.error('Quiz code:', code);
    console.error('Current index:', quiz.current_question_index);
    throw new Error(`Failed to move to next question: ${error.message}`);
  }

  if (!data) {
    throw new Error('Quiz update did not return data. The quiz may have been deleted.');
  }
}

/**
 * Complete the quiz
 */
export async function completeQuiz(code: string): Promise<void> {
  const { error } = await supabase
    .from('quizzes')
    .update({
      status: 'completed',
      updated_at: new Date().toISOString(),
    })
    .eq('code', code);

  if (error) {
    throw new Error(`Failed to complete quiz: ${error.message}`);
  }
}

/**
 * Get rankings for a quiz
 */
export async function getRankings(quizCode: string) {
  const { data: quiz } = await getQuiz(quizCode);
  if (!quiz) {
    throw new Error('Quiz not found');
  }

  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('quiz_id', quiz.id)
    .order('score', { ascending: false });

  if (error) {
    throw new Error(`Failed to get rankings: ${error.message}`);
  }

  return data;
}

