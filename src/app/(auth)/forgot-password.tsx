import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { useAuth } from '@/lib/auth/AuthProvider';

export default function ForgotPassword() {
  const { resetPasswordForEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function handleSubmit() {
    setStatus('sending');
    try {
      await resetPasswordForEmail(email.trim().toLowerCase());
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  return (
    <Screen centered>
      <ThemedText type="subtitle">Mot de passe oublié</ThemedText>
      <ThemedText themeColor="textSecondary">
        Indique ton e-mail : nous t’enverrons un lien pour réinitialiser ton mot de passe.
      </ThemedText>

      <TextField
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
        autoComplete="email"
      />

      {status === 'sent' ? (
        <ThemedText type="small" themeColor="primary">
          E-mail envoyé. Vérifie ta boîte de réception.
        </ThemedText>
      ) : null}
      {status === 'error' ? (
        <ThemedText type="small" themeColor="danger">
          Une erreur est survenue. Réessaie.
        </ThemedText>
      ) : null}

      <Button label="Envoyer le lien" onPress={handleSubmit} loading={status === 'sending'} />
    </Screen>
  );
}
