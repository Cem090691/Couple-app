import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { track } from '@/lib/analytics';
import { joinCoupleByCode } from '@/lib/couple/actions';
import { useCouple } from '@/lib/couple/CoupleProvider';

export default function Join() {
  const router = useRouter();
  const { couple, refresh } = useCouple();
  const params = useLocalSearchParams<{ code?: string }>();

  const [code, setCode] = useState(params.code ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Même filet de sécurité que sur l'écran d'invitation : si on est déjà
  // dans un couple en arrivant ici (retour arrière, relance de l'app),
  // on ne montre pas ce formulaire — on renvoie directement au bon endroit.
  useEffect(() => {
    if (couple) {
      router.replace('/');
    }
  }, [couple, router]);

  async function handleSubmit() {
    setError(null);
    if (!code.trim()) return setError('Entre le code reçu de ton/ta partenaire.');

    setIsSubmitting(true);
    try {
      await joinCoupleByCode(code);
      track('partner_joined');
      await refresh();
      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Une erreur est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen centered>
      <ThemedText type="subtitle">Rejoindre votre couple</ThemedText>
      <ThemedText themeColor="textSecondary">Entre le code d’invitation reçu de ton/ta partenaire.</ThemedText>

      <TextField
        label="Code d’invitation"
        value={code}
        onChangeText={(text) => setCode(text.toUpperCase())}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={6}
      />

      {error ? (
        <ThemedText type="small" themeColor="danger">
          {error}
        </ThemedText>
      ) : null}

      <Button label="Rejoindre" onPress={handleSubmit} loading={isSubmitting} />
    </Screen>
  );
}
