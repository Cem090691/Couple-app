import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useCouple } from '@/lib/couple/CoupleProvider';
import { getSixWeekOverview } from '@/lib/program/queries';
import type { ProgramWeek } from '@/lib/supabase/types';

export default function Progress() {
  const { couple } = useCouple();
  const [overview, setOverview] = useState<{ week: ProgramWeek; bothCompleted: boolean }[]>([]);

  useEffect(() => {
    if (!couple) return;
    getSixWeekOverview(couple.id).then(setOverview);
  }, [couple]);

  const isContinueMode = couple?.active_track_id === 'continue';

  return (
    <Screen>
      <ThemedText type="subtitle">Votre parcours</ThemedText>

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
          <ThemedText themeColor="primary">❤️</ThemedText>
          <View style={styles.rowText}>
            <ThemedText type="smallBold">Continuer ensemble</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Votre parcours initial est terminé — vous êtes maintenant dans le rituel hebdomadaire.
            </ThemedText>
          </View>
        </ThemedView>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.two },
  row: { flexDirection: 'row', gap: Spacing.three, alignItems: 'center', borderRadius: Spacing.three, padding: Spacing.three },
  rowText: { flex: 1, gap: 2 },
});
