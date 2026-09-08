import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ChoiceOption } from '@/lib/supabase/types';

type SingleProps = {
  options: ChoiceOption[];
  multiple?: false;
  value: string | null;
  onChange: (value: string) => void;
};

type MultiProps = {
  options: ChoiceOption[];
  multiple: true;
  value: string[];
  onChange: (value: string[]) => void;
};

export function ChoicePicker(props: SingleProps | MultiProps) {
  const { options } = props;
  const theme = useTheme();

  function isSelected(optionValue: string) {
    return props.multiple ? props.value.includes(optionValue) : props.value === optionValue;
  }

  function handlePress(optionValue: string) {
    if (props.multiple) {
      const next = props.value.includes(optionValue)
        ? props.value.filter((v) => v !== optionValue)
        : [...props.value, optionValue];
      props.onChange(next);
    } else {
      props.onChange(optionValue);
    }
  }

  return (
    <View style={styles.container}>
      {props.multiple ? (
        <ThemedText type="small" themeColor="textSecondary">
          Plusieurs réponses possibles
        </ThemedText>
      ) : null}
      <View style={styles.list}>
        {options.map((option) => {
          const selected = isSelected(option.value);
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => handlePress(option.value)}
              style={[
                styles.item,
                {
                  borderColor: selected ? theme.primary : theme.border,
                  backgroundColor: selected ? theme.backgroundSelected : theme.backgroundElement,
                },
              ]}>
              <ThemedText type="default" themeColor={selected ? 'text' : 'textSecondary'} style={styles.label}>
                {option.label}
              </ThemedText>
              {props.multiple ? (
                <ThemedText themeColor={selected ? 'primary' : 'textSecondary'}>{selected ? '✓' : '○'}</ThemedText>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.two },
  list: { gap: Spacing.two },
  item: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  label: { flex: 1 },
});
