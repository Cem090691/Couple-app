import { useRouter } from 'expo-router';
import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { leaveCouple } from '@/lib/couple/actions';
import { useCouple } from '@/lib/couple/CoupleProvider';

export default function LeaveCouple() {
  const router = useRouter();
  const { refresh } = useCouple();
  const [isLeaving, setIsLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLeave() {
    setError(null);
    setIsLeaving(true);
    try {
      await leaveCouple();
      await refresh();
      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Une erreur est survenue.');
      setIsLeaving(false);
    }
  }

  return (
    <Screen centered>
      <ThemedText type="subtitle" style={{ textAlign: 'center' }}>
        Quitter le couple
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={{ textAlign: 'center' }}>
        Cette action supprime définitivement votre espace de couple partagé : vos réponses, votre progression et
        celles de votre partenaire seront effacées pour vous deux. Votre compte, lui, reste actif.
      </ThemedText>

      {error ? (
        <ThemedText type="small" themeColor="danger">
          {error}
        </ThemedText>
      ) : null}

      <Button label="Quitter le couple" variant="ghost" onPress={handleLeave} loading={isLeaving} />
    </Screen>
  );
}
