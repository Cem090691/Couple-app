import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function ProfileLayout() {
  const scheme = useColorScheme();
  const palette = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: palette.background },
        headerTintColor: palette.text,
        headerShadowVisible: false,
        headerBackTitle: '',
      }}>
      <Stack.Screen name="index" options={{ title: 'Profil' }} />
      <Stack.Screen name="account" options={{ title: 'Compte' }} />
      <Stack.Screen name="privacy" options={{ title: 'Confidentialité' }} />
      <Stack.Screen name="leave-couple" options={{ title: 'Quitter le couple' }} />
      <Stack.Screen name="delete-account" options={{ title: 'Supprimer mon compte' }} />
    </Stack>
  );
}
