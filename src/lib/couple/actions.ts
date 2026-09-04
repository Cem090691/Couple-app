import { supabase } from '@/lib/supabase/client';

/** Erreurs métier renvoyées par les fonctions SQL (voir 0001_init.sql), à afficher en clair. */
const ERROR_MESSAGES: Record<string, string> = {
  already_in_couple: 'Vous faites déjà partie d’un couple.',
  invalid_code: 'Ce code d’invitation n’est pas valide.',
  code_already_used: 'Ce code d’invitation a déjà été utilisé.',
  code_expired: 'Ce code d’invitation a expiré. Demandez-en un nouveau à votre partenaire.',
  couple_full: 'Ce couple compte déjà deux personnes.',
  not_in_couple: 'Vous ne faites partie d’aucun couple.',
};

function friendlyError(error: { message: string }): Error {
  const known = Object.keys(ERROR_MESSAGES).find((code) => error.message.includes(code));
  return new Error(known ? ERROR_MESSAGES[known] : error.message);
}

export async function createCoupleAndInvite(): Promise<{ coupleId: string; code: string }> {
  const { data, error } = await supabase.rpc('create_couple_and_invite');
  if (error) throw friendlyError(error);
  const row = Array.isArray(data) ? data[0] : data;
  return { coupleId: row.couple_id, code: row.code };
}

export async function joinCoupleByCode(code: string): Promise<string> {
  const { data, error } = await supabase.rpc('join_couple_by_code', { p_code: code.trim() });
  if (error) throw friendlyError(error);
  return data as string;
}

export async function leaveCouple(): Promise<void> {
  const { error } = await supabase.rpc('leave_couple');
  if (error) throw friendlyError(error);
}
