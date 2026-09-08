import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { track } from '@/lib/analytics';
import { useCouple } from '@/lib/couple/CoupleProvider';
import { advanceCurrentWeek } from '@/lib/program/queries';
import { useCurrentWeek } from '@/lib/program/useCurrentWeek';

export default function WeekCompletion() {
  const router = useRouter();
  const { couple, refresh: refreshCouple } = useCouple();
  const { refresh: refreshWeek } = useCurrentWeek();

  const [isMilestone, setIsMilestone] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const hasAdvanced = useRef(false);

  useEffect(() => {
    if (!couple || hasAdvanced.current) return;
    hasAdvanced.current = true;

    const wasFinalWeek = couple.active_track_id === 'reconnect-6-weeks' && couple.active_week_number >= 6;

    advanceCurrentWeek()
      .then(async () => {
        track('week_completed');
        if (wasFinalWeek) track('program_completed');
        setIsMilestone(wasFinalWeek);
        await refreshCouple();
        await refreshWeek();
        setIsReady(true);
      })
      .catch(async () => {
        // L'autre partenaire a peut-être déjà déclenché l'avancement.
        await refreshCouple();
        await refreshWeek();
        setIsReady(true);
      });
  }, [couple, refreshCouple, refreshWeek]);

  if (!isReady) {
    return (
      <Screen centered>
        <ThemedText themeColor="textSecondary">Un instant…</ThemedText>
      </Screen>
    );
  }

  if (isMilestone) {
    return (
      <Screen centered>
        <ThemedText type="subtitle" style={{ textAlign: 'center' }}>
          ❤️ Vous avez terminé votre premier parcours.
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={{ textAlign: 'center' }}>
          Vous avez pris du temps pour vous retrouver, parler et mieux comprendre vos besoins. À partir de
          maintenant, place à 💕 Notre rituel : un petit check-in chaque semaine, quelques minutes suffisent.
        </ThemedText>
        <Button label="Découvrir cette semaine" onPress={() => router.replace('/(tabs)')} />
      </Screen>
    );
  }

  return (
    <Screen centered>
      <ThemedText type="subtitle" style={{ textAlign: 'center' }}>
        ✅ Semaine terminée !
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={{ textAlign: 'center' }}>
        Rendez-vous la semaine prochaine pour la suite.
      </ThemedText>
      <Button label="Découvrir la semaine suivante" onPress={() => router.replace('/(tabs)')} />
    </Screen>
  );
}
