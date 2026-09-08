import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { needLabel } from '@/lib/program/needs';
import { getQuestions, getWeekInsights } from '@/lib/program/queries';
import { useCurrentWeek } from '@/lib/program/useCurrentWeek';
import type { Question, WeekInsight } from '@/lib/supabase/types';

type CommonEntry = { key: string; text: string };
type DifferentEntry = { key: string; text: string };

function buildCommonEntries(question: Question, insight: WeekInsight): CommonEntry[] {
  if (question.kind === 'scale') {
    if (!insight.match) return [];
    return [{ key: `${question.id}-scale`, text: `❤️ Vous êtes sur la même longueur d’onde sur : « ${question.prompt} »` }];
  }
  if (!insight.common?.length) return [];
  return insight.common.map((category) => {
    const label = needLabel(category);
    const text = insight.inferred
      ? `${label} — vous semblez tous les deux avoir exprimé un besoin similaire de ce côté-là, chacun avec vos propres mots.`
      : `${label} — vous avez tous les deux exprimé cette envie.`;
    return { key: `${question.id}-${category}`, text };
  });
}

function buildDifferentEntry(question: Question, insight: WeekInsight): DifferentEntry | null {
  if (!insight.both_answered) return null;
  if (question.kind === 'scale') {
    if (insight.match !== false) return null;
    return { key: `${question.id}-scale`, text: `« ${question.prompt} » : vos ressentis diffèrent un peu cette semaine, et c’est tout à fait normal.` };
  }
  if (question.kind === 'text') {
    // Pas de contenu comparable détecté — reste neutre, jamais présenté comme un manque.
    if (insight.common?.length) return null;
    return null;
  }
  if (insight.common?.length) return null;
  return {
    key: `${question.id}-diff`,
    text: `« ${question.prompt} » : vous n’avez pas exprimé exactement le même besoin cette fois-ci. C’est simplement une occasion de découvrir ce qui compte le plus pour chacun de vous.`,
  };
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

  if (isLoading || !week) {
    return (
      <Screen centered>
        <ThemedText themeColor="textSecondary">Chargement…</ThemedText>
      </Screen>
    );
  }

  const common = questions.flatMap((q) => {
    const insight = insights.find((i) => i.question_id === q.id);
    return insight ? buildCommonEntries(q, insight) : [];
  });
  const different = questions.flatMap((q) => {
    const insight = insights.find((i) => i.question_id === q.id);
    const entry = insight ? buildDifferentEntry(q, insight) : null;
    return entry ? [entry] : [];
  });

  return (
    <Screen>
      <ThemedText type="subtitle">Votre synthèse de la semaine</ThemedText>

      <ThemedView type="backgroundElement" style={styles.section}>
        <ThemedText type="smallBold">💕 Ce que vous avez en commun</ThemedText>
        {common.length > 0 ? (
          common.map((entry) => (
            <ThemedText key={entry.key} style={styles.entryText}>
              {entry.text}
            </ThemedText>
          ))
        ) : (
          <ThemedText themeColor="textSecondary" style={styles.entryText}>
            Pas de correspondance nette à mettre en avant cette semaine — ce n’est pas grave, l’important est d’apprendre à se connaître.
          </ThemedText>
        )}
      </ThemedView>

      {different.length > 0 ? (
        <ThemedView type="backgroundElement" style={styles.section}>
          <ThemedText type="smallBold">💭 Ce qui est différent</ThemedText>
          {different.map((entry) => (
            <ThemedText key={entry.key} themeColor="textSecondary" style={styles.entryText}>
              {entry.text}
            </ThemedText>
          ))}
        </ThemedView>
      ) : null}

      <ThemedView type="backgroundElement" style={styles.section}>
        <ThemedText type="smallBold">✨ Votre expérience de la semaine</ThemedText>
        <ThemedText style={styles.entryText}>{week.experience_title}</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.entryText}>
          {week.experience_instructions}
        </ThemedText>
      </ThemedView>

      <Button label="Découvrir votre expérience" onPress={() => router.push('/program/experience')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { borderRadius: Spacing.three, padding: Spacing.three, gap: Spacing.two },
  entryText: { lineHeight: 22 },
});
