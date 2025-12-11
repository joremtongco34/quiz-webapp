import { useEffect, useState } from 'react';
import { supabase, Answer } from '../supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useAnswersRealtime(quizId: string | null, questionIndex: number | null) {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!quizId || questionIndex === null) {
      setLoading(false);
      return;
    }

    let channel: RealtimeChannel | null = null;

    // Initial fetch
    const fetchAnswers = async () => {
      const { data, error } = await supabase
        .from('answers')
        .select('*')
        .eq('quiz_id', quizId)
        .eq('question_index', questionIndex)
        .order('response_time_ms', { ascending: true });

      if (!error && data) {
        setAnswers(data as Answer[]);
      }
      setLoading(false);
    };

    fetchAnswers();

    // Subscribe to changes
    channel = supabase
      .channel(`answers:${quizId}:${questionIndex}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'answers',
          filter: `quiz_id=eq.${quizId}`,
        },
        async () => {
          // Refetch answers when changes occur
          const { data } = await supabase
            .from('answers')
            .select('*')
            .eq('quiz_id', quizId)
            .eq('question_index', questionIndex)
            .order('response_time_ms', { ascending: true });

          if (data) {
            setAnswers(data as Answer[]);
          }
        }
      )
      .subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [quizId, questionIndex]);

  return { answers, loading };
}

