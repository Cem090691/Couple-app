import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth/AuthProvider';
import { track } from '@/lib/analytics';

export default function Signup() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);

    if (!firstName.trim()) return setError('Indique ton prénom.');
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Adresse e-mail invalide.');
    if (password.length < 8) return setError('Le mot de passe doit contenir au moins 8 caractères.');

    setIsSubmitting(true);
    try {
      await signUp({ email: email.trim().toLowerCase(), password, firstName: firstName.trim() });
      track('account_created');
      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Une erreur est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen>
      <ThemedText type="subtitle">Créer votre compte</ThemedText>

      <TextField label="Prénom" value={firstName} onChangeText={setFirstName} autoCapitalize="words" textContentType="givenName" />
      <TextField
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
        autoComplete="email"
      />
      <TextField
        label="Mot de passe (8 caractères minimum)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textContentType="newPassword"
        autoComplete="new-password"
      />

      {error ? (
        <ThemedText type="small" themeColor="danger">
          {error}
        </ThemedText>
      ) : null}

      <Button label="Créer mon compte" onPress={handleSubmit} loading={isSubmitting} />

      <Link href="/(auth)/login" style={styles.link}>
        <ThemedText type="link" themeColor="textSecondary">
          Vous avez déjà un compte ? Se connecter
        </ThemedText>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  link: { alignSelf: 'center', padding: Spacing.two },
});
