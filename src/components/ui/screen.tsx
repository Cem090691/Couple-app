import { type PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

export type ScreenProps = PropsWithChildren<{
  /** Centre le contenu verticalement (écrans d'onboarding, écrans d'attente). */
  centered?: boolean;
  contentStyle?: ViewStyle;
}>;

export function Screen({ children, centered, contentStyle }: ScreenProps) {
  return (
    <ThemedView style={styles.fill}>
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
        <SafeAreaView style={styles.fill}>
          <ScrollView
            contentContainerStyle={[styles.scrollContent, centered && styles.centered]}
            keyboardShouldPersistTaps="handled">
            <View style={[styles.content, contentStyle]}>{children}</View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scrollContent: { flexGrow: 1, alignItems: 'center' },
  centered: { justifyContent: 'center' },
  content: { width: '100%', maxWidth: MaxContentWidth, padding: Spacing.four, gap: Spacing.four },
});
