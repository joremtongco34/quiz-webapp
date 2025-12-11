import { useEffect, useState } from 'react';
import { supabase, Quiz } from '../supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useQuizRealtime(quizCode: string | null) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!quizCode) {
      setLoading(false);
      return;
    }

    let channel: RealtimeChannel | null = null;
    let mounted = true;

    // Initial fetch
    const fetchQuiz = async () => {
      try {
        const { data, error } = await supabase
          .from('quizzes')
          .select('*')
          .eq('code', quizCode)
          .single();

        if (!mounted) return;

        if (error) {
          console.error('Error fetching quiz:', error);
          setQuiz(null);
        } else if (data) {
          setQuiz(data as Quiz);
        } else {
          setQuiz(null);
        }
      } catch (err) {
        console.error('Exception fetching quiz:', err);
        if (mounted) {
          setQuiz(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchQuiz();

    // Subscribe to changes
    channel = supabase
      .channel(`quiz:${quizCode}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quizzes',
          filter: `code=eq.${quizCode}`,
        },
        async (payload) => {
          if (!mounted) return;
          
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            setQuiz(payload.new as Quiz);
          } else if (payload.eventType === 'DELETE') {
            setQuiz(null);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to quiz changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Channel error, refetching quiz...');
          fetchQuiz();
        }
      });

    return () => {
      mounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [quizCode]);

  return { quiz, loading };
}

