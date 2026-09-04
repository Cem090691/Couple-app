import { useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useCouple } from '@/lib/couple/CoupleProvider';

function Row({ label, danger, onPress }: { label: string; danger?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <ThemedView type="backgroundElement" style={[styles.row, pressed && styles.pressed]}>
          <ThemedText themeColor={danger ? 'danger' : 'text'}>{label}</ThemedText>
          <ThemedText themeColor="textSecondary">›</ThemedText>
        </ThemedView>
      )}
    </Pressable>
  );
}

export default function ProfileHome() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { myProfile, partnerProfile } = useCouple();

  function handleSignOut() {
    Alert.alert('Se déconnecter', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Se déconnecter', style: 'destructive', onPress: () => signOut() },
    ]);
  }

  return (
    <Screen>
      <View style={styles.header}>
        <ThemedText type="subtitle">Bonjour {myProfile?.first_name ?? ''}</ThemedText>
        {partnerProfile ? (
          <ThemedText themeColor="textSecondary">En couple avec {partnerProfile.first_name}</ThemedText>
        ) : null}
      </View>

      <View style={styles.section}>
        <Row label="Compte" onPress={() => router.push('/(tabs)/profile/account')} />
        <Row label="Confidentialité" onPress={() => router.push('/(tabs)/profile/privacy')} />
        <Row label="Quitter le couple" onPress={() => router.push('/(tabs)/profile/leave-couple')} />
      </View>

      <View style={styles.section}>
        <Row label="Se déconnecter" onPress={handleSignOut} />
        <Row label="Supprimer mon compte" danger onPress={() => router.push('/(tabs)/profile/delete-account')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 2 },
  section: { gap: Spacing.two },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 52,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  pressed: { opacity: 0.7 },
});
