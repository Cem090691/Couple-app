import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

import { useAuth } from '@/lib/auth/AuthProvider';
import { useCouple } from '@/lib/couple/CoupleProvider';

/**
 * Porte d'entrée de l'application : redirige vers le bon flux selon
 * l'état de session / couple. Ne rend jamais rien elle-même.
 */
export default function Index() {
  const { session, isLoading: authLoading } = useAuth();
  const { couple, memberCount, isLoading: coupleLoading } = useCouple();

  const isLoading = authLoading || (!!session && coupleLoading);

  useEffect(() => {
    if (!isLoading) SplashScreen.hideAsync();
  }, [isLoading]);

  if (isLoading) return null;

  if (!session) return <Redirect href="/onboarding" />;
  if (!couple) return <Redirect href="/(couple)/invite" />;
  if (memberCount < 2) return <Redirect href="/(couple)/waiting" />;
  return <Redirect href="/(tabs)" />;
}
