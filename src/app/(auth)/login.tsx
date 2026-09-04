import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth/AuthProvider';

export default function Login() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);
    try {
      await signIn({ email: email.trim().toLowerCase(), password });
      router.replace('/');
    } catch {
      setError('E-mail ou mot de passe incorrect.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen centered>
      <ThemedText type="subtitle">Se connecter</ThemedText>

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
        label="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textContentType="password"
        autoComplete="password"
      />

      {error ? (
        <ThemedText type="small" themeColor="danger">
          {error}
        </ThemedText>
      ) : null}

      <Button label="Se connecter" onPress={handleSubmit} loading={isSubmitting} />

      <Link href="/(auth)/forgot-password" style={styles.link}>
        <ThemedText type="link" themeColor="textSecondary">
          Mot de passe oublié ?
        </ThemedText>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  link: { alignSelf: 'center', padding: Spacing.two },
});
