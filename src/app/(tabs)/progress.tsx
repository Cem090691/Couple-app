import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useCouple } from '@/lib/couple/CoupleProvider';
import { getCoupleHistory, getSixWeekOverview } from '@/lib/program/queries';
import type { CoupleWeekHistoryEntry, ProgramWeek } from '@/lib/supabase/types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}

export default function Progress() {
  const { couple } = useCouple();
  const [overview, setOverview] = useState<{ week: ProgramWeek; bothCompleted: boolean }[]>([]);
  const [history, setHistory] = useState<CoupleWeekHistoryEntry[]>([]);

  useEffect(() => {
    if (!couple) return;
    getSixWeekOverview(couple.id).then(setOverview);
    getCoupleHistory(couple.id).then(setHistory);
  }, [couple]);

  const isContinueMode = couple?.active_track_id === 'continue';

  return (
    <Screen>
      <ThemedText type="subtitle">❤️ Se retrouver</ThemedText>

      <View style={styles.list}>
        {overview.map(({ week, bothCompleted }) => {
          const isCurrent = !isContinueMode && couple?.active_week_number === week.week_number;
          return (
            <ThemedView
              key={week.id}
              type={isCurrent ? 'backgroundSelected' : 'backgroundElement'}
              style={styles.row}>
              <ThemedText themeColor={bothCompleted ? 'primary' : 'textSecondary'}>
                {bothCompleted ? '✓' : week.week_number}
              </ThemedText>
              <View style={styles.rowText}>
                <ThemedText type="smallBold">{week.title}</ThemedText>
                {isCurrent ? (
                  <ThemedText type="small" themeColor="primary">
                    En cours
                  </ThemedText>
                ) : null}
              </View>
            </ThemedView>
          );
        })}
      </View>

      {isContinueMode ? (
        <ThemedView type="backgroundElement" style={styles.row}>
          <ThemedText themeColor="primary">💕</ThemedText>
          <View style={styles.rowText}>
            <ThemedText type="smallBold">Notre rituel</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Votre parcours initial est terminé — vous êtes maintenant dans le check-in hebdomadaire.
            </ThemedText>
          </View>
        </ThemedView>
      ) : null}

      {history.length > 0 ? (
        <View style={styles.historySection}>
          <ThemedText type="subtitle">Votre mémoire</ThemedText>
          <ThemedText themeColor="textSecondary">Chaque semaine terminée ensemble reste ici.</ThemedText>
          <View style={styles.list}>
            {history.map((entry) => (
              <ThemedView key={entry.id} type="backgroundElement" style={styles.row}>
                <ThemedText themeColor="primary">✓</ThemedText>
                <View style={styles.rowText}>
                  <ThemedText type="smallBold">{entry.week_title}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Terminée le {formatDate(entry.completed_at)}
                  </ThemedText>
                </View>
              </ThemedView>
            ))}
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.two },
  row: { flexDirection: 'row', gap: Spacing.three, alignItems: 'center', borderRadius: Spacing.three, padding: Spacing.three },
  rowText: { flex: 1, gap: 2 },
  historySection: { gap: Spacing.two, marginTop: Spacing.two },
});
