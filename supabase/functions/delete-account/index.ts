// Edge Function : suppression définitive du compte de l'utilisateur
// courant. Doit être appelée avec le JWT de l'utilisateur (le client
// mobile le fait automatiquement via `supabase.functions.invoke`).
//
// 1. Vérifie l'identité de l'appelant avec un client "anon" + son JWT.
// 2. Quitte son couple s'il en a un (dissout l'espace partagé — voir
//    `leave_couple()` dans la migration SQL), avec un client service_role
//    pour ne pas dépendre de la policy RLS d'un rôle qui va disparaître.
// 3. Supprime le compte auth via l'API admin (service_role uniquement,
//    jamais exposée côté client).
//
// Déploiement : `supabase functions deploy delete-account`
// Variables d'env nécessaires (déjà fournies par Supabase en prod) :
//   SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from 'jsr:@supabase/supabase-js@2';

Deno.serve(async (req: Request) => {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'missing_authorization' }), { status: 401 });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Client "en tant que l'utilisateur" : sert uniquement à vérifier son
    // identité et à quitter proprement son couple via la RPC dédiée.
    const asUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await asUser.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'invalid_session' }), { status: 401 });
    }

    // Ignore l'erreur si l'utilisateur n'est simplement dans aucun couple.
    await asUser.rpc('leave_couple').catch(() => {});

    const asAdmin = createClient(supabaseUrl, serviceRoleKey);
    const { error: deleteError } = await asAdmin.auth.admin.deleteUser(user.id);

    if (deleteError) {
      return new Response(JSON.stringify({ error: 'delete_failed' }), { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'unexpected_error' }), { status: 500 });
  }
});
