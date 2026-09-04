import { Link, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { track } from '@/lib/analytics';

export default function OnboardingWelcome() {
  const router = useRouter();

  useEffect(() => {
    track('onboarding_started');
  }, []);

  return (
    <Screen centered>
      <View style={styles.copy}>
        <ThemedText type="title" style={styles.title}>
          Vous vous aimez toujours.
        </ThemedText>
        <ThemedText type="subtitle" themeColor="textSecondary" style={styles.title}>
          Mais vous avez parfois l’impression de vous être éloignés.
        </ThemedText>
      </View>

      <View style={styles.actions}>
        <Button label="Commencer" onPress={() => router.push('/onboarding/together')} />
        <Link href="/(auth)/login" style={styles.loginLink}>
          <ThemedText type="link" themeColor="textSecondary">
            Vous avez déjà un compte ? Se connecter
          </ThemedText>
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  copy: { gap: Spacing.three },
  title: { textAlign: 'center' },
  actions: { gap: Spacing.three, alignItems: 'center' },
  loginLink: { padding: Spacing.two },
});
