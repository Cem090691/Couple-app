import { useRouter } from 'expo-router';
import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useCouple } from '@/lib/couple/CoupleProvider';
import { markExperienceCompleted } from '@/lib/program/queries';
import { useCurrentWeek } from '@/lib/program/useCurrentWeek';

export default function Experience() {
  const router = useRouter();
  const { session } = useAuth();
  const { couple } = useCouple();
  const { week, refresh } = useCurrentWeek();
  const [isSaving, setIsSaving] = useState(false);

  async function handleDone() {
    if (!week || !couple || !session) return;
    setIsSaving(true);
    try {
      await markExperienceCompleted({ weekId: week.id, userId: session.user.id, coupleId: couple.id });
      await refresh();
      router.replace('/(tabs)');
    } finally {
      setIsSaving(false);
    }
  }

  if (!week) return null;

  return (
    <Screen centered>
      <ThemedText type="small" themeColor="textSecondary" style={{ textAlign: 'center' }}>
        Votre expérience de la semaine
      </ThemedText>
      <ThemedText type="subtitle" style={{ textAlign: 'center' }}>
        {week.experience_title}
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={{ textAlign: 'center' }}>
        {week.experience_instructions}
      </ThemedText>

      <Button label="Nous l’avons fait" onPress={handleDone} loading={isSaving} />
    </Screen>
  );
}
