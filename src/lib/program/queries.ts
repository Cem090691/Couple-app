import { supabase } from '@/lib/supabase/client';
import type { Answer, AnswerValue, ProgramWeek, Question, WeeklyProgress, WeekInsight } from '@/lib/supabase/types';

export async function getWeek(trackId: string, weekNumber: number): Promise<ProgramWeek> {
  const { data, error } = await supabase
    .from('program_weeks')
    .select('*')
    .eq('track_id', trackId)
    .eq('week_number', weekNumber)
    .single();
  if (error) throw error;
  return data;
}

export async function getQuestions(weekId: string): Promise<Question[]> {
  const { data, error } = await supabase.from('questions').select('*').eq('week_id', weekId).order('position');
  if (error) throw error;
  return data;
}

export async function getMyAnswers(weekId: string, userId: string): Promise<Answer[]> {
  const { data, error } = await supabase
    .from('answers')
    .select('*, questions!inner(week_id)')
    .eq('user_id', userId)
    .eq('questions.week_id', weekId);
  if (error) throw error;
  return data as unknown as Answer[];
}

export async function upsertAnswer(params: {
  questionId: string;
  userId: string;
  coupleId: string;
  value: AnswerValue;
}): Promise<void> {
  const { error } = await supabase
    .from('answers')
    .upsert(
      { question_id: params.questionId, user_id: params.userId, couple_id: params.coupleId, value: params.value },
      { onConflict: 'question_id,user_id' }
    );
  if (error) throw error;
}

export async function getWeeklyProgress(weekId: string, coupleId: string): Promise<WeeklyProgress[]> {
  const { data, error } = await supabase
    .from('weekly_progress')
    .select('*')
    .eq('week_id', weekId)
    .eq('couple_id', coupleId);
  if (error) throw error;
  return data;
}

export async function markQuestionsCompleted(params: {
  weekId: string;
  userId: string;
  coupleId: string;
}): Promise<void> {
  const { error } = await supabase
    .from('weekly_progress')
    .upsert(
      {
        week_id: params.weekId,
        user_id: params.userId,
        couple_id: params.coupleId,
        questions_completed_at: new Date().toISOString(),
      },
      { onConflict: 'week_id,user_id' }
    );
  if (error) throw error;
}

export async function markExperienceCompleted(params: {
  weekId: string;
  userId: string;
  coupleId: string;
}): Promise<void> {
  const { error } = await supabase
    .from('weekly_progress')
    .upsert(
      {
        week_id: params.weekId,
        user_id: params.userId,
        couple_id: params.coupleId,
        experience_completed_at: new Date().toISOString(),
      },
      { onConflict: 'week_id,user_id' }
    );
  if (error) throw error;
}

export async function getWeekInsights(weekId: string): Promise<WeekInsight[]> {
  const { data, error } = await supabase.rpc('get_week_insights', { p_week_id: weekId });
  if (error) throw error;
  return (data ?? []) as WeekInsight[];
}

export async function advanceCurrentWeek(): Promise<void> {
  const { error } = await supabase.rpc('advance_current_week');
  if (error) throw error;
}

export async function getSixWeekOverview(
  coupleId: string
): Promise<{ week: ProgramWeek; bothCompleted: boolean }[]> {
  const { data: weeks, error: weeksError } = await supabase
    .from('program_weeks')
    .select('*')
    .eq('track_id', 'reconnect-6-weeks')
    .order('week_number');
  if (weeksError) throw weeksError;

  const { data: progress, error: progressError } = await supabase
    .from('weekly_progress')
    .select('*')
    .eq('couple_id', coupleId)
    .in(
      'week_id',
      weeks.map((w) => w.id)
    );
  if (progressError) throw progressError;

  return weeks.map((week) => {
    const rows = progress.filter((p) => p.week_id === week.id && p.experience_completed_at);
    return { week, bothCompleted: rows.length >= 2 };
  });
}
