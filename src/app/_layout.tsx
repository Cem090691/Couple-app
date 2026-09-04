import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { AuthProvider } from '@/lib/auth/AuthProvider';
import { CoupleProvider } from '@/lib/couple/CoupleProvider';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const scheme = useColorScheme();
  const palette = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      background: palette.background,
      card: palette.background,
      text: palette.text,
      primary: palette.primary,
      border: palette.border,
    },
  };

  return (
    <ThemeProvider value={navTheme}>
      <AuthProvider>
        <CoupleProvider>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.background } }} />
        </CoupleProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
