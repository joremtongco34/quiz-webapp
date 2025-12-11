import { useEffect, useState } from 'react';
import { supabase, Participant } from '../supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useParticipantsRealtime(quizId: string | null) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!quizId) {
      setLoading(false);
      return;
    }

    let channel: RealtimeChannel | null = null;

    // Initial fetch
    const fetchParticipants = async () => {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('quiz_id', quizId)
        .order('score', { ascending: false });

      if (!error && data) {
        setParticipants(data as Participant[]);
      }
      setLoading(false);
    };

    fetchParticipants();

    // Subscribe to changes
    channel = supabase
      .channel(`participants:${quizId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
          filter: `quiz_id=eq.${quizId}`,
        },
        async () => {
          // Refetch participants when changes occur
          const { data } = await supabase
            .from('participants')
            .select('*')
            .eq('quiz_id', quizId)
            .order('score', { ascending: false });

          if (data) {
            setParticipants(data as Participant[]);
          }
        }
      )
      .subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [quizId]);

  return { participants, loading };
}

