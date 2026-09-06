import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Share, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { track } from '@/lib/analytics';
import { createCoupleAndInvite } from '@/lib/couple/actions';
import { useCouple } from '@/lib/couple/CoupleProvider';

export default function Invite() {
  const router = useRouter();
  const { couple, memberCount, refresh } = useCouple();

  const [code, setCode] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filet de sécurité : si on arrive sur cet écran alors qu'on est déjà
  // dans un couple (retour arrière, app relancée en pleine navigation),
  // on ne montre pas le choix "créer/rejoindre" — on renvoie directement
  // là où on doit être. Ne s'applique pas juste après avoir créé un code
  // dans cette même session (`code` est alors déjà défini localement).
  useEffect(() => {
    if (couple && !code) {
      router.replace(memberCount >= 2 ? '/' : '/(couple)/waiting');
    }
  }, [couple, code, memberCount, router]);

  async function handleCreate() {
    setError(null);
    setIsCreating(true);
    try {
      const result = await createCoupleAndInvite();
      setCode(result.code);
      track('couple_created');
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Une erreur est survenue.');
    } finally {
      setIsCreating(false);
    }
  }

  async function handleShare() {
    if (!code) return;
    track('partner_invited');
    await Share.share({
      message: `Rejoins-moi sur l’app avec ce code d’invitation : ${code}\ncoupleapp://join?code=${code}`,
    });
  }

  if (code) {
    return (
      <Screen centered>
        <ThemedText type="subtitle" style={styles.center}>
          Invitez votre partenaire
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.center}>
          Partagez ce code, ou le lien qui l’accompagne. Votre partenaire pourra rejoindre votre espace depuis son
          propre téléphone.
        </ThemedText>

        <ThemedView type="backgroundElement" style={styles.codeBox}>
          <ThemedText type="title" style={styles.code}>
            {code}
          </ThemedText>
        </ThemedView>

        <View style={styles.actions}>
          <Button label="Partager le code" onPress={handleShare} />
          <Button label="C’est fait, continuer" variant="ghost" onPress={() => router.replace('/(couple)/waiting')} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen centered>
      <ThemedText type="subtitle" style={styles.center}>
        Invitez votre partenaire
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.center}>
        Cette expérience se fait à deux. Générez un code à partager, ou rejoignez directement le couple de votre
        partenaire si vous en avez déjà reçu un.
      </ThemedText>

      {error ? (
        <ThemedText type="small" themeColor="danger">
          {error}
        </ThemedText>
      ) : null}

      <View style={styles.actions}>
        <Button label="Générer un code d’invitation" onPress={handleCreate} loading={isCreating} />
        <Button label="J’ai déjà un code" variant="ghost" onPress={() => router.push('/(couple)/join')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  actions: { gap: Spacing.three, width: '100%' },
  codeBox: {
    borderRadius: Spacing.four,
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.five,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  code: { letterSpacing: 8 },
});
