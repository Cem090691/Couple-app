import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/lib/auth/AuthProvider';
import { useCouple } from '@/lib/couple/CoupleProvider';
import { supabase } from '@/lib/supabase/client';
import type { ProgramWeek, WeeklyProgress } from '@/lib/supabase/types';

import { getWeek, getWeeklyProgress } from './queries';

export type WeekPhase =
  | 'answer_questions'
  | 'waiting_partner_questions'
  | 'ready_for_insights'
  | 'waiting_partner_experience'
  | 'week_complete';

export function useCurrentWeek() {
  const { session } = useAuth();
  const { couple, memberCount, refresh: refreshCouple } = useCouple();
  const userId = session?.user.id ?? null;

  const [week, setWeek] = useState<ProgramWeek | null>(null);
  const [progress, setProgress] = useState<WeeklyProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!couple) {
      setWeek(null);
      setProgress([]);
      setIsLoading(false);
      return;
    }
    const weekRow = await getWeek(couple.active_track_id, couple.active_week_number);
    const progressRows = await getWeeklyProgress(weekRow.id, couple.id);
    setWeek(weekRow);
    setProgress(progressRows);
    setIsLoading(false);
  }, [couple]);

  useEffect(() => {
    // Chargement des données au montage / au changement de couple — les
    // setState de `load` interviennent après un `await`.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  // Se met à jour en direct quand le/la partenaire termine ses
  // questions ou son expérience de la semaine.
  useEffect(() => {
    if (!couple?.id || !week?.id) return;
    const channel = supabase
      .channel(`weekly-progress-${week.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'weekly_progress', filter: `week_id=eq.${week.id}` },
        () => load()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [couple?.id, week?.id, load]);

  const myProgress = progress.find((p) => p.user_id === userId) ?? null;
  const partnerProgress = progress.find((p) => p.user_id !== userId) ?? null;

  let phase: WeekPhase = 'answer_questions';
  if (!myProgress?.questions_completed_at) {
    phase = 'answer_questions';
  } else if (memberCount >= 2 && !partnerProgress?.questions_completed_at) {
    phase = 'waiting_partner_questions';
  } else if (!myProgress?.experience_completed_at) {
    phase = 'ready_for_insights';
  } else if (memberCount >= 2 && !partnerProgress?.experience_completed_at) {
    phase = 'waiting_partner_experience';
  } else {
    phase = 'week_complete';
  }

  const refresh = useCallback(async () => {
    await refreshCouple();
    await load();
  }, [refreshCouple, load]);

  return { week, phase, isLoading, refresh };
}
