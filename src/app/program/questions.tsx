import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { ChoicePicker } from '@/components/ui/choice-picker';
import { ScalePicker } from '@/components/ui/scale-picker';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { track } from '@/lib/analytics';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useCouple } from '@/lib/couple/CoupleProvider';
import { getMyAnswers, getQuestions, markQuestionsCompleted, upsertAnswer } from '@/lib/program/queries';
import { useCurrentWeek } from '@/lib/program/useCurrentWeek';
import type { AnswerValue, Question } from '@/lib/supabase/types';

export default function Questions() {
  const router = useRouter();
  const { session } = useAuth();
  const { couple } = useCouple();
  const { week, refresh: refreshWeek } = useCurrentWeek();

  const userId = session?.user.id ?? null;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!week || !userId) return;
    (async () => {
      const [questionRows, myAnswers] = await Promise.all([getQuestions(week.id), getMyAnswers(week.id, userId)]);
      setQuestions(questionRows);
      setAnswers(Object.fromEntries(myAnswers.map((a) => [a.question_id, a.value])));
      setIsLoading(false);
      if (myAnswers.length === 0) track('week_started', { week_id: week.id });
    })();
  }, [week, userId]);

  const current = questions[step];
  const currentValue = current ? (answers[current.id] ?? null) : null;
  const isLastStep = step === questions.length - 1;

  const canProceed = useMemo(() => {
    if (!current) return false;
    if (current.kind === 'scale') return typeof currentValue === 'object' && currentValue !== null && 'scale' in currentValue;
    if (current.kind === 'choice') {
      if (!currentValue) return false;
      if (current.allow_multiple) return 'choices' in currentValue && currentValue.choices.length > 0;
      return 'choice' in currentValue;
    }
    return typeof currentValue === 'object' && currentValue !== null && 'text' in currentValue && (currentValue as { text: string }).text.trim().length > 0;
  }, [current, currentValue]);

  function setAnswer(value: AnswerValue) {
    if (!current) return;
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
  }

  async function handleNext() {
    if (!current || !userId || !couple) return;
    setIsSaving(true);
    try {
      await upsertAnswer({ questionId: current.id, userId, coupleId: couple.id, value: answers[current.id] });
      track('question_completed', { question_id: current.id });

      if (isLastStep) {
        await markQuestionsCompleted({ weekId: week!.id, userId, coupleId: couple.id });
        await refreshWeek();
        router.replace('/(tabs)');
      } else {
        setStep((s) => s + 1);
      }
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading || !current) {
    return (
      <Screen centered>
        <ThemedText themeColor="textSecondary">Chargement…</ThemedText>
      </Screen>
    );
  }

  return (
    <Screen>
      <ThemedText type="small" themeColor="textSecondary">
        Question {step + 1} sur {questions.length}
      </ThemedText>

      <ThemedText type="subtitle">{current.prompt}</ThemedText>

      <View style={styles.input}>
        {current.kind === 'scale' ? (
          <ScalePicker
            value={currentValue && 'scale' in currentValue ? currentValue.scale : null}
            onChange={(n) => setAnswer({ scale: n })}
            labels={current.scale_labels}
          />
        ) : null}
        {current.kind === 'choice' && current.allow_multiple ? (
          <ChoicePicker
            options={current.options ?? []}
            multiple
            value={currentValue && 'choices' in currentValue ? currentValue.choices : []}
            onChange={(v) => setAnswer({ choices: v })}
          />
        ) : null}
        {current.kind === 'choice' && !current.allow_multiple ? (
          <ChoicePicker
            options={current.options ?? []}
            value={currentValue && 'choice' in currentValue ? currentValue.choice : null}
            onChange={(v) => setAnswer({ choice: v })}
          />
        ) : null}
        {current.kind === 'text' ? (
          <TextField
            label=""
            multiline
            numberOfLines={4}
            value={currentValue && 'text' in currentValue ? currentValue.text : ''}
            onChangeText={(t) => setAnswer({ text: t })}
            style={styles.textArea}
          />
        ) : null}
      </View>

      <View style={styles.actions}>
        {step > 0 ? (
          <View style={styles.flex1}>
            <Button label="Retour" variant="ghost" onPress={() => setStep((s) => s - 1)} />
          </View>
        ) : null}
        <View style={styles.flex1}>
          <Button
            label={isLastStep ? 'Terminer' : 'Suivant'}
            onPress={handleNext}
            disabled={!canProceed}
            loading={isSaving}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { marginTop: Spacing.two },
  textArea: { minHeight: 120, textAlignVertical: 'top', paddingTop: Spacing.two },
  actions: { flexDirection: 'row', gap: Spacing.three },
  flex1: { flex: 1 },
});
