import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function ScalePicker({ value, onChange }: { value: number | null; onChange: (value: number) => void }) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((n) => {
        const selected = value === n;
        return (
          <Pressable
            key={n}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(n)}
            style={[
              styles.item,
              { borderColor: theme.border, backgroundColor: selected ? theme.primary : 'transparent' },
            ]}>
            <ThemedText type="smallBold" style={{ color: selected ? theme.onPrimary : theme.text }}>
              {n}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.two, justifyContent: 'space-between' },
  item: {
    flex: 1,
    aspectRatio: 1,
    borderWidth: 1,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
