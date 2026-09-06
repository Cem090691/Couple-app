import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { useAuth } from '@/lib/auth/AuthProvider';
import { supabase } from '@/lib/supabase/client';
import type { Couple, Profile } from '@/lib/supabase/types';

type CoupleContextValue = {
  couple: Couple | null;
  memberCount: number;
  myProfile: Profile | null;
  partnerProfile: Profile | null;
  /** true tant que le premier chargement n'est pas terminé. */
  isLoading: boolean;
  refresh: () => Promise<void>;
};

const CoupleContext = createContext<CoupleContextValue | null>(null);

export function CoupleProvider({ children }: PropsWithChildren) {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;

  const [couple, setCouple] = useState<Couple | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [myProfile, setMyProfile] = useState<Profile | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) {
      setCouple(null);
      setMemberCount(0);
      setMyProfile(null);
      setPartnerProfile(null);
      setIsLoading(false);
      return;
    }

    const { data: myProfileRow, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (profileError) console.error('[couple] profiles error:', profileError.message);
    setMyProfile(myProfileRow ?? null);

    const { data: membership, error: membershipError } = await supabase
      .from('couple_members')
      .select('couple_id')
      .eq('user_id', userId)
      .maybeSingle();
    if (membershipError) console.error('[couple] couple_members error:', membershipError.message);

    if (!membership) {
      setCouple(null);
      setMemberCount(0);
      setPartnerProfile(null);
      setIsLoading(false);
      return;
    }

    const [
      { data: coupleRow, error: coupleError },
      { data: members, error: membersError },
    ] = await Promise.all([
      supabase.from('couples').select('*').eq('id', membership.couple_id).single(),
      supabase.from('couple_members').select('user_id').eq('couple_id', membership.couple_id),
    ]);
    if (coupleError) console.error('[couple] couples error:', coupleError.message);
    if (membersError) console.error('[couple] couple_members (list) error:', membersError.message);

    setCouple(coupleRow ?? null);
    setMemberCount(members?.length ?? 0);

    const partnerId = members?.find((m) => m.user_id !== userId)?.user_id;
    if (partnerId) {
      const { data: partnerRow } = await supabase.from('profiles').select('*').eq('id', partnerId).single();
      setPartnerProfile(partnerRow ?? null);
    } else {
      setPartnerProfile(null);
    }

    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    // Chargement des données au montage / au changement d'utilisateur —
    // les setState de `refresh` interviennent après un `await`, ce n'est
    // pas le cas synchrone que cette règle vise à éviter.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  // Se met à jour en direct quand le/la partenaire rejoint (écran
  // "en attente") ou quitte le couple, sans que l'utilisateur ait à
  // rafraîchir manuellement.
  useEffect(() => {
    if (!couple?.id) return;

    const channel = supabase
      .channel(`couple-members-${couple.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'couple_members', filter: `couple_id=eq.${couple.id}` },
        () => refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [couple?.id, refresh]);

  const value = useMemo<CoupleContextValue>(
    () => ({ couple, memberCount, myProfile, partnerProfile, isLoading, refresh }),
    [couple, memberCount, myProfile, partnerProfile, isLoading, refresh]
  );

  return <CoupleContext.Provider value={value}>{children}</CoupleContext.Provider>;
}

export function useCouple() {
  const ctx = useContext(CoupleContext);
  if (!ctx) throw new Error('useCouple doit être utilisé sous CoupleProvider');
  return ctx;
}
