import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Share } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useCouple } from '@/lib/couple/CoupleProvider';
import { supabase } from '@/lib/supabase/client';

export default function Waiting() {
  const router = useRouter();
  const { couple, memberCount } = useCouple();
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    if (memberCount >= 2) router.replace('/');
  }, [memberCount, router]);

  useEffect(() => {
    if (!couple?.id) return;
    supabase
      .from('couple_invitations')
      .select('code')
      .eq('couple_id', couple.id)
      .is('used_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setCode(data?.code ?? null));
  }, [couple?.id]);

  async function handleShare() {
    if (!code) return;
    await Share.share({
      message: `Rejoins-moi sur l’app avec ce code d’invitation : ${code}\ncoupleapp://join?code=${code}`,
    });
  }

  return (
    <Screen centered>
      <ActivityIndicator size="large" />
      <ThemedText type="subtitle" style={{ textAlign: 'center' }}>
        En attente de votre partenaire
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={{ textAlign: 'center' }}>
        Dès que votre partenaire rejoint avec le code, vous commencez ensemble.
      </ThemedText>

      {code ? (
        <ThemedView type="backgroundElement" style={{ borderRadius: Spacing.four, padding: Spacing.four, alignSelf: 'stretch', alignItems: 'center' }}>
          <ThemedText type="title" style={{ letterSpacing: 8 }}>
            {code}
          </ThemedText>
        </ThemedView>
      ) : null}

      {code ? <Button label="Repartager le code" variant="ghost" onPress={handleShare} /> : null}
    </Screen>
  );
}
