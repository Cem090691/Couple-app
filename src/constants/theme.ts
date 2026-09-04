/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

// Palette volontairement chaude et sobre : ni rose, ni imagerie "Saint-
// Valentin", pensée pour un couple de 30 à 50 ans plutôt qu'une
// esthétique adolescente. `primary` (terracotta/argile) reste la seule
// touche de couleur, utilisée avec parcimonie.
export const Colors = {
  light: {
    text: '#2B2620',
    textSecondary: '#6B6459',
    background: '#FAF7F2',
    backgroundElement: '#F0EAE0',
    backgroundSelected: '#E8DFD0',
    border: '#E2D9CB',
    primary: '#8C5A4A',
    onPrimary: '#FFFFFF',
    danger: '#B3483C',
  },
  dark: {
    text: '#F5F0E8',
    textSecondary: '#B0A99C',
    background: '#15130F',
    backgroundElement: '#221F1A',
    backgroundSelected: '#2E2A22',
    border: '#332E26',
    primary: '#C98A6E',
    onPrimary: '#1B1712',
    danger: '#E0685A',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
