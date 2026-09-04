import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useCouple } from '@/lib/couple/CoupleProvider';
import { useCurrentWeek } from '@/lib/program/useCurrentWeek';

const STEP_LABELS = ['Répondre aux questions', 'Découvrir vos points communs', 'Faire votre expérience à deux'];

export default function Home() {
  const router = useRouter();
  const { couple, partnerProfile } = useCouple();
  const { week, phase, isLoading } = useCurrentWeek();

  if (isLoading || !week || !couple) {
    return (
      <Screen centered>
        <ThemedText themeColor="textSecondary">Chargement…</ThemedText>
      </Screen>
    );
  }

  const isContinueMode = couple.active_track_id === 'continue';
  const stepDone = [
    phase !== 'answer_questions',
    phase === 'ready_for_insights' ? false : phase !== 'waiting_partner_questions' && phase !== 'answer_questions',
    phase === 'week_complete',
  ];
  // "Découvrir vos points communs" est considéré fait dès qu'on est passé à l'expérience.
  stepDone[1] = phase === 'waiting_partner_experience' || phase === 'week_complete';

  return (
    <Screen>
      <ThemedText type="small" themeColor="textSecondary">
        ❤️ {isContinueMode ? 'Votre rituel hebdomadaire' : 'Votre reconnexion'}
      </ThemedText>

      <View>
        {!isContinueMode ? (
          <ThemedText type="small" themeColor="primary">
            Semaine {couple.active_week_number} sur 6
          </ThemedText>
        ) : null}
        <ThemedText type="subtitle">{week.title}</ThemedText>
        {week.objective ? <ThemedText themeColor="textSecondary">{week.objective}</ThemedText> : null}
      </View>

      <View style={styles.steps}>
        {STEP_LABELS.map((label, i) => (
          <View key={label} style={styles.stepRow}>
            <ThemedText themeColor={stepDone[i] ? 'primary' : 'textSecondary'}>{stepDone[i] ? '●' : '○'}</ThemedText>
            <ThemedText themeColor={stepDone[i] ? 'text' : 'textSecondary'}>{label}</ThemedText>
          </View>
        ))}
      </View>

      {phase === 'answer_questions' ? (
        <Button label="Continuer" onPress={() => router.push('/program/questions')} />
      ) : null}

      {phase === 'waiting_partner_questions' ? (
        <ThemedText themeColor="textSecondary">
          En attente de {partnerProfile?.first_name ?? 'votre partenaire'}…
        </ThemedText>
      ) : null}

      {phase === 'ready_for_insights' ? (
        <Button label="Découvrir vos points communs" onPress={() => router.push('/program/insights')} />
      ) : null}

      {phase === 'waiting_partner_experience' ? (
        <ThemedText themeColor="textSecondary">
          En attente de {partnerProfile?.first_name ?? 'votre partenaire'} pour terminer l’expérience…
        </ThemedText>
      ) : null}

      {phase === 'week_complete' ? (
        <Button label="Voir le récapitulatif" onPress={() => router.push('/program/week-completion')} />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  steps: { gap: Spacing.two },
  stepRow: { flexDirection: 'row', gap: Spacing.two, alignItems: 'center' },
});
