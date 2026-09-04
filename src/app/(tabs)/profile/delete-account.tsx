import { useRouter } from 'expo-router';
import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/lib/auth/AuthProvider';
import { supabase } from '@/lib/supabase/client';

export default function DeleteAccount() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setError(null);
    setIsDeleting(true);
    try {
      const { error: fnError } = await supabase.functions.invoke('delete-account');
      if (fnError) throw fnError;
      await signOut();
      router.replace('/');
    } catch {
      setError('Une erreur est survenue. Réessayez plus tard.');
      setIsDeleting(false);
    }
  }

  return (
    <Screen centered>
      <ThemedText type="subtitle" style={{ textAlign: 'center' }}>
        Supprimer mon compte
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={{ textAlign: 'center' }}>
        Cette action est définitive. Votre compte, vos réponses et — si vous êtes en couple — l’espace partagé avec
        votre partenaire seront entièrement supprimés.
      </ThemedText>

      {error ? (
        <ThemedText type="small" themeColor="danger">
          {error}
        </ThemedText>
      ) : null}

      <Button label="Supprimer définitivement mon compte" variant="ghost" onPress={handleDelete} loading={isDeleting} />
    </Screen>
  );
}
