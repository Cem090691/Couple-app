import { Tabs, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { useCouple } from '@/lib/couple/CoupleProvider';

// Variante web de la barre d'onglets. `expo-router/unstable-native-tabs`
// (utilisé sur iOS/Android, voir _layout.tsx) ne fonctionne pas sur web —
// ce fichier `.web.tsx` est automatiquement choisi par Metro à la place
// sur cette plateforme. Purement un outil de test : l'app n'est pas
// destinée à être publiée sur web (voir README).
export default function TabsLayoutWeb() {
  const scheme = useColorScheme();
  const palette = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { couple, memberCount, isLoading } = useCouple();
  const router = useRouter();
  const shouldLeave = !isLoading && (!couple || memberCount < 2);

  // Voir _layout.tsx : `useEffect` plutôt qu'un `<Redirect>` direct dans
  // le rendu, pour éviter une boucle infinie de navigation.
  useEffect(() => {
    if (shouldLeave) router.replace('/');
  }, [shouldLeave, router]);

  if (shouldLeave) return null;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.textSecondary,
        tabBarStyle: { backgroundColor: palette.background, borderTopColor: palette.border },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Accueil' }} />
      <Tabs.Screen name="progress" options={{ title: 'Progression' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
    </Tabs>
  );
}
