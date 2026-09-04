import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useCouple } from '@/lib/couple/CoupleProvider';
import { supabase } from '@/lib/supabase/client';

export default function Account() {
  const { session } = useAuth();
  const { myProfile, refresh } = useCouple();

  const [firstName, setFirstName] = useState(myProfile?.first_name ?? '');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  async function handleSave() {
    if (!session) return;
    setStatus('saving');
    const { error } = await supabase.from('profiles').update({ first_name: firstName.trim() }).eq('id', session.user.id);
    if (error) {
      setStatus('error');
      return;
    }
    await refresh();
    setStatus('saved');
  }

  return (
    <Screen>
      <TextField label="Prénom" value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
      <TextField label="E-mail" value={session?.user.email ?? ''} editable={false} />

      {status === 'saved' ? (
        <ThemedText type="small" themeColor="primary">
          Enregistré.
        </ThemedText>
      ) : null}
      {status === 'error' ? (
        <ThemedText type="small" themeColor="danger">
          Une erreur est survenue.
        </ThemedText>
      ) : null}

      <Button label="Enregistrer" onPress={handleSave} loading={status === 'saving'} />
    </Screen>
  );
}
