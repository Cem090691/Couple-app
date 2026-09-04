import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';

export default function OnboardingTogether() {
  const router = useRouter();

  return (
    <Screen centered>
      <View style={styles.copy}>
        <ThemedText type="subtitle" style={styles.title}>
          Cette expérience se fait à deux.
        </ThemedText>
        <ThemedText type="default" themeColor="textSecondary" style={styles.title}>
          Vous répondrez chacun de votre côté, en toute confidentialité.
        </ThemedText>
      </View>

      <Button label="Continuer" onPress={() => router.push('/(auth)/signup')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  copy: { gap: Spacing.three },
  title: { textAlign: 'center' },
});
