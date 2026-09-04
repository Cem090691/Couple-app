import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ChoiceOption } from '@/lib/supabase/types';

export function ChoicePicker({
  options,
  value,
  onChange,
}: {
  options: ChoiceOption[];
  value: string | null;
  onChange: (value: string) => void;
}) {
  const theme = useTheme();

  return (
    <View style={styles.list}>
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[
              styles.item,
              {
                borderColor: selected ? theme.primary : theme.border,
                backgroundColor: selected ? theme.backgroundSelected : theme.backgroundElement,
              },
            ]}>
            <ThemedText type="default" themeColor={selected ? 'text' : 'textSecondary'}>
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.two },
  item: {
    minHeight: 52,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
});
