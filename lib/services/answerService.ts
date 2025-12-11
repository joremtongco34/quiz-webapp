import { supabase, Answer, Quiz } from '../supabase';
import { getQuiz, getQuizQuestions } from './quizService';

/**
 * Submit an answer and calculate points
 */
export async function submitAnswer(
  quizCode: string,
  participantId: string,
  questionIndex: number,
  answer: string,
  responseTimeMs: number
): Promise<void> {
  const quiz = await getQuiz(quizCode);
  if (!quiz) {
    throw new Error('Quiz not found');
  }

  // Validate quiz state
  if (quiz.status !== 'in_progress') {
    throw new Error('Quiz is not in progress');
  }

  // Allow participants to answer any question (they can navigate freely)
  // Removed check for quiz.current_question_index since participants control their own progress

  // Get quiz questions
  const quizQuestions = getQuizQuestions(quiz);
  
  // Validate question index
  if (questionIndex < 0 || questionIndex >= quizQuestions.length) {
    throw new Error('Invalid question index');
  }

  const question = quizQuestions[questionIndex];
  const isCorrect = answer === question.correctAnswer;

  // Check if answer already exists
  const { data: existingAnswer } = await supabase
    .from('answers')
    .select('id')
    .eq('quiz_id', quiz.id)
    .eq('participant_id', participantId)
    .eq('question_index', questionIndex)
    .single();

  if (existingAnswer) {
    throw new Error('Answer already submitted');
  }

  // Insert answer first (points will be calculated after)
  const { data: insertedAnswer, error: insertError } = await supabase
    .from('answers')
    .insert({
      quiz_id: quiz.id,
      participant_id: participantId,
      question_index: questionIndex,
      answer,
      is_correct: isCorrect,
      points_awarded: 0,
      response_time_ms: responseTimeMs,
    })
    .select()
    .single();

  if (insertError) {
    throw new Error(`Failed to submit answer: ${insertError.message}`);
  }

  // Only calculate points for correct answers
  if (isCorrect) {
    // Get all correct answers for this question, ordered by response time
    // Include the newly inserted answer in the query
    const { data: correctAnswers } = await supabase
      .from('answers')
      .select('*')
      .eq('quiz_id', quiz.id)
      .eq('question_index', questionIndex)
      .eq('is_correct', true)
      .order('response_time_ms', { ascending: true });

    if (correctAnswers && correctAnswers.length > 0) {
      // Find position of current answer (1-indexed)
      const position = correctAnswers.findIndex((a) => a.id === insertedAnswer.id) + 1;

      // Only award points to top 3 fastest correct answers
      if (position <= 3) {
        const basePoints = [100, 50, 25][position - 1];
        const maxTime = (quiz.timer_seconds || 30) * 1000;
        const timeRatio = Math.max(0, 1 - responseTimeMs / maxTime);
        const points = Math.round(basePoints * (0.5 + 0.5 * timeRatio)); // Scale between 50% and 100% of base points

        // Update answer with points
        const { error: updateAnswerError } = await supabase
          .from('answers')
          .update({ points_awarded: points })
          .eq('id', insertedAnswer.id);

        if (updateAnswerError) {
          console.error('Error updating answer points:', updateAnswerError);
        }

        // Get current participant score and update it
        const { data: participant, error: fetchError } = await supabase
          .from('participants')
          .select('score')
          .eq('id', participantId)
          .single();

        if (fetchError) {
          console.error('Error fetching participant:', fetchError);
        } else if (participant) {
          const newScore = (participant.score || 0) + points;
          const { error: updateScoreError } = await supabase
            .from('participants')
            .update({ score: newScore })
            .eq('id', participantId);

          if (updateScoreError) {
            console.error('Error updating participant score:', updateScoreError);
            throw new Error(`Failed to update score: ${updateScoreError.message}`);
          }
        }
      } else {
        // Not in top 3, but still correct - award 0 points (already set)
        console.log(`Answer correct but not in top 3 (position ${position})`);
      }
    }
  } else {
    // Wrong answer - no points (already set to 0)
    console.log('Answer is incorrect, no points awarded');
  }
}

/**
 * Get answers for a specific question
 */
export async function getAnswers(quizCode: string, questionIndex: number): Promise<Answer[]> {
  const quiz = await getQuiz(quizCode);
  if (!quiz) {
    throw new Error('Quiz not found');
  }

  const { data, error } = await supabase
    .from('answers')
    .select('*')
    .eq('quiz_id', quiz.id)
    .eq('question_index', questionIndex)
    .order('response_time_ms', { ascending: true });

  if (error) {
    throw new Error(`Failed to get answers: ${error.message}`);
  }

  return data as Answer[];
}

