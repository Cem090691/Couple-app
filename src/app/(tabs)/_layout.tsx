import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { useCouple } from '@/lib/couple/CoupleProvider';

export default function TabsLayout() {
  const scheme = useColorScheme();
  const palette = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { couple, memberCount, isLoading } = useCouple();
  const router = useRouter();
  const shouldLeave = !isLoading && (!couple || memberCount < 2);

  // Filet de sécurité : si on arrive ici sans couple complet (lien
  // profond, retour en arrière, ou on vient de quitter le couple), on
  // renvoie vers la porte d'entrée qui sait où rediriger. Un `useEffect`
  // plutôt qu'un `<Redirect>` direct dans le rendu : ce dernier
  // redéclenche la navigation à chaque re-render tant que la condition
  // est vraie, ce qui a provoqué une boucle infinie en pratique.
  useEffect(() => {
    if (shouldLeave) router.replace('/');
  }, [shouldLeave, router]);

  if (shouldLeave) return null;

  return (
    <NativeTabs backgroundColor={palette.background} tintColor={palette.primary} labelStyle={{ color: palette.text }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Accueil</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house" src={<NativeTabs.Trigger.VectorIcon family={Ionicons} name="home-outline" />} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="progress">
        <NativeTabs.Trigger.Label>Progression</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="chart.bar"
          src={<NativeTabs.Trigger.VectorIcon family={Ionicons} name="stats-chart-outline" />}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Profil</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person" src={<NativeTabs.Trigger.VectorIcon family={Ionicons} name="person-outline" />} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
