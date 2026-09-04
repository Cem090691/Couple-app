import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { getQuestions, getWeekInsights } from '@/lib/program/queries';
import { useCurrentWeek } from '@/lib/program/useCurrentWeek';
import type { Question, WeekInsight } from '@/lib/supabase/types';

function insightMessage(question: Question, insight: WeekInsight): string {
  if (!insight.both_answered) {
    return 'En attente de la réponse de votre partenaire.';
  }
  if (question.kind === 'text') {
    return 'Vous avez chacun partagé votre point de vue — l’occasion d’en discuter ensemble.';
  }
  if (insight.match) {
    if (question.kind === 'choice' && insight.shared_value) {
      const label = question.options?.find((o) => o.value === insight.shared_value)?.label ?? insight.shared_value;
      return `❤️ Vous avez tous les deux envie de retrouver davantage de ${label.toLowerCase()}.`;
    }
    return '❤️ Vous êtes sur la même longueur d’onde sur ce point.';
  }
  return 'Vous n’avez pas exactement les mêmes besoins, et c’est normal. Prenez quelques minutes pour en parler.';
}

export default function Insights() {
  const router = useRouter();
  const { week } = useCurrentWeek();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [insights, setInsights] = useState<WeekInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!week) return;
    (async () => {
      const [questionRows, insightRows] = await Promise.all([getQuestions(week.id), getWeekInsights(week.id)]);
      setQuestions(questionRows);
      setInsights(insightRows);
      setIsLoading(false);
    })();
  }, [week]);

  if (isLoading) {
    return (
      <Screen centered>
        <ThemedText themeColor="textSecondary">Chargement…</ThemedText>
      </Screen>
    );
  }

  return (
    <Screen>
      <ThemedText type="subtitle">Vos points communs</ThemedText>

      {questions.map((question) => {
        const insight = insights.find((i) => i.question_id === question.id);
        if (!insight) return null;
        return (
          <ThemedView key={question.id} type="backgroundElement" style={styles.card}>
            <ThemedText type="small" themeColor="textSecondary">
              {question.prompt}
            </ThemedText>
            <ThemedText>{insightMessage(question, insight)}</ThemedText>
          </ThemedView>
        );
      })}

      <Button label="Découvrir votre expérience" onPress={() => router.push('/program/experience')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Spacing.three, padding: Spacing.three, gap: Spacing.one },
});
